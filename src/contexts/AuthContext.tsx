
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Initialize with empty array - users will be created at runtime
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing user session in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Also check if users exist in localStorage
    if (!localStorage.getItem("users")) {
      // Initialize empty users array if it doesn't exist
      localStorage.setItem("users", JSON.stringify([]));
    }
    
    setIsLoading(false);
  }, []);

  const register = async (username: string, password: string, role: string): Promise<boolean> => {
    try {
      // Get existing users
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      
      // Check if username already exists
      if (users.some((u: any) => u.username === username)) {
        toast.error("Username already exists");
        return false;
      }
      
      // Create new user
      const newUser = {
        id: crypto.randomUUID(),
        username,
        password,
        role: role || "staff", // Default to staff if no role provided
      };
      
      // Add to users array
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      
      toast.success("Registration successful! You can now login.");
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration");
      return false;
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      
      // Find user
      const foundUser = users.find(
        (u: any) => u.username === username && u.password === password
      );

      if (foundUser) {
        // Create a user object without the password
        const authUser = {
          id: foundUser.id,
          username: foundUser.username,
          role: foundUser.role,
        };

        // Store in state and localStorage
        setUser(authUser);
        localStorage.setItem("user", JSON.stringify(authUser));
        
        // Record login time in history
        const currentHistory = JSON.parse(localStorage.getItem("loginHistory") || "[]");
        const loginEntry = {
          userId: authUser.id,
          username: authUser.username,
          checkInTime: new Date().toISOString(),
          checkOutTime: null
        };
        localStorage.setItem("loginHistory", JSON.stringify([...currentHistory, loginEntry]));
        
        toast.success("Login successful!");
        return true;
      } else {
        toast.error("Invalid username or password");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
      return false;
    }
  };

  const logout = () => {
    // Record logout time in history
    if (user) {
      const currentHistory = JSON.parse(localStorage.getItem("loginHistory") || "[]");
      const updatedHistory = currentHistory.map((entry: any) => {
        if (entry.userId === user.id && !entry.checkOutTime) {
          return {
            ...entry,
            checkOutTime: new Date().toISOString()
          };
        }
        return entry;
      });
      localStorage.setItem("loginHistory", JSON.stringify(updatedHistory));
    }
    
    // Clear user from state and localStorage
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
    toast.info("You have been logged out");
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Users, Calendar, Home, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  {
    href: "/",
    label: "Dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: "/rooms",
    label: "Rooms",
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: "/customers",
    label: "Customers",
    icon: <Users className="h-5 w-5" />,
  },
  {
    href: "/bookings",
    label: "Bookings",
    icon: <Calendar className="h-5 w-5" />,
  },
];

const AppNav = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col gap-1">
      <div className="px-3 py-2">
        <div className="mb-8 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} to={link.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  {link.icon}
                  <span className="ml-2">{link.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
        <div className="mt-auto space-y-1">
          <div className="px-3 py-2 flex items-center text-sm">
            <UserCircle className="h-4 w-4 mr-2" />
            <span>{user?.username || "User"}</span>
            <span className="ml-auto text-xs opacity-60">{user?.role || ""}</span>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-2">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppNav;

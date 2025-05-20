
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bed, Users, Calendar, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
      isActive 
        ? "bg-sidebar-primary text-sidebar-primary-foreground" 
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    )}
  >
    {icon}
    {label}
  </Link>
);

const AppNav = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  const navItems = [
    { path: "/", icon: <Home className="h-5 w-5" />, label: "Dashboard" },
    { path: "/rooms", icon: <Bed className="h-5 w-5" />, label: "Rooms" },
    { path: "/customers", icon: <Users className="h-5 w-5" />, label: "Customers" },
    { path: "/bookings", icon: <Calendar className="h-5 w-5" />, label: "Bookings" },
  ];

  return (
    <div className="flex flex-col gap-2">
      {navItems.map((item) => (
        <NavItem
          key={item.path}
          to={item.path}
          icon={item.icon}
          label={item.label}
          isActive={pathname === item.path}
        />
      ))}
    </div>
  );
};

export default AppNav;

import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@/layouts/Root";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.user);
  const { logout } = useAuth();

// Get user business branding
const businessName = 'ApperBook';
  const logoUrl = user?.logo_url_c;
  const ownerName = user?.firstName || user?.name || 'User';
const navigation = [
    { name: "Services", href: "/services", icon: "Settings", public: false },
    { name: "Booking Config", href: "/booking-config", icon: "Store", public: true },
    { name: "Bookings", href: "/bookings", icon: "BookOpen", public: false },
    { name: "Availability", href: "/availability", icon: "Clock", public: false },
  ];

  // Detect if current user is a visitor on public booking page
  const location = useLocation();
  const isVisitorOnBookingPage = location.pathname.startsWith('/book/');

  // Filter and modify navigation for visitors
  const getNavigationItems = () => {
    if (isVisitorOnBookingPage) {
      // Show only "Book Service" for visitors
      return [{ name: "Book Service", href: location.pathname, icon: "Store", public: true }];
    }
    
    // For authenticated users, rename "Booking Config" to "Book Service" if they're on booking config
    return navigation.map(item => {
      if (item.href === "/booking-config" && location.pathname === "/booking-config") {
        return { ...item, name: "Book Service" };
      }
      return item;
    });
  };
  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={`${businessName} Logo`}
                  className="w-8 h-8 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-8 h-8 bg-gradient-to-r from-primary to-blue-600 rounded-lg flex items-center justify-center ${logoUrl ? 'hidden' : 'flex'}`}
                style={{display: logoUrl ? 'none' : 'flex'}}
              >
                <ApperIcon name="Calendar" className="w-5 h-5 text-white" />
              </div>
              <div>
<h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {businessName}
                </h1>
                {isAuthenticated && businessName !== 'ApperBook' && (
                  <p className="text-xs text-gray-500">by {ownerName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
<nav className="hidden md:flex space-x-1">
            {getNavigationItems()
              .filter(item => item.public || isAuthenticated)
              .map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg"
                      : "text-gray-700 hover:text-primary hover:bg-gray-100"
                  )
                }
              >
                <ApperIcon name={item.icon} className="w-4 h-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>

{/* Actions */}
<div className="flex items-center gap-3">
            {/* Hide all authentication elements for visitors on booking pages */}
            {!isVisitorOnBookingPage && (
              <>
                {/* User info - only show when authenticated */}
                {isAuthenticated && (
                  <div className="hidden lg:flex items-center gap-2 text-sm text-gray-600">
                    <ApperIcon name="User" className="w-4 h-4" />
                    <span>Hello, {user?.firstName || user?.name || 'User'}</span>
                  </div>
                )}
                
                {/* Authentication buttons */}
                {isAuthenticated ? (
                  /* Logout button - only show when authenticated */
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="LogOut"
                      onClick={handleLogout}
                      className="hidden sm:flex"
                    >
                      Logout
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogout}
                      className="sm:hidden"
                    >
                      <ApperIcon name="LogOut" className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  /* Login button - only show when not authenticated */
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      icon="LogIn"
                      onClick={() => navigate("/booker/login")}
                      className="hidden sm:flex"
                    >
                      Login
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate("/booker/login")}
                      className="sm:hidden"
                    >
                      <ApperIcon name="LogIn" className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </>
            )}
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <ApperIcon name={isMobileMenuOpen ? "X" : "Menu"} className="w-5 h-5" />
            </Button>
          </div>
        </div>

{/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="space-y-1">
              {getNavigationItems()
                .filter(item => item.public || isAuthenticated)
                .map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg"
                        : "text-gray-700 hover:text-primary hover:bg-gray-100"
                    )
                  }
                >
                  <ApperIcon name={item.icon} className="w-5 h-5" />
                  {item.name}
                </NavLink>
              ))}
              
              {/* Hide mobile auth links for visitors on booking pages */}
              {!isVisitorOnBookingPage && (
                <>
                  {/* Mobile auth links */}
                  {!isAuthenticated ? (
                    <div className="pt-2 border-t border-gray-200">
                      <NavLink
                        to="/booker/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-gray-700 hover:text-primary hover:bg-gray-100"
                      >
                        <ApperIcon name="LogIn" className="w-5 h-5" />
                        Login
                      </NavLink>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-gray-700 hover:text-primary hover:bg-gray-100 w-full text-left"
                    >
                      <ApperIcon name="LogOut" className="w-5 h-5" />
                      Logout
                    </button>
                  )}
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
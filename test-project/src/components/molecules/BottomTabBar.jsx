import { useLocation, Link } from "react-router-dom"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const BottomTabBar = () => {
  const location = useLocation()
  
  const tabs = [
    { id: "feed", label: "Feed", icon: "Home", path: "/" },
    { id: "discover", label: "Discover", icon: "Compass", path: "/discover" },
    { id: "create", label: "Create", icon: "Plus", path: "/create" },
    { id: "messages", label: "Messages", icon: "MessageCircle", path: "/messages" },
    { id: "profile", label: "Profile", icon: "User", path: "/profile" }
  ]

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/"
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 z-sticky"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16 md:h-20 px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path)
          
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={cn(
                "flex flex-col items-center justify-center p-2 transition-all duration-fast",
                "min-w-0 flex-1 relative",
                "hover:scale-105 active:scale-95",
                active ? "text-primary" : "text-gray-600 hover:text-gray-800"
              )}
              aria-current={active ? "page" : undefined}
            >
              {/* Icon */}
              <ApperIcon 
                name={tab.icon} 
                size={24} 
                className={cn(
                  "transition-all duration-fast",
                  active && "drop-shadow-sm"
                )} 
              />
              
              {/* Label */}
              <span 
                className={cn(
                  "text-xs font-medium mt-1 transition-all duration-fast",
                  "hidden xs:block truncate",
                  active && "font-semibold"
                )}
              >
                {tab.label}
              </span>
              
              {/* Active indicator */}
              {active && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-primary rounded-t-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomTabBar
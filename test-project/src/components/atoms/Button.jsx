import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = forwardRef(({ 
  className, 
  variant = "default", 
  size = "default",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  children,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100";
  
  const variants = {
    default: "bg-gradient-to-r from-primary to-blue-600 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-primary shadow-lg hover:shadow-xl",
    secondary: "border-2 border-secondary text-secondary hover:bg-secondary hover:text-white focus:ring-secondary",
    success: "bg-gradient-to-r from-success to-green-600 text-white hover:from-green-700 hover:to-green-800 focus:ring-success shadow-lg hover:shadow-xl",
    danger: "bg-gradient-to-r from-error to-red-600 text-white hover:from-red-700 hover:to-red-800 focus:ring-error shadow-lg hover:shadow-xl",
    ghost: "text-secondary hover:bg-gray-100 focus:ring-gray-300",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary"
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm rounded-lg gap-1.5",
    default: "px-4 py-2.5 text-sm rounded-lg gap-2",
    lg: "px-6 py-3 text-base rounded-xl gap-2.5",
    icon: "p-2.5 rounded-lg"
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      ref={ref}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {icon && iconPosition === "left" && !loading && (
        <ApperIcon name={icon} className="w-4 h-4" />
      )}
      {children}
      {icon && iconPosition === "right" && !loading && (
        <ApperIcon name={icon} className="w-4 h-4" />
      )}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
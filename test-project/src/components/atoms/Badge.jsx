import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Badge = forwardRef(({ 
  className, 
  variant = "default",
  children,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold";
  
  const variants = {
    default: "bg-gray-100 text-gray-800",
    confirmed: "bg-gradient-to-r from-success to-green-600 text-white",
    pending: "bg-gradient-to-r from-warning to-yellow-600 text-white",
    cancelled: "bg-gradient-to-r from-error to-red-600 text-white",
    active: "bg-gradient-to-r from-primary to-blue-600 text-white",
    inactive: "bg-gray-200 text-gray-600"
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], className)}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export default Badge;
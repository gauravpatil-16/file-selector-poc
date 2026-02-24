import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ 
  className, 
  variant = "default",
  children,
  ...props 
}, ref) => {
  const baseStyles = "rounded-xl transition-all duration-200";
  
  const variants = {
    default: "bg-surface border border-gray-200 shadow-sm hover:shadow-md",
    elevated: "bg-surface border border-gray-200 shadow-lg hover:shadow-xl",
    gradient: "bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-md hover:shadow-lg",
    glass: "bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg"
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;
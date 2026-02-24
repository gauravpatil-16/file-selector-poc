import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Select = forwardRef(({ 
  className, 
  label,
  error,
  helperText,
  required = false,
  children,
  ...props 
}, ref) => {
  const baseStyles = "w-full px-3 py-2.5 text-sm border-2 rounded-lg bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1";
  
  const stateStyles = error
    ? "border-error focus:border-error focus:ring-error/20"
    : "border-gray-300 focus:border-primary focus:ring-primary/20 hover:border-gray-400";

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <select
        className={cn(baseStyles, stateStyles, className)}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      
      {error && (
        <p className="text-sm text-error font-medium">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = "Select";

export default Select;
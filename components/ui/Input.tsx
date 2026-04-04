import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-5 py-4 bg-slate-50 rounded-xl border transition-all
            focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white
            ${error ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-rose-500"}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

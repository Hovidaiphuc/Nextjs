interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-[3px]",
  lg: "w-16 h-16 border-4",
};

export function Spinner({ size = "md", label = "Đang tải...", className = "" }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`flex items-center justify-center gap-3 ${className}`}
    >
      <div
        className={`
          border-slate-200 border-t-rose-500 rounded-full animate-spin
          ${sizeClasses[size]}
        `}
      />
      {label && <span className="text-slate-400 font-medium text-sm">{label}</span>}
    </div>
  );
}

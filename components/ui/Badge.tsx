type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-600 border-slate-200",
  success: "bg-emerald-50 text-emerald-600 border-emerald-100",
  warning: "bg-amber-50 text-amber-600 border-amber-100",
  danger: "bg-red-50 text-red-600 border-red-100",
  info: "bg-blue-50 text-blue-600 border-blue-100",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black
        uppercase tracking-widest border
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

// Convenience function to map order/status to Badge
export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PENDING":
    case "PROCESSING":
      return <Badge variant="warning">{status}</Badge>;
    case "SHIPPED":
    case "DELIVERED":
    case "COMPLETED":
    case "ANSWERED":
      return <Badge variant="success">{status}</Badge>;
    case "CANCELLED":
    case "REJECTED":
      return <Badge variant="danger">{status}</Badge>;
    default:
      return <Badge variant="info">{status}</Badge>;
  }
}

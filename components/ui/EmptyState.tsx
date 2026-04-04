interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon = "📭", title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-20 text-center ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
      {description && <p className="text-slate-400 font-medium text-sm max-w-sm mb-6">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

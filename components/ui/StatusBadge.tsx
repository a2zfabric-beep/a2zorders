import Badge from './Badge';

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
  draft: { variant: 'default', label: 'Draft' },
  submitted: { variant: 'info', label: 'Submitted' },
  in_review: { variant: 'warning', label: 'In Review' },
  sampling_in_progress: { variant: 'info', label: 'Sampling' },
  ready: { variant: 'success', label: 'Ready' },
  dispatched: { variant: 'success', label: 'Dispatched' },
  pending: { variant: 'warning', label: 'Pending' },
  in_progress: { variant: 'info', label: 'In Progress' },
  completed: { variant: 'success', label: 'Completed' },
  cancelled: { variant: 'danger', label: 'Cancelled' },
  high: { variant: 'danger', label: 'High' },
  medium: { variant: 'warning', label: 'Medium' },
  low: { variant: 'default', label: 'Low' },
  urgent: { variant: 'danger', label: 'Urgent' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { variant: 'default', label: status };
  
  return (
    <Badge variant={config.variant} size="sm">
      {config.label}
    </Badge>
  );
}

import { Badge } from '@/components/ui/badge';
import { ClaimPriority } from '@/types/claim';

interface ClaimPriorityBadgeProps {
  priority: ClaimPriority;
}

const ClaimPriorityBadge = ({ priority }: ClaimPriorityBadgeProps) => {
  const priorityConfig = {
    low: { label: 'Baja', className: 'bg-muted text-muted-foreground hover:bg-muted' },
    medium: { label: 'Media', className: 'bg-primary/10 text-primary hover:bg-primary/20' },
    high: { label: 'Alta', className: 'bg-warning/10 text-warning hover:bg-warning/20' },
    critical: { label: 'Crítica', className: 'bg-destructive/10 text-destructive hover:bg-destructive/20' },
  };

  const config = priorityConfig[priority];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

export default ClaimPriorityBadge;

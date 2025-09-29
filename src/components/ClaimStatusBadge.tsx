import { Badge } from '@/components/ui/badge';
import { ClaimStatus } from '@/types/claim';

interface ClaimStatusBadgeProps {
  status: ClaimStatus;
}

const ClaimStatusBadge = ({ status }: ClaimStatusBadgeProps) => {
  const statusConfig = {
    new: { label: 'Nuevo', className: 'bg-primary/10 text-primary hover:bg-primary/20' },
    'in-progress': { label: 'En Progreso', className: 'bg-warning/10 text-warning hover:bg-warning/20' },
    resolved: { label: 'Resuelto', className: 'bg-success/10 text-success hover:bg-success/20' },
    closed: { label: 'Cerrado', className: 'bg-muted text-muted-foreground hover:bg-muted' },
  };

  const config = statusConfig[status];

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
};

export default ClaimStatusBadge;

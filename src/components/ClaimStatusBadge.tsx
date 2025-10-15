import { Badge } from '@/components/ui/badge';
import { ClaimStatus } from '@/types/claim';

interface ClaimStatusBadgeProps {
  status: ClaimStatus;
}

const ClaimStatusBadge = ({ status }: ClaimStatusBadgeProps) => {
  const statusConfig: Record<ClaimStatus, { label: string; className: string }> = {
    'new': { 
      label: 'Nuevo', 
      className: 'bg-blue-100 text-blue-700 border-blue-300' 
    },
    'en-gestion': { 
      label: 'En Gestión', 
      className: 'bg-yellow-100 text-yellow-700 border-yellow-300' 
    },
    'escalado': { 
      label: 'Escalado', 
      className: 'bg-orange-100 text-orange-700 border-orange-300' 
    },
    'enviado-abogados': { 
      label: 'Enviado a Abogados', 
      className: 'bg-purple-100 text-purple-700 border-purple-300' 
    },
    'para-cierre': { 
      label: 'Para Cierre', 
      className: 'bg-green-100 text-green-700 border-green-300' 
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

export default ClaimStatusBadge;

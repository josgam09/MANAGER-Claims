import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useClaims } from '@/contexts/ClaimContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ClaimStatusBadge from '@/components/ClaimStatusBadge';
import ClaimPriorityBadge from '@/components/ClaimPriorityBadge';
import { Plus, Search, Download } from 'lucide-react';
import { ClaimStatus, ClaimPriority } from '@/types/claim';
import { toast } from 'sonner';

const ClaimsList = () => {
  const { claims } = useClaims();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ClaimPriority | 'all'>('all');

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesSearch =
        claim.emailSubject.toLowerCase().includes(search.toLowerCase()) ||
        claim.claimantName.toLowerCase().includes(search.toLowerCase()) ||
        claim.customerClaimDetail.toLowerCase().includes(search.toLowerCase()) ||
        claim.organizationClaimNumber.toLowerCase().includes(search.toLowerCase()) ||
        claim.pnr.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || claim.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [claims, search, statusFilter, priorityFilter]);

  const exportToCSV = () => {
    const headers = ['ID', 'Asunto', 'N° Reclamo Organismo', 'Tipo Claims', 'Organismo', 'Reclamante', 'RUT/DNI', 'Email', 'Teléfono', 'Motivo', 'Sub Motivo', 'PNR', 'Estado', 'Prioridad', 'Asignado a', 'Fecha Inicial', 'Fecha Creación', 'Última Actualización'];
    const rows = filteredClaims.map(claim => [
      claim.id,
      claim.emailSubject,
      claim.organizationClaimNumber || '',
      claim.claimType,
      claim.organization || '',
      claim.claimantName,
      claim.identityDocument || '',
      claim.email,
      claim.phone || '',
      claim.reason,
      claim.subReason || '',
      claim.pnr || '',
      claim.status,
      claim.priority,
      claim.assignedTo || '',
      new Date(claim.initialDate).toLocaleDateString('es-AR'),
      new Date(claim.createdAt).toLocaleString('es-AR'),
      new Date(claim.updatedAt).toLocaleString('es-AR'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reclamos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Archivo CSV descargado exitosamente');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Reclamos</h1>
          <p className="text-muted-foreground mt-1">
            Administra y da seguimiento a todos los reclamos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Link to="/claims/new">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Nuevo Reclamo
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar reclamos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ClaimStatus | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="new">Nuevo</SelectItem>
                <SelectItem value="in-progress">En Progreso</SelectItem>
                <SelectItem value="resolved">Resuelto</SelectItem>
                <SelectItem value="closed">Cerrado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as ClaimPriority | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Reclamos ({filteredClaims.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredClaims.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No se encontraron reclamos</p>
              </div>
            ) : (
              filteredClaims.map((claim) => (
                <Link
                  key={claim.id}
                  to={`/claims/${claim.id}`}
                  className="block p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{claim.emailSubject}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {claim.customerClaimDetail}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <ClaimStatusBadge status={claim.status} />
                        <ClaimPriorityBadge priority={claim.priority} />
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{claim.claimantName}</span>
                        {claim.pnr && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">PNR: {claim.pnr}</span>
                          </>
                        )}
                        {claim.assignedTo && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">Asignado a: {claim.assignedTo}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                      <div>{new Date(claim.initialDate).toLocaleDateString('es-AR')}</div>
                      <div className="text-xs mt-1">
                        {new Date(claim.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimsList;

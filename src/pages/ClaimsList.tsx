import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useClaims } from '@/contexts/ClaimContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ClaimStatusBadge from '@/components/ClaimStatusBadge';
import ClaimPriorityBadge from '@/components/ClaimPriorityBadge';
import { Plus, Search, Download, UserPlus, X, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { ClaimStatus, ClaimPriority, Country, AGENTES } from '@/types/claim';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

const ClaimsList = () => {
  const { claims, assignMultipleClaims } = useClaims();
  const { user, hasRole } = useAuth();
  
  // Estados para filtros - La fecha es el filtro principal
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState<Country | 'all'>('all');
  const [assignedToFilter, setAssignedToFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ClaimPriority | 'all'>('all');
  
  // Estado para asignación masiva
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('');

  // Primero filtrar por fecha para obtener el conjunto base
  const dateFilteredClaims = useMemo(() => {
    let claimsToShow = claims;

    // Si es analista, solo mostrar casos asignados a él
    if (hasRole(['analyst']) && user) {
      claimsToShow = claims.filter(claim => claim.assignedTo === user.name);
    }

    // Aplicar filtro de fecha primero
    if (dateFilter !== 'all') {
      claimsToShow = claimsToShow.filter((claim) => {
        const claimDate = new Date(claim.createdAt);
        const today = new Date();
        
        switch (dateFilter) {
          case 'today':
            return claimDate.toDateString() === today.toDateString();
          case 'week':
            return isWithinInterval(claimDate, {
              start: startOfWeek(today, { weekStartsOn: 1 }),
              end: endOfWeek(today, { weekStartsOn: 1 })
            });
          case 'month':
            return isWithinInterval(claimDate, {
              start: startOfMonth(today),
              end: endOfMonth(today)
            });
          case 'year':
            return isWithinInterval(claimDate, {
              start: startOfYear(today),
              end: endOfYear(today)
            });
          case 'custom':
            if (dateRange?.from) {
              if (dateRange.to) {
                return isWithinInterval(claimDate, {
                  start: dateRange.from,
                  end: dateRange.to
                });
              } else {
                return claimDate >= dateRange.from;
              }
            }
            return true;
          default:
            return true;
        }
      });
    }

    return claimsToShow;
  }, [claims, dateFilter, dateRange, hasRole, user]);

  // Luego aplicar los demás filtros sobre el conjunto filtrado por fecha
  const filteredClaims = useMemo(() => {
    return dateFilteredClaims.filter((claim) => {
      const matchesSearch =
        claim.claimNumber.toLowerCase().includes(search.toLowerCase()) ||
        claim.emailSubject.toLowerCase().includes(search.toLowerCase()) ||
        (claim.claimantName?.toLowerCase() || '').includes(search.toLowerCase()) ||
        claim.customerClaimDetail.toLowerCase().includes(search.toLowerCase()) ||
        claim.organizationClaimNumber.toLowerCase().includes(search.toLowerCase()) ||
        claim.pnr.toLowerCase().includes(search.toLowerCase());
      
      const matchesCountry = countryFilter === 'all' || claim.country === countryFilter;
      const matchesAssignedTo = assignedToFilter === 'all' || 
        (assignedToFilter === 'sin-asignar' ? !claim.assignedTo : claim.assignedTo === assignedToFilter);
      const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || claim.priority === priorityFilter;

      return matchesSearch && matchesCountry && matchesAssignedTo && matchesStatus && matchesPriority;
    });
  }, [dateFilteredClaims, search, countryFilter, assignedToFilter, statusFilter, priorityFilter]);

  const exportToCSV = () => {
    const headers = ['N° Reclamo', 'País', 'Asunto', 'N° Reclamo Organismo', 'Tipo Claims', 'Organismo', 'Reclamante', 'RUT/DNI', 'Email', 'Teléfono', 'Motivo', 'Sub Motivo', 'PNR', 'Estado', 'Prioridad', 'Asignado a', 'Estado Final', 'Fecha Inicial', 'Fecha Creación', 'Última Actualización'];
    const rows = filteredClaims.map(claim => [
      claim.claimNumber,
      claim.country,
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
      claim.finalStatus === 'cerrado' ? 'CERRADO' : 'PENDIENTE',
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

  // Funciones de asignación masiva
  const toggleClaimSelection = (claimId: string) => {
    setSelectedClaims(prev =>
      prev.includes(claimId)
        ? prev.filter(id => id !== claimId)
        : [...prev, claimId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedClaims.length === filteredClaims.length) {
      setSelectedClaims([]);
    } else {
      setSelectedClaims(filteredClaims.map(c => c.id));
    }
  };

  const handleMassiveAssign = () => {
    if (selectedClaims.length === 0) {
      toast.error('Seleccione al menos un reclamo');
      return;
    }
    setAssignDialogOpen(true);
  };

  const confirmMassiveAssign = () => {
    if (!selectedAgent) {
      toast.error('Seleccione un agente');
      return;
    }

    assignMultipleClaims(selectedClaims, selectedAgent);
    toast.success(`${selectedClaims.length} reclamo(s) asignado(s) a ${selectedAgent}`);
    setSelectedClaims([]);
    setSelectedAgent('');
    setAssignDialogOpen(false);
  };

  const canMassAssign = hasRole(['admin', 'supervisor']);

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
          {canMassAssign && selectedClaims.length > 0 && (
            <Button 
              onClick={handleMassiveAssign} 
              variant="default" 
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Asignar ({selectedClaims.length})
            </Button>
          )}
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          {hasRole(['admin', 'supervisor']) && (
            <Link to="/claims/new">
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Nuevo Reclamo
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filtros Avanzados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avanzados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Filtro de Fecha - PRIMERO */}
            <div className="space-y-2">
              <Label htmlFor="dateFilter" className="text-xs font-semibold">Periodo</Label>
              <Select value={dateFilter} onValueChange={(value) => {
                setDateFilter(value as any);
                if (value !== 'custom') {
                  setDateRange(undefined);
                }
              }}>
                <SelectTrigger id="dateFilter">
                  <SelectValue placeholder="Fecha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las fechas</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mes</SelectItem>
                  <SelectItem value="year">Este Año</SelectItem>
                  <SelectItem value="custom">Rango Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Selector de Rango de Fechas - Aparece si se selecciona "custom" */}
            {dateFilter === 'custom' && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Rango de Fechas</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd/MM/yyyy", { locale: es })} -{" "}
                            {format(dateRange.to, "dd/MM/yyyy", { locale: es })}
                          </>
                        ) : (
                          format(dateRange.from, "dd/MM/yyyy", { locale: es })
                        )
                      ) : (
                        <span>Seleccione rango</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Búsqueda */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-xs font-semibold">Buscar</Label>
              <Input
                id="search"
                placeholder="NIC, asunto, reclamante..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filtro de País */}
            <div className="space-y-2">
              <Label htmlFor="countryFilter" className="text-xs font-semibold">País</Label>
              <Select value={countryFilter} onValueChange={(value) => setCountryFilter(value as Country | 'all')}>
                <SelectTrigger id="countryFilter">
                  <SelectValue placeholder="País" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los países</SelectItem>
                  <SelectItem value="AR">🇦🇷 Argentina</SelectItem>
                  <SelectItem value="BR">🇧🇷 Brasil</SelectItem>
                  <SelectItem value="CL">🇨🇱 Chile</SelectItem>
                  <SelectItem value="CO">🇨🇴 Colombia</SelectItem>
                  <SelectItem value="EC">🇪🇨 Ecuador</SelectItem>
                  <SelectItem value="PY">🇵🇾 Paraguay</SelectItem>
                  <SelectItem value="PE">🇵🇪 Perú</SelectItem>
                  <SelectItem value="RD">🇩🇴 Rep. Dominicana</SelectItem>
                  <SelectItem value="UY">🇺🇾 Uruguay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Asignado a */}
            <div className="space-y-2">
              <Label htmlFor="assignedToFilter" className="text-xs font-semibold">Asignado a</Label>
              <Select value={assignedToFilter} onValueChange={(value) => setAssignedToFilter(value)}>
                <SelectTrigger id="assignedToFilter">
                  <SelectValue placeholder="Agente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los agentes</SelectItem>
                  <SelectItem value="sin-asignar">Sin asignar</SelectItem>
                  {AGENTES.map((agente) => (
                    <SelectItem key={agente} value={agente}>
                      {agente}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Estado */}
            <div className="space-y-2">
              <Label htmlFor="statusFilter" className="text-xs font-semibold">Estado</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ClaimStatus | 'all')}>
                <SelectTrigger id="statusFilter">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="new">Nuevo</SelectItem>
                  <SelectItem value="en-gestion">En Gestión</SelectItem>
                <SelectItem value="escalado">Escalado</SelectItem>
                <SelectItem value="enviado-abogados">Enviado a Abogados</SelectItem>
                <SelectItem value="para-cierre">Para Cierre</SelectItem>
              </SelectContent>
            </Select>
            </div>

            {/* Filtro de Prioridad */}
            <div className="space-y-2">
              <Label htmlFor="priorityFilter" className="text-xs font-semibold">Prioridad</Label>
              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as ClaimPriority | 'all')}>
                <SelectTrigger id="priorityFilter">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Indicador de registros filtrados */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{filteredClaims.length}</span> de{' '}
              <span className="font-semibold">{dateFilteredClaims.length}</span> reclamos
              {dateFilter !== 'all' && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Filtrado por fecha
                </span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {canMassAssign && filteredClaims.length > 0 && (
                <Checkbox
                  checked={selectedClaims.length === filteredClaims.length && filteredClaims.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              )}
              <CardTitle>
                Reclamos ({filteredClaims.length})
                {selectedClaims.length > 0 && (
                  <span className="text-primary ml-2">
                    - {selectedClaims.length} seleccionado(s)
                  </span>
                )}
              </CardTitle>
            </div>
            {selectedClaims.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedClaims([])}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Limpiar Selección
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredClaims.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron reclamos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {canMassAssign && <TableHead className="w-12"></TableHead>}
                    <TableHead className="font-semibold">NIC</TableHead>
                    <TableHead className="font-semibold">País</TableHead>
                    <TableHead className="font-semibold">Fecha Ingreso</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="font-semibold">Asunto</TableHead>
                    <TableHead className="font-semibold">Tipo Claims</TableHead>
                    <TableHead className="font-semibold">Organismo</TableHead>
                    <TableHead className="font-semibold">Motivo</TableHead>
                    <TableHead className="font-semibold">Sub Motivo</TableHead>
                    <TableHead className="font-semibold">Asignado a</TableHead>
                    <TableHead className="font-semibold">Estado Final</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClaims.map((claim) => (
                    <TableRow key={claim.id} className="cursor-pointer hover:bg-accent">
                      {canMassAssign && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedClaims.includes(claim.id)}
                            onCheckedChange={() => toggleClaimSelection(claim.id)}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <Link to={`/claims/${claim.id}`} className="block">
                          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded font-semibold">
                            {claim.claimNumber}
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link to={`/claims/${claim.id}`} className="block">
                          <span className="font-semibold">{claim.country}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link to={`/claims/${claim.id}`} className="block">
                          <div className="text-sm">
                            {new Date(claim.initialDate).toLocaleDateString('es-AR')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(claim.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link to={`/claims/${claim.id}`} className="block">
                          <ClaimStatusBadge status={claim.status} />
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link to={`/claims/${claim.id}`} className="block">
                          <span className="font-medium">{claim.emailSubject}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link to={`/claims/${claim.id}`} className="block">
                          <span className="text-sm uppercase">{claim.claimType}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link to={`/claims/${claim.id}`} className="block">
                          <span className="text-sm">{claim.organization}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link to={`/claims/${claim.id}`} className="block">
                          <span className="text-sm">{claim.reason.replace(/_/g, ' ')}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link to={`/claims/${claim.id}`} className="block">
                          <span className="text-sm">{claim.subReason}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link to={`/claims/${claim.id}`} className="block">
                          {claim.assignedTo ? (
                            <span className="text-sm font-medium">{claim.assignedTo}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">Sin asignar</span>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link to={`/claims/${claim.id}`} className="block">
                          {claim.finalStatus === 'cerrado' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
                              CERRADO
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                              PENDIENTE
                            </span>
                          )}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Asignación Masiva */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignación Masiva de Reclamos</DialogTitle>
            <DialogDescription>
              Asignar {selectedClaims.length} reclamo(s) seleccionado(s) a un agente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="massAgent">Seleccione un Agente</Label>
              <Select
                value={selectedAgent}
                onValueChange={setSelectedAgent}
              >
                <SelectTrigger id="massAgent">
                  <SelectValue placeholder="Seleccione un agente" />
                </SelectTrigger>
                <SelectContent>
                  {AGENTES.map((agente) => (
                    <SelectItem key={agente} value={agente}>
                      {agente}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>{selectedClaims.length}</strong> reclamo(s) serán asignados a <strong>{selectedAgent || '...'}</strong>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setAssignDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmMassiveAssign}
                className="flex-1 gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Asignar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClaimsList;

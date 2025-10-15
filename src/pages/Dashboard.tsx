import { useClaims } from '@/contexts/ClaimContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo, useState } from 'react';
import StatCard from '@/components/StatCard';
import ClaimStatusBadge from '@/components/ClaimStatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, CheckCircle, Clock, TrendingUp, Plus, Download, Filter, Calendar as CalendarIcon, PieChart as PieChartIcon, BarChart as BarChartIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClaimStatus, ClaimPriority, ClaimReason, ClaimType, Country, SUB_MOTIVOS_BY_MOTIVO, ORGANISMOS_BY_COUNTRY, AGENTES } from '@/types/claim';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const Dashboard = () => {
  const { claims } = useClaims();
  const { user, hasRole } = useAuth();

  // Estados para filtros
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ClaimPriority | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [countryFilter, setCountryFilter] = useState<Country | 'all'>('all');
  const [claimTypeFilter, setClaimTypeFilter] = useState<ClaimType | 'all'>('all');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  const [assignedToFilter, setAssignedToFilter] = useState<string>('all');
  const [reasonFilter, setReasonFilter] = useState<ClaimReason | 'all'>('all');
  const [subReasonFilter, setSubReasonFilter] = useState<string>('all');
  const [routeFilter, setRouteFilter] = useState<'all' | 'IDA' | 'VUELTA'>('all');

  // Filtrar casos según el rol
  const claimsToShow = hasRole(['analyst']) && user
    ? claims.filter(claim => claim.assignedTo === user.name)
    : claims;

  // Obtener submotivos disponibles según el motivo seleccionado
  const availableSubReasons = reasonFilter !== 'all' && reasonFilter 
    ? SUB_MOTIVOS_BY_MOTIVO[reasonFilter] || []
    : [];

  // Obtener organismos disponibles según país y tipo de claim
  const availableOrganizations = useMemo(() => {
    if (countryFilter !== 'all' && claimTypeFilter !== 'all') {
      return ORGANISMOS_BY_COUNTRY[countryFilter]?.[claimTypeFilter] || [];
    }
    // Si solo hay país, obtener todos los organismos de ese país
    if (countryFilter !== 'all') {
      const allOrgs = new Set<string>();
      Object.values(ORGANISMOS_BY_COUNTRY[countryFilter]).forEach(orgs => {
        orgs.forEach(org => allOrgs.add(org));
      });
      return Array.from(allOrgs).sort();
    }
    // Si solo hay tipo, obtener todos los organismos de ese tipo en todos los países
    if (claimTypeFilter !== 'all') {
      const allOrgs = new Set<string>();
      Object.values(ORGANISMOS_BY_COUNTRY).forEach(countryOrgs => {
        (countryOrgs[claimTypeFilter] || []).forEach(org => allOrgs.add(org));
      });
      return Array.from(allOrgs).sort();
    }
    return [];
  }, [countryFilter, claimTypeFilter]);

  // Aplicar todos los filtros
  const filteredClaims = useMemo(() => {
    return claimsToShow.filter((claim) => {
      // Filtro de búsqueda
      const matchesSearch = !search || 
        claim.claimNumber.toLowerCase().includes(search.toLowerCase()) ||
        claim.emailSubject.toLowerCase().includes(search.toLowerCase()) ||
        claim.claimantName?.toLowerCase().includes(search.toLowerCase()) ||
        claim.organization.toLowerCase().includes(search.toLowerCase());

      // Filtro de estado
      const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;

      // Filtro de prioridad
      const matchesPriority = priorityFilter === 'all' || claim.priority === priorityFilter;

      // Filtro de fecha
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const claimDate = new Date(claim.createdAt);
        const today = new Date();
        
        switch (dateFilter) {
          case 'today':
            matchesDate = claimDate.toDateString() === today.toDateString();
            break;
          case 'week':
            matchesDate = isWithinInterval(claimDate, {
              start: startOfWeek(today, { weekStartsOn: 1 }),
              end: endOfWeek(today, { weekStartsOn: 1 })
            });
            break;
          case 'month':
            matchesDate = isWithinInterval(claimDate, {
              start: startOfMonth(today),
              end: endOfMonth(today)
            });
            break;
          case 'year':
            matchesDate = isWithinInterval(claimDate, {
              start: startOfYear(today),
              end: endOfYear(today)
            });
            break;
          case 'custom':
            if (dateRange?.from) {
              if (dateRange.to) {
                matchesDate = isWithinInterval(claimDate, {
                  start: dateRange.from,
                  end: dateRange.to
                });
              } else {
                // Si solo hay fecha inicial, filtrar desde esa fecha
                matchesDate = claimDate >= dateRange.from;
              }
            }
            break;
        }
      }

      // Filtro de país
      const matchesCountry = countryFilter === 'all' || claim.country === countryFilter;

      // Filtro de tipo de claim
      const matchesClaimType = claimTypeFilter === 'all' || claim.claimType === claimTypeFilter;

      // Filtro de organismo
      const matchesOrganization = organizationFilter === 'all' || claim.organization === organizationFilter;

      // Filtro de asignado a
      const matchesAssignedTo = assignedToFilter === 'all' || 
        (assignedToFilter === 'sin-asignar' ? !claim.assignedTo : claim.assignedTo === assignedToFilter);

      // Filtro de motivo
      const matchesReason = reasonFilter === 'all' || claim.reason === reasonFilter;

      // Filtro de sub motivo
      const matchesSubReason = subReasonFilter === 'all' || claim.subReason === subReasonFilter;

      // Filtro de ruta
      let matchesRoute = true;
      if (routeFilter !== 'all') {
        if (routeFilter === 'IDA') {
          matchesRoute = !!claim.outboundFlightNumber;
        } else if (routeFilter === 'VUELTA') {
          matchesRoute = !!claim.returnFlightNumber;
        }
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesDate && matchesCountry && matchesClaimType && matchesOrganization && matchesAssignedTo && matchesReason && matchesSubReason && matchesRoute;
    });
  }, [claimsToShow, search, statusFilter, priorityFilter, dateFilter, dateRange, countryFilter, claimTypeFilter, organizationFilter, assignedToFilter, reasonFilter, subReasonFilter, routeFilter]);

  const stats = {
    total: filteredClaims.length,
    new: filteredClaims.filter(c => c.status === 'new').length,
    enGestion: filteredClaims.filter(c => c.status === 'en-gestion').length,
    escalado: filteredClaims.filter(c => c.status === 'escalado').length,
    paraCierre: filteredClaims.filter(c => c.status === 'para-cierre').length,
    critical: filteredClaims.filter(c => c.priority === 'critical').length,
  };

  // Datos para gráficos (solo para admin y supervisor)
  const countryChartData = useMemo(() => {
    const countryCounts: Record<string, number> = {};
    filteredClaims.forEach(claim => {
      countryCounts[claim.country] = (countryCounts[claim.country] || 0) + 1;
    });
    return Object.entries(countryCounts).map(([country, count]) => ({
      country,
      count,
      name: country,
    }));
  }, [filteredClaims]);

  const assignedToChartData = useMemo(() => {
    const assignedCounts: Record<string, { total: number; new: number; enGestion: number; cerrado: number }> = {};
    
    // Inicializar con todos los agentes
    AGENTES.forEach(agente => {
      assignedCounts[agente] = { total: 0, new: 0, enGestion: 0, cerrado: 0 };
    });
    assignedCounts['Sin asignar'] = { total: 0, new: 0, enGestion: 0, cerrado: 0 };
    
    filteredClaims.forEach(claim => {
      const agent = claim.assignedTo || 'Sin asignar';
      if (!assignedCounts[agent]) {
        assignedCounts[agent] = { total: 0, new: 0, enGestion: 0, cerrado: 0 };
      }
      assignedCounts[agent].total += 1;
      if (claim.status === 'new') assignedCounts[agent].new += 1;
      if (claim.status === 'en-gestion') assignedCounts[agent].enGestion += 1;
      if (claim.finalStatus === 'cerrado') assignedCounts[agent].cerrado += 1;
    });
    
    return Object.entries(assignedCounts)
      .filter(([_, counts]) => counts.total > 0)
      .map(([agent, counts]) => ({
        agent,
        total: counts.total,
        nuevos: counts.new,
        enGestion: counts.enGestion,
        cerrados: counts.cerrado,
      }));
  }, [filteredClaims]);

  const reasonChartData = useMemo(() => {
    const reasonCounts: Record<string, { total: number; pendiente: number; cerrado: number }> = {};
    
    filteredClaims.forEach(claim => {
      if (!claim.reason) return;
      const reason = claim.reason.replace(/_/g, ' ');
      if (!reasonCounts[reason]) {
        reasonCounts[reason] = { total: 0, pendiente: 0, cerrado: 0 };
      }
      reasonCounts[reason].total += 1;
      if (claim.finalStatus === 'pendiente') reasonCounts[reason].pendiente += 1;
      if (claim.finalStatus === 'cerrado') reasonCounts[reason].cerrado += 1;
    });
    
    return Object.entries(reasonCounts).map(([reason, counts]) => ({
      reason: reason.length > 20 ? reason.substring(0, 20) + '...' : reason,
      fullReason: reason,
      pendiente: counts.pendiente,
      cerrado: counts.cerrado,
      total: counts.total,
    }));
  }, [filteredClaims]);

  // Colores corporativos PANTONE
  const PANTONE_3125 = 'rgb(0, 174, 199)';   // Turquesa
  const PANTONE_534 = 'rgb(21, 50, 102)';    // Azul oscuro
  const PANTONE_1805 = 'rgb(175, 39, 47)';   // Rojo

  // Paleta de colores con degradados de los PANTONE
  const COLORS = [
    PANTONE_3125,           // Turquesa principal
    PANTONE_534,            // Azul oscuro principal
    PANTONE_1805,           // Rojo principal
    'rgb(77, 201, 219)',    // Turquesa claro (degradado de 3125)
    'rgb(51, 94, 140)',     // Azul medio (degradado de 534)
    'rgb(199, 89, 96)',     // Rojo claro (degradado de 1805)
    'rgb(156, 163, 175)',   // Gris medio
    'rgb(107, 114, 128)',   // Gris oscuro
    'rgb(209, 213, 219)',   // Gris claro
  ];

  const COUNTRY_COLORS: Record<string, string> = {
    'AR': PANTONE_3125,           // Argentina - Turquesa
    'BR': PANTONE_534,            // Brasil - Azul oscuro
    'CL': PANTONE_1805,           // Chile - Rojo
    'CO': 'rgb(77, 201, 219)',    // Colombia - Turquesa claro
    'EC': 'rgb(51, 94, 140)',     // Ecuador - Azul medio
    'PE': 'rgb(199, 89, 96)',     // Perú - Rojo claro
    'PY': 'rgb(156, 163, 175)',   // Paraguay - Gris medio
    'RD': 'rgb(107, 114, 128)',   // Rep. Dom. - Gris oscuro
    'UY': 'rgb(209, 213, 219)',   // Uruguay - Gris claro
  };

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
    link.setAttribute('download', `dashboard_claims_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {hasRole(['analyst']) 
              ? `Tus casos asignados - ${user?.name}`
              : hasRole(['supervisor'])
              ? 'Control y supervisión de todos los casos'
              : 'Resumen general de reclamos y gestión'
            }
          </p>
        </div>
        {hasRole(['admin', 'supervisor']) && (
        <Link to="/claims/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Nuevo Reclamo
          </Button>
        </Link>
        )}
      </div>

      {/* Estadísticas Compactas */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={hasRole(['analyst']) ? "Mis Reclamos" : "Total Reclamos"}
          value={stats.total}
          icon={TrendingUp}
          trend="+12% vs mes anterior"
          trendUp={false}
          color="primary"
        />
        <StatCard
          title="Nuevos"
          value={stats.new}
          icon={AlertCircle}
          color="primary"
        />
        <StatCard
          title="En Gestión"
          value={stats.enGestion}
          icon={Clock}
          color="warning"
        />
        <StatCard
          title="Para Cierre"
          value={stats.paraCierre}
          icon={CheckCircle}
          color="success"
        />
      </div>

      {/* Filtros Avanzados */}
        <Card>
          <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Avanzados
            </CardTitle>
            <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
          </CardHeader>
          <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

            {/* Filtro de Fecha */}
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

            {/* Filtro de País */}
            <div className="space-y-2">
              <Label htmlFor="countryFilter" className="text-xs font-semibold">País</Label>
              <Select value={countryFilter} onValueChange={(value) => {
                setCountryFilter(value as Country | 'all');
                setOrganizationFilter('all');
              }}>
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

            {/* Filtro de Tipo de Claim */}
            <div className="space-y-2">
              <Label htmlFor="claimTypeFilter" className="text-xs font-semibold">Tipo de Claim</Label>
              <Select value={claimTypeFilter} onValueChange={(value) => {
                setClaimTypeFilter(value as ClaimType | 'all');
                setOrganizationFilter('all');
              }}>
                <SelectTrigger id="claimTypeFilter">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="empresa">EMPRESA</SelectItem>
                  <SelectItem value="legal">LEGAL</SelectItem>
                  <SelectItem value="official">OFFICIAL</SelectItem>
                </SelectContent>
              </Select>
              </div>

            {/* Filtro de Organismo */}
            <div className="space-y-2">
              <Label htmlFor="organizationFilter" className="text-xs font-semibold">Organismo</Label>
              <Select 
                value={organizationFilter} 
                onValueChange={(value) => setOrganizationFilter(value)}
                disabled={countryFilter === 'all' && claimTypeFilter === 'all'}
              >
                <SelectTrigger id="organizationFilter">
                  <SelectValue placeholder="Organismo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los organismos</SelectItem>
                  {availableOrganizations.map((org) => (
                    <SelectItem key={org} value={org}>
                      {org}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableOrganizations.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {availableOrganizations.length} disponible(s)
                </p>
              )}
                </div>

            {/* Filtro de Motivo */}
            <div className="space-y-2">
              <Label htmlFor="reasonFilter" className="text-xs font-semibold">Motivo</Label>
              <Select value={reasonFilter} onValueChange={(value) => {
                setReasonFilter(value as ClaimReason | 'all');
                setSubReasonFilter('all');
              }}>
                <SelectTrigger id="reasonFilter">
                  <SelectValue placeholder="Motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los motivos</SelectItem>
                  <SelectItem value="Aeropuerto">Aeropuerto</SelectItem>
                  <SelectItem value="American_Airlines">American Airlines</SelectItem>
                  <SelectItem value="Cambio_de_Itinerario_y_Atrasos">Cambio de Itinerario</SelectItem>
                  <SelectItem value="Cesion_y_Retracto">Cesión y Retracto</SelectItem>
                  <SelectItem value="Club_de_Descuento">Club de Descuento</SelectItem>
                  <SelectItem value="Crisis_Social">Crisis Social</SelectItem>
                  <SelectItem value="Devoluciones">Devoluciones</SelectItem>
                  <SelectItem value="Equipaje">Equipaje</SelectItem>
                  <SelectItem value="Error_en_Compra">Error en Compra</SelectItem>
                  <SelectItem value="Gift_Card">Gift Card</SelectItem>
                  <SelectItem value="Impedimento_Médico">Impedimento Médico</SelectItem>
                  <SelectItem value="Norwegian">Norwegian</SelectItem>
                  <SelectItem value="PVC_SERNAC">PVC SERNAC</SelectItem>
                  <SelectItem value="Servicios_Opcionales">Servicios Opcionales</SelectItem>
                  <SelectItem value="Sitio_Web">Sitio Web</SelectItem>
                  <SelectItem value="Validación_de_Compra">Validación de Compra</SelectItem>
                </SelectContent>
              </Select>
              </div>

            {/* Filtro de Sub Motivo */}
            <div className="space-y-2">
              <Label htmlFor="subReasonFilter" className="text-xs font-semibold">Sub Motivo</Label>
              <Select 
                value={subReasonFilter} 
                onValueChange={(value) => setSubReasonFilter(value)}
                disabled={reasonFilter === 'all'}
              >
                <SelectTrigger id="subReasonFilter">
                  <SelectValue placeholder="Sub Motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los sub motivos</SelectItem>
                  {availableSubReasons.map((subReason) => (
                    <SelectItem key={subReason} value={subReason}>
                      {subReason}
                    </SelectItem>
                  ))}
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

            {/* Filtro de Ruta */}
            <div className="space-y-2">
              <Label htmlFor="routeFilter" className="text-xs font-semibold">Ruta</Label>
              <Select value={routeFilter} onValueChange={(value) => setRouteFilter(value as any)}>
                <SelectTrigger id="routeFilter">
                  <SelectValue placeholder="Ruta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las rutas</SelectItem>
                  <SelectItem value="IDA">Solo IDA</SelectItem>
                  <SelectItem value="VUELTA">Solo VUELTA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos - Solo para Admin y Supervisor */}
      {hasRole(['admin', 'supervisor']) && filteredClaims.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Gráfico de Torta - Claims por País */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieChartIcon className="h-5 w-5" />
                Claims por País
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={countryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ country, count, percent }) => `${country}: ${count} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {countryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COUNTRY_COLORS[entry.country] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Barras Agrupadas - Por Asignado a */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChartIcon className="h-5 w-5" />
                Claims por Agente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={assignedToChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="agent" angle={-45} textAnchor="end" height={100} fontSize={11} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="nuevos" fill={PANTONE_3125} name="Nuevos" />
                  <Bar dataKey="enGestion" fill={PANTONE_534} name="En Gestión" />
                  <Bar dataKey="cerrados" fill={PANTONE_1805} name="Cerrados" />
                </BarChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>

          {/* Gráfico de Barras Apiladas - Por Motivos */}
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChartIcon className="h-5 w-5" />
                Claims por Motivo
              </CardTitle>
          </CardHeader>
          <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reasonChartData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="reason" width={150} fontSize={11} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border-2 rounded shadow-lg" style={{ borderColor: PANTONE_534 }}>
                            <p className="font-semibold mb-2" style={{ color: PANTONE_534 }}>{data.fullReason}</p>
                            <p className="text-sm font-medium" style={{ color: PANTONE_534 }}>Pendientes: {data.pendiente}</p>
                            <p className="text-sm font-medium" style={{ color: PANTONE_3125 }}>Cerrados: {data.cerrado}</p>
                            <p className="text-sm font-bold mt-1" style={{ color: PANTONE_1805 }}>Total: {data.total}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="pendiente" stackId="a" fill={PANTONE_534} name="Pendiente" />
                  <Bar dataKey="cerrado" stackId="a" fill={PANTONE_3125} name="Cerrado" />
                </BarChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Tabla de Reclamos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Listado de Reclamos ({filteredClaims.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
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
                {filteredClaims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      No se encontraron reclamos con los filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClaims.map((claim) => (
                    <TableRow key={claim.id} className="cursor-pointer hover:bg-accent">
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
                          <span className="text-sm">{claim.reason ? claim.reason.replace(/_/g, ' ') : '-'}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link to={`/claims/${claim.id}`} className="block">
                          <span className="text-sm">{claim.subReason || '-'}</span>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

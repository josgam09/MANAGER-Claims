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
import { AlertCircle, CheckCircle, Clock, TrendingUp, Plus, Download, Filter, Calendar as CalendarIcon, PieChart as PieChartIcon, BarChart as BarChartIcon, ChevronDown, ChevronUp, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ClaimStatus, ClaimPriority, ClaimReason, ClaimType, Country, SUB_MOTIVOS_BY_MOTIVO, ORGANISMOS_BY_COUNTRY, AGENTES } from '@/types/claim';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'sonner';

const Dashboard = () => {
  const { claims } = useClaims();
  const { user, hasRole } = useAuth();

  // Estados para filtros
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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

  // Estados de ordenamiento
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Contador de filtros activos
  const activeFiltersCount = [
    dateFilter !== 'all',
    search !== '',
    statusFilter !== 'all',
    priorityFilter !== 'all',
    countryFilter !== 'all',
    claimTypeFilter !== 'all',
    organizationFilter !== 'all',
    assignedToFilter !== 'all',
    reasonFilter !== 'all',
    subReasonFilter !== 'all',
    routeFilter !== 'all',
  ].filter(Boolean).length;

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setDateFilter('all');
    setDateRange(undefined);
    setCountryFilter('all');
    setClaimTypeFilter('all');
    setOrganizationFilter('all');
    setAssignedToFilter('all');
    setReasonFilter('all');
    setSubReasonFilter('all');
    setRouteFilter('all');
    toast.success('Filtros limpiados');
  };

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
  // Función para manejar el ordenamiento
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredClaims = useMemo(() => {
    const filtered = claimsToShow.filter((claim) => {
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

    // Aplicar ordenamiento
    return filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case 'claimNumber':
          aValue = a.claimNumber;
          bValue = b.claimNumber;
          break;
        case 'country':
          aValue = a.country;
          bValue = b.country;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'emailSubject':
          aValue = a.emailSubject;
          bValue = b.emailSubject;
          break;
        case 'claimType':
          aValue = a.claimType;
          bValue = b.claimType;
          break;
        case 'organization':
          aValue = a.organization || '';
          bValue = b.organization || '';
          break;
        case 'reason':
          aValue = a.reason || '';
          bValue = b.reason || '';
          break;
        case 'subReason':
          aValue = a.subReason || '';
          bValue = b.subReason || '';
          break;
        case 'assignedTo':
          aValue = a.assignedTo || '';
          bValue = b.assignedTo || '';
          break;
        case 'finalStatus':
          aValue = a.finalStatus || '';
          bValue = b.finalStatus || '';
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [claimsToShow, search, statusFilter, priorityFilter, dateFilter, dateRange, countryFilter, claimTypeFilter, organizationFilter, assignedToFilter, reasonFilter, subReasonFilter, routeFilter, sortColumn, sortDirection]);

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
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
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

      {/* Filtros Híbridos - Compactos */}
        <Card>
        <CardContent className="pt-4 pb-3">
          {/* Filtros Principales - Siempre Visibles */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5 mb-3">
            {/* Periodo */}
            <div>
              <Label htmlFor="dateFilter" className="text-xs font-medium mb-1.5 block">Periodo</Label>
              <Select value={dateFilter} onValueChange={(value) => {
                setDateFilter(value as any);
                if (value !== 'custom') setDateRange(undefined);
              }}>
                <SelectTrigger id="dateFilter" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mes</SelectItem>
                  <SelectItem value="year">Año</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Búsqueda */}
            <div>
              <Label htmlFor="search" className="text-xs font-medium mb-1.5 block">Buscar</Label>
              <Input
                id="search"
                placeholder="NIC, asunto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Estado */}
            <div>
              <Label htmlFor="statusFilter" className="text-xs font-medium mb-1.5 block">Estado</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ClaimStatus | 'all')}>
                <SelectTrigger id="statusFilter" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="new">Nuevo</SelectItem>
                  <SelectItem value="en-gestion">En Gestión</SelectItem>
                  <SelectItem value="escalado">Escalado</SelectItem>
                  <SelectItem value="enviado-abogados">Abogados</SelectItem>
                  <SelectItem value="para-cierre">Para Cierre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prioridad */}
            <div>
              <Label htmlFor="priorityFilter" className="text-xs font-medium mb-1.5 block">Prioridad</Label>
              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as ClaimPriority | 'all')}>
                <SelectTrigger id="priorityFilter" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botón Filtros Avanzados + Limpiar */}
            <div className="flex gap-2 items-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex-1 h-9"
              >
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                Más
                {activeFiltersCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                    {activeFiltersCount}
                  </span>
                )}
                {showAdvancedFilters ? <ChevronUp className="ml-1.5 h-3.5 w-3.5" /> : <ChevronDown className="ml-1.5 h-3.5 w-3.5" />}
              </Button>
              {activeFiltersCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-9 px-2"
                  title="Limpiar filtros"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportToCSV}
                className="h-9 px-2"
                title="Exportar CSV"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Rango de Fechas Personalizado - Aparece si es necesario */}
          {dateFilter === 'custom' && (
            <div className="mb-3 pb-3 border-b">
              <Label className="text-xs font-medium mb-1.5 block">Rango de Fechas</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("h-9 justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>{format(dateRange.from, "dd/MM/yy", { locale: es })} - {format(dateRange.to, "dd/MM/yy", { locale: es })}</>
                      ) : format(dateRange.from, "dd/MM/yy", { locale: es })
                    ) : <span>Seleccione rango</span>}
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

          {/* Filtros Avanzados - Colapsables */}
          {showAdvancedFilters && (
            <div className="pt-3 border-t">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {/* País */}
                <div>
                  <Label htmlFor="countryFilter" className="text-xs font-medium mb-1.5 block">País</Label>
                  <Select value={countryFilter} onValueChange={(value) => {
                    setCountryFilter(value as Country | 'all');
                    setOrganizationFilter('all');
                  }}>
                    <SelectTrigger id="countryFilter" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="AR">🇦🇷 Argentina</SelectItem>
                      <SelectItem value="BR">🇧🇷 Brasil</SelectItem>
                      <SelectItem value="CL">🇨🇱 Chile</SelectItem>
                      <SelectItem value="CO">🇨🇴 Colombia</SelectItem>
                      <SelectItem value="EC">🇪🇨 Ecuador</SelectItem>
                      <SelectItem value="PY">🇵🇾 Paraguay</SelectItem>
                      <SelectItem value="PE">🇵🇪 Perú</SelectItem>
                      <SelectItem value="RD">🇩🇴 RD</SelectItem>
                      <SelectItem value="UY">🇺🇾 Uruguay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo de Claim */}
                <div>
                  <Label htmlFor="claimTypeFilter" className="text-xs font-medium mb-1.5 block">Tipo</Label>
                  <Select value={claimTypeFilter} onValueChange={(value) => {
                    setClaimTypeFilter(value as ClaimType | 'all');
                    setOrganizationFilter('all');
                  }}>
                    <SelectTrigger id="claimTypeFilter" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="empresa">EMPRESA</SelectItem>
                      <SelectItem value="legal">LEGAL</SelectItem>
                      <SelectItem value="official">OFFICIAL</SelectItem>
                    </SelectContent>
                  </Select>
              </div>

                {/* Organismo */}
                <div>
                  <Label htmlFor="organizationFilter" className="text-xs font-medium mb-1.5 block">Organismo</Label>
                  <Select 
                    value={organizationFilter} 
                    onValueChange={(value) => setOrganizationFilter(value)}
                    disabled={countryFilter === 'all' && claimTypeFilter === 'all'}
                  >
                    <SelectTrigger id="organizationFilter" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {availableOrganizations.map((org) => (
                        <SelectItem key={org} value={org}>
                          {org}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Asignado a */}
                <div>
                  <Label htmlFor="assignedToFilter" className="text-xs font-medium mb-1.5 block">Asignado a</Label>
                  <Select value={assignedToFilter} onValueChange={(value) => setAssignedToFilter(value)}>
                    <SelectTrigger id="assignedToFilter" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="sin-asignar">Sin asignar</SelectItem>
                      {AGENTES.map((agente) => (
                        <SelectItem key={agente} value={agente}>
                          {agente}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>

                {/* Motivo */}
                <div>
                  <Label htmlFor="reasonFilter" className="text-xs font-medium mb-1.5 block">Motivo</Label>
                  <Select value={reasonFilter} onValueChange={(value) => {
                    setReasonFilter(value as ClaimReason | 'all');
                    setSubReasonFilter('all');
                  }}>
                    <SelectTrigger id="reasonFilter" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Aeropuerto">Aeropuerto</SelectItem>
                      <SelectItem value="American_Airlines">American Airlines</SelectItem>
                      <SelectItem value="Cambio_de_Itinerario_y_Atrasos">Cambio Itinerario</SelectItem>
                      <SelectItem value="Cesion_y_Retracto">Cesión</SelectItem>
                      <SelectItem value="Club_de_Descuento">Club Descuento</SelectItem>
                      <SelectItem value="Crisis_Social">Crisis Social</SelectItem>
                      <SelectItem value="Devoluciones">Devoluciones</SelectItem>
                      <SelectItem value="Equipaje">Equipaje</SelectItem>
                      <SelectItem value="Error_en_Compra">Error Compra</SelectItem>
                      <SelectItem value="Gift_Card">Gift Card</SelectItem>
                      <SelectItem value="Impedimento_Médico">Imp. Médico</SelectItem>
                      <SelectItem value="Norwegian">Norwegian</SelectItem>
                      <SelectItem value="PVC_SERNAC">PVC SERNAC</SelectItem>
                      <SelectItem value="Servicios_Opcionales">Servicios</SelectItem>
                      <SelectItem value="Sitio_Web">Sitio Web</SelectItem>
                      <SelectItem value="Validación_de_Compra">Validación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sub Motivo */}
                <div>
                  <Label htmlFor="subReasonFilter" className="text-xs font-medium mb-1.5 block">Sub Motivo</Label>
                  <Select 
                    value={subReasonFilter} 
                    onValueChange={(value) => setSubReasonFilter(value)}
                    disabled={reasonFilter === 'all'}
                  >
                    <SelectTrigger id="subReasonFilter" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {availableSubReasons.map((subReason) => (
                        <SelectItem key={subReason} value={subReason}>
                          {subReason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>

                {/* Ruta */}
                <div>
                  <Label htmlFor="routeFilter" className="text-xs font-medium mb-1.5 block">Ruta</Label>
                  <Select value={routeFilter} onValueChange={(value) => setRouteFilter(value as any)}>
                    <SelectTrigger id="routeFilter" className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="IDA">IDA</SelectItem>
                      <SelectItem value="VUELTA">VUELTA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráficos - Solo para Admin y Supervisor */}
      {hasRole(['admin', 'supervisor']) && filteredClaims.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Gráfico de Torta - Claims por País */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChartIcon className="h-4 w-4" />
                Claims por País
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={280}>
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
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChartIcon className="h-4 w-4" />
                Claims por Agente
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={280}>
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
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChartIcon className="h-4 w-4" />
                Claims por Motivo
              </CardTitle>
          </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={280}>
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
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Listado de Reclamos ({filteredClaims.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold hover:bg-accent" onClick={() => handleSort('claimNumber')}>
                      NIC
                      {sortColumn === 'claimNumber' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                      {sortColumn !== 'claimNumber' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead className="py-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold hover:bg-accent" onClick={() => handleSort('country')}>
                      País
                      {sortColumn === 'country' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                      {sortColumn !== 'country' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead className="py-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold hover:bg-accent whitespace-normal text-left" onClick={() => handleSort('createdAt')}>
                      Fecha<br/>Ingreso
                      {sortColumn === 'createdAt' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                      {sortColumn !== 'createdAt' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead className="py-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold hover:bg-accent" onClick={() => handleSort('status')}>
                      Estado
                      {sortColumn === 'status' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                      {sortColumn !== 'status' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead className="py-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold hover:bg-accent" onClick={() => handleSort('emailSubject')}>
                      Asunto
                      {sortColumn === 'emailSubject' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                      {sortColumn !== 'emailSubject' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead className="py-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold hover:bg-accent whitespace-normal text-left" onClick={() => handleSort('claimType')}>
                      Tipo<br/>Claims
                      {sortColumn === 'claimType' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                      {sortColumn !== 'claimType' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead className="py-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold hover:bg-accent" onClick={() => handleSort('organization')}>
                      Organismo
                      {sortColumn === 'organization' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                      {sortColumn !== 'organization' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead className="py-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold hover:bg-accent" onClick={() => handleSort('reason')}>
                      Motivo
                      {sortColumn === 'reason' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                      {sortColumn !== 'reason' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead className="py-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold hover:bg-accent whitespace-normal text-left" onClick={() => handleSort('subReason')}>
                      Sub<br/>Motivo
                      {sortColumn === 'subReason' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                      {sortColumn !== 'subReason' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead className="py-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold hover:bg-accent whitespace-normal text-left" onClick={() => handleSort('assignedTo')}>
                      Asignado<br/>a
                      {sortColumn === 'assignedTo' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                      {sortColumn !== 'assignedTo' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
                  <TableHead className="py-2">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold hover:bg-accent whitespace-normal text-left" onClick={() => handleSort('finalStatus')}>
                      Estado<br/>Final
                      {sortColumn === 'finalStatus' && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />)}
                      {sortColumn !== 'finalStatus' && <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />}
                    </Button>
                  </TableHead>
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
                      <TableCell className="py-2">
                        <Link to={`/claims/${claim.id}`} className="block">
                          <span className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded font-semibold">
                            {claim.claimNumber}
                      </span>
                        </Link>
                      </TableCell>
                      <TableCell className="py-2">
                        <Link to={`/claims/${claim.id}`} className="block">
                          <span className="text-xs font-semibold">{claim.country}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="py-2">
                        <Link to={`/claims/${claim.id}`} className="block">
                          <div className="text-xs">
                    {new Date(claim.initialDate).toLocaleDateString('es-AR')}
                  </div>
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(claim.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </Link>
                      </TableCell>
                      <TableCell className="py-2">
                        <Link to={`/claims/${claim.id}`} className="block">
                          <ClaimStatusBadge status={claim.status} />
                        </Link>
                      </TableCell>
                      <TableCell className="py-2">
                        <Link to={`/claims/${claim.id}`} className="block">
                          <span className="text-xs font-medium">{claim.emailSubject}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="py-2">
                        <Link to={`/claims/${claim.id}`} className="block">
                          <span className="text-xs uppercase">{claim.claimType}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="py-2">
                        <Link to={`/claims/${claim.id}`} className="block">
                          <span className="text-xs">{claim.organization}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="py-2">
                        <Link to={`/claims/${claim.id}`} className="block">
                          <span className="text-xs">{claim.reason ? claim.reason.replace(/_/g, ' ') : '-'}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="py-2">
                        <Link to={`/claims/${claim.id}`} className="block">
                          <span className="text-xs">{claim.subReason || '-'}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="py-2">
                        <Link to={`/claims/${claim.id}`} className="block">
                          {claim.assignedTo ? (
                            <span className="text-xs font-medium">{claim.assignedTo}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Sin asignar</span>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell className="py-2">
                        <Link to={`/claims/${claim.id}`} className="block">
                          {claim.finalStatus === 'cerrado' ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-800 border border-green-300">
                              CERRADO
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
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

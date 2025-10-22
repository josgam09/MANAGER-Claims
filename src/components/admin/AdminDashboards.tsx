import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LayoutDashboard, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface CustomDashboard {
  id: string;
  name: string;
  role: 'admin' | 'supervisor' | 'analyst';
  widgets: string[];
  isActive: boolean;
}

const AdminDashboards = () => {
  const [dashboards, setDashboards] = useState<CustomDashboard[]>([
    { id: '1', name: 'Dashboard Administrador', role: 'admin', widgets: ['Estadísticas Generales', 'Usuarios Activos', 'Rendimiento'], isActive: true },
    { id: '2', name: 'Dashboard Supervisor', role: 'supervisor', widgets: ['Casos Totales', 'Asignaciones', 'Productividad'], isActive: true },
    { id: '3', name: 'Dashboard Analista', role: 'analyst', widgets: ['Mis Casos', 'Casos Pendientes', 'Casos Resueltos'], isActive: true },
  ]);

  const [newDashboard, setNewDashboard] = useState({
    name: '',
    role: 'analyst' as CustomDashboard['role'],
    widgets: [] as string[],
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  const availableWidgets = [
    'Estadísticas Generales',
    'Casos Totales',
    'Mis Casos',
    'Casos Pendientes',
    'Casos Resueltos',
    'Usuarios Activos',
    'Asignaciones',
    'Rendimiento',
    'Productividad',
    'Gráfico de Estados',
    'Gráfico de Prioridades',
    'Reclamos Recientes',
  ];

  const handleCreateDashboard = () => {
    if (!newDashboard.name) {
      toast.error('El nombre del dashboard es requerido');
      return;
    }

    if (newDashboard.widgets.length === 0) {
      toast.error('Seleccione al menos un widget');
      return;
    }

    const dashboard: CustomDashboard = {
      id: Date.now().toString(),
      ...newDashboard,
      isActive: true,
    };

    setDashboards([...dashboards, dashboard]);
    setNewDashboard({ name: '', role: 'analyst', widgets: [] });
    setDialogOpen(false);
    toast.success('Dashboard creado exitosamente');
  };

  const toggleDashboardStatus = (id: string) => {
    setDashboards(dashboards.map(d => 
      d.id === id ? { ...d, isActive: !d.isActive } : d
    ));
    toast.success('Estado actualizado');
  };

  const deleteDashboard = (id: string) => {
    setDashboards(dashboards.filter(d => d.id !== id));
    toast.success('Dashboard eliminado');
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'supervisor': return 'Supervisor';
      case 'analyst': return 'Analista';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-300';
      case 'supervisor': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'analyst': return 'bg-green-100 text-green-700 border-green-300';
      default: return '';
    }
  };

  const toggleWidget = (widget: string) => {
    const currentWidgets = newDashboard.widgets;
    if (currentWidgets.includes(widget)) {
      setNewDashboard({ ...newDashboard, widgets: currentWidgets.filter(w => w !== widget) });
    } else {
      setNewDashboard({ ...newDashboard, widgets: [...currentWidgets, widget] });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              Gestión de Dashboards
            </CardTitle>
            <CardDescription>Crear y configurar dashboards personalizados por rol</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Dashboard
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Dashboard</DialogTitle>
                <DialogDescription>
                  Configure un dashboard personalizado para un rol específico
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="dashName">Nombre del Dashboard</Label>
                  <Input
                    id="dashName"
                    value={newDashboard.name}
                    onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })}
                    placeholder="Ej: Dashboard Personalizado Analista"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dashRole">Rol Asignado</Label>
                  <Select
                    value={newDashboard.role}
                    onValueChange={(value) => setNewDashboard({ ...newDashboard, role: value as any })}
                  >
                    <SelectTrigger id="dashRole">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="analyst">Analista</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Widgets a Mostrar</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg">
                    {availableWidgets.map((widget) => (
                      <button
                        key={widget}
                        type="button"
                        onClick={() => toggleWidget(widget)}
                        className={`p-3 text-left text-sm rounded-md border-2 transition-all ${
                          newDashboard.widgets.includes(widget)
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {widget}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {newDashboard.widgets.length} widget(s) seleccionado(s)
                  </p>
                </div>
                <Button onClick={handleCreateDashboard} className="w-full">
                  Crear Dashboard
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {dashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                dashboard.isActive ? 'border-border bg-card' : 'border-muted bg-muted/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <p className="font-semibold">{dashboard.name}</p>
                    <Badge variant="outline" className={`text-xs ${getRoleBadgeColor(dashboard.role)}`}>
                      {getRoleName(dashboard.role)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {dashboard.widgets.length} widgets
                    </Badge>
                    {!dashboard.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Inactivo
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dashboard.widgets.map((widget, idx) => (
                      <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {widget}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={dashboard.isActive ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => toggleDashboardStatus(dashboard.id)}
                  >
                    {dashboard.isActive ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteDashboard(dashboard.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDashboards;



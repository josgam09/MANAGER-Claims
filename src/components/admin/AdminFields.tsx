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
import { FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number';
  category: 'reclamo' | 'usuario' | 'sistema';
  required: boolean;
  isActive: boolean;
}

const AdminFields = () => {
  const [fields, setFields] = useState<CustomField[]>([
    { id: '1', name: 'Referencia Externa', type: 'text', category: 'reclamo', required: false, isActive: true },
    { id: '2', name: 'Notas Internas', type: 'textarea', category: 'sistema', required: false, isActive: true },
  ]);

  const [newField, setNewField] = useState({
    name: '',
    type: 'text' as CustomField['type'],
    category: 'reclamo' as CustomField['category'],
    required: false,
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateField = () => {
    if (!newField.name) {
      toast.error('El nombre del campo es requerido');
      return;
    }

    const field: CustomField = {
      id: Date.now().toString(),
      ...newField,
      isActive: true,
    };

    setFields([...fields, field]);
    setNewField({ name: '', type: 'text', category: 'reclamo', required: false });
    setDialogOpen(false);
    toast.success('Campo creado exitosamente');
  };

  const toggleFieldStatus = (id: string) => {
    setFields(fields.map(f => 
      f.id === id ? { ...f, isActive: !f.isActive } : f
    ));
    toast.success('Estado actualizado');
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    toast.success('Campo eliminado');
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: 'Texto',
      textarea: 'Área de Texto',
      select: 'Lista Desplegable',
      date: 'Fecha',
      number: 'Número',
    };
    return labels[type] || type;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      reclamo: 'Reclamo',
      usuario: 'Usuario',
      sistema: 'Sistema',
    };
    return labels[category] || category;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Gestión de Campos
            </CardTitle>
            <CardDescription>Agregar y gestionar campos personalizados del formulario</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Campo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Campo</DialogTitle>
                <DialogDescription>
                  Configure un campo personalizado para el formulario de reclamos
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fieldName">Nombre del Campo</Label>
                  <Input
                    id="fieldName"
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    placeholder="Ej: Código de Seguimiento"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fieldType">Tipo de Campo</Label>
                  <Select
                    value={newField.type}
                    onValueChange={(value) => setNewField({ ...newField, type: value as any })}
                  >
                    <SelectTrigger id="fieldType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="textarea">Área de Texto</SelectItem>
                      <SelectItem value="select">Lista Desplegable</SelectItem>
                      <SelectItem value="date">Fecha</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fieldCategory">Categoría</Label>
                  <Select
                    value={newField.category}
                    onValueChange={(value) => setNewField({ ...newField, category: value as any })}
                  >
                    <SelectTrigger id="fieldCategory">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reclamo">Reclamo</SelectItem>
                      <SelectItem value="usuario">Usuario</SelectItem>
                      <SelectItem value="sistema">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={newField.required}
                    onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="required">Campo Requerido</Label>
                </div>
                <Button onClick={handleCreateField} className="w-full">
                  Crear Campo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {fields.map((field) => (
            <div
              key={field.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                field.isActive ? 'border-border bg-card' : 'border-muted bg-muted/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <p className="font-semibold">{field.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(field.type)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(field.category)}
                    </Badge>
                    {field.required && (
                      <Badge variant="destructive" className="text-xs">
                        Requerido
                      </Badge>
                    )}
                    {!field.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Inactivo
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={field.isActive ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => toggleFieldStatus(field.id)}
                  >
                    {field.isActive ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteField(field.id)}
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

export default AdminFields;



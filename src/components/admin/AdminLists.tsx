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
import { List as ListIcon, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

interface CustomList {
  id: string;
  name: string;
  category: 'reclamo' | 'asignacion' | 'escalamiento';
  options: string[];
  isActive: boolean;
}

const AdminLists = () => {
  const [lists, setLists] = useState<CustomList[]>([
    { id: '1', name: 'Canales de Contacto', category: 'reclamo', options: ['Email', 'Teléfono', 'Redes Sociales', 'WhatsApp'], isActive: true },
    { id: '2', name: 'Nivel de Escalamiento', category: 'escalamiento', options: ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Gerencia'], isActive: true },
  ]);

  const [newList, setNewList] = useState({
    name: '',
    category: 'reclamo' as CustomList['category'],
    options: [''],
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateList = () => {
    if (!newList.name) {
      toast.error('El nombre de la lista es requerido');
      return;
    }

    const validOptions = newList.options.filter(opt => opt.trim() !== '');
    if (validOptions.length === 0) {
      toast.error('Agregue al menos una opción');
      return;
    }

    const list: CustomList = {
      id: Date.now().toString(),
      name: newList.name,
      category: newList.category,
      options: validOptions,
      isActive: true,
    };

    setLists([...lists, list]);
    setNewList({ name: '', category: 'reclamo', options: [''] });
    setDialogOpen(false);
    toast.success('Lista creada exitosamente');
  };

  const addOption = () => {
    setNewList({ ...newList, options: [...newList.options, ''] });
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...newList.options];
    updated[index] = value;
    setNewList({ ...newList, options: updated });
  };

  const removeOption = (index: number) => {
    setNewList({ ...newList, options: newList.options.filter((_, i) => i !== index) });
  };

  const toggleListStatus = (id: string) => {
    setLists(lists.map(l => 
      l.id === id ? { ...l, isActive: !l.isActive } : l
    ));
    toast.success('Estado actualizado');
  };

  const deleteList = (id: string) => {
    setLists(lists.filter(l => l.id !== id));
    toast.success('Lista eliminada');
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      reclamo: 'Reclamo',
      asignacion: 'Asignación',
      escalamiento: 'Escalamiento',
    };
    return labels[category] || category;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ListIcon className="h-5 w-5" />
              Gestión de Listas
            </CardTitle>
            <CardDescription>Crear y administrar listas desplegables personalizadas</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nueva Lista
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nueva Lista</DialogTitle>
                <DialogDescription>
                  Configure una lista desplegable personalizada para el sistema
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="listName">Nombre de la Lista</Label>
                  <Input
                    id="listName"
                    value={newList.name}
                    onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                    placeholder="Ej: Métodos de Pago"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="listCategory">Categoría</Label>
                  <Select
                    value={newList.category}
                    onValueChange={(value) => setNewList({ ...newList, category: value as any })}
                  >
                    <SelectTrigger id="listCategory">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reclamo">Reclamo</SelectItem>
                      <SelectItem value="asignacion">Asignación</SelectItem>
                      <SelectItem value="escalamiento">Escalamiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Opciones de la Lista</Label>
                  {newList.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Opción ${index + 1}`}
                      />
                      {newList.options.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeOption(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Opción
                  </Button>
                </div>
                <Button onClick={handleCreateList} className="w-full">
                  Crear Lista
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lists.map((list) => (
            <div
              key={list.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                list.isActive ? 'border-border bg-card' : 'border-muted bg-muted/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <p className="font-semibold">{list.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(list.category)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {list.options.length} opciones
                    </Badge>
                    {!list.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Inactiva
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {list.options.map((opt, idx) => (
                      <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={list.isActive ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => toggleListStatus(list.id)}
                  >
                    {list.isActive ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteList(list.id)}
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

export default AdminLists;


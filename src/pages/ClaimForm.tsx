import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useClaims } from '@/contexts/ClaimContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { ClaimStatus, ClaimPriority, ClaimCategory } from '@/types/claim';
import { toast } from 'sonner';

const ClaimForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addClaim, updateClaim, getClaim, addClaimHistory } = useClaims();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'new' as ClaimStatus,
    priority: 'medium' as ClaimPriority,
    category: 'other' as ClaimCategory,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    assignedTo: '',
  });

  useEffect(() => {
    if (isEditing && id) {
      const claim = getClaim(id);
      if (claim) {
        setFormData({
          title: claim.title,
          description: claim.description,
          status: claim.status,
          priority: claim.priority,
          category: claim.category,
          customerName: claim.customerName,
          customerEmail: claim.customerEmail,
          customerPhone: claim.customerPhone || '',
          assignedTo: claim.assignedTo || '',
        });
      }
    }
  }, [id, isEditing, getClaim]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.customerName || !formData.customerEmail) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    if (isEditing && id) {
      updateClaim(id, formData);
      addClaimHistory(id, 'Reclamo actualizado', 'Información del reclamo modificada');
      toast.success('Reclamo actualizado exitosamente');
    } else {
      addClaim(formData);
      toast.success('Reclamo creado exitosamente');
    }

    navigate('/claims');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button onClick={() => navigate('/claims')} variant="outline" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isEditing ? 'Editar Reclamo' : 'Nuevo Reclamo'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Breve descripción del reclamo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción Detallada *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describa el reclamo en detalle..."
                  rows={5}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as ClaimStatus })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Nuevo</SelectItem>
                      <SelectItem value="in-progress">En Progreso</SelectItem>
                      <SelectItem value="resolved">Resuelto</SelectItem>
                      <SelectItem value="closed">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as ClaimPriority })}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as ClaimCategory })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Producto</SelectItem>
                      <SelectItem value="service">Servicio</SelectItem>
                      <SelectItem value="billing">Facturación</SelectItem>
                      <SelectItem value="technical">Técnico</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información del Cliente</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nombre Completo *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Nombre del cliente"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder="email@ejemplo.com"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Teléfono</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="+54 11 1234-5678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Asignado a</Label>
                  <Input
                    id="assignedTo"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    placeholder="Nombre del responsable"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate('/claims')}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Actualizar Reclamo' : 'Crear Reclamo'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimForm;

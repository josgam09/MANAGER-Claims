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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, CalendarIcon } from 'lucide-react';
import { ClaimStatus, ClaimPriority, ClaimType, ClaimReason } from '@/types/claim';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const ClaimForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addClaim, updateClaim, getClaim, addClaimHistory } = useClaims();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    emailSubject: '',
    organizationClaimNumber: '',
    claimType: 'compensacion' as ClaimType,
    organization: '',
    claimantName: '',
    identityDocument: '',
    email: '',
    phone: '',
    reason: 'otro' as ClaimReason,
    subReason: '',
    customerClaimDetail: '',
    informationRequest: '',
    pnr: '',
    initialDate: new Date(),
    status: 'new' as ClaimStatus,
    priority: 'medium' as ClaimPriority,
    assignedTo: '',
  });

  useEffect(() => {
    if (isEditing && id) {
      const claim = getClaim(id);
      if (claim) {
        setFormData({
          emailSubject: claim.emailSubject,
          organizationClaimNumber: claim.organizationClaimNumber,
          claimType: claim.claimType,
          organization: claim.organization,
          claimantName: claim.claimantName,
          identityDocument: claim.identityDocument,
          email: claim.email,
          phone: claim.phone,
          reason: claim.reason,
          subReason: claim.subReason,
          customerClaimDetail: claim.customerClaimDetail,
          informationRequest: claim.informationRequest,
          pnr: claim.pnr,
          initialDate: claim.initialDate,
          status: claim.status,
          priority: claim.priority,
          assignedTo: claim.assignedTo || '',
        });
      }
    }
  }, [id, isEditing, getClaim]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.emailSubject || !formData.claimantName || !formData.email || !formData.customerClaimDetail) {
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
                <Label htmlFor="emailSubject">Asunto del Correo *</Label>
                <Input
                  id="emailSubject"
                  value={formData.emailSubject}
                  onChange={(e) => setFormData({ ...formData, emailSubject: e.target.value })}
                  placeholder="Asunto del correo del reclamo"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="organizationClaimNumber">N° Reclamo Organismo</Label>
                  <Input
                    id="organizationClaimNumber"
                    value={formData.organizationClaimNumber}
                    onChange={(e) => setFormData({ ...formData, organizationClaimNumber: e.target.value })}
                    placeholder="Número de reclamo en el organismo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="claimType">Tipo Claims</Label>
                  <Select
                    value={formData.claimType}
                    onValueChange={(value) => setFormData({ ...formData, claimType: value as ClaimType })}
                  >
                    <SelectTrigger id="claimType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compensacion">Compensación</SelectItem>
                      <SelectItem value="reembolso">Reembolso</SelectItem>
                      <SelectItem value="informacion">Información</SelectItem>
                      <SelectItem value="queja">Queja</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organismo</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Nombre del organismo"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información del Reclamante</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="claimantName">Nombre del Reclamante *</Label>
                  <Input
                    id="claimantName"
                    value={formData.claimantName}
                    onChange={(e) => setFormData({ ...formData, claimantName: e.target.value })}
                    placeholder="Nombre completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identityDocument">Cédula de Identidad (RUT-DNI)</Label>
                  <Input
                    id="identityDocument"
                    value={formData.identityDocument}
                    onChange={(e) => setFormData({ ...formData, identityDocument: e.target.value })}
                    placeholder="12345678-9"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@ejemplo.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">N° Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+54 11 1234-5678"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Detalles del Reclamo</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reason">Motivos</Label>
                  <Select
                    value={formData.reason}
                    onValueChange={(value) => setFormData({ ...formData, reason: value as ClaimReason })}
                  >
                    <SelectTrigger id="reason">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demora">Demora</SelectItem>
                      <SelectItem value="cancelacion">Cancelación</SelectItem>
                      <SelectItem value="equipaje">Equipaje</SelectItem>
                      <SelectItem value="servicio-bordo">Servicio a Bordo</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subReason">Sub Motivos</Label>
                  <Input
                    id="subReason"
                    value={formData.subReason}
                    onChange={(e) => setFormData({ ...formData, subReason: e.target.value })}
                    placeholder="Especifique el sub motivo"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerClaimDetail">Detalle del Reclamo del Cliente *</Label>
                <Textarea
                  id="customerClaimDetail"
                  value={formData.customerClaimDetail}
                  onChange={(e) => setFormData({ ...formData, customerClaimDetail: e.target.value })}
                  placeholder="Describa en detalle el reclamo del cliente..."
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="informationRequest">Solicitud de Información</Label>
                <Textarea
                  id="informationRequest"
                  value={formData.informationRequest}
                  onChange={(e) => setFormData({ ...formData, informationRequest: e.target.value })}
                  placeholder="Información adicional solicitada..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pnr">PNR</Label>
                  <Input
                    id="pnr"
                    value={formData.pnr}
                    onChange={(e) => setFormData({ ...formData, pnr: e.target.value })}
                    placeholder="Código PNR"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initialDate">Fecha Inicial que se Generó el Reclamo</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.initialDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.initialDate ? format(formData.initialDate, "PPP", { locale: es }) : "Seleccione una fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.initialDate}
                        onSelect={(date) => date && setFormData({ ...formData, initialDate: date })}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Estado y Gestión</h3>

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

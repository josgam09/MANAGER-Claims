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
import { ClaimStatus, ClaimPriority, ClaimType, ClaimReason, Country, ORGANISMOS_BY_COUNTRY, SUB_MOTIVOS_BY_MOTIVO, AGENTES } from '@/types/claim';
import { toast } from 'sonner';

const ClaimForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addClaim, updateClaim, getClaim, addClaimHistory, getNextClaimNumber } = useClaims();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    country: 'AR' as Country,
    emailSubject: '',
    organizationClaimNumber: '',
    claimType: 'empresa' as ClaimType,
    organization: '',
    reason: '' as ClaimReason | '',
    subReason: '',
    customerClaimDetail: '',
    informationRequest: '',
    assignedTo: '',
    // Campos que se completarán en gestión
    claimantName: '',
    identityDocument: '',
    email: '',
    phone: '',
    status: 'new' as ClaimStatus,
    priority: 'medium' as ClaimPriority,
  });

  // Obtener organismos disponibles basados en país y tipo de claim
  const availableOrganismos = ORGANISMOS_BY_COUNTRY[formData.country]?.[formData.claimType] || [];

  // Obtener sub motivos disponibles basados en el motivo seleccionado
  const availableSubMotivos = formData.reason ? (SUB_MOTIVOS_BY_MOTIVO[formData.reason as ClaimReason] || []) : [];

  // Resetear organismo cuando cambie país o tipo de claim (solo en modo creación)
  useEffect(() => {
    if (!isEditing) {
      const currentOrgValid = availableOrganismos.includes(formData.organization);
      if (!currentOrgValid) {
        setFormData(prev => ({ ...prev, organization: '' }));
      }
    }
  }, [formData.country, formData.claimType, availableOrganismos, isEditing, formData.organization]);

  // Resetear sub motivo cuando cambie el motivo (solo en modo creación)
  useEffect(() => {
    if (!isEditing) {
      const currentSubMotivoValid = availableSubMotivos.includes(formData.subReason);
      if (!currentSubMotivoValid) {
        setFormData(prev => ({ ...prev, subReason: '' }));
      }
    }
  }, [formData.reason, availableSubMotivos, isEditing, formData.subReason]);

  useEffect(() => {
    if (isEditing && id) {
      const claim = getClaim(id);
      if (claim) {
        setFormData({
          country: claim.country,
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
          status: claim.status,
          priority: claim.priority,
          assignedTo: claim.assignedTo || '',
        });
      }
    }
  }, [id, isEditing, getClaim]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica para crear reclamo (reason y subReason son opcionales ahora)
    if (!formData.emailSubject || !formData.customerClaimDetail || !formData.organization) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    // Validación adicional para edición (gestión)
    if (isEditing && formData.claimantName && (!formData.email)) {
      toast.error('Si ingresa el nombre del reclamante, el email es requerido');
      return;
    }

    if (isEditing && id) {
      // Convertir el formData para que sea compatible con Claim
      const updateData = {
        ...formData,
        reason: formData.reason as ClaimReason,
      };
      updateClaim(id, updateData);
      addClaimHistory(id, 'Reclamo actualizado', 'Información del reclamo modificada', 'Información Básica');
      toast.success('Reclamo actualizado exitosamente');
    } else {
      // Convertir el formData para que sea compatible con Claim
      const newClaimData = {
        ...formData,
        reason: formData.reason as ClaimReason,
        finalStatus: 'pendiente' as const,
        pnr: '', // Se completará en gestión
        initialDate: new Date(), // Fecha de creación por defecto
      };
      addClaim(newClaimData);
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
            {isEditing ? 'Editar Información del Reclamo' : 'Nuevo Reclamo'}
          </CardTitle>
          {!isEditing && (
            <p className="text-sm text-muted-foreground mt-2">
              Ingrese la información básica del reclamo. El agente asignado completará los datos del reclamante posteriormente.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NIC y País en paralelo - Diseño compacto */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
                <Label className="text-xs text-muted-foreground">
                  {isEditing ? 'NIC' : 'NIC (será asignado)'}
                </Label>
                <p className="text-xl font-bold text-primary mt-1 font-mono">
                  {isEditing && id ? (getClaim(id)?.claimNumber || 'N/A') : (getNextClaimNumber() || 'NIC-00000001-2025')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">País de Origen *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value as Country })}
                >
                  <SelectTrigger id="country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AR">🇦🇷 Argentina (AR)</SelectItem>
                    <SelectItem value="BR">🇧🇷 Brasil (BR)</SelectItem>
                    <SelectItem value="CL">🇨🇱 Chile (CL)</SelectItem>
                    <SelectItem value="CO">🇨🇴 Colombia (CO)</SelectItem>
                    <SelectItem value="EC">🇪🇨 Ecuador (EC)</SelectItem>
                    <SelectItem value="PY">🇵🇾 Paraguay (PY)</SelectItem>
                    <SelectItem value="PE">🇵🇪 Perú (PE)</SelectItem>
                    <SelectItem value="RD">🇩🇴 República Dominicana (RD)</SelectItem>
                    <SelectItem value="UY">🇺🇾 Uruguay (UY)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Asunto del Correo */}
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

            {/* N° Reclamo de Organismo */}
            <div className="space-y-2">
              <Label htmlFor="organizationClaimNumber">N° Reclamo de Organismo</Label>
              <Input
                id="organizationClaimNumber"
                value={formData.organizationClaimNumber}
                onChange={(e) => setFormData({ ...formData, organizationClaimNumber: e.target.value })}
                placeholder="Número de reclamo del organismo externo"
              />
            </div>

            {/* Tipo de Claim y Organismo en paralelo */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="claimType">Tipo de Claim *</Label>
                <Select
                  value={formData.claimType}
                  onValueChange={(value) => setFormData({ ...formData, claimType: value as ClaimType })}
                >
                  <SelectTrigger id="claimType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="empresa">EMPRESA</SelectItem>
                    <SelectItem value="legal">LEGAL</SelectItem>
                    <SelectItem value="official">OFFICIAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organismo *</Label>
                <Select
                  value={formData.organization}
                  onValueChange={(value) => setFormData({ ...formData, organization: value })}
                >
                  <SelectTrigger id="organization">
                    <SelectValue placeholder="Seleccione un organismo" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOrganismos.length > 0 ? (
                      availableOrganismos.map((org) => (
                        <SelectItem key={org} value={org}>
                          {org}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-disponible" disabled>
                        Seleccione país y tipo de claim primero
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {availableOrganismos.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {availableOrganismos.length} organismo(s) disponible(s) para {formData.country} - {formData.claimType.toUpperCase()}
                  </p>
                )}
              </div>
            </div>

            {/* Motivos y Sub Motivos en paralelo - Compacto */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reason">Motivos</Label>
                <Select
                  value={formData.reason}
                  onValueChange={(value) => setFormData({ ...formData, reason: value as ClaimReason })}
                >
                  <SelectTrigger id="reason">
                    <SelectValue placeholder="Seleccione un motivo (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aeropuerto">Aeropuerto</SelectItem>
                    <SelectItem value="American_Airlines">American Airlines</SelectItem>
                    <SelectItem value="Cambio_de_Itinerario_y_Atrasos">Cambio de Itinerario y Atrasos</SelectItem>
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

              <div className="space-y-2">
                <Label htmlFor="subReason">Sub Motivos</Label>
                <Select
                  value={formData.subReason}
                  onValueChange={(value) => setFormData({ ...formData, subReason: value })}
                >
                  <SelectTrigger id="subReason">
                    <SelectValue placeholder="Seleccione un sub motivo (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubMotivos.length > 0 ? (
                      availableSubMotivos.map((subMotivo) => (
                        <SelectItem key={subMotivo} value={subMotivo}>
                          {subMotivo}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-disponible" disabled>
                        Seleccione un motivo primero
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {availableSubMotivos.length > 0 && formData.reason && (
                  <p className="text-xs text-muted-foreground">
                    {availableSubMotivos.length} sub motivo(s) disponible(s) para {formData.reason.replace(/_/g, ' ')}
                  </p>
                )}
              </div>
            </div>

            {/* Detalle del Reclamo */}
            <div className="space-y-2">
              <Label htmlFor="customerClaimDetail">Detalle del Reclamo del Cliente *</Label>
              <Textarea
                id="customerClaimDetail"
                value={formData.customerClaimDetail}
                onChange={(e) => setFormData({ ...formData, customerClaimDetail: e.target.value })}
                placeholder="Describa en detalle el reclamo del cliente..."
                rows={4}
                required
              />
            </div>

            {/* Asignación */}
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Asignado a *</Label>
                <Select
                  value={formData.assignedTo || 'sin-asignar'}
                  onValueChange={(value) => setFormData({ ...formData, assignedTo: value === 'sin-asignar' ? '' : value })}
                >
                  <SelectTrigger id="assignedTo">
                    <SelectValue placeholder="Seleccione un agente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sin-asignar">Sin asignar</SelectItem>
                    {AGENTES.map((agente) => (
                      <SelectItem key={agente} value={agente}>
                        {agente}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              <p className="text-xs text-muted-foreground">
                El agente asignado podrá gestionar el reclamo y completar la información del reclamante
              </p>
            </div>

            <div className="flex gap-4 justify-end pt-2">
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

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useClaims } from '@/contexts/ClaimContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, UserCheck, Calendar as CalendarIcon } from 'lucide-react';
import { ClaimStatus, ClaimPriority, FinalStatus, ClosureReason, Currency, PaymentType, ClaimReason, FlightOperator, AffectedFlight, AREAS_ESCALAMIENTO, CURRENCIES, SUB_MOTIVOS_BY_MOTIVO, FLIGHT_OPERATORS } from '@/types/claim';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const ClaimManagement = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateClaim, getClaim, addClaimHistory } = useClaims();
  const { user } = useAuth();

  const claim = id ? getClaim(id) : undefined;

  const [formData, setFormData] = useState({
    claimantName: '',
    identityDocument: '',
    email: '',
    phone: '',
    // Categorización (obligatorio en gestión)
    reason: '' as ClaimReason | '',
    subReason: '',
    // PNR y fechas
    pnr: '',
    initialDate: new Date(),
    // Información de vuelos
    outboundFlightDate: undefined as Date | undefined,
    outboundFlightNumber: '',
    outboundOperator: undefined as FlightOperator | undefined,
    outboundRoute: '',
    returnFlightDate: undefined as Date | undefined,
    returnFlightNumber: '',
    returnOperator: undefined as FlightOperator | undefined,
    returnRoute: '',
    affectedFlight: undefined as AffectedFlight | undefined,
    status: 'en-gestion' as ClaimStatus,
    priority: 'medium' as ClaimPriority,
    // Campos de escalamiento
    escalatedAreas: [] as string[],
    otherEscalationArea: '',
    // Campos de abogados
    lawyerInfoRequested: false,
    lawyerPaymentSentence: false,
    lawyerPaymentAgreement: false,
    // Estado final
    finalStatus: 'pendiente' as FinalStatus,
    closureReason: undefined as ClosureReason | undefined,
    // Compensación
    wasCompensated: false,
    paymentType: undefined as PaymentType | undefined,
    transferAmount: '',
    transferCurrency: undefined as Currency | undefined,
    transferCustomCurrency: '',
    gcAmount: '',
    gcCurrency: undefined as Currency | undefined,
    gcCustomCurrency: '',
  });

  // Obtener sub motivos disponibles basados en el motivo seleccionado
  const availableSubMotivos = formData.reason ? (SUB_MOTIVOS_BY_MOTIVO[formData.reason as ClaimReason] || []) : [];

  useEffect(() => {
    if (claim) {
      // Si el estado es 'new', cambiarlo automáticamente a 'en-gestion'
      const newStatus = claim.status === 'new' ? 'en-gestion' : claim.status;
      
      setFormData({
        claimantName: claim.claimantName || '',
        identityDocument: claim.identityDocument || '',
        email: claim.email || '',
        phone: claim.phone || '',
        reason: claim.reason || '',
        subReason: claim.subReason || '',
        pnr: claim.pnr || '',
        initialDate: claim.initialDate ? new Date(claim.initialDate) : new Date(),
        outboundFlightDate: claim.outboundFlightDate ? new Date(claim.outboundFlightDate) : undefined,
        outboundFlightNumber: claim.outboundFlightNumber || '',
        outboundOperator: claim.outboundOperator,
        outboundRoute: claim.outboundRoute || '',
        returnFlightDate: claim.returnFlightDate ? new Date(claim.returnFlightDate) : undefined,
        returnFlightNumber: claim.returnFlightNumber || '',
        returnOperator: claim.returnOperator,
        returnRoute: claim.returnRoute || '',
        affectedFlight: claim.affectedFlight,
        status: newStatus,
        priority: claim.priority,
        escalatedAreas: claim.escalatedAreas || [],
        otherEscalationArea: claim.otherEscalationArea || '',
        lawyerInfoRequested: claim.lawyerInfoRequested || false,
        lawyerPaymentSentence: claim.lawyerPaymentSentence || false,
        lawyerPaymentAgreement: claim.lawyerPaymentAgreement || false,
        finalStatus: claim.finalStatus || 'pendiente',
        closureReason: claim.closureReason,
        wasCompensated: claim.wasCompensated || false,
        paymentType: claim.paymentType,
        transferAmount: claim.transferAmount || '',
        transferCurrency: claim.transferCurrency,
        transferCustomCurrency: claim.transferCustomCurrency || '',
        gcAmount: claim.gcAmount || '',
        gcCurrency: claim.gcCurrency,
        gcCustomCurrency: claim.gcCustomCurrency || '',
      });
      
      // Si cambió de 'new' a 'en-gestion', actualizar inmediatamente
      if (claim.status === 'new' && id) {
        updateClaim(id, { status: 'en-gestion' });
        addClaimHistory(id, 'Estado cambiado a En Gestión', 'El analista comenzó la gestión del caso', 'Estado');
      }
    }
  }, [claim, id, updateClaim, addClaimHistory]);

  if (!claim) {
    return (
      <div className="space-y-6">
        <Button onClick={() => navigate('/claims')} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Reclamo no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Función para validar PNR
  const validatePNR = (pnr: string): boolean => {
    if (!pnr) return true; // PNR vacío es válido (opcional)
    if (pnr.length !== 6) return false;
    const firstChar = pnr.charAt(0);
    const lastChar = pnr.charAt(5);
    return /[A-Za-z]/.test(firstChar) && /[A-Za-z]/.test(lastChar) && /^[A-Za-z0-9]+$/.test(pnr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.claimantName || !formData.email) {
      toast.error('El nombre del reclamante y el email son obligatorios');
      return;
    }

    // Validación de PNR
    if (formData.pnr && !validatePNR(formData.pnr)) {
      toast.error('El PNR debe tener 6 caracteres alfanuméricos, comenzando y terminando con una letra');
      return;
    }

    // Validación para estado escalado
    if (formData.status === 'escalado' && formData.escalatedAreas.length === 0) {
      toast.error('Debe seleccionar al menos un área de escalamiento');
      return;
    }

    // Validación para "Otra" área
    if (formData.status === 'escalado' && formData.escalatedAreas.includes('Otra') && !formData.otherEscalationArea) {
      toast.error('Debe especificar el área personalizada');
      return;
    }

    // Validación para estado final cerrado
    if (formData.finalStatus === 'cerrado' && !formData.closureReason) {
      toast.error('Debe seleccionar un motivo de cierre');
      return;
    }

    // Validaciones para compensación
    if (formData.wasCompensated) {
      if (!formData.paymentType) {
        toast.error('Debe seleccionar el tipo de pago de la compensación');
        return;
      }

      // Validar transferencia
      if (formData.paymentType === 'transferencia' || formData.paymentType === 'ambas') {
        if (!formData.transferAmount || !formData.transferCurrency) {
          toast.error('Debe completar el monto y la moneda de la transferencia');
          return;
        }
        if (formData.transferCurrency === 'OTRA' && !formData.transferCustomCurrency) {
          toast.error('Debe especificar la moneda personalizada de la transferencia');
          return;
        }
      }

      // Validar Gift Card
      if (formData.paymentType === 'gc' || formData.paymentType === 'ambas') {
        if (!formData.gcAmount || !formData.gcCurrency) {
          toast.error('Debe completar el monto y la moneda del Gift Card');
          return;
        }
        if (formData.gcCurrency === 'OTRA' && !formData.gcCustomCurrency) {
          toast.error('Debe especificar la moneda personalizada del Gift Card');
          return;
        }
      }
    }

    if (id) {
      // Detectar cambios para la bitácora
      const changes: string[] = [];
      if (claim?.status !== formData.status) {
        changes.push(`Estado: ${formData.status}`);
        addClaimHistory(id, 'Estado actualizado', `Cambió a: ${formData.status}`, 'Estado');
      }
      if (claim?.priority !== formData.priority) {
        changes.push(`Prioridad: ${formData.priority}`);
        addClaimHistory(id, 'Prioridad actualizada', `Cambió a: ${formData.priority}`, 'Prioridad');
      }
      if (claim?.finalStatus !== formData.finalStatus) {
        changes.push(`Estado Final: ${formData.finalStatus}`);
        addClaimHistory(id, 'Estado final actualizado', `Cambió a: ${formData.finalStatus}`, 'Estado Final');
      }
      if (claim?.closureReason !== formData.closureReason && formData.closureReason) {
        changes.push(`Motivo de Cierre: ${formData.closureReason}`);
        addClaimHistory(id, 'Motivo de cierre actualizado', `Cambió a: ${formData.closureReason}`, 'Cierre');
      }
      if (claim?.wasCompensated !== formData.wasCompensated) {
        addClaimHistory(id, 'Compensación actualizada', `Se compensó: ${formData.wasCompensated ? 'Sí' : 'No'}`, 'Compensación');
      }
      if (formData.wasCompensated && claim?.paymentType !== formData.paymentType) {
        addClaimHistory(id, 'Tipo de pago actualizado', `Tipo: ${formData.paymentType}`, 'Compensación');
      }
      // Detectar cambios en categorización
      if (claim?.reason !== formData.reason) {
        addClaimHistory(id, 'Motivo actualizado', `Cambió de "${claim?.reason || 'Sin definir'}" a "${formData.reason}"`, 'Categorización');
      }
      if (claim?.subReason !== formData.subReason) {
        addClaimHistory(id, 'Sub Motivo actualizado', `Cambió de "${claim?.subReason || 'Sin definir'}" a "${formData.subReason}"`, 'Categorización');
      }
      // Detectar cambios en PNR
      if (claim?.pnr !== formData.pnr) {
        addClaimHistory(id, 'PNR actualizado', `Cambió de "${claim?.pnr || 'Sin PNR'}" a "${formData.pnr}"`, 'Datos de Vuelo');
      }
      // Detectar cambios en información de vuelos
      if (claim?.outboundFlightNumber !== formData.outboundFlightNumber && formData.outboundFlightNumber) {
        addClaimHistory(id, 'Vuelo IDA actualizado', `Número: ${formData.outboundFlightNumber}`, 'Datos de Vuelo');
      }
      if (claim?.returnFlightNumber !== formData.returnFlightNumber && formData.returnFlightNumber) {
        addClaimHistory(id, 'Vuelo VUELTA actualizado', `Número: ${formData.returnFlightNumber}`, 'Datos de Vuelo');
      }

      updateClaim(id, formData);
      toast.success('Gestión actualizada exitosamente');
      navigate(`/claims/${id}`);
    }
  };

  return (
    <div className="space-y-3 max-w-4xl mx-auto">
      <Button onClick={() => navigate(`/claims/${id}`)} variant="outline" size="sm" className="gap-2">
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver al Detalle
      </Button>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-xl">Gestión de Reclamo</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complete la información del reclamante y gestione el estado del caso
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Banner con info del reclamo */}
          <div className="p-3 bg-muted rounded-lg mb-4">
            <div className="grid gap-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">N° Reclamo:</span>
                <span className="font-mono font-bold text-primary">{claim.claimNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">País:</span>
                <span className="font-semibold">{claim.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Asunto:</span>
                <span className="font-semibold">{claim.emailSubject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Organismo:</span>
                <span className="font-semibold">{claim.organization}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-base font-semibold">Información del Reclamante</h3>
              
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

            {/* CATEGORIZACIÓN DEL RECLAMO */}
            <Separator className="my-4" />
            <div className="space-y-4">
              <h3 className="text-base font-semibold">Categorización del Reclamo</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reason">Motivos *</Label>
                  <Select
                    value={formData.reason}
                    onValueChange={(value) => {
                      setFormData({ ...formData, reason: value as ClaimReason, subReason: '' });
                    }}
                  >
                    <SelectTrigger id="reason">
                      <SelectValue placeholder="Seleccione un motivo" />
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
                  <Label htmlFor="subReason">Sub Motivos *</Label>
                  <Select
                    value={formData.subReason}
                    onValueChange={(value) => setFormData({ ...formData, subReason: value })}
                  >
                    <SelectTrigger id="subReason">
                      <SelectValue placeholder="Seleccione un sub motivo" />
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
                      {availableSubMotivos.length} sub motivo(s) disponible(s)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* PNR Y FECHA INICIAL */}
            <Separator className="my-4" />
            <div className="space-y-4">
              <h3 className="text-base font-semibold">Datos del Reclamo y Vuelo</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pnr">PNR (Código de Reserva)</Label>
                  <Input
                    id="pnr"
                    value={formData.pnr}
                    onChange={(e) => setFormData({ ...formData, pnr: e.target.value.toUpperCase() })}
                    placeholder="ABC12D (6 caracteres)"
                    maxLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    6 caracteres alfanuméricos, comienza y termina con letra
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initialDate">Fecha Inicial del Reclamo *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="initialDate"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.initialDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.initialDate ? format(formData.initialDate, "PPP", { locale: es }) : <span>Seleccione fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.initialDate}
                        onSelect={(date) => date && setFormData({ ...formData, initialDate: date })}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* CAMPOS DE VUELO - Aparecen si hay PNR válido o si el motivo requiere información de vuelo */}
              {((formData.pnr && validatePNR(formData.pnr)) || 
                formData.reason === 'Equipaje' || 
                formData.reason === 'Cambio_de_Itinerario_y_Atrasos') && (
                <>
                  <Separator className="my-4" />
                  <div className="p-4 bg-sky-50 rounded-lg border-2 border-sky-200 space-y-4">
                    <h4 className="font-semibold text-sky-900">
                      Información de Vuelos
                      {formData.reason === 'Equipaje' && !formData.pnr && (
                        <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                          Requerido para reclamos de Equipaje
                        </span>
                      )}
                      {formData.reason === 'Cambio_de_Itinerario_y_Atrasos' && !formData.pnr && (
                        <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                          Requerido para reclamos de Cambio de Itinerario y Atrasos
                        </span>
                      )}
                    </h4>
                    
                    {/* VUELO IDA */}
                    <div className="space-y-4 p-3 bg-white rounded border border-sky-300">
                      <h5 className="font-semibold text-sky-800">Tramo IDA</h5>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="outboundFlightDate">Fecha de Vuelo</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="outboundFlightDate"
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !formData.outboundFlightDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.outboundFlightDate ? format(formData.outboundFlightDate, "PPP", { locale: es }) : <span>Fecha</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={formData.outboundFlightDate}
                                onSelect={(date) => setFormData({ ...formData, outboundFlightDate: date })}
                                initialFocus
                                locale={es}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="outboundFlightNumber">Número de Vuelo</Label>
                          <Input
                            id="outboundFlightNumber"
                            value={formData.outboundFlightNumber}
                            onChange={(e) => setFormData({ ...formData, outboundFlightNumber: e.target.value.toUpperCase() })}
                            placeholder="JA123"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="outboundOperator">Operado por</Label>
                          <Select
                            value={formData.outboundOperator}
                            onValueChange={(value) => setFormData({ ...formData, outboundOperator: value as FlightOperator })}
                          >
                            <SelectTrigger id="outboundOperator">
                              <SelectValue placeholder="Seleccione" />
                            </SelectTrigger>
                            <SelectContent>
                              {FLIGHT_OPERATORS.map((op) => (
                                <SelectItem key={op.code} value={op.code}>
                                  {op.code} - {op.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Campo Tramos IDA */}
                      <div className="space-y-2">
                        <Label htmlFor="outboundRoute">Tramos</Label>
                        <Input
                          id="outboundRoute"
                          value={formData.outboundRoute}
                          onChange={(e) => setFormData({ ...formData, outboundRoute: e.target.value.toUpperCase() })}
                          placeholder="Ejemplo: SCL-AEP"
                        />
                        <p className="text-xs text-muted-foreground">
                          Formato: ORIGEN-DESTINO (ej: SCL-AEP)
                        </p>
                      </div>
                    </div>

                    {/* VUELO VUELTA */}
                    <div className="space-y-4 p-3 bg-white rounded border border-sky-300">
                      <h5 className="font-semibold text-sky-800">Tramo VUELTA</h5>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="returnFlightDate">Fecha de Vuelo</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="returnFlightDate"
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !formData.returnFlightDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.returnFlightDate ? format(formData.returnFlightDate, "PPP", { locale: es }) : <span>Fecha</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={formData.returnFlightDate}
                                onSelect={(date) => setFormData({ ...formData, returnFlightDate: date })}
                                initialFocus
                                locale={es}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="returnFlightNumber">Número de Vuelo</Label>
                          <Input
                            id="returnFlightNumber"
                            value={formData.returnFlightNumber}
                            onChange={(e) => setFormData({ ...formData, returnFlightNumber: e.target.value.toUpperCase() })}
                            placeholder="JA456"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="returnOperator">Operado por</Label>
                          <Select
                            value={formData.returnOperator}
                            onValueChange={(value) => setFormData({ ...formData, returnOperator: value as FlightOperator })}
                          >
                            <SelectTrigger id="returnOperator">
                              <SelectValue placeholder="Seleccione" />
                            </SelectTrigger>
                            <SelectContent>
                              {FLIGHT_OPERATORS.map((op) => (
                                <SelectItem key={op.code} value={op.code}>
                                  {op.code} - {op.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Campo Tramos VUELTA */}
                      <div className="space-y-2">
                        <Label htmlFor="returnRoute">Tramos</Label>
                        <Input
                          id="returnRoute"
                          value={formData.returnRoute}
                          onChange={(e) => setFormData({ ...formData, returnRoute: e.target.value.toUpperCase() })}
                          placeholder="Ejemplo: AEP-SCL"
                        />
                        <p className="text-xs text-muted-foreground">
                          Formato: ORIGEN-DESTINO (ej: AEP-SCL)
                        </p>
                      </div>
                    </div>

                    {/* VUELO AFECTADO - Para Cambio_de_Itinerario_y_Atrasos y Equipaje */}
                    {(formData.reason === 'Cambio_de_Itinerario_y_Atrasos' || formData.reason === 'Equipaje') && (
                      <div className="space-y-2 p-3 bg-amber-50 rounded border border-amber-300">
                        <Label htmlFor="affectedFlight">¿Cuál vuelo fue afectado? *</Label>
                        <Select
                          value={formData.affectedFlight}
                          onValueChange={(value) => setFormData({ ...formData, affectedFlight: value as AffectedFlight })}
                        >
                          <SelectTrigger id="affectedFlight">
                            <SelectValue placeholder="Seleccione el vuelo afectado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IDA">IDA</SelectItem>
                            <SelectItem value="VUELTA">VUELTA</SelectItem>
                            <SelectItem value="AMBAS">AMBAS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <Separator className="my-4" />
            <div className="space-y-4">
              <h3 className="text-base font-semibold">Estado y Gestión</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Estado del Caso *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as ClaimStatus })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Nuevo</SelectItem>
                      <SelectItem value="en-gestion">En Gestión</SelectItem>
                      <SelectItem value="escalado">Escalado</SelectItem>
                      <SelectItem value="enviado-abogados">Enviado a Abogados</SelectItem>
                      <SelectItem value="para-cierre">Para Cierre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad *</Label>
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
              </div>

              {/* Campos condicionales para ESCALADO */}
              {formData.status === 'escalado' && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-4 p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                    <h4 className="font-semibold text-orange-900">Información de Escalamiento</h4>
                    <div className="space-y-2">
                      <Label>Áreas de Escalamiento *</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 border rounded-lg bg-white">
                        {AREAS_ESCALAMIENTO.map((area) => (
                          <div key={area} className="flex items-center space-x-2">
                            <Checkbox
                              id={`area-${area}`}
                              checked={formData.escalatedAreas.includes(area)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    escalatedAreas: [...formData.escalatedAreas, area]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    escalatedAreas: formData.escalatedAreas.filter(a => a !== area)
                                  });
                                }
                              }}
                            />
                            <Label htmlFor={`area-${area}`} className="text-sm cursor-pointer">
                              {area}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formData.escalatedAreas.length} área(s) seleccionada(s)
                      </p>
                    </div>
                    
                    {/* Campo libre si seleccionó "Otra" */}
                    {formData.escalatedAreas.includes('Otra') && (
                      <div className="space-y-2">
                        <Label htmlFor="otherArea">Especifique Otra Área</Label>
                        <Input
                          id="otherArea"
                          value={formData.otherEscalationArea}
                          onChange={(e) => setFormData({ ...formData, otherEscalationArea: e.target.value })}
                          placeholder="Escriba el nombre del área..."
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Campos condicionales para ENVIADO A ABOGADOS */}
              {formData.status === 'enviado-abogados' && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-4 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <h4 className="font-semibold text-purple-900">Información Legal</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="infoRequested"
                          checked={formData.lawyerInfoRequested}
                          onCheckedChange={(checked) => 
                            setFormData({ ...formData, lawyerInfoRequested: checked as boolean })
                          }
                        />
                        <Label htmlFor="infoRequested" className="cursor-pointer">
                          Pidieron Información Adicional
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="paymentSentence"
                          checked={formData.lawyerPaymentSentence}
                          onCheckedChange={(checked) => 
                            setFormData({ ...formData, lawyerPaymentSentence: checked as boolean })
                          }
                        />
                        <Label htmlFor="paymentSentence" className="cursor-pointer">
                          Solicitaron Pago de Sentencia/Costas/Apelación
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="paymentAgreement"
                          checked={formData.lawyerPaymentAgreement}
                          onCheckedChange={(checked) => 
                            setFormData({ ...formData, lawyerPaymentAgreement: checked as boolean })
                          }
                        />
                        <Label htmlFor="paymentAgreement" className="cursor-pointer">
                          Solicitaron Pago de Acuerdo
                        </Label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ESTADO FINAL */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold">Estado Final del Caso</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="finalStatus">Estado Final *</Label>
                  <Select
                    value={formData.finalStatus}
                    onValueChange={(value) => setFormData({ ...formData, finalStatus: value as FinalStatus })}
                  >
                    <SelectTrigger id="finalStatus">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="cerrado">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mostrar razón de cierre solo si está cerrado */}
                {formData.finalStatus === 'cerrado' && (
                  <div className="space-y-2">
                    <Label htmlFor="closureReason">Motivo de Cierre *</Label>
                    <Select
                      value={formData.closureReason}
                      onValueChange={(value) => setFormData({ ...formData, closureReason: value as ClosureReason })}
                    >
                      <SelectTrigger id="closureReason">
                        <SelectValue placeholder="Seleccione motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="con-acuerdo">Con Acuerdo</SelectItem>
                        <SelectItem value="sin-acuerdo">Sin Acuerdo</SelectItem>
                        <SelectItem value="incomparecencia">Incomparecencia</SelectItem>
                        <SelectItem value="aplica">Aplica</SelectItem>
                        <SelectItem value="aplica-parcial">Aplica Parcial</SelectItem>
                        <SelectItem value="no-aplica">No Aplica</SelectItem>
                        <SelectItem value="desistido">Desistido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* COMPENSACIÓN */}
            {formData.finalStatus === 'cerrado' && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <h3 className="text-base font-semibold text-blue-900">Información de Cierre</h3>
                  
                  {/* ¿Se compensó? */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">¿Se compensó al cliente?</Label>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="compensated-yes"
                          checked={formData.wasCompensated === true}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({ ...formData, wasCompensated: true });
                            }
                          }}
                        />
                        <Label htmlFor="compensated-yes" className="cursor-pointer font-normal">Sí</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="compensated-no"
                          checked={formData.wasCompensated === false}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({ 
                                ...formData, 
                                wasCompensated: false,
                                paymentType: undefined,
                                transferAmount: '',
                                transferCurrency: undefined,
                                transferCustomCurrency: '',
                                gcAmount: '',
                                gcCurrency: undefined,
                                gcCustomCurrency: ''
                              });
                            }
                          }}
                        />
                        <Label htmlFor="compensated-no" className="cursor-pointer font-normal">No</Label>
                      </div>
                    </div>
                  </div>

                  {/* Si se compensó, mostrar tipo de pago */}
                  {formData.wasCompensated && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="paymentType">Tipo de Pago *</Label>
                        <Select
                          value={formData.paymentType}
                          onValueChange={(value) => setFormData({ ...formData, paymentType: value as PaymentType })}
                        >
                          <SelectTrigger id="paymentType">
                            <SelectValue placeholder="Seleccione tipo de pago" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="transferencia">Transferencia</SelectItem>
                            <SelectItem value="gc">Gift Card (GC)</SelectItem>
                            <SelectItem value="ambas">Ambas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Campos para Transferencia */}
                      {(formData.paymentType === 'transferencia' || formData.paymentType === 'ambas') && (
                        <div className="space-y-4 p-3 bg-white rounded border border-blue-300">
                          <h4 className="font-semibold text-blue-800">Datos de Transferencia</h4>
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                              <Label htmlFor="transferAmount">Monto *</Label>
                              <Input
                                id="transferAmount"
                                type="text"
                                value={formData.transferAmount}
                                onChange={(e) => setFormData({ ...formData, transferAmount: e.target.value })}
                                placeholder="1000.00"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="transferCurrency">Moneda *</Label>
                              <Select
                                value={formData.transferCurrency}
                                onValueChange={(value) => setFormData({ ...formData, transferCurrency: value as Currency })}
                              >
                                <SelectTrigger id="transferCurrency">
                                  <SelectValue placeholder="Seleccione moneda" />
                                </SelectTrigger>
                                <SelectContent>
                                  {CURRENCIES.map((currency) => (
                                    <SelectItem key={currency} value={currency}>
                                      {currency}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {formData.transferCurrency === 'OTRA' && (
                              <div className="space-y-2">
                                <Label htmlFor="transferCustomCurrency">Especifique Moneda *</Label>
                                <Input
                                  id="transferCustomCurrency"
                                  value={formData.transferCustomCurrency}
                                  onChange={(e) => setFormData({ ...formData, transferCustomCurrency: e.target.value })}
                                  placeholder="EUR, GBP, etc."
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Campos para Gift Card */}
                      {(formData.paymentType === 'gc' || formData.paymentType === 'ambas') && (
                        <div className="space-y-4 p-3 bg-white rounded border border-blue-300">
                          <h4 className="font-semibold text-blue-800">Datos de Gift Card</h4>
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                              <Label htmlFor="gcAmount">Monto *</Label>
                              <Input
                                id="gcAmount"
                                type="text"
                                value={formData.gcAmount}
                                onChange={(e) => setFormData({ ...formData, gcAmount: e.target.value })}
                                placeholder="1000.00"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="gcCurrency">Moneda *</Label>
                              <Select
                                value={formData.gcCurrency}
                                onValueChange={(value) => setFormData({ ...formData, gcCurrency: value as Currency })}
                              >
                                <SelectTrigger id="gcCurrency">
                                  <SelectValue placeholder="Seleccione moneda" />
                                </SelectTrigger>
                                <SelectContent>
                                  {CURRENCIES.map((currency) => (
                                    <SelectItem key={currency} value={currency}>
                                      {currency}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {formData.gcCurrency === 'OTRA' && (
                              <div className="space-y-2">
                                <Label htmlFor="gcCustomCurrency">Especifique Moneda *</Label>
                                <Input
                                  id="gcCustomCurrency"
                                  value={formData.gcCustomCurrency}
                                  onChange={(e) => setFormData({ ...formData, gcCustomCurrency: e.target.value })}
                                  placeholder="EUR, GBP, etc."
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate(`/claims/${id}`)}>
                Cancelar
              </Button>
              <Button type="submit">
                Guardar Gestión
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimManagement;


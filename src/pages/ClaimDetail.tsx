import { useParams, useNavigate, Link } from 'react-router-dom';
import { useClaims } from '@/contexts/ClaimContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ClaimStatusBadge from '@/components/ClaimStatusBadge';
import ClaimPriorityBadge from '@/components/ClaimPriorityBadge';
import { ArrowLeft, Mail, Phone, User, Calendar, Clock, DollarSign, CreditCard } from 'lucide-react';

const ClaimDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClaim } = useClaims();

  const claim = id ? getClaim(id) : undefined;

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

  const claimTypeLabels = {
    empresa: 'EMPRESA',
    legal: 'LEGAL',
    official: 'OFFICIAL',
  };

  const getReasonLabel = (reason: string) => {
    return reason.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={() => navigate('/claims')} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver a Reclamos
        </Button>
        <div className="flex gap-2">
          <Link to={`/claims/${claim.id}/manage`}>
            <Button variant="default" className="gap-2">
              <User className="h-4 w-4" />
              Gestionar Reclamo
            </Button>
          </Link>
          <Link to={`/claims/${claim.id}/edit`}>
            <Button variant="outline">Editar Info</Button>
          </Link>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Número de Reclamo</p>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-primary font-mono">{claim.claimNumber}</h2>
              <span className="text-lg font-bold bg-secondary px-3 py-1 rounded">
                {claim.country}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ClaimStatusBadge status={claim.status} />
            <ClaimPriorityBadge priority={claim.priority} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{claim.emailSubject}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">N° Reclamo Organismo</h3>
                  <p className="text-muted-foreground">{claim.organizationClaimNumber || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Tipo Claims</h3>
                  <p className="text-muted-foreground">{claimTypeLabels[claim.claimType]}</p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Organismo</h3>
                  <p className="text-muted-foreground">{claim.organization || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">PNR</h3>
                  <p className="text-muted-foreground">{claim.pnr || 'N/A'}</p>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Motivo</h3>
                <p className="text-muted-foreground">{getReasonLabel(claim.reason)}</p>
                {claim.subReason && (
                  <p className="text-sm text-muted-foreground mt-1">Sub motivo: {claim.subReason}</p>
                )}
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Detalle del Reclamo</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{claim.customerClaimDetail}</p>
              </div>
              {claim.informationRequest && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Solicitud de Información</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{claim.informationRequest}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {claim.history.map((entry, index) => (
                  <div key={entry.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      {index < claim.history.length - 1 && (
                        <div className="w-0.5 h-full bg-border mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold">{entry.action}</p>
                            {entry.area && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                {entry.area}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">por {entry.user}</p>
                          {entry.comment && (
                            <p className="text-sm text-muted-foreground mt-1">{entry.comment}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(entry.date).toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Información del Cliente</CardTitle>
                {!claim.claimantName && (
                  <span className="text-xs bg-warning/20 text-warning-foreground px-2 py-1 rounded">
                    Pendiente de gestión
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {claim.claimantName ? (
                <>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre del Reclamante</p>
                      <p className="font-medium">{claim.claimantName}</p>
                    </div>
                  </div>
                  {claim.identityDocument && (
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Cédula de Identidad</p>
                        <p className="font-medium">{claim.identityDocument}</p>
                      </div>
                    </div>
                  )}
                  {claim.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium break-all">{claim.email}</p>
                      </div>
                    </div>
                  )}
                  {claim.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Teléfono</p>
                        <p className="font-medium">{claim.phone}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground mb-4">
                    La información del reclamante aún no ha sido completada
                  </p>
                  <Link to={`/claims/${claim.id}/manage`}>
                    <Button size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      Completar Información
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles del Reclamo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha Inicial del Reclamo</p>
                  <p className="font-medium">
                    {new Date(claim.initialDate).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Creación en Sistema</p>
                  <p className="font-medium">
                    {new Date(claim.createdAt).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Última Actualización</p>
                  <p className="font-medium">
                    {new Date(claim.updatedAt).toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
              {claim.assignedTo && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Asignado a</p>
                    <p className="font-medium">{claim.assignedTo}</p>
                  </div>
                </div>
              )}
              {claim.resolvedAt && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Resolución</p>
                    <p className="font-medium">
                      {new Date(claim.resolvedAt).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tarjeta de Compensación */}
          {claim.finalStatus === 'cerrado' && claim.wasCompensated !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Información de Compensación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="text-sm text-muted-foreground">¿Se compensó?</p>
                    <p className="font-semibold text-lg">
                      {claim.wasCompensated ? (
                        <span className="text-green-600">Sí</span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </p>
                  </div>
                </div>

                {claim.wasCompensated && claim.paymentType && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      {/* Transferencia */}
                      {(claim.paymentType === 'transferencia' || claim.paymentType === 'ambas') && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-blue-700" />
                            <p className="font-semibold text-blue-900">Transferencia</p>
                          </div>
                          <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Monto:</span>
                              <span className="font-medium">{claim.transferAmount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Moneda:</span>
                              <span className="font-medium">
                                {claim.transferCurrency === 'OTRA' 
                                  ? claim.transferCustomCurrency 
                                  : claim.transferCurrency}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Gift Card */}
                      {(claim.paymentType === 'gc' || claim.paymentType === 'ambas') && (
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="h-4 w-4 text-purple-700" />
                            <p className="font-semibold text-purple-900">Gift Card</p>
                          </div>
                          <div className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Monto:</span>
                              <span className="font-medium">{claim.gcAmount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Moneda:</span>
                              <span className="font-medium">
                                {claim.gcCurrency === 'OTRA' 
                                  ? claim.gcCustomCurrency 
                                  : claim.gcCurrency}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimDetail;

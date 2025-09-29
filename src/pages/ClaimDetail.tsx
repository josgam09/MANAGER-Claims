import { useParams, useNavigate, Link } from 'react-router-dom';
import { useClaims } from '@/contexts/ClaimContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ClaimStatusBadge from '@/components/ClaimStatusBadge';
import ClaimPriorityBadge from '@/components/ClaimPriorityBadge';
import { ArrowLeft, Mail, Phone, User, Calendar, Clock } from 'lucide-react';

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
    compensacion: 'Compensación',
    reembolso: 'Reembolso',
    informacion: 'Información',
    queja: 'Queja',
    otro: 'Otro',
  };

  const reasonLabels = {
    demora: 'Demora',
    cancelacion: 'Cancelación',
    equipaje: 'Equipaje',
    'servicio-bordo': 'Servicio a Bordo',
    personal: 'Personal',
    otro: 'Otro',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={() => navigate('/claims')} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver a Reclamos
        </Button>
        <Link to={`/claims/${claim.id}/edit`}>
          <Button>Editar Reclamo</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{claim.emailSubject}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <ClaimStatusBadge status={claim.status} />
                    <ClaimPriorityBadge priority={claim.priority} />
                  </div>
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
                <p className="text-muted-foreground">{reasonLabels[claim.reason]}</p>
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
                        <div>
                          <p className="font-semibold">{entry.action}</p>
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
              <CardTitle>Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{claim.email}</p>
                </div>
              </div>
              {claim.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{claim.phone}</p>
                  </div>
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
        </div>
      </div>
    </div>
  );
};

export default ClaimDetail;

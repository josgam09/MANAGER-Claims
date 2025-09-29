import { useClaims } from '@/contexts/ClaimContext';
import StatCard from '@/components/StatCard';
import ClaimStatusBadge from '@/components/ClaimStatusBadge';
import ClaimPriorityBadge from '@/components/ClaimPriorityBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { claims } = useClaims();

  const stats = {
    total: claims.length,
    new: claims.filter(c => c.status === 'new').length,
    inProgress: claims.filter(c => c.status === 'in-progress').length,
    resolved: claims.filter(c => c.status === 'resolved').length,
    critical: claims.filter(c => c.priority === 'critical').length,
  };

  const recentClaims = claims.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Resumen general de reclamos y gestión
          </p>
        </div>
        <Link to="/claims/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Nuevo Reclamo
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Reclamos"
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
          title="En Progreso"
          value={stats.inProgress}
          icon={Clock}
          color="warning"
        />
        <StatCard
          title="Resueltos"
          value={stats.resolved}
          icon={CheckCircle}
          color="success"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reclamos por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-sm">Nuevos</span>
                </div>
                <span className="font-semibold">{stats.new}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <span className="text-sm">En Progreso</span>
                </div>
                <span className="font-semibold">{stats.inProgress}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-sm">Resueltos</span>
                </div>
                <span className="font-semibold">{stats.resolved}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted"></div>
                  <span className="text-sm">Cerrados</span>
                </div>
                <span className="font-semibold">
                  {claims.filter(c => c.status === 'closed').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reclamos por Prioridad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <span className="text-sm">Crítica</span>
                </div>
                <span className="font-semibold">
                  {claims.filter(c => c.priority === 'critical').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <span className="text-sm">Alta</span>
                </div>
                <span className="font-semibold">
                  {claims.filter(c => c.priority === 'high').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="text-sm">Media</span>
                </div>
                <span className="font-semibold">
                  {claims.filter(c => c.priority === 'medium').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted"></div>
                  <span className="text-sm">Baja</span>
                </div>
                <span className="font-semibold">
                  {claims.filter(c => c.priority === 'low').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Reclamos Recientes</CardTitle>
          <Link to="/claims">
            <Button variant="outline" size="sm">Ver Todos</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentClaims.map((claim) => (
              <Link
                key={claim.id}
                to={`/claims/${claim.id}`}
                className="block p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold truncate">{claim.emailSubject}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {claim.customerClaimDetail}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <ClaimStatusBadge status={claim.status} />
                      <ClaimPriorityBadge priority={claim.priority} />
                      <span className="text-xs text-muted-foreground">
                        {claim.claimantName}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(claim.initialDate).toLocaleDateString('es-AR')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { type UserRole } from '@/types/auth';
import {
  BarChart3,
  Calendar,
  ClipboardList,
  Filter,
  Folder,
  Laptop,
  Shield,
  Sparkles,
  Terminal,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';

type RoleMeta = {
  label: string;
  tagline: string;
  badgeClass: string;
  icon: LucideIcon;
};

const ROLE_META: Record<UserRole, RoleMeta> = {
  admin: {
    label: 'Administrador',
    tagline: 'Orquestas permisos, prioridades y reportes sin perder el pulso.',
    badgeClass: 'bg-red-100 text-red-700 border-red-300',
    icon: Shield,
  },
  supervisor: {
    label: 'Supervisor',
    tagline: 'Coordinar equipos y rutas de escalamiento es tu cancha.',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: Users,
  },
  analyst: {
    label: 'Analista',
    tagline: 'Desarmas reclamos y armas conclusiones claras.',
    badgeClass: 'bg-green-100 text-green-700 border-green-300',
    icon: UserCheck,
  },
};

const FALLBACK_ROLE: RoleMeta = {
  label: 'Especialista',
  tagline: 'Siempre listo para poner orden en el tablero.',
  badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
  icon: Sparkles,
};

const KNOWN_FACTS: Array<{ label: string; value: string; icon: LucideIcon }> = [
  { label: 'OS', value: 'Linux 6.1.147', icon: Laptop },
  { label: 'Shell', value: 'bash', icon: Terminal },
  { label: 'Workspace', value: '/workspace', icon: Folder },
  { label: 'Fecha', value: 'Friday Feb 6, 2026', icon: Calendar },
];

const TOOL_BELT: Array<{ label: string; icon: LucideIcon }> = [
  { label: 'Reclamos', icon: ClipboardList },
  { label: 'Filtros', icon: Filter },
  { label: 'Graficos', icon: BarChart3 },
  { label: 'Terminal', icon: Terminal },
];

const SIGNATURE_MOVES = [
  'Filtras reclamos como si fueran logs en vivo.',
  'Alineas prioridades con un ojo en el SLA.',
  'Exportas CSV sin soltar el teclado.',
];

const CaricatureAvatar = ({ roleIcon: RoleIcon }: { roleIcon: LucideIcon }) => (
  <div className="relative">
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="Caricature avatar"
      className="h-48 w-48"
    >
      <circle cx="100" cy="105" r="70" fill="#FDE3C7" stroke="#F59E0B" strokeWidth="4" />
      <path d="M45 78 Q100 28 155 78" stroke="#1F2937" strokeWidth="12" strokeLinecap="round" />
      <circle cx="75" cy="98" r="8" fill="#1F2937" />
      <circle cx="125" cy="98" r="8" fill="#1F2937" />
      <path d="M75 132 Q100 150 125 132" stroke="#1F2937" strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx="100" cy="118" r="6" fill="#F5B57B" />
      <rect x="28" y="88" width="18" height="40" rx="9" fill="#9CA3AF" />
      <rect x="154" y="88" width="18" height="40" rx="9" fill="#9CA3AF" />
      <path d="M40 88 Q100 48 160 88" stroke="#9CA3AF" strokeWidth="8" fill="none" strokeLinecap="round" />
      <circle cx="164" cy="128" r="6" fill="#9CA3AF" />
      <rect x="144" y="132" width="22" height="6" rx="3" fill="#9CA3AF" />
    </svg>
    <div className="absolute -bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
      <RoleIcon className="h-4 w-4" />
    </div>
  </div>
);

const CaricatureCard = () => {
  const { user } = useAuth();
  const roleInfo = user ? ROLE_META[user.role] : FALLBACK_ROLE;
  const RoleIcon = roleInfo.icon;
  const displayName = user?.name ?? 'Tu perfil';

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Tu caricatura laboral
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={`gap-1 ${roleInfo.badgeClass}`}>
                <RoleIcon className="h-3 w-3" />
                {roleInfo.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Alias: {displayName}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold">{displayName}</h3>
              <p className="text-sm text-muted-foreground">{roleInfo.tagline}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {KNOWN_FACTS.map((fact) => {
                const FactIcon = fact.icon;
                return (
                  <Badge key={fact.label} variant="secondary" className="gap-1">
                    <FactIcon className="h-3 w-3" />
                    {fact.label}: {fact.value}
                  </Badge>
                );
              })}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Movidas estrella
              </p>
              <ul className="mt-2 grid gap-2 text-sm">
                {SIGNATURE_MOVES.map((move) => (
                  <li key={move} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{move}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-3">
              {TOOL_BELT.map((tool) => {
                const ToolIcon = tool.icon;
                return (
                  <div
                    key={tool.label}
                    className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground"
                  >
                    <ToolIcon className="h-3.5 w-3.5 text-primary" />
                    {tool.label}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <CaricatureAvatar roleIcon={RoleIcon} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaricatureCard;

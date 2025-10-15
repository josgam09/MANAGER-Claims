import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, List, PlusCircle, Menu, Settings, LogOut, Shield, Users, UserCheck } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasRole } = useAuth();
  const [open, setOpen] = useState(false);

  // Navegación dinámica según rol
  const getNavigation = () => {
    const baseNav = [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['admin', 'supervisor', 'analyst'] },
      { name: 'Reclamos', href: '/claims', icon: List, roles: ['admin', 'supervisor', 'analyst'] },
    ];

    // Solo Admin y Supervisor pueden crear nuevos reclamos
    if (hasRole(['admin', 'supervisor'])) {
      baseNav.push({ name: 'Nuevo Reclamo', href: '/claims/new', icon: PlusCircle, roles: ['admin', 'supervisor'] });
    }

    // Solo Admin ve Administración
    if (hasRole(['admin'])) {
      baseNav.push({ name: 'Administración', href: '/admin', icon: Settings, roles: ['admin'] });
    }

    return baseNav;
  };

  const navigation = getNavigation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getRoleIcon = () => {
    if (!user) return Shield;
    switch (user.role) {
      case 'admin': return Shield;
      case 'supervisor': return Users;
      case 'analyst': return UserCheck;
      default: return Shield;
    }
  };

  const getRoleName = () => {
    if (!user) return '';
    switch (user.role) {
      case 'admin': return 'Administrador';
      case 'supervisor': return 'Supervisor';
      case 'analyst': return 'Analista';
      default: return '';
    }
  };

  const getRoleBadgeColor = () => {
    if (!user) return '';
    switch (user.role) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-300';
      case 'supervisor': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'analyst': return 'bg-green-100 text-green-700 border-green-300';
      default: return '';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const RoleIcon = getRoleIcon();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-2xl font-bold text-sidebar-foreground">MANAGER Claims</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`
                            group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors
                            ${
                              isActive(item.href)
                                ? 'bg-sidebar-accent text-sidebar-primary'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary'
                            }
                          `}
                        >
                          <Icon className="h-6 w-6 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              
              {/* User Info y Logout */}
              <li className="mt-auto">
                <div className="p-3 bg-sidebar-accent rounded-lg mb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <RoleIcon className="h-5 w-5 text-sidebar-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-sidebar-foreground truncate">
                        {user?.name}
                      </p>
                      <Badge variant="outline" className={`text-xs ${getRoleBadgeColor()}`}>
                        {getRoleName()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  Cerrar Sesión
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card px-4 shadow-sm sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-full flex-col gap-y-5 overflow-y-auto bg-sidebar px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                  <h1 className="text-2xl font-bold text-sidebar-foreground">MANAGER Claims</h1>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => {
                          const Icon = item.icon;
                          return (
                            <li key={item.name}>
                              <Link
                                to={item.href}
                                onClick={() => setOpen(false)}
                                className={`
                                  group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors
                                  ${
                                    isActive(item.href)
                                      ? 'bg-sidebar-accent text-sidebar-primary'
                                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary'
                                  }
                                `}
                              >
                                <Icon className="h-6 w-6 shrink-0" />
                                {item.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                    
                    {/* User Info y Logout - Mobile */}
                    <li className="mt-auto">
                      <div className="p-3 bg-sidebar-accent rounded-lg mb-3">
                        <div className="flex items-center gap-3 mb-2">
                          <RoleIcon className="h-5 w-5 text-sidebar-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-sidebar-foreground truncate">
                              {user?.name}
                            </p>
                            <Badge variant="outline" className={`text-xs ${getRoleBadgeColor()}`}>
                              {getRoleName()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"
                        onClick={() => {
                          handleLogout();
                          setOpen(false);
                        }}
                      >
                        <LogOut className="h-5 w-5" />
                        Cerrar Sesión
                      </Button>
                    </li>
                  </ul>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-bold">MANAGER Claims</h1>
        </div>
      </div>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;

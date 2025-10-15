import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Shield, Users, UserCheck, Plane } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const demoUsers = [
    {
      email: 'admin@jetsmart.com',
      password: 'password123',
      name: 'Administrador',
      icon: Shield,
      color: 'text-red-500',
      bgColor: 'bg-red-50 hover:bg-red-100',
    },
    {
      email: 'supervisor@jetsmart.com',
      password: 'password123',
      name: 'Supervisor',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      email: 'analista@jetsmart.com',
      password: 'password123',
      name: 'Analista',
      icon: UserCheck,
      color: 'text-green-500',
      bgColor: 'bg-green-50 hover:bg-green-100',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor ingrese email y contraseña');
      return;
    }

    const success = login(email, password);
    
    if (success) {
      toast.success('Inicio de sesión exitoso');
      navigate('/');
    } else {
      toast.error('Credenciales incorrectas');
    }
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    const success = login(demoEmail, demoPassword);
    
    if (success) {
      toast.success('Inicio de sesión exitoso');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sidebar p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Plane className="h-12 w-12 text-white" />
            <h1 className="text-4xl font-bold text-white">JetSMART Claims</h1>
          </div>
          <p className="text-xl font-semibold" style={{ color: 'rgb(0, 174, 199)' }}>Sistema de Gestión de Reclamos</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulario de Login */}
          <Card>
            <CardHeader>
              <CardTitle>Iniciar Sesión</CardTitle>
              <CardDescription>Ingrese sus credenciales para acceder</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@jetsmart.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full text-white hover:opacity-90"
                  style={{ backgroundColor: 'rgb(0, 174, 199)' }}
                >
                  Iniciar Sesión
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Usuarios Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Acceso Rápido - Demo</CardTitle>
              <CardDescription>Prueba con diferentes perfiles de usuario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoUsers.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.email}
                    onClick={() => handleDemoLogin(demo.email, demo.password)}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${demo.bgColor} border-transparent hover:border-primary/20`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full bg-white ${demo.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-foreground">{demo.name}</p>
                        <p className="text-sm text-muted-foreground">{demo.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Contraseña: {demo.password}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
              
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground text-center">
                  💡 Click en cualquier perfil para iniciar sesión automáticamente
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 JetSMART - Sistema de Gestión de Reclamos</p>
        </div>
      </div>
    </div>
  );
};

export default Login;


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UserPlus, Shield, Users, UserCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'analyst';
  isActive: boolean;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Administrador Sistema', email: 'admin@jetsmart.com', role: 'admin', isActive: true },
    { id: '2', name: 'Supervisor General', email: 'supervisor@jetsmart.com', role: 'supervisor', isActive: true },
    { id: '3', name: 'Carlos Lopez', email: 'analista@jetsmart.com', role: 'analyst', isActive: true },
  ]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'analyst' as 'admin' | 'supervisor' | 'analyst',
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Complete todos los campos');
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isActive: true,
    };

    setUsers([...users, user]);
    setNewUser({ name: '', email: '', role: 'analyst' });
    setDialogOpen(false);
    toast.success('Usuario creado exitosamente');
  };

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u => 
      u.id === id ? { ...u, isActive: !u.isActive } : u
    ));
    toast.success('Estado actualizado');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'supervisor': return <Users className="h-4 w-4" />;
      case 'analyst': return <UserCheck className="h-4 w-4" />;
      default: return null;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'supervisor': return 'Supervisor';
      case 'analyst': return 'Analista';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-300';
      case 'supervisor': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'analyst': return 'bg-green-100 text-green-700 border-green-300';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestión de Usuarios
            </CardTitle>
            <CardDescription>Crear y administrar usuarios del sistema</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Ingrese la información del nuevo usuario del sistema
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Juan Pérez"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="juan.perez@jetsmart.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({ ...newUser, role: value as any })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="analyst">Analista</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateUser} className="w-full">
                  Crear Usuario
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                user.isActive ? 'border-border bg-card' : 'border-muted bg-muted/50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-full ${
                    user.role === 'admin' ? 'bg-red-100' :
                    user.role === 'supervisor' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {getRoleIcon(user.role)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{user.name}</p>
                      <Badge variant="outline" className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                        {getRoleName(user.role)}
                      </Badge>
                      {!user.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Inactivo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={user.isActive ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => toggleUserStatus(user.id)}
                  >
                    {user.isActive ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUsers;


import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, FileText, List as ListIcon, LayoutDashboard } from 'lucide-react';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminFields from '@/components/admin/AdminFields';
import AdminLists from '@/components/admin/AdminLists';
import AdminDashboards from '@/components/admin/AdminDashboards';

const Admin = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-red-100 rounded-lg">
          <Shield className="h-8 w-8 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona usuarios, campos, listas y dashboards del sistema
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Usuarios</span>
          </TabsTrigger>
          <TabsTrigger value="fields" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Campos</span>
          </TabsTrigger>
          <TabsTrigger value="lists" className="gap-2">
            <ListIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Listas</span>
          </TabsTrigger>
          <TabsTrigger value="dashboards" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboards</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <AdminUsers />
        </TabsContent>

        <TabsContent value="fields">
          <AdminFields />
        </TabsContent>

        <TabsContent value="lists">
          <AdminLists />
        </TabsContent>

        <TabsContent value="dashboards">
          <AdminDashboards />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;



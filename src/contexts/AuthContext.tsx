import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios de demo
const DEMO_USERS: (User & { password: string })[] = [
  {
    id: '1',
    email: 'admin@jetsmart.com',
    password: 'password123',
    name: 'Administrador Sistema',
    role: 'admin',
    isActive: true,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: '2',
    email: 'supervisor@jetsmart.com',
    password: 'password123',
    name: 'Supervisor General',
    role: 'supervisor',
    isActive: true,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: '3',
    email: 'analista@jetsmart.com',
    password: 'password123',
    name: 'Carlos Lopez',
    role: 'analyst',
    isActive: true,
    createdAt: new Date('2025-01-01'),
  },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Validar que el usuario existe en DEMO_USERS
        const validUser = DEMO_USERS.find(u => u.id === userData.id && u.isActive);
        if (validUser) {
          setUser({
            id: validUser.id,
            email: validUser.email,
            name: validUser.name,
            role: validUser.role,
            isActive: validUser.isActive,
            createdAt: validUser.createdAt,
          });
        } else {
          localStorage.removeItem('currentUser');
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const foundUser = DEMO_USERS.find(
      u => u.email === email && u.password === password && u.isActive
    );

    if (foundUser) {
      const userToStore: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        isActive: foundUser.isActive,
        createdAt: foundUser.createdAt,
      };
      setUser(userToStore);
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Claim, ClaimStatus, ClaimPriority, ClaimCategory } from '@/types/claim';

interface ClaimContextType {
  claims: Claim[];
  addClaim: (claim: Omit<Claim, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => void;
  updateClaim: (id: string, updates: Partial<Claim>) => void;
  deleteClaim: (id: string) => void;
  getClaim: (id: string) => Claim | undefined;
  addClaimHistory: (id: string, action: string, comment?: string) => void;
}

const ClaimContext = createContext<ClaimContextType | undefined>(undefined);

// Mock data inicial
const mockClaims: Claim[] = [
  {
    id: '1',
    title: 'Producto defectuoso recibido',
    description: 'El producto llegó con defectos de fábrica. La pantalla no enciende correctamente.',
    status: 'in-progress',
    priority: 'high',
    category: 'product',
    customerName: 'Juan Pérez',
    customerEmail: 'juan.perez@email.com',
    customerPhone: '+54 11 1234-5678',
    assignedTo: 'María González',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-16'),
    history: [
      {
        id: '1',
        date: new Date('2025-01-15'),
        action: 'Reclamo creado',
        user: 'Sistema',
      },
      {
        id: '2',
        date: new Date('2025-01-16'),
        action: 'Asignado a María González',
        user: 'Admin',
        comment: 'Prioridad alta por defecto crítico',
      },
    ],
  },
  {
    id: '2',
    title: 'Error en facturación',
    description: 'Se cobró el doble del monto acordado en la última factura.',
    status: 'new',
    priority: 'critical',
    category: 'billing',
    customerName: 'Ana Martínez',
    customerEmail: 'ana.martinez@email.com',
    createdAt: new Date('2025-01-18'),
    updatedAt: new Date('2025-01-18'),
    history: [
      {
        id: '1',
        date: new Date('2025-01-18'),
        action: 'Reclamo creado',
        user: 'Sistema',
      },
    ],
  },
  {
    id: '3',
    title: 'Demora en entrega',
    description: 'El pedido #12345 no fue entregado en la fecha prometida.',
    status: 'resolved',
    priority: 'medium',
    category: 'service',
    customerName: 'Carlos Rodríguez',
    customerEmail: 'carlos.rodriguez@email.com',
    customerPhone: '+54 11 9876-5432',
    assignedTo: 'Pedro Sánchez',
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-14'),
    resolvedAt: new Date('2025-01-14'),
    history: [
      {
        id: '1',
        date: new Date('2025-01-10'),
        action: 'Reclamo creado',
        user: 'Sistema',
      },
      {
        id: '2',
        date: new Date('2025-01-11'),
        action: 'Asignado a Pedro Sánchez',
        user: 'Admin',
      },
      {
        id: '3',
        date: new Date('2025-01-14'),
        action: 'Reclamo resuelto',
        user: 'Pedro Sánchez',
        comment: 'Producto entregado y cliente satisfecho',
      },
    ],
  },
];

export const ClaimProvider = ({ children }: { children: ReactNode }) => {
  const [claims, setClaims] = useState<Claim[]>(mockClaims);

  const addClaim = (claim: Omit<Claim, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => {
    const newClaim: Claim = {
      ...claim,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [
        {
          id: '1',
          date: new Date(),
          action: 'Reclamo creado',
          user: 'Sistema',
        },
      ],
    };
    setClaims([newClaim, ...claims]);
  };

  const updateClaim = (id: string, updates: Partial<Claim>) => {
    setClaims(claims.map(claim => 
      claim.id === id 
        ? { ...claim, ...updates, updatedAt: new Date() }
        : claim
    ));
  };

  const deleteClaim = (id: string) => {
    setClaims(claims.filter(claim => claim.id !== id));
  };

  const getClaim = (id: string) => {
    return claims.find(claim => claim.id === id);
  };

  const addClaimHistory = (id: string, action: string, comment?: string) => {
    setClaims(claims.map(claim => {
      if (claim.id === id) {
        const newHistory = {
          id: Date.now().toString(),
          date: new Date(),
          action,
          user: 'Usuario',
          comment,
        };
        return {
          ...claim,
          history: [...claim.history, newHistory],
          updatedAt: new Date(),
        };
      }
      return claim;
    }));
  };

  return (
    <ClaimContext.Provider value={{
      claims,
      addClaim,
      updateClaim,
      deleteClaim,
      getClaim,
      addClaimHistory,
    }}>
      {children}
    </ClaimContext.Provider>
  );
};

export const useClaims = () => {
  const context = useContext(ClaimContext);
  if (context === undefined) {
    throw new Error('useClaims must be used within a ClaimProvider');
  }
  return context;
};

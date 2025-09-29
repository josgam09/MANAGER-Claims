import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Claim, ClaimStatus, ClaimPriority, ClaimType, ClaimReason } from '@/types/claim';

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
    emailSubject: 'Vuelo cancelado sin previo aviso',
    organizationClaimNumber: 'ORG-2025-001',
    claimType: 'compensacion',
    organization: 'Aerolíneas Argentinas',
    claimantName: 'Juan Pérez',
    identityDocument: '12345678-9',
    email: 'juan.perez@email.com',
    phone: '+54 11 1234-5678',
    reason: 'cancelacion',
    subReason: 'Cancelación sin notificación previa',
    customerClaimDetail: 'El vuelo AR1234 fue cancelado sin previo aviso. Tuve que reprogramar toda mi agenda y perder reuniones importantes.',
    informationRequest: 'Solicito compensación por los gastos adicionales y el tiempo perdido.',
    pnr: 'ABC123',
    initialDate: new Date('2025-01-15'),
    status: 'in-progress',
    priority: 'high',
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
        comment: 'Prioridad alta por cancelación sin aviso',
      },
    ],
  },
  {
    id: '2',
    emailSubject: 'Equipaje extraviado en vuelo internacional',
    organizationClaimNumber: 'ORG-2025-002',
    claimType: 'reembolso',
    organization: 'LATAM Airlines',
    claimantName: 'Ana Martínez',
    identityDocument: '98765432-1',
    email: 'ana.martinez@email.com',
    phone: '+54 11 9876-5432',
    reason: 'equipaje',
    subReason: 'Equipaje no llegó al destino',
    customerClaimDetail: 'Mi equipaje no llegó en el vuelo LA4567. He esperado 3 días y aún no tengo información sobre su ubicación.',
    informationRequest: 'Necesito que me reembolsen los gastos de artículos de primera necesidad que tuve que comprar.',
    pnr: 'XYZ789',
    initialDate: new Date('2025-01-18'),
    status: 'new',
    priority: 'critical',
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
    emailSubject: 'Demora prolongada en vuelo',
    organizationClaimNumber: 'ORG-2025-003',
    claimType: 'compensacion',
    organization: 'Aerolíneas Argentinas',
    claimantName: 'Carlos Rodríguez',
    identityDocument: '11223344-5',
    email: 'carlos.rodriguez@email.com',
    phone: '+54 11 5555-6666',
    reason: 'demora',
    subReason: 'Demora de más de 4 horas',
    customerClaimDetail: 'El vuelo AR5678 tuvo una demora de 6 horas. No se proporcionó asistencia ni compensación durante la espera.',
    informationRequest: 'Solicito compensación de acuerdo a la normativa vigente.',
    pnr: 'DEF456',
    initialDate: new Date('2025-01-10'),
    status: 'resolved',
    priority: 'medium',
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
        comment: 'Compensación procesada según normativa',
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

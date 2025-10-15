import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Claim, ClaimStatus, ClaimPriority, ClaimType, ClaimReason, Country } from '@/types/claim';
import { useAuth } from '@/contexts/AuthContext';

interface ClaimContextType {
  claims: Claim[];
  addClaim: (claim: Omit<Claim, 'id' | 'claimNumber' | 'createdAt' | 'updatedAt' | 'history'>) => void;
  updateClaim: (id: string, updates: Partial<Claim>) => void;
  deleteClaim: (id: string) => void;
  getClaim: (id: string) => Claim | undefined;
  addClaimHistory: (id: string, action: string, comment?: string, area?: string) => void;
  getNextClaimNumber: () => string;
  assignMultipleClaims: (claimIds: string[], assignedTo: string) => void;
}

// Función para generar número de reclamo único
const generateClaimNumber = (claims: Claim[]): string => {
  const currentYear = new Date().getFullYear();
  
  // Filtrar reclamos del año actual
  const currentYearClaims = claims.filter(claim => {
    if (!claim.claimNumber) return false;
    const parts = claim.claimNumber.split('-');
    const claimYear = parts.length >= 3 ? parts[2] : '';
    return claimYear === currentYear.toString();
  });
  
  // Obtener el siguiente número secuencial
  const nextNumber = currentYearClaims.length + 1;
  
  // Formatear con 8 dígitos
  const paddedNumber = nextNumber.toString().padStart(8, '0');
  
  return `NIC-${paddedNumber}-${currentYear}`;
};

const ClaimContext = createContext<ClaimContextType | undefined>(undefined);

// Mock data inicial
const mockClaims: Claim[] = [
  {
    id: '1',
    claimNumber: 'NIC-00000001-2025',
    country: 'AR',
    emailSubject: 'Vuelo cancelado sin previo aviso',
    organizationClaimNumber: 'ORG-2025-001',
    claimType: 'official',
    organization: 'ANAC',
    claimantName: 'Juan Pérez',
    identityDocument: '12345678-9',
    email: 'juan.perez@email.com',
    phone: '+54 11 1234-5678',
    reason: 'Cambio_de_Itinerario_y_Atrasos',
    subReason: 'Cancelación Operacional',
    customerClaimDetail: 'El vuelo AR1234 fue cancelado sin previo aviso. Tuve que reprogramar toda mi agenda y perder reuniones importantes.',
    informationRequest: 'Solicito compensación por los gastos adicionales y el tiempo perdido.',
    pnr: 'ABC123',
    initialDate: new Date('2025-01-15'),
    status: 'en-gestion',
    priority: 'high',
    assignedTo: 'Carlos Lopez',
    finalStatus: 'pendiente',
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
    claimNumber: 'NIC-00000002-2025',
    country: 'CL',
    emailSubject: 'Equipaje extraviado en vuelo internacional',
    organizationClaimNumber: 'ORG-2025-002',
    claimType: 'official',
    organization: 'SERNAC',
    reason: 'Equipaje',
    subReason: 'Equipaje Extraviado',
    customerClaimDetail: 'Mi equipaje no llegó en el vuelo LA4567. He esperado 3 días y aún no tengo información sobre su ubicación.',
    informationRequest: 'Necesito que me reembolsen los gastos de artículos de primera necesidad que tuve que comprar.',
    pnr: 'XYZ789',
    initialDate: new Date('2025-01-18'),
    status: 'new',
    priority: 'critical',
    assignedTo: 'Diana Portilla',
    finalStatus: 'pendiente',
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
    claimNumber: 'NIC-00000003-2025',
    country: 'PE',
    emailSubject: 'Demora prolongada en vuelo',
    organizationClaimNumber: 'ORG-2025-003',
    claimType: 'empresa',
    organization: 'ESCALAMIENTOS',
    claimantName: 'Carlos Rodríguez',
    identityDocument: '11223344-5',
    email: 'carlos.rodriguez@email.com',
    phone: '+54 11 5555-6666',
    reason: 'Aeropuerto',
    subReason: 'Problemas de Aeronave',
    customerClaimDetail: 'El vuelo AR5678 tuvo una demora de 6 horas. No se proporcionó asistencia ni compensación durante la espera.',
    informationRequest: 'Solicito compensación de acuerdo a la normativa vigente.',
    pnr: 'DEF456',
    initialDate: new Date('2025-01-10'),
    status: 'para-cierre',
    priority: 'medium',
    assignedTo: 'Pedro Sánchez',
    finalStatus: 'cerrado',
    closureReason: 'con-acuerdo',
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
  const { user } = useAuth();

  const addClaim = (claim: Omit<Claim, 'id' | 'claimNumber' | 'createdAt' | 'updatedAt' | 'history' | 'finalStatus'>) => {
    const claimNumber = generateClaimNumber(claims);
    const newClaim: Claim = {
      ...claim,
      id: Date.now().toString(),
      claimNumber,
      finalStatus: 'pendiente', // Estado final por defecto
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

  const addClaimHistory = (id: string, action: string, comment?: string, area?: string) => {
    setClaims(claims.map(claim => {
      if (claim.id === id) {
        const newHistory = {
          id: Date.now().toString(),
          date: new Date(),
          action,
          user: user?.name || 'Sistema',
          comment,
          area,
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

  const getNextClaimNumber = () => {
    return generateClaimNumber(claims);
  };

  const assignMultipleClaims = (claimIds: string[], assignedTo: string) => {
    setClaims(claims.map(claim => {
      if (claimIds.includes(claim.id)) {
        const newHistory = {
          id: Date.now().toString() + Math.random(),
          date: new Date(),
          action: `Reasignado a ${assignedTo}`,
          user: user?.name || 'Sistema',
          comment: 'Asignación masiva',
          area: 'Asignación',
        };
        return {
          ...claim,
          assignedTo,
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
      getNextClaimNumber,
      assignMultipleClaims,
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

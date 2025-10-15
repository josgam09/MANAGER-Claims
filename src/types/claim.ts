export type ClaimStatus = 'new' | 'en-gestion' | 'escalado' | 'enviado-abogados' | 'para-cierre';
export type ClaimPriority = 'low' | 'medium' | 'high' | 'critical';
export type FinalStatus = 'pendiente' | 'cerrado';
export type ClosureReason = 'con-acuerdo' | 'sin-acuerdo' | 'incomparecencia' | 'aplica' | 'aplica-parcial' | 'no-aplica' | 'desistido';
export type Currency = 'CLP' | 'ARS' | 'USD' | 'BRL' | 'COP' | 'PEN' | 'OTRA';
export type PaymentType = 'transferencia' | 'gc' | 'ambas';

// Áreas de escalamiento
export const AREAS_ESCALAMIENTO = [
  'Aeropuerto',
  'CC',
  'CC-Comprobantes',
  'CC-Equipajes',
  'Crew',
  'E-Commerce-Pagos',
  'E-Commerce-Web',
  'Finanzas',
  'Itinerarios',
  'Legal-JS',
  'Marketing',
  'SOC',
  'Soporte IT',
  'Supervisor-Backoffice',
  'Tesorería',
  'Otra'
];

// Monedas disponibles
export const CURRENCIES: Currency[] = ['CLP', 'ARS', 'USD', 'BRL', 'COP', 'PEN', 'OTRA'];

// Operadores de vuelo
export const FLIGHT_OPERATORS = [
  { code: 'J6', name: 'JETSMART AIRLINES S.A.S' },
  { code: 'JA', name: 'JETSMART AIRLINES S.P.A.' },
  { code: 'JZ', name: 'JETSMART AIRLINES PERU S.A.C.' },
  { code: 'WJ', name: 'JETSMART AIRLINES S.A.' },
];

export type FlightOperator = 'J6' | 'JA' | 'JZ' | 'WJ';
export type AffectedFlight = 'IDA' | 'VUELTA' | 'AMBAS';

export type ClaimType = 'empresa' | 'legal' | 'official';
export type ClaimReason = 
  | 'Aeropuerto'
  | 'Cambio_de_Itinerario_y_Atrasos'
  | 'Cesion_y_Retracto'
  | 'Club_de_Descuento'
  | 'Crisis_Social'
  | 'Devoluciones'
  | 'Equipaje'
  | 'Error_en_Compra'
  | 'Gift_Card'
  | 'Norwegian'
  | 'Impedimento_Médico'
  | 'PVC_SERNAC'
  | 'Servicios_Opcionales'
  | 'Sitio_Web'
  | 'Validación_de_Compra'
  | 'American_Airlines';
export type Country = 'AR' | 'BR' | 'CL' | 'CO' | 'EC' | 'PE' | 'PY' | 'RD' | 'UY';

// Organismos por país y tipo de claim (ordenados alfabéticamente)
export const ORGANISMOS_BY_COUNTRY: Record<Country, Record<ClaimType, string[]>> = {
  AR: {
    empresa: ['ESCALAMIENTOS', 'LINKEDIN', 'OFICIOS'],
    legal: ['JUICIO'],
    official: ['ANAC', 'COPREC', 'DFCO', 'MEDIACIONES']
  },
  BR: {
    empresa: ['ESCALAMIENTOS', 'LINKEDIN', 'OFICIOS', 'RECLAME AQUI'],
    legal: ['JUICIO'],
    official: ['PROCON']
  },
  CL: {
    empresa: ['ESCALAMIENTOS', 'LINKEDIN', 'OFICIOS'],
    legal: ['JUICIO'],
    official: ['LINEA DIRECTA', 'SERNAC']
  },
  CO: {
    empresa: ['DERECHO DE PETICIÓN', 'ESCALAMIENTOS', 'LINKEDIN', 'OFICIOS'],
    legal: ['JUICIO'],
    official: ['SIC', 'SUPERTRANSPORTE']
  },
  EC: {
    empresa: ['ESCALAMIENTOS', 'LINKEDIN', 'OFICIOS'],
    legal: ['JUICIO'],
    official: ['DFCO']
  },
  PE: {
    empresa: ['ESCALAMIENTOS', 'LINKEDIN', 'OFICIOS'],
    legal: ['JUICIO'],
    official: ['INDECOPI', 'INDECOPI ABG', 'INDECOPI LR']
  },
  PY: {
    empresa: ['ESCALAMIENTOS', 'LINKEDIN', 'OFICIOS'],
    legal: ['JUICIO'],
    official: ['SEDECO']
  },
  RD: {
    empresa: ['ESCALAMIENTOS', 'LINKEDIN', 'OFICIOS'],
    legal: ['JUICIO'],
    official: ['PROCON']
  },
  UY: {
    empresa: ['ESCALAMIENTOS', 'LINKEDIN', 'OFICIOS'],
    legal: ['JUICIO'],
    official: ['DFCO']
  }
};

// Sub Motivos por Motivo (ordenados alfabéticamente)
export const SUB_MOTIVOS_BY_MOTIVO: Record<ClaimReason, string[]> = {
  Aeropuerto: [
    'Cobro de Equipaje (Error en Proceso)',
    'Hora de Cierre Counter',
    'Información de Aeropuerto',
    'Inspección SERNAC',
    'Leyes Migratorias',
    'Menor a Bordo',
    'Pasajero Disruptivo',
    'Problemas Check In ATO',
    'Problemas de Aeronave',
    'Problemas en Counter',
    'Puerta de Embarque',
    'Servicio Personal JetSMART',
    'Tiempo Cierre Puerta Embarque'
  ],
  Cambio_de_Itinerario_y_Atrasos: [
    'Cancelación Comercial',
    'Cancelación Operacional',
    'COVID19',
    'Reprogramación Comercial',
    'Reprogramación Operacional',
    'Vuelo Sobreventa'
  ],
  Cesion_y_Retracto: [
    'Retracto demorado',
    'Solicitud de Cesión con Costo',
    'Solicitud de Cesión sin Costo',
    'Solicitud de Retracto'
  ],
  Club_de_Descuento: [
    'Club No Activado',
    'Condiciones Generales'
  ],
  Crisis_Social: [
    'COVID19',
    'Disturbios País',
    'Toque de Queda'
  ],
  Devoluciones: [
    'Compensación Equipaje',
    'Devolucion Agencia',
    'Devolucion con Demora',
    'Solicitud Devolución'
  ],
  Equipaje: [
    'Equipaje con Merma',
    'Equipaje Dañado',
    'Equipaje Demorado',
    'Equipaje Extraviado'
  ],
  Error_en_Compra: [
    'Doble Cobro',
    'Factura No Emitida',
    'Hold Canceled'
  ],
  Gift_Card: [
    'Demora de Gift Card',
    'Problemas con Gift Card'
  ],
  Norwegian: [
    'Cambio de Fecha',
    'Devolución Dinero',
    'Devolución Gift Card'
  ],
  Impedimento_Médico: [
    'Cambio x Impedimento Médico',
    'Devolución x Impedimento Médico'
  ],
  PVC_SERNAC: [
    'Cambio Fecha',
    'Devolución Dinero',
    'Devolución GC+10%',
    'Plazo de Implementación',
    'Redimir GC en Dinero'
  ],
  Servicios_Opcionales: [
    'Asientos para Menores',
    'Cambio de Fecha',
    'Cambio de Hora',
    'Cambio de Nombre',
    'Cambio de Tramo',
    'Cobro por Servicio',
    'Comida a Bordo',
    'Costo Cambio de Fecha',
    'Costo Cambio de Hora',
    'Costo Cambio de Nombre',
    'Costo Cambio de Tramo',
    'Costo Infante',
    'Costo Mascota a Bordo',
    'JetSMART GO',
    'Precio Equipaje',
    'Rango Cambio de Fecha',
    'Seguro Chubb',
    'Seguro de Viaje',
    'Selección de Asientos'
  ],
  Sitio_Web: [
    'FAQ',
    'Funcion Sitio Web',
    'Oferta Engañosa',
    'Precio de Pasajes',
    'Problemas Check In Web'
  ],
  Validación_de_Compra: [
    'ADCK',
    'Contracargos',
    'Posible Fraude'
  ],
  American_Airlines: [
    'Canjes de Millas',
    'Consultas sobre Millas',
    'Modificaciones N° AA'
  ]
};

// Lista de agentes (ordenados alfabéticamente)
export const AGENTES = [
  'Carlos Lopez',
  'Diana Portilla',
  'Esteban Hernández',
  'Estefani Cossio',
  'Juan Bermudez',
  'Juan Melchor',
  'Lina Serna',
  'Lina Uchima',
  'Manuela Rodríguez',
  'Natalia Osorio',
  'Oscar Melo',
  'Rosa Rengifo',
  'Tatiana Atehortua'
];

export interface ClaimHistory {
  id: string;
  date: Date;
  action: string;
  user: string;
  comment?: string;
  area?: string; // Área o detalle del cambio
}

export interface Claim {
  id: string;
  claimNumber: string; // Número único NIC-00000001-2025
  country: Country; // País de origen del reclamo
  emailSubject: string;
  organizationClaimNumber: string;
  claimType: ClaimType;
  organization: string;
  claimantName?: string; // Opcional - se completa en gestión
  identityDocument?: string; // Opcional - se completa en gestión
  email?: string; // Opcional - se completa en gestión
  phone?: string; // Opcional - se completa en gestión
  reason: ClaimReason;
  subReason: string;
  customerClaimDetail: string;
  informationRequest: string;
  pnr: string;
  initialDate: Date;
  status: ClaimStatus;
  priority: ClaimPriority;
  assignedTo?: string;
  // Campos de escalamiento
  escalatedAreas?: string[]; // Áreas de escalamiento seleccionadas
  otherEscalationArea?: string; // Área personalizada cuando se selecciona "Otra"
  // Campos de abogados
  lawyerInfoRequested?: boolean; // Pidieron información adicional
  lawyerPaymentSentence?: boolean; // Solicitaron pago de sentencia/costas/apelación
  lawyerPaymentAgreement?: boolean; // Solicitaron pago de acuerdo
  // Estado final
  finalStatus: FinalStatus; // PENDIENTE o CERRADO
  closureReason?: ClosureReason; // Razón de cierre si está cerrado
  // Compensación
  wasCompensated?: boolean; // ¿Se compensó?
  paymentType?: PaymentType; // Tipo de pago: transferencia, gc, ambas
  // Datos de transferencia
  transferAmount?: string;
  transferCurrency?: Currency;
  transferCustomCurrency?: string; // Si eligió "OTRA"
  // Datos de Gift Card
  gcAmount?: string;
  gcCurrency?: Currency;
  gcCustomCurrency?: string; // Si eligió "OTRA"
  // Información de vuelos (se completa en gestión)
  outboundFlightDate?: Date; // Fecha de vuelo IDA
  outboundFlightNumber?: string; // Número de vuelo IDA
  outboundOperator?: FlightOperator; // Operado por IDA
  returnFlightDate?: Date; // Fecha de vuelo VUELTA
  returnFlightNumber?: string; // Número de vuelo VUELTA
  returnOperator?: FlightOperator; // Operado por VUELTA
  affectedFlight?: AffectedFlight; // Para Cambio_de_Itinerario_y_Atrasos
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  history: ClaimHistory[];
}

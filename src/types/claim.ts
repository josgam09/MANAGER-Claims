export type ClaimStatus = 'new' | 'in-progress' | 'resolved' | 'closed';
export type ClaimPriority = 'low' | 'medium' | 'high' | 'critical';
export type ClaimType = 'compensacion' | 'reembolso' | 'informacion' | 'queja' | 'otro';
export type ClaimReason = 'demora' | 'cancelacion' | 'equipaje' | 'servicio-bordo' | 'personal' | 'otro';

export interface ClaimHistory {
  id: string;
  date: Date;
  action: string;
  user: string;
  comment?: string;
}

export interface Claim {
  id: string;
  emailSubject: string;
  organizationClaimNumber: string;
  claimType: ClaimType;
  organization: string;
  claimantName: string;
  identityDocument: string;
  email: string;
  phone: string;
  reason: ClaimReason;
  subReason: string;
  customerClaimDetail: string;
  informationRequest: string;
  pnr: string;
  initialDate: Date;
  status: ClaimStatus;
  priority: ClaimPriority;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  history: ClaimHistory[];
}

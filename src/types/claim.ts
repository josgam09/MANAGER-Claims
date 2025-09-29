export type ClaimStatus = 'new' | 'in-progress' | 'resolved' | 'closed';
export type ClaimPriority = 'low' | 'medium' | 'high' | 'critical';
export type ClaimCategory = 'product' | 'service' | 'billing' | 'technical' | 'other';

export interface ClaimHistory {
  id: string;
  date: Date;
  action: string;
  user: string;
  comment?: string;
}

export interface Claim {
  id: string;
  title: string;
  description: string;
  status: ClaimStatus;
  priority: ClaimPriority;
  category: ClaimCategory;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  history: ClaimHistory[];
}

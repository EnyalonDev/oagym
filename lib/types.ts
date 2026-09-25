export type AccountStatus = 'active' | 'expiring' | 'expired';

export interface AnthropometricRecord {
  id: string;
  memberId: string;
  date: string;
  weightKg: number;
  heightCm: number;
  bodyFatPct: number;
  muscleMassKg: number;
  chestCm?: number;
  waistCm?: number;
  bicepCm?: number;
  notes: string;
  evaluator: string;
}

export interface PaymentRecord {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  daysAdded: number;
  method: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Nequi / Daviplata' | string;
  receiptNumber: string;
  concept?: string;
  status?: string;
  notes?: string;
}

export interface AccessLog {
  id: string;
  memberId: string;
  memberName: string;
  method: 'Cédula' | 'Código QR' | 'QR Admin + PIN' | 'Biometría (Face ID / Huella)';
  timestamp: string;
  ip: string;
  device: string;
  status: 'Permitido (Activo)' | 'Permitido (Próximo a Vencer)' | 'Denegado (En Mora)' | 'Acceso Staff Autorizado';
}

export interface BiometricCredential {
  cedula: string;
  memberName: string;
  memberId: string;
  credentialId?: string;
  registeredAt: string;
  deviceLabel: string;
  active: boolean;
}

export interface Member {
  id: string;
  cedula: string;
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  planId: string;
  planName: string;
  membershipStart: string;
  membershipEnd: string;
  daysRemaining: number;
  status: AccountStatus;
  assignedTrainer: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodType: string;
  routineTitle: string;
  routineGoals: string;
  nutritionOverview: string;
  pin?: string;
  qrCode?: string;
  biometricRegistered?: boolean;
  records: AnthropometricRecord[];
  payments: PaymentRecord[];
  expirationDate?: string;
  joinDate?: string;
  remainingDays?: number;
}

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PlanData {
  id: string;
  name: string;
  category: 'inscripcion' | 'base' | 'nutricion' | 'entrenamiento' | 'personalizado' | 'semi-personalizado' | 'completo' | string;
  price: number;
  formattedPrice: string;
  pricePrefix?: string;
  duration: string;
  description: string;
  recommended: boolean;
  features: string[];
}

export interface SiteContent {
  gymName: string;
  slogan: string;
  announcement: string;
  showAnnouncement: boolean;
  phone: string;
  whatsapp: string;
  address: string;
  scheduleWeekdays: string;
  scheduleWeekends: string;
  heroHeadline: string;
  heroSubheadline: string;
  aboutText: string;
}

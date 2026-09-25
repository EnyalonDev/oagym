'use client';

import {
  Member,
  AnthropometricRecord,
  PaymentRecord,
  AccessLog,
  PlanData,
  SiteContent,
  AccountStatus,
  BiometricCredential,
} from './types';
import {
  INITIAL_MEMBERS,
  INITIAL_PLANS,
  INITIAL_SITE_CONTENT,
  INITIAL_AUDIT_LOGS,
} from './initial-data';

const STORAGE_KEYS = {
  MEMBERS: 'oa_gym_members_v2',
  PLANS: 'oa_gym_plans_v2',
  SITE_CONTENT: 'oa_gym_content_v3',
  LOGS: 'oa_gym_logs_v2',
  ADMIN_SESSION: 'oa_gym_admin_auth_v1',
  CURRENT_CLIENT: 'oa_gym_current_client_v1',
  BIOMETRIC: 'oa_gym_biometric_cred_v1',
};

function calculateStatus(daysRemaining: number): AccountStatus {
  if (daysRemaining > 7) return 'active';
  if (daysRemaining > 0) return 'expiring';
  return 'expired';
}

export function loadStoredMembers(): Member[] {
  if (typeof window === 'undefined') return INITIAL_MEMBERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
      return INITIAL_MEMBERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MEMBERS;
  }
}

export function saveMembers(members: Member[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    window.dispatchEvent(new Event('oa_gym_data_change'));
  } catch (err) {
    console.error('Error saving members', err);
  }
}

export function loadStoredPlans(): PlanData[] {
  if (typeof window === 'undefined') return INITIAL_PLANS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLANS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(INITIAL_PLANS));
      return INITIAL_PLANS;
    }
    const parsed: PlanData[] = JSON.parse(raw);
    // Auto-migrate if old plans schema detected
    if (!parsed.some((p) => p.id === 'mensualidad-base')) {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(INITIAL_PLANS));
      return INITIAL_PLANS;
    }
    return parsed;
  } catch {
    return INITIAL_PLANS;
  }
}

export function savePlans(plans: PlanData[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
    window.dispatchEvent(new Event('oa_gym_data_change'));
  } catch (err) {
    console.error('Error saving plans', err);
  }
}

export function loadStoredSiteContent(): SiteContent {
  if (typeof window === 'undefined') return INITIAL_SITE_CONTENT;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SITE_CONTENT);
    if (!raw) {
      // Check legacy key if exists
      const legacyRaw = localStorage.getItem('oa_gym_content_v2');
      if (legacyRaw) {
        try {
          const parsed = JSON.parse(legacyRaw);
          const migrated: SiteContent = {
            ...parsed,
            address: INITIAL_SITE_CONTENT.address,
            phone: INITIAL_SITE_CONTENT.phone,
            whatsapp: INITIAL_SITE_CONTENT.whatsapp,
            scheduleWeekdays: INITIAL_SITE_CONTENT.scheduleWeekdays,
          };
          localStorage.setItem(STORAGE_KEYS.SITE_CONTENT, JSON.stringify(migrated));
          return migrated;
        } catch {
          // fallback
        }
      }
      localStorage.setItem(STORAGE_KEYS.SITE_CONTENT, JSON.stringify(INITIAL_SITE_CONTENT));
      return INITIAL_SITE_CONTENT;
    }
    const parsed = JSON.parse(raw);
    let changed = false;
    if (parsed.address?.includes('Calle 45') || parsed.phone?.includes('+57')) {
      parsed.address = INITIAL_SITE_CONTENT.address;
      parsed.phone = INITIAL_SITE_CONTENT.phone;
      parsed.whatsapp = INITIAL_SITE_CONTENT.whatsapp;
      parsed.scheduleWeekdays = INITIAL_SITE_CONTENT.scheduleWeekdays;
      changed = true;
    }
    if (parsed.announcement?.includes('palanca') || parsed.showAnnouncement) {
      parsed.announcement = '';
      parsed.showAnnouncement = false;
      changed = true;
    }
    if (parsed.scheduleWeekends) {
      parsed.scheduleWeekends = '';
      changed = true;
    }
    if (changed) {
      localStorage.setItem(STORAGE_KEYS.SITE_CONTENT, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return INITIAL_SITE_CONTENT;
  }
}

export function saveSiteContent(content: SiteContent): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SITE_CONTENT, JSON.stringify(content));
    window.dispatchEvent(new Event('oa_gym_data_change'));
  } catch (err) {
    console.error('Error saving site content', err);
  }
}

export function loadStoredLogs(): AccessLog[] {
  if (typeof window === 'undefined') return INITIAL_AUDIT_LOGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

export function addAccessLog(
  memberId: string,
  memberName: string,
  method: AccessLog['method'],
  status: 'Permitido (Activo)' | 'Permitido (Próximo a Vencer)' | 'Denegado (En Mora)' | 'Acceso Staff Autorizado'
): AccessLog {
  const newLog: AccessLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    memberId,
    memberName,
    method,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    ip: '186.84.92.' + (Math.floor(Math.random() * 80) + 100),
    device: typeof navigator !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Móvil / Escáner QR' : 'Terminal / Navegador Web') : 'Terminal Acceso',
    status,
  };

  const logs = [newLog, ...loadStoredLogs()];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(0, 100)));
    window.dispatchEvent(new Event('oa_gym_data_change'));
  }
  return newLog;
}

export function registerNewMember(
  data: Omit<Member, 'id' | 'records' | 'payments' | 'status' | 'daysRemaining'> & { initialDays?: number }
): Member {
  const members = loadStoredMembers();
  const days = data.initialDays ?? 30;
  const status = calculateStatus(days);

  const newMember: Member = {
    ...data,
    id: `mem_${Date.now()}`,
    daysRemaining: days,
    status,
    records: [],
    payments: [
      {
        id: `pay_${Date.now()}`,
        memberId: `mem_${Date.now()}`,
        memberName: data.name,
        amount:
          data.planId === 'plan-personalizado-premium'
            ? 80
            : data.planId === 'plan-nutricional-detallado' || data.planId === 'plan-entrenamiento-detallado'
            ? 40
            : data.planId === 'inscripcion'
            ? 10
            : 35,
        date: new Date().toISOString().split('T')[0],
        daysAdded: days,
        method: 'Efectivo',
        receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
        notes: 'Pago inicial de membresía con carnet digital generado',
      },
    ],
  };

  members.unshift(newMember);
  saveMembers(members);
  return newMember;
}

export function recordMemberPayment(
  memberId: string,
  daysToAdd: number,
  amount: number,
  method: PaymentRecord['method'],
  notes: string = ''
): Member | null {
  const members = loadStoredMembers();
  const index = members.findIndex((m) => m.id === memberId);
  if (index === -1) return null;

  const current = members[index];
  const currentDays = Math.max(0, current.daysRemaining);
  const updatedDays = currentDays + daysToAdd;
  const newStatus = calculateStatus(updatedDays);

  const newPayment: PaymentRecord = {
    id: `pay_${Date.now()}`,
    memberId: current.id,
    memberName: current.name,
    amount,
    date: new Date().toISOString().split('T')[0],
    daysAdded: daysToAdd,
    method,
    receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
    notes,
  };

  const updatedMember: Member = {
    ...current,
    daysRemaining: updatedDays,
    status: newStatus,
    payments: [newPayment, ...current.payments],
  };

  members[index] = updatedMember;
  saveMembers(members);
  return updatedMember;
}

export function addMemberAnthropometry(
  memberId: string,
  recordData: Omit<AnthropometricRecord, 'id' | 'memberId'>
): Member | null {
  const members = loadStoredMembers();
  const index = members.findIndex((m) => m.id === memberId);
  if (index === -1) return null;

  const current = members[index];
  const newRecord: AnthropometricRecord = {
    ...recordData,
    id: `rec_${Date.now()}`,
    memberId: current.id,
  };

  const updatedRecords = [...current.records, newRecord].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const updatedMember: Member = {
    ...current,
    records: updatedRecords,
  };

  members[index] = updatedMember;
  saveMembers(members);
  return updatedMember;
}

export function updateStoredMember(memberIdOrCedula: string, updates: Partial<Member>): Member | null {
  const members = loadStoredMembers();
  const index = members.findIndex(
    (m) => m.id === memberIdOrCedula || m.cedula === memberIdOrCedula
  );
  if (index === -1) return null;

  members[index] = {
    ...members[index],
    ...updates,
  };

  saveMembers(members);
  return members[index];
}

export function resetAllDataToDefault(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(INITIAL_MEMBERS));
  localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(INITIAL_PLANS));
  localStorage.setItem(STORAGE_KEYS.SITE_CONTENT, JSON.stringify(INITIAL_SITE_CONTENT));
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  window.dispatchEvent(new Event('oa_gym_data_change'));
}

export function getStoredBiometricCredential(): BiometricCredential | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BIOMETRIC);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveBiometricCredential(cred: BiometricCredential): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.BIOMETRIC, JSON.stringify(cred));
    window.dispatchEvent(new Event('oa_gym_biometric_change'));
  } catch (e) {
    console.error('Error saving biometric credential:', e);
  }
}

export function removeBiometricCredential(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.BIOMETRIC);
    window.dispatchEvent(new Event('oa_gym_biometric_change'));
  } catch (e) {
    console.error('Error removing biometric credential:', e);
  }
}

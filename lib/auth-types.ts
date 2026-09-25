export const PIN_REGEX = /^[a-zA-Z0-9+\-*._]{4,8}$/;

export interface AuthUser {
  id: string | number;
  identifier: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  role_id?: number | string;
  has_pin_enabled: boolean;
  external_permissions: Record<string, any>;
  member_data?: Record<string, any>;
  last_session_id?: string;
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  requires_pin?: boolean;
  message?: string;
  error?: string;
  session_id?: string;
}

export interface CheckLoginResult {
  requiresPin: boolean;
  user?: AuthUser;
  token?: string;
  identifier: string;
  message?: string;
}

export function isValidPin(pin: string): boolean {
  return PIN_REGEX.test(pin);
}

export function sanitizeIdentifier(raw: string): string {
  if (!raw) return '';
  return raw.trim().toUpperCase().replace(/[\s.-]/g, '');
}

export function parsePermissions(rawPerms: any, projectId?: string): Record<string, any> {
  let perms = rawPerms || {};
  if (typeof perms === 'string') {
    try {
      perms = JSON.parse(perms);
    } catch {
      perms = {};
    }
  }
  if (projectId && perms[projectId]) {
    return perms[projectId];
  }
  return perms;
}

export function reconstructUser(userData: any, projectId?: string): AuthUser {
  if (!userData) {
    return {
      id: '',
      identifier: '',
      name: 'Usuario',
      has_pin_enabled: false,
      external_permissions: {},
    };
  }

  const perms = parsePermissions(userData.external_permissions, projectId);
  const identifier =
    userData.identifier ||
    userData.user_code ||
    userData.cedula ||
    userData.document_id ||
    (typeof userData.id === 'string' ? userData.id : String(userData.id || ''));

  return {
    id: userData.id || userData.user_id || identifier,
    identifier: sanitizeIdentifier(identifier),
    name: userData.name || userData.username || userData.public_name || userData.full_name || 'Socio OA GYM',
    email: userData.email || '',
    phone: userData.phone || userData.telefono || '',
    address: userData.address || userData.direccion || '',
    role_id: userData.role_id,
    has_pin_enabled: Boolean(userData.has_pin_enabled || userData.pin_active || userData.pin_enabled || perms?.has_pin_enabled),
    external_permissions: perms,
    member_data: userData.member_data || userData,
    last_session_id: userData.last_session_id || perms?.last_session_id || '',
    created_at: userData.created_at || new Date().toISOString(),
  };
}

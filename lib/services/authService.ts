import {
  AuthUser,
  CheckLoginResult,
  isValidPin,
  reconstructUser,
  sanitizeIdentifier,
} from '@/lib/auth-types';
import { useAuthStore } from '@/lib/stores/authStore';
import { loadStoredMembers, updateStoredMember } from '@/lib/gym-store';

class AuthService {
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    const token = useAuthStore.getState().token;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Check or login by identifier (Cédula or QR Code plain-text)
   */
  async checkOrLogin(rawIdentifier: string): Promise<CheckLoginResult> {
    const identifier = sanitizeIdentifier(rawIdentifier);
    if (!identifier) {
      throw new Error('Debes ingresar o escanear una cédula o identificador válido.');
    }

    try {
      const response = await fetch('/api/data2rest/auth/check-or-login', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.requires_pin || data.has_pin_enabled) {
          return {
            requiresPin: true,
            identifier,
            message: data.message || 'Se requiere PIN de seguridad para continuar.',
          };
        }

        const rawUser = data.data?.user || data.user;
        const token = data.data?.token || data.token || `token_${Date.now()}`;
        const user = reconstructUser(rawUser);

        useAuthStore.getState().setSession(user, token, data.session_id);
        return {
          requiresPin: false,
          user,
          token,
          identifier,
        };
      }

      // If backend returns specific business error
      if (!response.ok && response.status !== 404 && response.status !== 500) {
        throw new Error(data.message || data.error || 'No se pudo validar el identificador.');
      }
    } catch (err: any) {
      // If network/backend error or route not yet deployed on backend, use local store fallback
      console.warn('Backend check-or-login fallback to local store:', err.message);
    }

    // Local Store Fallback for OA GYM members
    const members = loadStoredMembers();
    const cleanId = identifier.toLowerCase();
    const found = members.find(
      (m) =>
        sanitizeIdentifier(m.id).toLowerCase() === cleanId ||
        sanitizeIdentifier(m.cedula || '').toLowerCase() === cleanId ||
        (m.qrCode && sanitizeIdentifier(m.qrCode).toLowerCase() === cleanId)
    );

    if (!found) {
      throw new Error(`Socio con cédula / identificador "${identifier}" no encontrado en el sistema.`);
    }

    const hasPin = Boolean(found.pin && found.pin.length >= 4);
    if (hasPin) {
      return {
        requiresPin: true,
        identifier,
        message: 'Por favor ingresa tu PIN de seguridad personal.',
      };
    }

    const user = reconstructUser({
      ...found,
      identifier: found.cedula || found.id,
      has_pin_enabled: false,
    });
    const token = `gym_token_${found.id}_${Date.now()}`;
    useAuthStore.getState().setSession(user, token);

    return {
      requiresPin: false,
      user,
      token,
      identifier,
    };
  }

  /**
   * Verify security PIN for the user
   */
  async verifyPin(rawIdentifier: string, pin: string): Promise<{ success: boolean; user: AuthUser; token: string }> {
    const identifier = sanitizeIdentifier(rawIdentifier);
    if (!identifier) {
      throw new Error('Identificador inválido.');
    }
    if (!isValidPin(pin)) {
      throw new Error('El PIN debe tener entre 4 y 8 caracteres (alfanumérico o + - * . _).');
    }

    try {
      const response = await fetch('/api/data2rest/auth/verify-pin', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ identifier, pin }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const rawUser = data.data?.user || data.user;
        const token = data.data?.token || data.token || `token_${Date.now()}`;
        const user = reconstructUser(rawUser);

        useAuthStore.getState().setSession(user, token, data.session_id);
        return { success: true, user, token };
      }

      if (!response.ok && response.status !== 404 && response.status !== 500) {
        throw new Error(data.message || data.error || 'PIN de seguridad incorrecto.');
      }
    } catch (err: any) {
      console.warn('Backend verify-pin fallback to local store:', err.message);
    }

    // Local store fallback
    const members = loadStoredMembers();
    const cleanId = identifier.toLowerCase();
    const found = members.find(
      (m) =>
        sanitizeIdentifier(m.id).toLowerCase() === cleanId ||
        sanitizeIdentifier(m.cedula || '').toLowerCase() === cleanId ||
        (m.qrCode && sanitizeIdentifier(m.qrCode).toLowerCase() === cleanId)
    );

    if (!found) {
      throw new Error('Socio no encontrado.');
    }

    if (found.pin && found.pin !== pin) {
      throw new Error('PIN de seguridad incorrecto. Intenta nuevamente.');
    }

    const user = reconstructUser({
      ...found,
      identifier: found.cedula || found.id,
      has_pin_enabled: true,
    });
    const token = `gym_token_${found.id}_${Date.now()}`;
    useAuthStore.getState().setSession(user, token);

    return { success: true, user, token };
  }

  /**
   * Verify Staff / Admin login credentials
   */
  async loginStaff(staffPin: string, staffCode?: string): Promise<{ success: boolean; user: AuthUser; token: string }> {
    if (!staffPin || staffPin.trim().length === 0) {
      throw new Error('El PIN institucional es requerido.');
    }

    const cleanPin = staffPin.trim();

    try {
      const response = await fetch('/api/data2rest/auth/staff-login', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ pin: cleanPin, code: staffCode }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const rawUser = data.data?.user || data.user;
        const token = data.data?.token || data.token || `staff_token_${Date.now()}`;
        const user = reconstructUser({
          ...rawUser,
          external_permissions: { role: 'admin', ...(rawUser?.external_permissions || {}) },
        });

        useAuthStore.getState().setSession(user, token, data.session_id);
        return { success: true, user, token };
      }
    } catch (err: any) {
      console.warn('Backend staff login fallback:', err.message);
    }

    // Standard Staff verification fallback
    const validStaffPins = ['1234', 'admin', 'oa2026', 'staff2026', 'oa1234'];
    if (!validStaffPins.includes(cleanPin.toLowerCase())) {
      throw new Error('PIN o credencial de Staff incorrecta.');
    }

    const adminUser = reconstructUser({
      id: 'staff_1',
      identifier: staffCode || 'STAFF-OA-01',
      name: 'Director General Staff',
      email: 'admin@oagym.com',
      role_id: 1,
      has_pin_enabled: true,
      external_permissions: { role: 'admin', is_staff: true },
    });

    const token = `staff_token_${Date.now()}`;
    useAuthStore.getState().setSession(adminUser, token);

    return { success: true, user: adminUser, token };
  }

  /**
   * Get current authenticated user session (/auth/me)
   */
  async getMe(): Promise<AuthUser | null> {
    const token = useAuthStore.getState().token;
    if (!token) return null;

    try {
      const response = await fetch('/api/data2rest/auth/me', {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        const rawUser = data.data?.user || data.user;
        if (rawUser) {
          const user = reconstructUser(rawUser);
          useAuthStore.getState().setUser(user);
          return user;
        }
      }
    } catch (err) {
      console.error('Error in getMe:', err);
    }

    return useAuthStore.getState().user;
  }

  /**
   * Enable PIN for the current user
   */
  async enablePin(newPin: string): Promise<boolean> {
    if (!isValidPin(newPin)) {
      throw new Error('El PIN debe tener entre 4 y 8 caracteres (alfanumérico o + - * . _).');
    }

    const user = useAuthStore.getState().user;
    if (!user) throw new Error('No hay sesión activa.');

    try {
      await fetch('/api/data2rest/auth/set-pin', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ pin: newPin }),
      });
    } catch (err) {
      console.warn('Backend set-pin fallback:', err);
    }

    // Local sync
    updateStoredMember(String(user.id), { pin: newPin });
    useAuthStore.getState().setUser({
      ...user,
      has_pin_enabled: true,
    });

    return true;
  }

  /**
   * Change existing PIN
   */
  async changePin(currentPin: string, newPin: string): Promise<boolean> {
    if (!isValidPin(newPin)) {
      throw new Error('El nuevo PIN debe tener entre 4 y 8 caracteres (alfanumérico o + - * . _).');
    }

    const user = useAuthStore.getState().user;
    if (!user) throw new Error('No hay sesión activa.');

    // Verify current pin first
    const members = loadStoredMembers();
    const found = members.find((m) => String(m.id) === String(user.id) || m.cedula === user.identifier);
    if (found?.pin && found.pin !== currentPin) {
      throw new Error('El PIN actual no es correcto.');
    }

    try {
      await fetch('/api/data2rest/auth/change-pin', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ current_pin: currentPin, new_pin: newPin }),
      });
    } catch (err) {
      console.warn('Backend change-pin fallback:', err);
    }

    updateStoredMember(String(user.id), { pin: newPin });
    useAuthStore.getState().setUser({
      ...user,
      has_pin_enabled: true,
    });

    return true;
  }

  /**
   * Disable PIN (revert to direct QR access)
   */
  async disablePin(currentPin: string): Promise<boolean> {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('No hay sesión activa.');

    const members = loadStoredMembers();
    const found = members.find((m) => String(m.id) === String(user.id) || m.cedula === user.identifier);
    if (found?.pin && found.pin !== currentPin) {
      throw new Error('El PIN actual no coincide. No se puede desactivar.');
    }

    try {
      await fetch('/api/data2rest/auth/disable-pin', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ current_pin: currentPin }),
      });
    } catch (err) {
      console.warn('Backend disable-pin fallback:', err);
    }

    updateStoredMember(String(user.id), { pin: undefined });
    useAuthStore.getState().setUser({
      ...user,
      has_pin_enabled: false,
    });

    return true;
  }

  /**
   * Logout user and notify backend
   */
  async logout(): Promise<void> {
    try {
      await fetch('/api/data2rest/v1/auth/logout', {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } catch (err) {
      console.warn('Backend logout call failed:', err);
    } finally {
      useAuthStore.getState().logout();
    }
  }
}

export const authService = new AuthService();

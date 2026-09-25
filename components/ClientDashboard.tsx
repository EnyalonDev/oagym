'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Member, BiometricCredential } from '@/lib/types';
import { OA_LOGO } from '@/lib/logo';
import { DigitalCarnetCard } from './DigitalCarnetCard';
import { CanvasPdfViewer } from './CanvasPdfViewer';
import { AnthropometricCharts } from './AnthropometricCharts';
import { getStoredBiometricCredential, removeBiometricCredential, loadStoredMembers } from '@/lib/gym-store';
import { registerBiometricCredential } from '@/lib/biometrics';
import { useAuthStore } from '@/lib/stores/authStore';
import { authService } from '@/lib/services/authService';
import { isValidPin } from '@/lib/auth-types';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Calendar,
  LogOut,
  CreditCard,
  FileText,
  Activity,
  History,
  Phone,
  User,
  HeartPulse,
  Clock,
  Sparkles,
  ExternalLink,
  Fingerprint,
  CheckCircle2,
  Trash2,
  Smartphone,
  Lock,
  KeyRound,
  ShieldAlert,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';

interface ClientDashboardProps {
  member: Member;
  onLogout: () => void;
}

export function ClientDashboard({ member, onLogout }: ClientDashboardProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'pdf' | 'body' | 'history' | 'security'>('overview');
  const [biometricCred, setBiometricCred] = useState<BiometricCredential | null>(null);
  const [bioLoading, setBioLoading] = useState(false);
  const [bioMessage, setBioMessage] = useState<string | null>(null);

  // Security & PIN self-service state
  const authUser = useAuthStore((state) => state.user);
  const [hasPinActive, setHasPinActive] = useState<boolean>(() => {
    return Boolean(member.pin && member.pin.length >= 4) || Boolean(authUser?.has_pin_enabled);
  });

  const [pinMode, setPinMode] = useState<'view' | 'enable' | 'change' | 'disable'>('view');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [showPinText, setShowPinText] = useState(false);
  const [pinActionError, setPinActionError] = useState<string | null>(null);
  const [pinActionSuccess, setPinActionSuccess] = useState<string | null>(null);
  const [pinSubmitting, setPinSubmitting] = useState(false);

  // F5 Refresh & Hydration Guard (Section 1.3)
  useEffect(() => {
    setMounted(true);
    setBiometricCred(getStoredBiometricCredential());

    const members = loadStoredMembers();
    const fresh = members.find((m) => m.id === member.id || m.cedula === member.cedula);
    if (fresh) {
      setHasPinActive(Boolean(fresh.pin && fresh.pin.length >= 4));
    }
  }, [member]);

  // Inactivity tracking (10 minutes timeout according to Section 7.2)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const resetTimer = () => {
      useAuthStore.getState().updateLastActivity();
      clearTimeout(timer);
      timer = setTimeout(() => {
        alert('Tu sesión ha expirado por inactividad (10 minutos).');
        onLogout();
      }, 10 * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [onLogout]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="text-xs font-mono text-zinc-400">Cargando área personal...</span>
        </div>
      </div>
    );
  }

  const handleRegisterBiometric = async () => {
    setBioLoading(true);
    setBioMessage(null);
    try {
      const res = await registerBiometricCredential(member);
      if (res.success) {
        setBiometricCred(res.credential || getStoredBiometricCredential());
        setBioMessage('¡Dispositivo vinculado con éxito! Ahora puedes ingresar con tu huella o Face ID.');
      } else {
        setBioMessage(res.error || 'No se pudo vincular la biometría.');
      }
    } catch (e: any) {
      setBioMessage(e.message || 'Error al vincular biometría.');
    } finally {
      setBioLoading(false);
    }
  };

  const handleRemoveBiometric = () => {
    removeBiometricCredential();
    setBiometricCred(null);
    setBioMessage('Acceso biométrico desvinculado de este dispositivo.');
  };

  // PIN Self-Service Handlers (Section 3.3.C)
  const handleEnablePin = async () => {
    setPinActionError(null);
    setPinActionSuccess(null);

    if (!isValidPin(newPin)) {
      setPinActionError('El PIN debe tener entre 4 y 8 caracteres (alfanumérico o símbolos + - * . _).');
      return;
    }
    if (newPin !== confirmPin) {
      setPinActionError('La confirmación del PIN no coincide.');
      return;
    }

    setPinSubmitting(true);
    try {
      await authService.enablePin(newPin);
      setHasPinActive(true);
      setPinActionSuccess('¡PIN de seguridad activado con éxito! Se solicitará en tus próximos accesos.');
      setPinMode('view');
      setNewPin('');
      setConfirmPin('');
    } catch (err: any) {
      setPinActionError(err.message || 'Error al activar el PIN.');
    } finally {
      setPinSubmitting(false);
    }
  };

  const handleChangePin = async () => {
    setPinActionError(null);
    setPinActionSuccess(null);

    if (!currentPin) {
      setPinActionError('Debes ingresar tu PIN actual.');
      return;
    }
    if (!isValidPin(newPin)) {
      setPinActionError('El nuevo PIN debe tener entre 4 y 8 caracteres.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinActionError('La confirmación del nuevo PIN no coincide.');
      return;
    }

    setPinSubmitting(true);
    try {
      await authService.changePin(currentPin, newPin);
      setPinActionSuccess('¡PIN de seguridad actualizado exitosamente!');
      setPinMode('view');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (err: any) {
      setPinActionError(err.message || 'Error al cambiar el PIN.');
    } finally {
      setPinSubmitting(false);
    }
  };

  const handleDisablePin = async () => {
    setPinActionError(null);
    setPinActionSuccess(null);

    if (!currentPin) {
      setPinActionError('Debes ingresar tu PIN actual para confirmar la desactivación.');
      return;
    }

    setPinSubmitting(true);
    try {
      await authService.disablePin(currentPin);
      setHasPinActive(false);
      setPinActionSuccess('PIN de seguridad desactivado. Tu cuenta ahora ingresa de forma directa con solo escanear el QR.');
      setPinMode('view');
      setCurrentPin('');
    } catch (err: any) {
      setPinActionError(err.message || 'Error al desactivar el PIN.');
    } finally {
      setPinSubmitting(false);
    }
  };

  const statusConfig = {
    active: {
      color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      dotColor: 'bg-emerald-400',
      title: 'Membresía Activa • Acceso Total',
      desc: `Disfrutas de acceso completo a todas las zonas e instalaciones. Tu membresía vence el ${member.membershipEnd || member.expirationDate}.`,
      icon: ShieldCheck,
      bannerBg: 'bg-emerald-950/30 border-emerald-900/50',
    },
    expiring: {
      color: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      dotColor: 'bg-amber-400',
      title: 'Alerta de Vencimiento Próximo',
      desc: `Te quedan ${member.daysRemaining ?? member.remainingDays} días de suscripción. Renueva hoy en recepción para conservar tu acceso.`,
      icon: AlertTriangle,
      bannerBg: 'bg-amber-950/30 border-amber-900/50',
    },
    expired: {
      color: 'border-rose-500/40 bg-rose-950/20 text-rose-300',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      dotColor: 'bg-rose-500',
      title: 'Membresía Vencida • Acceso Restringido',
      desc: 'Tu periodo contratado ha finalizado. Por favor comunícate con recepción para renovar tu plan.',
      icon: AlertOctagon,
      bannerBg: 'bg-rose-950/30 border-rose-900/50',
    },
  }[member.status || 'active'] || {
    color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    dotColor: 'bg-emerald-400',
    title: 'Membresía Activa • Acceso Total',
    desc: 'Acceso completo a instalaciones de OA GYM.',
    icon: ShieldCheck,
    bannerBg: 'bg-emerald-950/30 border-emerald-900/50',
  };

  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-black text-[#E5E7EB] pb-16">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-black/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-20 flex items-center">
              <Image
                src={OA_LOGO}
                alt="OA GYM Logo Oficial"
                width={100}
                height={36}
                className="h-full w-auto max-h-9 object-contain drop-shadow"
              />
            </div>
            <div className="border-l border-zinc-800 pl-2.5">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold text-white leading-none">
                  {member.name}
                </h1>
                <span className="rounded-md bg-blue-950 px-1.5 py-0.5 text-[9px] font-bold text-blue-400 border border-blue-800/40 font-mono uppercase">
                  C.I. {member.cedula}
                </span>
                {hasPinActive && (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-emerald-950/60 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-800/40">
                    <Lock className="h-2.5 w-2.5" /> PIN Protegido
                  </span>
                )}
              </div>
              <span className="text-[10px] text-zinc-400">
                Plan {member.planName || 'Integral Pro'} • OA GYM Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="btn-logout-client"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white cursor-pointer transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Traffic Light Status Banner */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div
          id="member-status-traffic-light"
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-5 shadow-xl transition-all ${statusConfig.bannerBg}`}
        >
          <div className="flex items-start gap-3.5">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${statusConfig.color}`}>
              <StatusIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-white">{statusConfig.title}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-300 max-w-2xl leading-relaxed">{statusConfig.desc}</p>
            </div>
          </div>

          {/* Days remaining counter widget */}
          <div className="flex items-center gap-4 sm:border-l sm:border-zinc-800/80 sm:pl-6 shrink-0">
            <div className="text-center sm:text-right">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-semibold">
                Días de Acceso
              </span>
              <div className="flex items-baseline gap-1 justify-center sm:justify-end">
                <span
                  className={`text-3xl font-black font-mono ${
                    member.status === 'active'
                      ? 'text-emerald-400'
                      : member.status === 'expiring'
                      ? 'text-amber-400'
                      : 'text-rose-500'
                  }`}
                >
                  {member.daysRemaining ?? member.remainingDays ?? 30}
                </span>
                <span className="text-xs text-zinc-400">días</span>
              </div>
              <span className="text-[10px] text-zinc-400 block">
                Hasta {member.membershipEnd || member.expirationDate || 'Próximo ciclo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
          <button
            type="button"
            id="tab-client-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Carnet Digital & Resumen</span>
          </button>

          <button
            type="button"
            id="tab-client-pdf"
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'pdf'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Rutina & Nutrición Protegida</span>
          </button>

          <button
            type="button"
            id="tab-client-body"
            onClick={() => setActiveTab('body')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'body'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Monitoreo Corporal ({member.records?.length || 0} controles)</span>
          </button>

          <button
            type="button"
            id="tab-client-history"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Historial de Pagos</span>
          </button>

          {/* Security & PIN Self-Service Tab */}
          <button
            type="button"
            id="tab-client-security"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>Seguridad & PIN {hasPinActive && '🔒'}</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {/* TAB 1: OVERVIEW & CARNET */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Carnet Digital Column */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full text-left mb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tu Carnet Oficial OA GYM</h3>
                <p className="text-xs text-zinc-400">
                  Presenta este código QR en los sensores de torniquete para ingresar a la sede
                </p>
              </div>

              <DigitalCarnetCard member={member} allowDownload={true} />

              {/* Biometrics Device Linking Box */}
              <div className="mt-6 w-full max-w-[420px] rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-950 text-blue-400 border border-blue-800/50">
                    <Fingerprint className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Biometría Rápida (Face ID / Huella)</h4>
                    <p className="text-[11px] text-zinc-400">
                      {biometricCred
                        ? 'Este dispositivo está vinculado para entrar sin digitar tu cédula.'
                        : 'Vincula este dispositivo para acceder en 1 segundo con tu sensor físico.'}
                    </p>
                  </div>
                </div>

                {bioMessage && (
                  <div className="mt-3 rounded-xl bg-blue-950/50 border border-blue-800/60 p-2.5 text-xs text-blue-300">
                    {bioMessage}
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  {biometricCred ? (
                    <button
                      type="button"
                      onClick={handleRemoveBiometric}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Desvincular este dispositivo</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRegisterBiometric}
                      disabled={bioLoading}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 px-4 py-2 text-xs font-bold text-white shadow cursor-pointer transition-all"
                    >
                      <Fingerprint className="h-4 w-4 text-blue-400" />
                      <span>{bioLoading ? 'Registrando...' : 'Vincular Huella / Face ID Ahora'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* General Member Info */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  Detalles de la Membresía
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Plan Contratado</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">{member.planName || 'Plan Integral Pro'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Fecha de Inicio</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">{member.joinDate || member.membershipStart || '2026-01-15'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Próximo Vencimiento</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">{member.membershipEnd || member.expirationDate || '2026-03-30'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Protección de PIN</span>
                    <span className={`text-sm font-bold mt-0.5 block ${hasPinActive ? 'text-emerald-400' : 'text-zinc-400'}`}>
                      {hasPinActive ? 'Activado (4-8 dígitos)' : 'Desactivado'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Teléfono</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">{member.phone || 'No registrado'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Sede Principal</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">OA GYM San Cristóbal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROUTINE & NUTRITION PROTECTED CANVAS */}
        {activeTab === 'pdf' && (
          <div className="space-y-4">
            <CanvasPdfViewer member={member} />
          </div>
        )}

        {/* TAB 3: BODY MONITORING CHARTS */}
        {activeTab === 'body' && (
          <div className="space-y-4">
            <AnthropometricCharts records={member.records || []} memberName={member.name} />
          </div>
        )}

        {/* TAB 4: PAYMENT HISTORY */}
        {activeTab === 'history' && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Historial de Pagos y Facturas
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px]">
                    <th className="pb-3">Fecha</th>
                    <th className="pb-3">Concepto</th>
                    <th className="pb-3">Método</th>
                    <th className="pb-3">Monto</th>
                    <th className="pb-3 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {member.payments?.map((pay, i) => (
                    <tr key={i}>
                      <td className="py-3 font-mono">{pay.date}</td>
                      <td className="py-3 font-medium text-white">{pay.concept}</td>
                      <td className="py-3 text-zinc-400">{pay.method}</td>
                      <td className="py-3 font-mono font-bold text-white">${pay.amount}</td>
                      <td className="py-3 text-right">
                        <span className="rounded-full bg-emerald-950 border border-emerald-800/60 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          {pay.status || 'Pagado'}
                        </span>
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-zinc-500">
                        No hay pagos registrados recientemente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SECURITY & PIN SELF-SERVICE (Section 3.3.C) */}
        {activeTab === 'security' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-950/80 text-blue-400 border border-blue-800/50">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Seguridad de la Cuenta y PIN de Acceso</h3>
                  <p className="text-xs text-zinc-400">
                    Gestiona la protección adicional de tu carnet digital OA GYM
                  </p>
                </div>
              </div>

              {/* Status Banner */}
              <div className="mt-5 p-4 rounded-xl border bg-zinc-900/60 border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      hasPinActive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-zinc-600'
                    }`}
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {hasPinActive ? 'PIN de Seguridad ACTIVO' : 'PIN de Seguridad DESACTIVADO'}
                    </span>
                    <span className="text-[11px] text-zinc-400 block">
                      {hasPinActive
                        ? 'Tu carnet QR solicita un PIN de 4-8 dígitos para autorizar el ingreso.'
                        : 'El acceso se realiza de forma directa leyendo el QR o cédula.'}
                    </span>
                  </div>
                </div>

                {pinMode === 'view' && (
                  <div>
                    {hasPinActive ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPinMode('change');
                            setPinActionError(null);
                            setPinActionSuccess(null);
                          }}
                          className="rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-bold text-white cursor-pointer transition-all"
                        >
                          Cambiar PIN
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPinMode('disable');
                            setPinActionError(null);
                            setPinActionSuccess(null);
                          }}
                          className="rounded-lg border border-red-900 bg-red-950/50 hover:bg-red-900 px-3 py-1.5 text-xs font-bold text-red-300 cursor-pointer transition-all"
                        >
                          Desactivar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setPinMode('enable');
                          setPinActionError(null);
                          setPinActionSuccess(null);
                        }}
                        className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow cursor-pointer transition-all"
                      >
                        Activar PIN Ahora
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Action Feedback Alerts */}
              {pinActionError && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-900/60 bg-red-950/40 p-3 text-xs text-red-300">
                  <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{pinActionError}</span>
                </div>
              )}

              {pinActionSuccess && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-900/60 bg-emerald-950/40 p-3 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{pinActionSuccess}</span>
                </div>
              )}

              {/* SUB-PANEL: ENABLE PIN */}
              {pinMode === 'enable' && (
                <div className="mt-5 space-y-4 rounded-xl border border-blue-900/50 bg-blue-950/20 p-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                      Definir Nuevo PIN de Seguridad
                    </h4>
                    <button
                      type="button"
                      onClick={() => setPinMode('view')}
                      className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Nuevo PIN (4 a 8 caracteres):
                    </label>
                    <div className="relative">
                      <input
                        type={showPinText ? 'text' : 'password'}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        placeholder="Ej: 1234 o miPin*2"
                        maxLength={8}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white font-mono tracking-widest"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Confirmar Nuevo PIN:</label>
                    <input
                      type={showPinText ? 'text' : 'password'}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="Repite el PIN exacto"
                      maxLength={8}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white font-mono tracking-widest"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPinText(!showPinText)}
                      className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {showPinText ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span>{showPinText ? 'Ocultar caracteres' : 'Mostrar caracteres'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleEnablePin}
                      disabled={pinSubmitting || newPin.length < 4}
                      className="rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-5 py-2 text-xs font-bold text-white shadow cursor-pointer transition-all"
                    >
                      {pinSubmitting ? 'Guardando...' : 'Guardar y Activar PIN'}
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-PANEL: CHANGE PIN */}
              {pinMode === 'change' && (
                <div className="mt-5 space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cambiar PIN Actual</h4>
                    <button
                      type="button"
                      onClick={() => setPinMode('view')}
                      className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">PIN Actual:</label>
                    <input
                      type={showPinText ? 'text' : 'password'}
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value)}
                      placeholder="Digita tu PIN actual"
                      maxLength={8}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white font-mono tracking-widest"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Nuevo PIN (4 a 8 caracteres):
                    </label>
                    <input
                      type={showPinText ? 'text' : 'password'}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="Nuevo PIN"
                      maxLength={8}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white font-mono tracking-widest"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Confirmar Nuevo PIN:</label>
                    <input
                      type={showPinText ? 'text' : 'password'}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      placeholder="Repite el nuevo PIN"
                      maxLength={8}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white font-mono tracking-widest"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPinText(!showPinText)}
                      className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {showPinText ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span>{showPinText ? 'Ocultar caracteres' : 'Mostrar caracteres'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleChangePin}
                      disabled={pinSubmitting || newPin.length < 4}
                      className="rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-5 py-2 text-xs font-bold text-white shadow cursor-pointer transition-all"
                    >
                      {pinSubmitting ? 'Actualizando...' : 'Actualizar PIN'}
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-PANEL: DISABLE PIN */}
              {pinMode === 'disable' && (
                <div className="mt-5 space-y-4 rounded-xl border border-red-900/50 bg-red-950/20 p-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider">
                      Desactivar Protección por PIN
                    </h4>
                    <button
                      type="button"
                      onClick={() => setPinMode('view')}
                      className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Al desactivar el PIN, cualquier persona que escanee tu carnet QR o digite tu cédula podrá ingresar directamente al área personal.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Confirma ingresando tu PIN actual:
                    </label>
                    <input
                      type="password"
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value)}
                      placeholder="PIN actual para confirmar"
                      maxLength={8}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white font-mono tracking-widest text-center"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleDisablePin}
                      disabled={pinSubmitting || !currentPin}
                      className="rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 px-5 py-2 text-xs font-bold text-white shadow cursor-pointer transition-all"
                    >
                      {pinSubmitting ? 'Desactivando...' : 'Confirmar Desactivación de PIN'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

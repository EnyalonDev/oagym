'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Member, BiometricCredential } from '@/lib/types';
import { OA_LOGO } from '@/lib/logo';
import { SITE_CONTENT } from '@/constants/content';
import { loadStoredMembers, addAccessLog, getStoredBiometricCredential, removeBiometricCredential } from '@/lib/gym-store';
import { verifyBiometricCredential, registerBiometricCredential } from '@/lib/biometrics';
import { authService } from '@/lib/services/authService';
import { useAuthStore } from '@/lib/stores/authStore';
import { isValidPin } from '@/lib/auth-types';
import { QRScanner } from './QRScanner';
import {
  CreditCard,
  QrCode,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  X,
  Sparkles,
  Fingerprint,
  CheckCircle2,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Lock,
} from 'lucide-react';

interface ClientPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (member: Member) => void;
}

export function ClientPortalModal({ isOpen, onClose, onLoginSuccess }: ClientPortalModalProps) {
  const modalTitle = SITE_CONTENT.find((c) => c.key === 'portal_modal_title')?.value || 'Portal de Socios OA GYM';
  const modalSubtitle = SITE_CONTENT.find((c) => c.key === 'portal_modal_subtitle')?.value || 'Ingresa a tu carnet digital oficial, rutina prescrita y seguimiento de cargas.';
  const tabBiometric = SITE_CONTENT.find((c) => c.key === 'portal_tab_biometric')?.value || 'Huella / Face ID';
  const tabCedula = SITE_CONTENT.find((c) => c.key === 'portal_tab_cedula')?.value || 'Por Cédula';
  const tabQr = SITE_CONTENT.find((c) => c.key === 'portal_tab_qr')?.value || 'Escanear QR';
  const labelCedula = SITE_CONTENT.find((c) => c.key === 'portal_label_cedula')?.value || 'Número de Cédula o Identificación';
  const placeholderCedula = SITE_CONTENT.find((c) => c.key === 'portal_placeholder_cedula')?.value || 'Ej: 1020304050 (sin puntos ni guiones)';
  const hintCedula = SITE_CONTENT.find((c) => c.key === 'portal_hint_cedula')?.value || 'Digita tu documento exactamente como fue registrado en recepción.';
  const bioCheckboxLabel = SITE_CONTENT.find((c) => c.key === 'portal_biometrics_checkbox_label')?.value || 'Activar Face ID / Huella Dactilar en este dispositivo';
  const bioCheckboxHint = SITE_CONTENT.find((c) => c.key === 'portal_biometrics_checkbox_hint')?.value || 'Vinculará tu cédula para que en tus próximos ingresos entres en 1 segundo con tu sensor biométrico.';
  const btnSubmitLogin = SITE_CONTENT.find((c) => c.key === 'portal_btn_submit_login')?.value || 'Acceder a Mi Área Personal';
  const securityGuarantee = SITE_CONTENT.find((c) => c.key === 'portal_security_guarantee')?.value || 'Validación protegida por el hardware de tu dispositivo. Tu biometría no se almacena en servidores externos.';
  const demoBannerTitle = SITE_CONTENT.find((c) => c.key === 'portal_demo_banner_title')?.value || 'Usuarios de demostración para evaluación rápida:';

  const [biometricCred, setBiometricCred] = useState<BiometricCredential | null>(() => {
    if (typeof window !== 'undefined') return getStoredBiometricCredential();
    return null;
  });
  const [activeTab, setActiveTab] = useState<'biometric' | 'cedula' | 'qr'>(() => {
    if (typeof window !== 'undefined') {
      const cred = getStoredBiometricCredential();
      if (cred && cred.active) return 'biometric';
    }
    return 'cedula';
  });

  const [step, setStep] = useState<'identify' | 'pin'>('identify');
  const [targetIdentifier, setTargetIdentifier] = useState('');
  const [cedulaInput, setCedulaInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberBiometric, setRememberBiometric] = useState(true);
  const [isAuthenticatingBio, setIsAuthenticatingBio] = useState(false);
  const [bioSuccessMsg, setBioSuccessMsg] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep('identify');
      setTargetIdentifier('');
      setPinInput('');
      setErrorMsg(null);
      return;
    }

    const handleBioChange = () => {
      const cred = getStoredBiometricCredential();
      setBiometricCred(cred);
      if (cred && cred.active) {
        setActiveTab('biometric');
      }
    };
    window.addEventListener('oa_gym_biometric_change', handleBioChange);
    return () => window.removeEventListener('oa_gym_biometric_change', handleBioChange);
  }, [isOpen]);

  if (!isOpen) return null;

  // Complete Login and pass Member object to parent
  const completeLoginFlow = (targetId: string) => {
    const members = loadStoredMembers();
    const cleanId = targetId.trim().toLowerCase();
    const found = members.find(
      (m) =>
        m.id.toLowerCase() === cleanId ||
        m.cedula.toLowerCase() === cleanId ||
        (m.qrCode && m.qrCode.toLowerCase() === cleanId)
    );

    if (found) {
      const statusLabel =
        found.status === 'active'
          ? 'Permitido (Activo)'
          : found.status === 'expiring'
          ? 'Permitido (Próximo a Vencer)'
          : 'Denegado (En Mora)';
      addAccessLog(found.id, found.name, 'Código QR', statusLabel);
      onLoginSuccess(found);
    } else {
      // Create synthetic member for newly authenticated user
      const currentUser = useAuthStore.getState().user;
      const syntheticMember: Member = {
        id: String(currentUser?.id || targetId),
        name: currentUser?.name || 'Socio OA GYM',
        cedula: currentUser?.identifier || targetId,
        planId: 'plan_pro',
        planName: 'Plan Integral Pro',
        membershipStart: new Date().toISOString().split('T')[0],
        membershipEnd: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        daysRemaining: 30,
        status: 'active',
        biometricRegistered: Boolean(currentUser?.has_pin_enabled),
        pin: currentUser?.has_pin_enabled ? '****' : undefined,
        phone: '',
        email: '',
        birthDate: '',
        assignedTrainer: 'Equipo OA GYM',
        emergencyContact: 'Recepción OA GYM',
        emergencyPhone: 'N/A',
        bloodType: 'O+',
        routineTitle: 'Acondicionamiento General',
        routineGoals: 'Salud, fuerza y resistencia',
        nutritionOverview: 'Guía de hidratación y alimentación balanceada',
        records: [],
        payments: [],
      };
      onLoginSuccess(syntheticMember);
    }
  };

  // Step 1: Handle Identifier Input (QR or Cédula)
  const handleIdentifySubmit = async (identifierValue?: string) => {
    const rawId = identifierValue || cedulaInput;
    const cleanId = rawId.trim().replace(/[.-]/g, '');

    if (!cleanId) {
      setErrorMsg('Por favor ingresa o escanea un número de cédula o identificador válido.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const result = await authService.checkOrLogin(cleanId);

      if (result.requiresPin) {
        setTargetIdentifier(cleanId);
        setStep('pin');
        setPinInput('');
        setIsLoading(false);
        return;
      }

      // Success direct login
      if (rememberBiometric) {
        const members = loadStoredMembers();
        const found = members.find((m) => m.cedula.trim() === cleanId || m.id === cleanId);
        if (found) {
          try {
            await registerBiometricCredential(found);
          } catch (e) {
            console.warn('Biometric auto-enrollment skipped:', e);
          }
        }
      }

      completeLoginFlow(cleanId);
    } catch (err: any) {
      setErrorMsg(err.message || 'No se pudo verificar el identificador.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle PIN Verification
  const handlePinSubmit = async () => {
    if (!pinInput || !isValidPin(pinInput)) {
      setErrorMsg('El PIN debe contener entre 4 y 8 caracteres (letras, números o + - * . _).');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      await authService.verifyPin(targetIdentifier, pinInput);
      completeLoginFlow(targetIdentifier);
    } catch (err: any) {
      setErrorMsg(err.message || 'PIN de seguridad incorrecto.');
    } finally {
      setIsLoading(false);
    }
  };

  // Biometric Login
  const handleBiometricLogin = async () => {
    if (!biometricCred) return;
    setErrorMsg(null);
    setIsAuthenticatingBio(true);

    try {
      const result = await verifyBiometricCredential(biometricCred);
      if (!result.success) {
        setErrorMsg(result.error || 'Autenticación biométrica no completada.');
        setIsAuthenticatingBio(false);
        return;
      }

      setBioSuccessMsg(true);
      await authService.checkOrLogin(biometricCred.cedula);

      setTimeout(() => {
        setIsAuthenticatingBio(false);
        completeLoginFlow(biometricCred.cedula);
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al validar datos biométricos.');
      setIsAuthenticatingBio(false);
    }
  };

  const handleQRSuccess = (decodedText: string) => {
    let cleanText = decodedText.trim();
    if (cleanText.startsWith('OAGYM_MEMBER:')) {
      cleanText = cleanText.replace('OAGYM_MEMBER:', '');
    }
    setCedulaInput(cleanText);
    handleIdentifySubmit(cleanText);
  };

  const handleRemoveBiometric = () => {
    removeBiometricCredential();
    setBiometricCred(null);
    setActiveTab('cedula');
  };

  const demoMembers = [
    { label: 'Carlos R. (1020304050)', cedula: '1020304050', badge: '🟢 Activo (24 d)' },
    { label: 'Mariana G. (1098765432)', cedula: '1098765432', badge: '🟠 Alerta (5 d)' },
    { label: 'Andrés M. (1040506070)', cedula: '1040506070', badge: '🔴 Mora (0 d)' },
    { label: 'Valentina C. (1030201040)', cedula: '1030201040', badge: '🟢 Activo (18 d)' },
  ];

  return (
    <div className="fixed inset-0 z-[100000] flex items-end sm:items-center justify-center sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6 shadow-2xl max-h-[92dvh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          style={{ touchAction: 'manipulation' }}
          className="absolute top-3 right-3 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:bg-zinc-900 hover:text-white active:bg-zinc-800 transition-all cursor-pointer select-none"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center pb-4 border-b border-zinc-800/80">
          <div className="mx-auto mb-2 flex h-14 w-auto items-center justify-center">
            <Image
              src={OA_LOGO}
              alt="OA GYM Logo Oficial"
              width={120}
              height={48}
              className="h-12 w-auto object-contain drop-shadow-[0_2px_10px_rgba(37,99,235,0.35)]"
            />
          </div>
          <h2 className="text-xl font-extrabold text-white">{modalTitle}</h2>
          <p className="text-xs text-zinc-400 mt-1">{modalSubtitle}</p>
        </div>

        {/* Step 1: Identifier Entry (Tabs: Biometric / Cédula / QR) */}
        {step === 'identify' && (
          <div>
            {/* Method Switcher Tabs */}
            <div className="mt-5 grid grid-cols-3 gap-1.5 rounded-xl bg-zinc-900 p-1.5 border border-zinc-800 text-xs font-bold">
              {biometricCred && (
                <button
                  type="button"
                  id="tab-access-biometric"
                  style={{ touchAction: 'manipulation' }}
                  onClick={() => {
                    setActiveTab('biometric');
                    setErrorMsg(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-lg min-h-[44px] py-2 transition-all cursor-pointer select-none ${
                    activeTab === 'biometric'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Fingerprint className="h-4 w-4" />
                  <span>{tabBiometric}</span>
                </button>
              )}

              <button
                type="button"
                id="tab-access-cedula"
                style={{ touchAction: 'manipulation' }}
                onClick={() => {
                  setActiveTab('cedula');
                  setErrorMsg(null);
                }}
                className={`flex items-center justify-center gap-1.5 rounded-lg min-h-[44px] py-2 transition-all cursor-pointer select-none ${
                  !biometricCred ? 'col-span-1.5' : ''
                } ${
                  activeTab === 'cedula'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>{tabCedula}</span>
              </button>

              <button
                type="button"
                id="tab-access-qr"
                style={{ touchAction: 'manipulation' }}
                onClick={() => {
                  setActiveTab('qr');
                  setErrorMsg(null);
                }}
                className={`flex items-center justify-center gap-1.5 rounded-lg min-h-[44px] py-2 transition-all cursor-pointer select-none ${
                  !biometricCred ? 'col-span-1.5' : ''
                } ${
                  activeTab === 'qr'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <QrCode className="h-4 w-4" />
                <span>{tabQr}</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB: Biometrics */}
            {activeTab === 'biometric' && biometricCred && (
              <div className="mt-5 space-y-4 text-center">
                <div className="rounded-2xl border border-blue-900/40 bg-blue-950/20 p-6">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-900/40 text-blue-400 border border-blue-700/50 shadow-lg shadow-blue-950/50">
                    <Fingerprint className="h-8 w-8 animate-pulse" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Dispositivo Vinculado</h3>
                  <p className="text-xs text-zinc-300 mt-1">
                    Socio: <strong>{biometricCred.memberName}</strong>
                  </p>
                  <p className="text-[11px] text-zinc-500">Cédula: {biometricCred.cedula}</p>

                  <button
                    type="button"
                    onClick={handleBiometricLogin}
                    disabled={isAuthenticatingBio}
                    className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-xs font-bold text-white shadow-lg shadow-blue-900/40 cursor-pointer transition-all"
                  >
                    {isAuthenticatingBio ? (
                      <span>Validando sensor biométrico...</span>
                    ) : (
                      <>
                        <Fingerprint className="h-4 w-4" />
                        <span>Escanear Huella o Face ID</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB: Cédula Manual */}
            {activeTab === 'cedula' && (
              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="input-portal-cedula" className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    {labelCedula}
                  </label>
                  <div className="relative">
                    <input
                      id="input-portal-cedula"
                      type="text"
                      value={cedulaInput}
                      onChange={(e) => setCedulaInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleIdentifySubmit()}
                      placeholder={placeholderCedula}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono tracking-wider"
                      autoFocus
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-zinc-500">{hintCedula}</p>
                </div>

                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberBiometric}
                      onChange={(e) => setRememberBiometric(e.target.checked)}
                      className="mt-0.5 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="block text-xs font-bold text-zinc-200">{bioCheckboxLabel}</span>
                      <span className="block text-[11px] text-zinc-400 mt-0.5">{bioCheckboxHint}</span>
                    </div>
                  </label>
                </div>

                <button
                  type="button"
                  id="btn-submit-portal-login"
                  onClick={() => handleIdentifySubmit()}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-xs font-bold text-white shadow-lg shadow-blue-900/40 cursor-pointer transition-all"
                >
                  <span>{isLoading ? 'Verificando...' : btnSubmitLogin}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* TAB: QR Scanner */}
            {activeTab === 'qr' && (
              <div className="mt-5 space-y-4">
                <QRScanner
                  onScanSuccess={handleQRSuccess}
                  title="Lector de Carnet Digital OA GYM"
                  subtitle="Apunta la cámara al código QR de tu carnet físico o celular"
                  demoOptions={demoMembers.map((m) => ({
                    label: m.label,
                    value: m.cedula,
                    badge: m.badge,
                  }))}
                />
              </div>
            )}

            {/* Demo Quick Select */}
            {activeTab === 'cedula' && (
              <div className="mt-5 pt-4 border-t border-zinc-800/80">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  {demoBannerTitle}
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {demoMembers.map((demo) => (
                    <button
                      key={demo.cedula}
                      type="button"
                      onClick={() => {
                        setCedulaInput(demo.cedula);
                        handleIdentifySubmit(demo.cedula);
                      }}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-left text-[11px] text-zinc-300 hover:border-blue-700 hover:bg-zinc-800 transition-all cursor-pointer"
                    >
                      <span className="font-medium truncate">{demo.label.split(' ')[0]}</span>
                      <span className="text-[9px] font-bold text-blue-400 font-mono">{demo.cedula}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Security PIN Challenge (Estrategia B) */}
        {step === 'pin' && (
          <div className="mt-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between rounded-xl bg-blue-950/40 border border-blue-800/60 p-3 text-xs text-blue-300">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-400" />
                <span>
                  Socio identificado: <strong className="font-mono text-white">{targetIdentifier}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('identify');
                  setErrorMsg(null);
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-white underline cursor-pointer"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Cambiar</span>
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2 rounded-xl border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label htmlFor="input-portal-pin" className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                <span>PIN de Seguridad Personal</span>
                <span className="text-[10px] text-zinc-500 font-normal">4 a 8 caracteres (alfanumérico / + - * . _)</span>
              </label>
              <div className="relative">
                <input
                  id="input-portal-pin"
                  type={showPin ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
                  placeholder="Digita tu PIN de acceso"
                  maxLength={8}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 pr-12 text-base text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono tracking-widest text-center"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-zinc-500">
                Esta cuenta cuenta con protección de PIN activada.
              </p>
            </div>

            <button
              type="button"
              id="btn-submit-portal-pin"
              onClick={handlePinSubmit}
              disabled={isLoading || pinInput.length < 4}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-3 text-xs font-bold text-white shadow-lg shadow-blue-900/40 cursor-pointer transition-all"
            >
              <KeyRound className="h-4 w-4" />
              <span>{isLoading ? 'Validando PIN...' : 'Verificar PIN e Ingresar'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

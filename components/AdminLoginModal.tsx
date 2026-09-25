'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ADMIN_MASTER_QR_VALUE, ADMIN_DEFAULT_PIN } from '@/lib/initial-data';
import { OA_LOGO } from '@/lib/logo';
import { addAccessLog } from '@/lib/gym-store';
import { authService } from '@/lib/services/authService';
import { QRScanner } from './QRScanner';
import { ShieldAlert, KeyRound, QrCode, Lock, CheckCircle2, X, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminLoginSuccess: () => void;
}

export function AdminLoginModal({ isOpen, onClose, onAdminLoginSuccess }: AdminLoginModalProps) {
  const [scannedQR, setScannedQR] = useState<string | null>(null);
  const [adminPin, setAdminPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [qrStepCompleted, setQrStepCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleQRDetected = (decodedText: string) => {
    setErrorMsg(null);
    const cleanText = decodedText.trim();
    if (cleanText === ADMIN_MASTER_QR_VALUE.trim() || cleanText.includes('STAFF-OA') || cleanText.includes('ADMIN')) {
      setScannedQR(cleanText);
      setQrStepCompleted(true);
    } else {
      setErrorMsg('El código QR escaneado no corresponde a una Llave Maestra de Staff OA GYM.');
    }
  };

  const handleAdminAuthSubmit = async () => {
    setErrorMsg(null);

    if (!qrStepCompleted || !scannedQR) {
      setErrorMsg('Es obligatorio escanear previamente el Código QR de Staff.');
      return;
    }

    if (!adminPin || adminPin.trim().length === 0) {
      setErrorMsg('Por favor ingresa tu PIN institucional de Staff.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.loginStaff(adminPin, scannedQR);
      addAccessLog('staff_master', 'Staff OA GYM (Administrador)', 'QR Admin + PIN', 'Acceso Staff Autorizado');
      onAdminLoginSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'PIN o credencial de Staff incorrecta. (Demo: OAGYM2026 / 1234)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border-2 border-blue-900/60 bg-zinc-950 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all cursor-pointer"
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
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-950/60 border border-blue-800/60 px-3 py-0.5 text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-1">
            <ShieldAlert className="h-3.5 w-3.5" /> Ruta Privada Staff
          </div>
          <h2 className="text-xl font-extrabold text-white">Portal Administrativo OA GYM</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Acceso de alta seguridad: Requiere Código QR de Staff + PIN Criptográfico
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div
            className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold border ${
              qrStepCompleted
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300'
            }`}
          >
            {qrStepCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <QrCode className="h-4 w-4 text-blue-400 shrink-0" />
            )}
            <span>Paso 1: QR Staff</span>
          </div>

          <div
            className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold border ${
              qrStepCompleted
                ? 'bg-blue-950/40 border-blue-800 text-blue-300'
                : 'bg-zinc-900/50 border-zinc-800/60 text-zinc-500'
            }`}
          >
            <KeyRound className="h-4 w-4 shrink-0" />
            <span>Paso 2: PIN Staff</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-300">
            <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Scan QR Admin */}
        {!qrStepCompleted ? (
          <div className="mt-5 space-y-4">
            <QRScanner
              onScanSuccess={handleQRDetected}
              title="Escaneo de Credencial de Staff"
              subtitle="Apunta la cámara al QR de la tarjeta del Staff / Administrador"
              demoOptions={[
                {
                  label: 'Escanear Llave Maestra Staff',
                  value: ADMIN_MASTER_QR_VALUE,
                  badge: 'Llave Autorizada',
                },
              ]}
            />
          </div>
        ) : (
          /* Step 2: Enter PIN (No-Form pattern) */
          <div className="mt-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between rounded-xl bg-emerald-950/30 border border-emerald-800/60 p-3 text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Llave QR verificada con éxito (STAFF-OA)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQrStepCompleted(false);
                  setScannedQR(null);
                }}
                className="text-[11px] font-bold text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Cambiar QR
              </button>
            </div>

            <div>
              <label htmlFor="input-admin-pin" className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                PIN / Clave de Staff
              </label>
              <div className="relative">
                <input
                  id="input-admin-pin"
                  type={showPin ? 'text' : 'password'}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminAuthSubmit()}
                  placeholder="Digita el PIN de seguridad (Demo: OAGYM2026)"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 pr-12 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono tracking-widest"
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
              <p className="mt-1.5 text-[11px] text-zinc-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-400" /> PIN de prueba institucional:{' '}
                <strong className="text-zinc-200 font-mono">OAGYM2026</strong> o <strong className="text-zinc-200 font-mono">1234</strong>
              </p>
            </div>

            <button
              type="button"
              id="btn-confirm-admin-auth"
              onClick={handleAdminAuthSubmit}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/40 hover:from-blue-500 hover:to-indigo-600 cursor-pointer transition-all"
            >
              <span>{isLoading ? 'Autenticando...' : 'Acceder al Panel de Control Staff'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

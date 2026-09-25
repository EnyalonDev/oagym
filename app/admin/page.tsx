'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { authService } from '@/lib/services/authService';
import { AdminLoginModal } from '@/components/AdminLoginModal';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ShieldAlert, Lock, ArrowLeft, QrCode } from 'lucide-react';

export default function AdminRoutePage() {
  const [mounted, setMounted] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(true);

  const authUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated && authUser) {
      if (useAuthStore.getState().isAdmin()) {
        setIsAdminAuth(true);
        setShowLoginModal(false);
      }
    }
  }, [isAuthenticated, authUser]);

  const handleAdminLogout = async () => {
    await authService.logout();
    setIsAdminAuth(false);
    setShowLoginModal(true);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="text-xs font-mono text-zinc-400">Verificando credenciales de Staff...</span>
        </div>
      </div>
    );
  }

  if (isAdminAuth) {
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  return (
    <div className="min-h-screen bg-black text-[#E5E7EB] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-950/80 text-blue-400 border border-blue-800/60 shadow-lg shadow-blue-950/50">
          <Lock className="h-8 w-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-950/60 border border-blue-800/60 px-3 py-1 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
          <ShieldAlert className="h-3.5 w-3.5" /> Ruta Privada Staff OA GYM
        </div>

        <h1 className="text-2xl font-black text-white mb-2">Acceso Administrativo</h1>
        <p className="text-xs text-zinc-400 mb-6">
          Esta ruta está restringida exclusivamente al personal técnico y directivo de OA GYM.
          Para ingresar debes validar tu carnet QR de Staff y tu PIN institucional.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowLoginModal(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-xs font-bold text-white shadow-lg shadow-blue-900/40 transition-all cursor-pointer"
          >
            <QrCode className="h-4 w-4" />
            <span>Validar QR Staff + PIN</span>
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 py-2.5 text-xs font-semibold text-zinc-300 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al Sitio Principal</span>
          </Link>
        </div>
      </div>

      <AdminLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onAdminLoginSuccess={() => {
          setIsAdminAuth(true);
          setShowLoginModal(false);
        }}
      />
    </div>
  );
}

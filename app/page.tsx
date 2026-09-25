'use client';

import React, { useState, useEffect } from 'react';
import { Member, SiteContent, PlanData } from '@/lib/types';
import {
  loadStoredSiteContent,
  loadStoredPlans,
  loadStoredMembers,
} from '@/lib/gym-store';
import { useAuthStore } from '@/lib/stores/authStore';
import { authService } from '@/lib/services/authService';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { PlansSection } from '@/components/PlansSection';
import { FacilitiesSection } from '@/components/FacilitiesSection';
import { MethodologySection } from '@/components/MethodologySection';
import { Footer } from '@/components/Footer';
import { ClientPortalModal } from '@/components/ClientPortalModal';
import { AdminLoginModal } from '@/components/AdminLoginModal';
import { ClientDashboard } from '@/components/ClientDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { INITIAL_SITE_CONTENT, INITIAL_PLANS } from '@/lib/initial-data';

export default function HomePage() {
  const [content, setContent] = useState<SiteContent>(INITIAL_SITE_CONTENT);
  const [plans, setPlans] = useState<PlanData[]>(INITIAL_PLANS);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  const authUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Sync with store and rehydrate active user session
  useEffect(() => {
    const updateFromStore = () => {
      setContent(loadStoredSiteContent());
      setPlans(loadStoredPlans());

      const user = useAuthStore.getState().user;
      const isAuth = useAuthStore.getState().isAuthenticated;

      if (isAuth && user) {
        if (useAuthStore.getState().isAdmin()) {
          setIsAdminAuth(true);
          setCurrentMember(null);
        } else {
          const mems = loadStoredMembers();
          const cleanId = (user.identifier || '').toLowerCase();
          const found = mems.find(
            (m) =>
              m.id.toLowerCase() === cleanId ||
              m.cedula.toLowerCase() === cleanId ||
              (m.qrCode && m.qrCode.toLowerCase() === cleanId)
          );
          if (found) {
            setCurrentMember(found);
          } else {
            setCurrentMember({
              id: String(user.id),
              name: user.name,
              cedula: user.identifier,
              phone: user.phone || '0424-0000000',
              email: user.email || 'socio@oagym.com',
              birthDate: '1995-01-01',
              planId: 'plan_pro',
              planName: 'Plan Integral Pro',
              membershipStart: '2026-01-15',
              membershipEnd: '2026-03-30',
              daysRemaining: 30,
              status: 'active',
              assignedTrainer: 'Óscar Arias',
              emergencyContact: 'Recepción OA GYM',
              emergencyPhone: '0424-8543500',
              bloodType: 'O+',
              routineTitle: 'Acondicionamiento Integral',
              routineGoals: 'Hipertrofia y Resistencia',
              nutritionOverview: 'Plan de Nutrición Personalizada',
              biometricRegistered: Boolean(user.has_pin_enabled),
              records: [],
              payments: [],
            });
          }
        }
      } else {
        if (!currentMember && !isAdminAuth) {
          // Keep unauthenticated state
        }
      }
    };

    updateFromStore();
    window.addEventListener('oa_gym_data_change', updateFromStore);
    window.addEventListener('userUpdated', updateFromStore);
    return () => {
      window.removeEventListener('oa_gym_data_change', updateFromStore);
      window.removeEventListener('userUpdated', updateFromStore);
    };
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setCurrentMember(null);
    setIsAdminAuth(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If client is logged in, show their private dashboard (Module 2)
  if (currentMember) {
    return <ClientDashboard member={currentMember} onLogout={handleLogout} />;
  }

  // If staff is authenticated, show the admin control panel (Module 3 & 4)
  if (isAdminAuth) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <div
      className="min-h-screen bg-black text-[#E5E7EB] selection:bg-blue-600 selection:text-white"
      style={{ isolation: 'isolate', touchAction: 'pan-y' }}
    >
      {/* Navigation */}
      <Navbar
        content={content}
        onOpenClientPortal={() => setClientModalOpen(true)}
        onOpenAdminPortal={() => setAdminModalOpen(true)}
      />

      {/* Main Landing Page Sections */}
      <main>
        {/* SECTION: Hero */}
        <Hero content={content} onOpenClientPortal={() => setClientModalOpen(true)} />

        {/* SECTION: Plans */}
        <PlansSection plans={plans} onOpenClientPortal={() => setClientModalOpen(true)} />

        {/* SECTION: Facilities */}
        <FacilitiesSection />

        {/* SECTION: Methodology */}
        <MethodologySection />
      </main>

      {/* SECTION: Footer */}
      <Footer
        content={content}
        onOpenClientPortal={() => setClientModalOpen(true)}
        onOpenAdminPortal={() => setAdminModalOpen(true)}
      />

      {/* Client Access Modal (Dual: Manual Cédula or QR Code + PIN Step) */}
      <ClientPortalModal
        isOpen={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onLoginSuccess={(member) => {
          setCurrentMember(member);
          setClientModalOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Admin Staff Access Modal (QR + Text PIN) */}
      <AdminLoginModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onAdminLoginSuccess={() => {
          setIsAdminAuth(true);
          setAdminModalOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

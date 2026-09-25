'use client';

import React from 'react';
import Image from 'next/image';
import { SiteContent } from '@/lib/types';
import { OA_LOGO } from '@/lib/logo';
import { SITE_CONTENT } from '@/constants/content';
import { MapPin, Phone, Clock, MessageSquare, Shield, Lock } from 'lucide-react';

interface FooterProps {
  content: SiteContent;
  onOpenClientPortal: () => void;
  onOpenAdminPortal: () => void;
}

export function Footer({ content, onOpenClientPortal, onOpenAdminPortal }: FooterProps) {
  // Extract copy via .find() on SITE_CONTENT according to protocol
  const badgeSubtitle = SITE_CONTENT.find((c) => c.key === 'footer_badge_subtitle')?.value || 'Centro de Alto Rendimiento';
  const certificationBadge = SITE_CONTENT.find((c) => c.key === 'footer_certification_badge')?.value || 'Instalaciones habilitadas y certificadas con protocolo biomédico.';
  const scheduleTitle = SITE_CONTENT.find((c) => c.key === 'footer_schedule_title')?.value || 'Horarios de Apertura';
  const scheduleWeekdaysLabel = SITE_CONTENT.find((c) => c.key === 'footer_schedule_weekdays_label')?.value || 'Lunes a Viernes';
  const contactTitle = SITE_CONTENT.find((c) => c.key === 'footer_contact_title')?.value || 'Sede Principal & Contacto';
  const whatsappButton = SITE_CONTENT.find((c) => c.key === 'footer_whatsapp_button')?.value || 'Atención WhatsApp Recepción';
  const shortcutsTitle = SITE_CONTENT.find((c) => c.key === 'footer_shortcuts_title')?.value || 'Accesos Directos';
  const clientPortalTitle = SITE_CONTENT.find((c) => c.key === 'footer_client_portal_title')?.value || 'Área Personal de Socios';
  const clientPortalDesc = SITE_CONTENT.find((c) => c.key === 'footer_client_portal_desc')?.value || 'Ingreso por Cédula o Carnet QR';
  const staffAccessLabel = SITE_CONTENT.find((c) => c.key === 'footer_staff_access_label')?.value || 'Ruta Privada Staff (Admin)';
  const staffAccessBadge = SITE_CONTENT.find((c) => c.key === 'footer_staff_access_badge')?.value || 'QR + PIN';
  const copyrightSuffix = SITE_CONTENT.find((c) => c.key === 'footer_copyright_suffix')?.value || 'OA GYM • Todos los derechos reservados. Sistema Integral de Gestión Deportiva.';
  const techSpecs = SITE_CONTENT.find((c) => c.key === 'footer_tech_specs')?.value || 'Desarrollo Next.js 16.3.5 • Dark Mode Nativo';

  return (
    /* SECTION: Footer */
    <footer id="contacto" className="border-t border-zinc-800 bg-black text-zinc-400 text-xs">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-28 flex items-center">
                <Image
                  src={OA_LOGO}
                  alt="OA GYM Logo Oficial"
                  width={120}
                  height={48}
                  className="h-full w-auto max-h-12 object-contain drop-shadow-[0_2px_10px_rgba(37,99,235,0.3)]"
                />
              </div>
              <div className="border-l border-zinc-800 pl-3">
                <span className="text-base font-black tracking-wider text-white">OA GYM</span>
                <span className="block text-[10px] uppercase font-semibold text-blue-400 tracking-widest">
                  {badgeSubtitle}
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {content.aboutText}
            </p>

            <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>{certificationBadge}</span>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              {scheduleTitle}
            </h4>

            <div className="space-y-2 text-xs">
              <div className="rounded-xl bg-zinc-950 p-3.5 border border-zinc-800">
                <span className="text-blue-400 block text-[10px] uppercase font-bold tracking-wider mb-1">
                  {scheduleWeekdaysLabel}
                </span>
                <span className="text-white font-medium text-sm">{content.scheduleWeekdays}</span>
              </div>
            </div>
          </div>

          {/* Location & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-400" />
              {contactTitle}
            </h4>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                <span>{content.address}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-zinc-500 shrink-0" />
                <span className="font-mono">{content.phone}</span>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/${content.whatsapp || '584248543500'}?text=${encodeURIComponent('Contacto directo desde la web\n\n')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition-all"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{whatsappButton}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Access & Staff Portal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {shortcutsTitle}
            </h4>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={onOpenClientPortal}
                className="w-full text-left rounded-xl border border-zinc-800 bg-zinc-950 p-3 hover:border-blue-600/50 hover:bg-zinc-900 transition-all"
              >
                <span className="font-bold text-white block">{clientPortalTitle}</span>
                <span className="text-[11px] text-zinc-400">{clientPortalDesc}</span>
              </button>

              {/* Private Staff Access Route */}
              <button
                type="button"
                id="footer-btn-staff-private"
                onClick={onOpenAdminPortal}
                className="w-full flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950 p-3 hover:border-zinc-700 hover:bg-zinc-900 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-zinc-500 group-hover:text-blue-400" />
                  <span className="font-medium text-zinc-400 group-hover:text-zinc-200">
                    {staffAccessLabel}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">{staffAccessBadge}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400">
          <span>
            © {new Date().getFullYear()} {copyrightSuffix}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400">{techSpecs}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

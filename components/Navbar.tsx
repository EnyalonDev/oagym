'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SiteContent } from '@/lib/types';
import { OA_LOGO } from '@/lib/logo';
import { SITE_CONTENT } from '@/constants/content';
import { User, Lock, Menu, X } from 'lucide-react';

interface NavbarProps {
  content: SiteContent;
  onOpenClientPortal: () => void;
  onOpenAdminPortal: () => void;
}

export function Navbar({ content, onOpenClientPortal, onOpenAdminPortal }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Extract navigation copy via .find() on SITE_CONTENT according to protocol
  const brandTitle = SITE_CONTENT.find((c) => c.key === 'nav_brand_title')?.value || 'Centro Pro';
  const brandBadge = SITE_CONTENT.find((c) => c.key === 'nav_brand_badge')?.value || 'Oficial';
  const linkInicio = SITE_CONTENT.find((c) => c.key === 'nav_link_inicio')?.value || 'Inicio';
  const linkPlanes = SITE_CONTENT.find((c) => c.key === 'nav_link_planes')?.value || 'Planes & Costos';
  const linkInstalaciones = SITE_CONTENT.find((c) => c.key === 'nav_link_instalaciones')?.value || 'Instalaciones';
  const linkMetodo = SITE_CONTENT.find((c) => c.key === 'nav_link_metodo')?.value || 'Metodología';
  const linkContacto = SITE_CONTENT.find((c) => c.key === 'nav_link_contacto')?.value || 'Horarios & Sede';
  const btnClientAccess = SITE_CONTENT.find((c) => c.key === 'nav_btn_client_access')?.value || 'Acceso Socios';
  const btnClientAccessShort = SITE_CONTENT.find((c) => c.key === 'nav_btn_client_access_short')?.value || 'Socios';
  const btnAdminPrivate = SITE_CONTENT.find((c) => c.key === 'nav_btn_admin_private')?.value || 'Staff Privado';
  const mobilePortalText = SITE_CONTENT.find((c) => c.key === 'nav_mobile_portal_text')?.value || 'Portal de Socios (QR / Cédula)';
  const mobileAdminText = SITE_CONTENT.find((c) => c.key === 'nav_mobile_admin_text')?.value || 'Ruta Privada Administrador (Staff)';

  return (
    <header
      className="sticky top-0 w-full border-b border-zinc-800/90 bg-black/95 backdrop-blur-md"
      style={{ zIndex: 9999, willChange: 'transform', isolation: 'isolate' }}
    >
      {/* Main Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand with official logo */}
        <a href="#inicio" className="flex items-center gap-3 group">
          <div className="relative h-11 w-24 sm:w-28 flex items-center justify-center">
            <Image
              src={OA_LOGO}
              alt="OA GYM Logo Oficial"
              width={120}
              height={44}
              priority
              className="h-full w-auto max-h-11 object-contain group-hover:scale-105 transition-transform drop-shadow-[0_2px_12px_rgba(37,99,235,0.35)]"
            />
          </div>
          <div className="hidden sm:block border-l border-zinc-800 pl-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-white">{brandTitle}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/50 uppercase">
                {brandBadge}
              </span>
            </div>
            <span className="block text-[10px] text-zinc-400 uppercase tracking-widest font-medium">
              {content.slogan}
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <a href="#inicio" className="hover:text-blue-400 transition-colors">
            {linkInicio}
          </a>
          <a href="#planes" className="hover:text-blue-400 transition-colors">
            {linkPlanes}
          </a>
          <a href="#instalaciones" className="hover:text-blue-400 transition-colors">
            {linkInstalaciones}
          </a>
          <a href="#metodo" className="hover:text-blue-400 transition-colors">
            {linkMetodo}
          </a>
          <a href="#contacto" className="hover:text-blue-400 transition-colors">
            {linkContacto}
          </a>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5">
          {/* Client Portal Button (Prominent) */}
          <button
            type="button"
            id="nav-btn-client-access"
            onClick={onOpenClientPortal}
            style={{ touchAction: 'manipulation' }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 min-h-[44px] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-900/40 hover:shadow-blue-900/60 transition-all cursor-pointer select-none"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{btnClientAccess}</span>
            <span className="sm:hidden">{btnClientAccessShort}</span>
          </button>

          {/* Discreet Staff / Admin Private Route Button */}
          <button
            type="button"
            id="nav-btn-admin-private"
            onClick={onOpenAdminPortal}
            title="Ruta Privada Administrativa (Staff)"
            style={{ touchAction: 'manipulation' }}
            className="group relative inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950 min-h-[44px] min-w-[44px] px-2.5 py-2 text-xs font-semibold text-zinc-400 hover:border-blue-700/60 hover:bg-zinc-900 hover:text-white active:bg-zinc-800 transition-all cursor-pointer select-none"
          >
            <Lock className="h-3.5 w-3.5 text-zinc-500 group-hover:text-blue-400 transition-colors" />
            <span className="hidden lg:inline text-[11px] font-mono text-zinc-500 group-hover:text-zinc-300">
              {btnAdminPrivate}
            </span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ touchAction: 'manipulation' }}
            className="md:hidden rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-white active:text-blue-400 select-none"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-4 space-y-3">
          <nav className="flex flex-col gap-2.5 text-sm font-semibold text-zinc-300">
            <a
              href="#inicio"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-blue-400"
            >
              {linkInicio}
            </a>
            <a
              href="#planes"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-blue-400"
            >
              {linkPlanes}
            </a>
            <a
              href="#instalaciones"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-blue-400"
            >
              {linkInstalaciones}
            </a>
            <a
              href="#metodo"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-blue-400"
            >
              {linkMetodo}
            </a>
            <a
              href="#contacto"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-blue-400"
            >
              {linkContacto}
            </a>
          </nav>

          <div className="pt-3 border-t border-zinc-800/80 flex flex-col gap-2">
            <button
              type="button"
              style={{ touchAction: 'manipulation' }}
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenClientPortal();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 active:bg-blue-700 min-h-[52px] py-2.5 text-sm font-bold text-white shadow select-none"
            >
              <User className="h-4 w-4" />
              <span>{mobilePortalText}</span>
            </button>

            <button
              type="button"
              style={{ touchAction: 'manipulation' }}
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdminPortal();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 active:bg-zinc-800 min-h-[48px] py-2 text-sm font-semibold text-zinc-400 hover:text-white select-none"
            >
              <Lock className="h-3.5 w-3.5 text-zinc-500" />
              <span>{mobileAdminText}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

'use client';

import React from 'react';
import Image from 'next/image';
import { SiteContent } from '@/lib/types';
import { SITE_CONTENT, getContent } from '@/constants/content';
import { Dumbbell, ArrowRight, QrCode, Activity, Sparkles } from 'lucide-react';

interface HeroProps {
  content: SiteContent;
  onOpenClientPortal: () => void;
}

export function Hero({ content, onOpenClientPortal }: HeroProps) {
  // Access values via .find() on SITE_CONTENT according to protocol
  const badgeText = SITE_CONTENT.find((c) => c.key === 'hero_badge_text')?.value || 'CENTRO DE ALTO RENDIMIENTO & FITNESS TÉCNICO';
  const ctaPlanesText = SITE_CONTENT.find((c) => c.key === 'hero_cta_planes')?.value || 'Explorar Planes & Costos';
  const ctaPortalText = SITE_CONTENT.find((c) => c.key === 'hero_cta_portal')?.value || 'Acceder con QR o Cédula';
  const ctaTrialText = SITE_CONTENT.find((c) => c.key === 'hero_cta_trial_label')?.value || '¿Primera vez? Solicita 1 Día de Cortesía';

  const pillar1Title = SITE_CONTENT.find((c) => c.key === 'hero_pillar_1_title')?.value || 'Biomecánica Pesada';
  const pillar1Desc = SITE_CONTENT.find((c) => c.key === 'hero_pillar_1_desc')?.value || 'Palancas guiadas y plataformas olímpicas';

  const pillar2Title = SITE_CONTENT.find((c) => c.key === 'hero_pillar_2_title')?.value || 'Control Antropométrico';
  const pillar2Desc = SITE_CONTENT.find((c) => c.key === 'hero_pillar_2_desc')?.value || 'Bioimpedancia y pliegues periódicos';

  const pillar3Title = SITE_CONTENT.find((c) => c.key === 'hero_pillar_3_title')?.value || 'Carnet QR & App';
  const pillar3Desc = SITE_CONTENT.find((c) => c.key === 'hero_pillar_3_desc')?.value || 'Acceso por torniquete y rutina en línea';

  return (
    /* SECTION: Hero */
    <section id="inicio" className="relative min-h-[85vh] flex items-center justify-center border-b border-zinc-800">
      {/* Background Image — wrapper propio con overflow-hidden para no crear stacking context en el section */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0, pointerEvents: 'none' }}>
        <Image
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
          alt="Instalaciones OA GYM - Zona de Peso Libre y Musculación"
          fill
          priority
          referrerPolicy="no-referrer"
          className="object-cover object-center filter brightness-[0.32] contrast-125 scale-105"
          style={{ pointerEvents: 'none' }}
        />
        {/* Gradients for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28 text-left">
        <div className="max-w-3xl space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/40 px-3.5 py-1 text-xs font-bold text-blue-400 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>{badgeText}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[1.08]">
            {content.heroHeadline}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal max-w-2xl">
            {content.heroSubheadline}
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <a
              href="#planes"
              id="hero-cta-planes"
              style={{ touchAction: 'manipulation' }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 min-h-[48px] px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-900/40 hover:shadow-blue-900/60 transition-all cursor-pointer select-none"
            >
              <span>{ctaPlanesText}</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <button
              type="button"
              id="hero-cta-portal"
              onClick={onOpenClientPortal}
              style={{ touchAction: 'manipulation' }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 hover:border-zinc-500 active:bg-zinc-800 min-h-[48px] px-6 py-3.5 text-sm font-bold text-zinc-200 transition-all cursor-pointer backdrop-blur-md select-none"
            >
              <QrCode className="h-4 w-4 text-blue-400" />
              <span>{ctaPortalText}</span>
            </button>

            <a
              href={`https://wa.me/${content.whatsapp || '584248543500'}?text=${encodeURIComponent('Contacto directo desde la web\n\nHola OA GYM, deseo agendar mi clase de prueba gratuita.\n')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ touchAction: 'manipulation' }}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white min-h-[44px] px-2 py-3 transition-colors select-none"
            >
              <span>{ctaTrialText}</span>
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>

          {/* 3 Pillars Value Props */}
          <div className="pt-8 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-950/60 text-blue-400 border border-blue-800/40">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{pillar1Title}</h4>
                <p className="text-[11px] text-zinc-400">{pillar1Desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{pillar2Title}</h4>
                <p className="text-[11px] text-zinc-400">{pillar2Desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-950/60 text-sky-400 border border-sky-800/40">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{pillar3Title}</h4>
                <p className="text-[11px] text-zinc-400">{pillar3Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

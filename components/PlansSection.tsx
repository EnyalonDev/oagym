'use client';

import React from 'react';
import { PlanData } from '@/lib/types';
import { Check, Star, Zap, Dumbbell, Apple, Award, ArrowRight, ShieldCheck, UserCheck, Flame, Sparkles } from 'lucide-react';

interface PlansSectionProps {
  plans: PlanData[];
  onOpenClientPortal: () => void;
}

export function PlansSection({ plans, onOpenClientPortal }: PlansSectionProps) {
  return (
    /* SECTION: Plans */
    <section id="planes" className="relative py-20 bg-zinc-950 border-b border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-950/40 px-3.5 py-1 text-xs font-bold text-blue-400">
            <Award className="h-3.5 w-3.5" />
            <span>TARIFAS & PROGRAMAS OFICIALES • OA GYM</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
            Planes y Costos
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Estructura transparente diseñada para cada etapa de tu evolución física. Desde tu registro inicial hasta programas especializados con monitor y nutrición avanzada.
          </p>
        </div>

        {/* Plans Grid: 5 Plans responsive layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 items-stretch">
          {plans.map((plan) => {
            const isFeatured = plan.recommended;

            return (
              <div
                key={plan.id}
                id={`plan-card-${plan.id}`}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                  isFeatured
                    ? 'border-blue-500 bg-gradient-to-b from-blue-950/30 via-zinc-900 to-black shadow-2xl shadow-blue-950/50 scale-[1.02] ring-1 ring-blue-500/50'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                {/* Popular / Recommended badge */}
                {isFeatured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-blue-900/40 whitespace-nowrap">
                    <Star className="h-3 w-3 fill-white" />
                    <span>Todo Incluido</span>
                  </div>
                )}

                <div>
                  {/* Category icon & duration pill */}
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                        plan.category === 'inscripcion'
                          ? 'bg-amber-600/20 text-amber-400 border-amber-500/40'
                          : plan.category === 'personalizado'
                          ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                          : plan.category === 'nutricion'
                          ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                          : plan.category === 'entrenamiento'
                          ? 'bg-orange-600/20 text-orange-400 border-orange-500/40'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      {plan.category === 'inscripcion' ? (
                        <UserCheck className="h-5 w-5" />
                      ) : plan.category === 'personalizado' ? (
                        <Sparkles className="h-5 w-5" />
                      ) : plan.category === 'nutricion' ? (
                        <Apple className="h-5 w-5" />
                      ) : plan.category === 'entrenamiento' ? (
                        <Flame className="h-5 w-5" />
                      ) : (
                        <Dumbbell className="h-5 w-5" />
                      )}
                    </div>

                    <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider bg-zinc-950/80 px-2.5 py-1 rounded-lg border border-zinc-800 text-right truncate">
                      {plan.duration}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white uppercase tracking-tight min-h-[44px] flex items-center">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="mt-3 pt-3 border-t border-zinc-800/80">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black font-mono text-white tracking-tight">
                        {plan.formattedPrice}
                      </span>
                      <span className="text-xs text-zinc-400 font-sans font-medium">
                        {plan.duration === 'Pago único'
                          ? 'USD'
                          : plan.duration === 'Hereda mensualidad'
                          ? 'USD / mes'
                          : 'USD / mes'}
                      </span>
                    </div>
                  </div>

                  {/* Exact description from requirement */}
                  <p className="mt-3 text-xs text-zinc-300 leading-relaxed min-h-[48px] bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-800/50">
                    {plan.description}
                  </p>

                  {/* Features list */}
                  <div className="mt-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                      Incluye:
                    </span>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <Check className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span className="leading-tight text-[11px] text-zinc-300">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA */}
                <div className="mt-6 pt-4 border-t border-zinc-800/80">
                  <a
                    href={`https://wa.me/584248543500?text=${encodeURIComponent(
                      `Contacto directo desde la web\n\nHola OA GYM, estoy interesado en el ${plan.name} (${plan.formattedPrice}).\n`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all shadow-md ${
                      isFeatured
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/60'
                    }`}
                  >
                    <span>Solicitar Plan</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informative Note & Advisor CTA */}
        <div className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-600/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">¿Cómo funcionan los planes en OA GYM?</h4>
              <p className="text-xs text-zinc-400 max-w-2xl mt-0.5">
                La <strong className="text-zinc-200">Inscripción ($10)</strong> es un pago único que registra y activa tu usuario en el sistema. Los planes de <strong className="text-zinc-200">Nutrición Detallada (+$40)</strong> y <strong className="text-zinc-200">Entrenamiento Detallado (+$40)</strong> complementan tu <strong className="text-zinc-200">Mensualidad Base ($35)</strong> heredando su periodo de vigencia, o puedes optar por el <strong className="text-zinc-200">Plan Personalizado Premium ($80)</strong> con todo incluido.
              </p>
            </div>
          </div>

          <a
            href={`https://wa.me/584248543500?text=${encodeURIComponent(
              'Contacto directo desde la web\n\nHola OA GYM, quiero información sobre los planes y costos.\n'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-5 py-2.5 text-xs font-bold text-white whitespace-nowrap transition-all shrink-0"
          >
            Hablar con un Asesor
          </a>
        </div>
      </div>
    </section>
  );
}


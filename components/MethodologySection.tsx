'use client';

import React from 'react';
import { Target, Activity, FileCheck, RefreshCw, Sparkles, Award } from 'lucide-react';

export function MethodologySection() {
  const steps = [
    {
      num: '01',
      title: 'Diagnóstico & Antropometría ISAK',
      desc: 'Medición de pliegues, bioimpedancia, porcentaje graso y masa muscular. Determinamos tu punto de partida real y posibles desequilibrios posturales.',
      icon: Target,
    },
    {
      num: '02',
      title: 'Prescripción Biomecánica & Dieta',
      desc: 'Nuestros preparadores físicos diseñan tu microciclo de entrenamiento con series, repeticiones, RPE/RIR y descansos, entregado en tu portal en PDF protegido.',
      icon: FileCheck,
    },
    {
      num: '03',
      title: 'Entrenamiento Guiado en Sala',
      desc: 'Ingresas con tu código QR al torniquete. Los entrenadores de sala supervisan cada ejecución técnica, corrigiendo patrones motores y guiando tu sobrecarga progresiva.',
      icon: Activity,
    },
    {
      num: '04',
      title: 'Re-evaluación & Progresión Continua',
      desc: 'Cada 15 a 30 días repetimos el control antropométrico. Visualizas en tus gráficas de evolución el aumento de músculo y la reducción del tejido adiposo.',
      icon: RefreshCw,
    },
  ];

  return (
    /* SECTION: Methodology */
    <section id="metodo" className="py-20 bg-zinc-950 border-b border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-950/40 px-3.5 py-1 text-xs font-bold text-blue-400">
            <Award className="h-3.5 w-3.5" />
            <span>EL SISTEMA CIENTÍFICO OA GYM</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
            Metodología Basada en Evidencia y Resultados
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Un ciclo cerrado de 4 fases que asegura adherencia, previene sobreentrenamiento y maximiza tus adaptaciones neuromusculares.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col justify-between hover:border-blue-700/60 transition-all shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black font-mono text-blue-500">
                      {st.num}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950/60 text-blue-400 border border-blue-800/40">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">{st.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{st.desc}</p>
                </div>

                <div className="mt-6 pt-3 border-t border-zinc-800/60 text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                  Fase {idx + 1} del Método OA
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

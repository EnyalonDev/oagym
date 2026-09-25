'use client';

import React from 'react';
import Image from 'next/image';
import { Dumbbell, Shield, Flame, Activity, Sparkles, CheckCircle2 } from 'lucide-react';

export function FacilitiesSection() {
  const zones = [
    {
      title: 'Zona de Palancas Biomecánicas Guiadas',
      desc: 'Maquinaria de carga con curvas de resistencia óptimas (cams excéntricos y rodamientos industriales) que aíslan el grupo muscular y protegen tendones y articulaciones.',
      image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop',
      features: ['Prensa 45° de alta capacidad', 'Hack Squat pendular', 'Remo T articulado', 'Poleas regulables duales'],
    },
    {
      title: 'Zona de Peso Libre & Plataformas Olímpicas',
      desc: 'Área construida para los amantes de la fuerza real. Barras olímpicas calibradas de 20kg, discos bumper de caucho virgen, plataformas de madera y magnesio habilitado.',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop',
      features: ['Mancuernas de 2kg hasta 50kg', 'Power Racks con pines de seguridad', 'Bancos planos y declinables comerciales'],
    },
    {
      title: 'Zona Funcional & Potencia Metabólica',
      desc: 'Espacio dinámico con césped sintético de arrastre de trineo (prowler), cuerdas de batalla, balones medicinales y kettlebells rusas de competición.',
      image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1200&auto=format&fit=crop',
      features: ['Pista de trineo de 20 metros', 'Remos de aire Concept2', 'Air Bikes Assault', 'Cajas de pliometría'],
    },
    {
      title: 'Consultorio Biomédico & Antropometría',
      desc: 'Espacio privado clínico donde nuestros profesionales realizan las valoraciones antropométricas ISAK, bioimpedancia eléctrica y cálculo de composición corporal.',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop',
      features: ['Báscula médica de bioimpedancia', 'Plicómetros Harpenden de precisión', 'Tallímetro de pared certificado', 'Software de prescripción deportiva'],
    },
  ];

  return (
    /* SECTION: Facilities */
    <section id="instalaciones" className="py-20 bg-black border-b border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-950/40 px-3.5 py-1 text-xs font-bold text-blue-400">
            <Dumbbell className="h-3.5 w-3.5" />
            <span>INFRAESTRUCTURA & ESPACIOS DE ALTO NIVEL</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
            Instalaciones Equipadas Para Romper Tus Límites
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Más de 800 metros cuadrados diseñados para el entrenamiento serio. Espacios climatizados, ventilación forzada y acústica deportiva de primera categoría.
          </p>
        </div>

        {/* Zones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {zones.map((zone, idx) => (
            <div
              key={idx}
              className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 transition-all hover:border-zinc-700 shadow-xl"
            >
              {/* Image with zoom effect */}
              <div className="relative h-64 w-full overflow-hidden bg-zinc-900">
                <Image
                  src={zone.image}
                  alt={zone.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  referrerPolicy="no-referrer"
                  className="object-cover object-center filter brightness-90 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                <span className="absolute bottom-3 left-4 text-[11px] font-mono uppercase font-bold text-blue-400 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-blue-900/60 z-10">
                  Zona 0{idx + 1} • OA GYM
                </span>
              </div>

              {/* Text content */}
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                  {zone.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {zone.desc}
                </p>

                {/* Features chips */}
                <div className="pt-2 flex flex-wrap gap-2">
                  {zone.features.map((item, fIdx) => (
                    <span
                      key={fIdx}
                      className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-300 border border-zinc-800"
                    >
                      <CheckCircle2 className="h-3 w-3 text-blue-400" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

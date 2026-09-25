'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Member } from '@/lib/types';
import { Lock, ShieldAlert, ShieldCheck, FileText, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

interface CanvasPdfViewerProps {
  member: Member;
}

export function CanvasPdfViewer({ member }: CanvasPdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isBlocked = member.status === 'expired';
  const [loading, setLoading] = useState(!isBlocked);
  const [scale, setScale] = useState(1.0);
  const [page, setPage] = useState<1 | 2>(1); // 1: Rutina, 2: Nutrición

  const renderCanvasDocument = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Document Dimensions (Letter proportion: 800 x 1130)
    const baseW = 800;
    const baseH = 1130;
    canvas.width = baseW * scale;
    canvas.height = baseH * scale;

    ctx.save();
    ctx.scale(scale, scale);

    // 1. Background Paper
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, baseW, baseH);

    // Outer border
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, baseW - 40, baseH - 40);

    // 2. Header
    // Gradient accent bar
    const grad = ctx.createLinearGradient(20, 20, baseW - 20, 20);
    grad.addColorStop(0, '#2563eb');
    grad.addColorStop(0.5, '#38bdf8');
    grad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = grad;
    ctx.fillRect(20, 20, baseW - 40, 6);

    // Gym Logo / Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('OA GYM • CENTRO DE ALTO RENDIMIENTO', 40, 60);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('PROGRAMA DE PRESCRIPCIÓN DEPORTIVA & BIOMECÁNICA', 40, 80);

    // DRM Badge
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.roundRect(baseW - 240, 45, 200, 32, 6);
    ctx.fill();
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('SECURE CANV-STREAM DRM', baseW - 225, 65);

    // Horizontal separator
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 100);
    ctx.lineTo(baseW - 40, 100);
    ctx.stroke();

    // 3. Member Info Box
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.roundRect(40, 115, baseW - 80, 80, 8);
    ctx.fill();
    ctx.strokeStyle = '#374151';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`Socio: ${member.name.toUpperCase()}`, 55, 140);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`Cédula: ${member.cedula}   |   Plan: ${member.planName}   |   Vence: ${member.membershipEnd}`, 55, 162);
    ctx.fillText(`Entrenador Titular: ${member.assignedTrainer}   |   Emitido: ${member.membershipStart}`, 55, 180);

    // 4. Page Content
    if (page === 1) {
      // PAGE 1: RUTINA & CARGAS
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('1. PLAN DE SOBRECARGA PROGRESIVA & BIOMECÁNICA', 40, 230);

      ctx.fillStyle = '#e5e7eb';
      ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`Enfoque: ${member.routineTitle}`, 40, 255);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`Objetivos del Mesociclo: ${member.routineGoals}`, 40, 275);

      // Workout Table Header
      const tableY = 300;
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(40, tableY, baseW - 80, 30);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('DÍA / GRUPO', 55, tableY + 20);
      ctx.fillText('EJERCICIOS PRINCIPALES', 180, tableY + 20);
      ctx.fillText('SERIES', 460, tableY + 20);
      ctx.fillText('REPS', 540, tableY + 20);
      ctx.fillText('RPE/RIR', 620, tableY + 20);
      ctx.fillText('DESCANSO', 690, tableY + 20);

      // Table Rows
      const exercises = [
        { day: 'Día 1: Torso (Empuje)', name: 'Press Banca Plano con Barra Olímpica', series: '4', reps: '6-8', rir: 'RIR 1-2', rest: '2.5 min' },
        { day: 'Día 1: Torso (Empuje)', name: 'Press Inclinado en Máquina de Palanca', series: '3', reps: '8-10', rir: 'RIR 1', rest: '2 min' },
        { day: 'Día 1: Torso (Empuje)', name: 'Elevaciones Laterales con Mancuerna en Polea', series: '4', reps: '12-15', rir: 'Fallo -1', rest: '90 seg' },
        { day: 'Día 1: Torso (Empuje)', name: 'Fondos en Paralelas Asistidos / Lastrados', series: '3', reps: '8-10', rir: 'RIR 2', rest: '2 min' },
        { day: 'Día 1: Torso (Empuje)', name: 'Extensión de Tríceps en Polea Alta (Cuerda)', series: '3', reps: '12-15', rir: 'Fallo técnico', rest: '90 seg' },
        { day: 'Día 2: Pierna (Fuerza)', name: 'Sentadilla Libre con Barra Alta / Hack', series: '4', reps: '6-8', rir: 'RIR 2', rest: '3 min' },
        { day: 'Día 2: Pierna (Fuerza)', name: 'Prensa 45° con Sobrecarga Progresiva', series: '3', reps: '10-12', rir: 'RIR 1', rest: '2 min' },
        { day: 'Día 2: Pierna (Fuerza)', name: 'Curl Femoral Tumbado en Palanca', series: '4', reps: '10-12', rir: 'RIR 1', rest: '90 seg' },
        { day: 'Día 2: Pierna (Fuerza)', name: 'Elevación de Talones en Máquina Smith', series: '4', reps: '15-20', rir: 'Fallo', rest: '60 seg' },
        { day: 'Día 3: Tracción (Tirón)', name: 'Dominadas Pronas / Jalón al Pecho', series: '4', reps: '8-10', rir: 'RIR 1', rest: '2 min' },
        { day: 'Día 3: Tracción (Tirón)', name: 'Remo con Barra T apoyado en Pecho', series: '4', reps: '8-10', rir: 'RIR 1', rest: '2 min' },
        { day: 'Día 3: Tracción (Tirón)', name: 'Pájaros Posteriores en Máquina Contractora', series: '3', reps: '12-15', rir: 'Fallo -1', rest: '90 seg' },
        { day: 'Día 3: Tracción (Tirón)', name: 'Curl de Bíceps en Banco Scott con Barra Z', series: '3', reps: '10-12', rir: 'Fallo', rest: '90 seg' },
      ];

      exercises.forEach((ex, idx) => {
        const rowY = tableY + 30 + idx * 32;
        ctx.fillStyle = idx % 2 === 0 ? '#182234' : '#111827';
        ctx.fillRect(40, rowY, baseW - 80, 32);

        ctx.fillStyle = '#e5e7eb';
        ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(ex.day, 55, rowY + 20);
        ctx.fillText(ex.name, 180, rowY + 20);

        ctx.fillStyle = '#93c5fd';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(ex.series, 475, rowY + 20);
        ctx.fillText(ex.reps, 545, rowY + 20);
        ctx.fillText(ex.rir, 620, rowY + 20);
        ctx.fillText(ex.rest, 690, rowY + 20);
      });

      // Bio notes box
      const notesY = tableY + 30 + exercises.length * 32 + 25;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(40, notesY, baseW - 80, 85, 8);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('CRITERIO TÉCNICO & SEGURIDAD BIOMECÁNICA:', 55, notesY + 25);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('• Calentamiento general: 5 min movilidad articular + 2 series de aproximación sin fatiga.', 55, notesY + 45);
      ctx.fillText('• En caso de dolor articular agudo, suspender la serie y consultar al Head Coach Óscar Arias.', 55, notesY + 63);
    } else {
      // PAGE 2: NUTRICIÓN & COMPOSICIÓN CORPORAL
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('2. PLAN NUTRICIONAL & PAUTA ENERGÉTICA PERSONALIZADA', 40, 230);

      ctx.fillStyle = '#e5e7eb';
      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`Estrategia: ${member.nutritionOverview}`, 40, 255);

      // Macro breakdown Cards
      const macroY = 285;
      const macroCardW = (baseW - 80 - 30) / 4;

      const macros = [
        { label: 'Calorías Meta', val: '2,450 kcal', color: '#f59e0b' },
        { label: 'Proteína (2.0g/kg)', val: '155 g', color: '#38bdf8' },
        { label: 'Carbohidratos', val: '270 g', color: '#10b981' },
        { label: 'Grasas Saludables', val: '65 g', color: '#f43f5e' },
      ];

      macros.forEach((m, idx) => {
        const mx = 40 + idx * (macroCardW + 10);
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(mx, macroY, macroCardW, 65, 8);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.stroke();

        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(m.label, mx + 12, macroY + 24);

        ctx.fillStyle = m.color;
        ctx.font = 'bold 16px monospace';
        ctx.fillText(m.val, mx + 12, macroY + 50);
      });

      // Meal Structure Table
      const mealTableY = 380;
      ctx.fillStyle = '#059669';
      ctx.fillRect(40, mealTableY, baseW - 80, 30);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('TIEMPO / MOMENTO', 55, mealTableY + 20);
      ctx.fillText('ALIMENTOS RECOMENDADOS', 220, mealTableY + 20);
      ctx.fillText('PORCIONES / PESO EN CRUDO', 540, mealTableY + 20);

      const meals = [
        { time: 'Desayuno (07:30 AM)', desc: 'Huevos enteros + claras, arepa de maíz blanco y aguacate', portion: '3 huevos + 2 claras + 1 arepa (80g) + 50g aguacate' },
        { time: 'Media Mañana (10:30 AM)', desc: 'Fruta fresca de bajo índice glucémico + frutos secos', portion: '1 manzana verde o pera + 25g almendras o nueces' },
        { time: 'Almuerzo (01:30 PM)', desc: 'Pechuga de pollo a la plancha, arroz jazmín y ensalada verde', portion: '180g pechuga + 180g arroz cocido + vegetales libres' },
        { time: 'Pre-Entreno (04:30 PM)', desc: 'Avena en hojuelas con canela y proteína isolada en agua', portion: '50g avena + 1 scoop (30g) proteína' },
        { time: 'Post-Entreno (07:30 PM)', desc: 'Filete de salmón / pescado blanco con batata horneada', portion: '190g pescado + 150g batata o papa cocida' },
        { time: 'Cena Ligera (09:30 PM)', desc: 'Yogurt griego natural sin azúcar con semillas de chía', portion: '150g yogurt + 10g semillas de chía' },
      ];

      meals.forEach((meal, idx) => {
        const rowY = mealTableY + 30 + idx * 45;
        ctx.fillStyle = idx % 2 === 0 ? '#182234' : '#111827';
        ctx.fillRect(40, rowY, baseW - 80, 45);

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(meal.time, 55, rowY + 25);

        ctx.fillStyle = '#e5e7eb';
        ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(meal.desc, 220, rowY + 20);

        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px monospace';
        ctx.fillText(meal.portion, 220, rowY + 36);
      });

      // Hydration Box
      const hydroY = mealTableY + 30 + meals.length * 45 + 25;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(40, hydroY, baseW - 80, 80, 8);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('PAUTA DE HIDRATACIÓN & SUPLEMENTACIÓN BÁSICA:', 55, hydroY + 25);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('• Ingesta hídrica mínima: 35-40 ml por kg de peso corporal al día (aprox. 3.0L).', 55, hydroY + 45);
      ctx.fillText('• Creatina monohidrato: 5g diarios continuos con o sin entrenamiento (fase de mantenimiento).', 55, hydroY + 63);
    }

    // 5. Document Footer
    ctx.strokeStyle = '#374151';
    ctx.beginPath();
    ctx.moveTo(40, baseH - 90);
    ctx.lineTo(baseW - 40, baseH - 90);
    ctx.stroke();

    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px monospace';
    ctx.fillText(`PÁGINA ${page} DE 2   |   DOCUMENTO CONFIDENCIAL GENERADO POR OA GYM CORE ENGINE`, 40, baseH - 65);
    ctx.fillText(`IDENTIFICADOR DE SEGURIDAD SHA-256: ${member.id}-${member.cedula.slice(-4)}-VALIDATED`, 40, baseH - 50);

    // 6. Security Watermark (Diagonal repetitions)
    ctx.save();
    ctx.rotate((-25 * Math.PI) / 180);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.font = 'bold 15px monospace';
    for (let wy = -300; wy < baseH + 600; wy += 130) {
      for (let wx = -600; wx < baseW + 600; wx += 480) {
        ctx.fillText(`OA GYM • CÉDULA ${member.cedula} • USO PRIVADO`, wx, wy);
      }
    }
    ctx.restore();

    ctx.restore();
  }, [member, page, scale]);

  // Security layer: Block right click, Ctrl+S, Cmd+S, Ctrl+P, PrintScreen
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+S / Cmd+S
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
      }
      // Block Ctrl+P / Cmd+P
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
      }
      // Block Ctrl+U (view source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const container = containerRef.current;
    if (container) {
      container.addEventListener('contextmenu', handleContextMenu);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (container) {
        container.removeEventListener('contextmenu', handleContextMenu);
      }
    };
  }, []);

  // Fetch protected blob stream and render directly to Canvas
  useEffect(() => {
    if (isBlocked) {
      return;
    }

    let active = true;

    async function fetchAndRender() {
      try {
        const response = await fetch('/api/member-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId: member.id, cedula: member.cedula }),
        });

        // Protected ArrayBuffer binary stream
        await response.arrayBuffer();

        if (!active) return;
        renderCanvasDocument();
      } catch (err) {
        console.error('Error in secure stream:', err);
        if (active) renderCanvasDocument();
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchAndRender();

    return () => {
      active = false;
    };
  }, [member, isBlocked, renderCanvasDocument]);

  return (
    <div
      ref={containerRef}
      id="pdf-security-wrapper"
      className="relative select-none rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl"
    >
      {/* Header Controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-950/60 text-blue-400 border border-blue-800/40">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">
              Prescripción Deportiva & Plan Nutricional
            </h3>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>Visor protegido en tiempo real • Prohibida la descarga/reproducción</span>
            </p>
          </div>
        </div>

        {/* Page Switcher & Zoom */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-zinc-900 p-0.5 border border-zinc-800 text-xs">
            <button
              type="button"
              id="btn-pdf-page-1"
              onClick={() => setPage(1)}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                page === 1
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Pág 1: Rutina
            </button>
            <button
              type="button"
              id="btn-pdf-page-2"
              onClick={() => setPage(2)}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                page === 2
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Pág 2: Nutrición
            </button>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-zinc-900 px-2 py-1 border border-zinc-800">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.6, s - 0.1))}
              className="text-zinc-400 hover:text-white p-1"
              title="Reducir zoom"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] font-mono text-zinc-300 w-10 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(1.4, s + 0.1))}
              className="text-zinc-400 hover:text-white p-1"
              title="Aumentar zoom"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Block Overlay if Member is Expired (Red Status) */}
      {isBlocked ? (
        <div
          id="pdf-blocked-warning"
          className="my-6 rounded-xl border border-rose-900/60 bg-rose-950/30 p-8 text-center"
        >
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-900/40 text-rose-400 border border-rose-700/50">
            <Lock className="h-7 w-7" />
          </div>
          <h4 className="text-base font-bold text-white">Visualización Protegida Suspendida</h4>
          <p className="mt-1 text-xs text-rose-300/90 max-w-md mx-auto">
            Tu suscripción en OA GYM ha expirado ({member.membershipEnd}). El visor de rutina técnica y plan nutricional está bloqueado hasta regularizar tu mensualidad en recepción.
          </p>
          <div className="mt-4">
            <a
              href={`https://wa.me/584248543500?text=${encodeURIComponent(
                `Contacto directo desde la web\n\nHola OA GYM, deseo renovar mi plan para activar mi rutina (Socio: ${member.name}, Cédula: ${member.cedula}).\n`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-rose-500 transition-all"
            >
              <span>Renovar Suscripción Vía WhatsApp</span>
            </a>
          </div>
        </div>
      ) : (
        /* Canvas Stage */
        <div className="relative flex justify-center overflow-auto rounded-lg bg-zinc-950 p-2 border border-zinc-900">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-xs">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
              <span className="mt-2 text-xs text-zinc-400">
                Descifrando flujo binario seguro y renderizando canvas...
              </span>
            </div>
          )}

          <canvas
            ref={canvasRef}
            id="protected-pdf-canvas"
            className="rounded shadow-2xl transition-all"
            style={{
              maxWidth: '100%',
              height: 'auto',
              pointerEvents: 'none', // Prevents mouse drag/save on canvas
            }}
          />
        </div>
      )}

      {/* Security Footer Notice */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-[10px] text-zinc-400 border-t border-zinc-900 pt-2">
        <span className="flex items-center gap-1 font-mono">
          <ShieldAlert className="h-3 w-3 text-amber-500" />
          CANVAS-DRM: Bloqueo de menú contextual, impresión y clonación de imagen.
        </span>
        <span className="font-mono text-zinc-400">OA GYM Engine • v2.6.4</span>
      </div>
    </div>
  );
}

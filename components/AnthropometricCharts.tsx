'use client';

import React, { useState } from 'react';
import { AnthropometricRecord } from '@/lib/types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Activity, Scale, Percent, Dumbbell, Calendar, UserCheck, TrendingUp, TrendingDown } from 'lucide-react';

interface AnthropometricChartsProps {
  records: AnthropometricRecord[];
  memberName: string;
}

export function AnthropometricCharts({ records, memberName }: AnthropometricChartsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'weight' | 'fat' | 'muscle'>('all');

  if (!records || records.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-center text-zinc-400">
        <Activity className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
        <p className="text-sm font-semibold text-zinc-300">Sin registros antropométricos aún</p>
        <p className="text-xs text-zinc-400 mt-1">
          El equipo de entrenadores de OA GYM agendará tu valoración de composición corporal en tu próxima visita.
        </p>
      </div>
    );
  }

  // Sorted records
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  const first = sorted[0];

  const weightDiff = Number((latest.weightKg - first.weightKg).toFixed(1));
  const fatDiff = Number((latest.bodyFatPct - first.bodyFatPct).toFixed(1));
  const muscleDiff = Number((latest.muscleMassKg - first.muscleMassKg).toFixed(1));

  // BMI calculation
  const heightM = latest.heightCm / 100;
  const bmi = Number((latest.weightKg / (heightM * heightM)).toFixed(1));

  // Chart data formatting
  const chartData = sorted.map((rec) => ({
    date: rec.date.slice(5), // MM-DD
    fullDate: rec.date,
    peso: rec.weightKg,
    grasa: rec.bodyFatPct,
    musculo: rec.muscleMassKg,
  }));

  return (
    <div className="space-y-6">
      {/* Top Stat Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Stat 1: Peso */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Scale className="h-3.5 w-3.5 text-blue-400" /> Peso Corporal
            </span>
            {weightDiff !== 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                  weightDiff > 0 ? 'bg-amber-950/60 text-amber-400' : 'bg-emerald-950/60 text-emerald-400'
                }`}
              >
                {weightDiff > 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                {weightDiff > 0 ? `+${weightDiff}` : weightDiff} kg
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-white">{latest.weightKg} <span className="text-xs text-zinc-400 font-normal">kg</span></div>
          <div className="text-[11px] text-zinc-400 mt-1">Inicial: {first.weightKg} kg</div>
        </div>

        {/* Stat 2: % Grasa */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Percent className="h-3.5 w-3.5 text-rose-400" /> % Grasa Corporal
            </span>
            {fatDiff !== 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                  fatDiff < 0 ? 'bg-emerald-950/60 text-emerald-400' : 'bg-rose-950/60 text-rose-400'
                }`}
              >
                {fatDiff < 0 ? <TrendingDown className="h-2.5 w-2.5" /> : <TrendingUp className="h-2.5 w-2.5" />}
                {fatDiff > 0 ? `+${fatDiff}` : fatDiff}%
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-rose-400">{latest.bodyFatPct} <span className="text-xs text-zinc-400 font-normal">%</span></div>
          <div className="text-[11px] text-zinc-400 mt-1">Inicial: {first.bodyFatPct}%</div>
        </div>

        {/* Stat 3: Masa Muscular */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Dumbbell className="h-3.5 w-3.5 text-emerald-400" /> Masa Muscular
            </span>
            {muscleDiff !== 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                  muscleDiff > 0 ? 'bg-emerald-950/60 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {muscleDiff > 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                {muscleDiff > 0 ? `+${muscleDiff}` : muscleDiff} kg
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-emerald-400">{latest.muscleMassKg} <span className="text-xs text-zinc-400 font-normal">kg</span></div>
          <div className="text-[11px] text-zinc-400 mt-1">Inicial: {first.muscleMassKg} kg</div>
        </div>

        {/* Stat 4: IMC & Talla */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="h-3.5 w-3.5 text-sky-400" /> IMC / Estatura
            </span>
            <span className="text-[10px] font-mono text-zinc-400">Talla: {latest.heightCm} cm</span>
          </div>
          <div className="text-2xl font-black text-white">{bmi} <span className="text-xs text-zinc-400 font-normal">kg/m²</span></div>
          <div className="text-[11px] text-zinc-400 mt-1">Estatura: {heightM} m</div>
        </div>
      </div>

      {/* Main Evolution Line Chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Evolución Antropométrica Histórica ({records.length} mediciones)
            </h4>
            <p className="text-xs text-zinc-400">Tendencia de composición corporal y masa magra</p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1 rounded-lg bg-zinc-900 p-1 border border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setSelectedMetric('all')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                selectedMetric === 'all' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('weight')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                selectedMetric === 'weight' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Peso
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('fat')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                selectedMetric === 'fat' ? 'bg-rose-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              % Grasa
            </button>
            <button
              type="button"
              onClick={() => setSelectedMetric('muscle')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                selectedMetric === 'muscle' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Masa Muscular
            </button>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={11} domain={['auto', 'auto']} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#09090b',
                  borderColor: '#27272a',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              {(selectedMetric === 'all' || selectedMetric === 'weight') && (
                <Line
                  type="monotone"
                  dataKey="peso"
                  name="Peso Total (kg)"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#3b82f6' }}
                  activeDot={{ r: 6 }}
                />
              )}
              {(selectedMetric === 'all' || selectedMetric === 'muscle') && (
                <Line
                  type="monotone"
                  dataKey="musculo"
                  name="Masa Muscular (kg)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              )}
              {(selectedMetric === 'all' || selectedMetric === 'fat') && (
                <Line
                  type="monotone"
                  dataKey="grasa"
                  name="% Grasa Corporal"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#f43f5e' }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Latest Evaluation & Coach Notes */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-blue-400" />
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">
              Diagnóstico del Último Monitoreo
            </h5>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-zinc-400" /> Fecha: <strong className="text-zinc-200">{latest.date}</strong>
            </span>
            <span className="text-zinc-600">|</span>
            <span>Evaluador: <strong className="text-zinc-200">{latest.evaluator}</strong></span>
          </div>
        </div>

        <p className="text-sm text-zinc-300 leading-relaxed italic">
          &quot;{latest.notes}&quot;
        </p>

        {(latest.waistCm || latest.bicepCm || latest.chestCm) && (
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap gap-4 text-xs text-zinc-400">
            {latest.chestCm && <span>Pecho: <strong className="text-white">{latest.chestCm} cm</strong></span>}
            {latest.waistCm && <span>Cintura: <strong className="text-white">{latest.waistCm} cm</strong></span>}
            {latest.bicepCm && <span>Bíceps: <strong className="text-white">{latest.bicepCm} cm</strong></span>}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { Member } from '@/lib/types';
import { OA_LOGO } from '@/lib/logo';
import { Download, ShieldCheck, Sparkles, AlertCircle, Clock } from 'lucide-react';

interface DigitalCarnetCardProps {
  member: Member;
  allowDownload?: boolean;
}

export function DigitalCarnetCard({ member, allowDownload = true }: DigitalCarnetCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Status badge colors as defined in the plan:
  // Verde brillante (Activo), Naranja vibrante (Alerta de vencimiento) y Rojo encendido (Mora o bloqueo)
  const statusConfig = {
    active: {
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      label: 'Activo • Acceso Total',
      icon: ShieldCheck,
      badgeDot: 'bg-emerald-400',
    },
    expiring: {
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      label: 'Próximo a Vencer',
      icon: Clock,
      badgeDot: 'bg-amber-400',
    },
    expired: {
      color: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      label: 'En Mora / Suspendido',
      icon: AlertCircle,
      badgeDot: 'bg-rose-500',
    },
  }[member.status];

  const StatusIcon = statusConfig.icon;

  // The QR payload encodes the plain text identifier for scanners and turnstiles
  const qrPayload = member.cedula;

  const downloadQrCode = () => {
    // Generate clean SVG/canvas export of QR
    const svg = document.getElementById(`qr-svg-${member.id}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 600, 600);
        ctx.drawImage(img, 50, 50, 500, 500);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `Carnet-QR-OAGYM-${member.cedula}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Physical Card Mockup */}
      <div
        ref={cardRef}
        id={`carnet-card-${member.id}`}
        className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border-2 border-blue-900/60 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 shadow-2xl text-left"
      >
        {/* Decorative corner glows */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-blue-600/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-sky-500/10 blur-2xl" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-24 flex items-center">
              <Image
                src={OA_LOGO}
                alt="OA GYM Logo Oficial"
                width={100}
                height={40}
                className="h-full w-auto max-h-10 object-contain drop-shadow"
              />
            </div>
            <div className="border-l border-zinc-800 pl-2.5">
              <span className="text-sm font-black tracking-wider text-white">OA GYM</span>
              <span className="block text-[9px] uppercase font-semibold text-blue-400 tracking-widest">
                Centro de Alto Rendimiento
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="block text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
              Carnet Digital
            </span>
            <span className="text-xs font-mono text-zinc-300 font-bold">
              ID: {member.cedula.slice(-6)}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
          {/* Member Details (Left) */}
          <div className="sm:col-span-3 space-y-2">
            <div>
              <span className="text-[10px] uppercase text-zinc-400 font-medium tracking-wider">
                Socio Titular
              </span>
              <h4 className="text-base font-extrabold text-white leading-tight">
                {member.name}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 block">Cédula:</span>
                <span className="font-mono text-zinc-200 font-semibold">{member.cedula}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block">RH:</span>
                <span className="font-mono text-blue-400 font-bold">{member.bloodType || 'O+'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-zinc-400 block">Plan Suscrito:</span>
              <span className="text-xs font-semibold text-blue-300 line-clamp-1">
                {member.planName}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-zinc-400 block">Vigencia hasta:</span>
              <span className="text-xs font-medium text-zinc-300">
                {member.membershipEnd} ({member.daysRemaining} días restantes)
              </span>
            </div>
          </div>

          {/* QR Code (Right) */}
          <div className="sm:col-span-2 flex flex-col items-center justify-center p-3 rounded-xl bg-white text-black shadow-inner">
            <QRCodeSVG
              id={`qr-svg-${member.id}`}
              value={qrPayload}
              size={110}
              level="H"
              includeMargin={false}
              className="rounded"
            />
            <span className="mt-1.5 text-[9px] font-mono font-bold tracking-tight text-zinc-700">
              Cód. Acceso Físico
            </span>
          </div>
        </div>

        {/* Footer Status Pill */}
        <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusConfig.color}`}
          >
            <span className={`h-2 w-2 rounded-full ${statusConfig.badgeDot} animate-pulse`} />
            <StatusIcon className="h-3.5 w-3.5" />
            <span>{statusConfig.label}</span>
          </div>

          <span className="text-[10px] text-zinc-400 font-mono">
            Válido en torniquetes OA
          </span>
        </div>
      </div>

      {/* Download Action */}
      {allowDownload && (
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={downloadQrCode}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 transition-all border border-zinc-700/60"
          >
            <Download className="h-3.5 w-3.5 text-blue-400" />
            Descargar QR Alta Resolución
          </button>
        </div>
      )}
    </div>
  );
}

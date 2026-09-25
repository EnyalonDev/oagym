'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, Image as ImageIcon, CheckCircle2, AlertCircle, RefreshCw, X, Sparkles } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  demoOptions?: Array<{ label: string; value: string; badge?: string }>;
}

export function QRScanner({
  onScanSuccess,
  onClose,
  title = 'Escanear Código QR de Carnet',
  subtitle = 'Apunta la cámara del dispositivo al código QR del carnet físico o digital.',
  demoOptions,
}: QRScannerProps) {
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const scannerInstanceRef = useRef<Html5Qrcode | null>(null);
  const scannerRegionId = 'oa-html5-qrcode-region';
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraCaptureInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = useCallback(async () => {
    if (scannerInstanceRef.current) {
      try {
        if (scannerInstanceRef.current.isScanning) {
          await scannerInstanceRef.current.stop();
        }
        await scannerInstanceRef.current.clear();
      } catch (e) {
        console.warn('Stop error', e);
      }
      scannerInstanceRef.current = null;
    }
    setScannerActive(false);
  }, []);

  const handleSuccess = useCallback((text: string) => {
    setScannedResult(text);
    stopCamera();
    onScanSuccess(text);
  }, [onScanSuccess, stopCamera]);

  // Start live camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (scannerInstanceRef.current) {
        try {
          await scannerInstanceRef.current.stop();
        } catch {
          // ignore
        }
      }

      const html5QrCode = new Html5Qrcode(scannerRegionId);
      scannerInstanceRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleSuccess(decodedText);
        },
        () => {
          // scanning frame callback - silent
        }
      );

      setScannerActive(true);
    } catch (err: unknown) {
      console.warn('Camera start error:', err);
      setCameraError(
        'No se pudo acceder a la cámara. Puedes subir una imagen con el QR o seleccionar una credencial de prueba rápida.'
      );
      setScannerActive(false);
    }
  }, [handleSuccess]);

  // Handle image upload with QR
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode(scannerRegionId);
      const decoded = await html5QrCode.scanFile(file, true);
      handleSuccess(decoded);
    } catch (err) {
      console.error('File QR error:', err);
      setCameraError('No se encontró ningún código QR válido en la imagen seleccionada.');
    }
  };

  useEffect(() => {
    // Attempt camera startup asynchronously
    const timer = setTimeout(() => {
      startCamera();
    }, 100);

    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return (
    <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl text-left">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-500" />
            {title}
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Video Scanner Area */}
      <div className="mt-4 relative overflow-hidden rounded-xl border border-zinc-800 bg-black min-h-[260px] flex flex-col items-center justify-center">
        {/* html5-qrcode target div */}
        <div id={scannerRegionId} className="w-full max-w-[320px] overflow-hidden" />

        {/* Framing Overlay Guides when camera active */}
        {scannerActive && !scannedResult && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-56 w-56 rounded-2xl border-2 border-blue-500/80 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              {/* Corner markers */}
              <div className="absolute -top-1 -left-1 h-6 w-6 border-t-4 border-l-4 border-blue-400" />
              <div className="absolute -top-1 -right-1 h-6 w-6 border-t-4 border-r-4 border-blue-400" />
              <div className="absolute -bottom-1 -left-1 h-6 w-6 border-bottom-4 border-l-4 border-blue-400" />
              <div className="absolute -bottom-1 -right-1 h-6 w-6 border-b-4 border-r-4 border-blue-400" />

              {/* Scanning laser line animation */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse" />
            </div>
          </div>
        )}

        {/* Error notification if camera is blocked/denied */}
        {cameraError && (
          <div className="p-4 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-amber-500 mb-2" />
            <p className="text-xs text-zinc-300 max-w-xs mx-auto mb-1 font-medium">{cameraError}</p>
            <p className="text-[11px] text-zinc-400 max-w-xs mx-auto mb-3">
              iOS/Safari bloquea el video continuo en HTTP sin SSL. Puedes tomar una foto directa del carnet con tu cámara:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => cameraCaptureInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-md shadow-blue-900/30"
              >
                <Camera className="h-4 w-4" /> Tomar Foto al QR
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
              >
                <ImageIcon className="h-4 w-4" /> Galería
              </button>
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {scannedResult && (
          <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center p-4 text-center z-20">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-2" />
            <span className="text-sm font-bold text-white">¡Código QR Detectado!</span>
            <span className="text-xs font-mono text-zinc-400 mt-1 max-w-[280px] truncate">
              {scannedResult}
            </span>
          </div>
        )}
      </div>

      {/* Hidden File Input for Direct Camera Photo Capture */}
      <input
        type="file"
        ref={cameraCaptureInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Hidden File Input for Gallery / File selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Alternative Input / Upload File trigger */}
      <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
        <span>¿Deseas capturar una imagen?</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => cameraCaptureInputRef.current?.click()}
            className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 flex items-center gap-1"
          >
            <Camera className="h-3.5 w-3.5" /> Tomar Foto
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-zinc-400 hover:text-zinc-200 font-semibold underline underline-offset-2 flex items-center gap-1"
          >
            <ImageIcon className="h-3.5 w-3.5" /> Galería
          </button>
        </div>
      </div>

      {/* Quick Testing Options (Crucial for testing demo users without printing cards!) */}
      {demoOptions && demoOptions.length > 0 && (
        <div className="mt-4 pt-3 border-t border-zinc-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Acceso Rápido de Prueba (Simulador de Lector QR):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {demoOptions.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuccess(opt.value)}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 text-left text-xs hover:border-blue-600/50 hover:bg-zinc-800/80 transition-all"
              >
                <span className="truncate text-zinc-200 font-medium">{opt.label}</span>
                {opt.badge && (
                  <span className="shrink-0 text-[10px] rounded px-1.5 py-0.5 font-bold uppercase tracking-wider ml-1 bg-zinc-800 text-zinc-300">
                    {opt.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

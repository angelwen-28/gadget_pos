import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, ScanLine, CameraOff } from 'lucide-react';

export default function BarcodeScannerModal({ onClose, onScanSuccess, onScanError }) {
  const scannerRef = useRef(null);
  const html5QrcodeRef = useRef(null);

  useEffect(() => {
    // Start scanner
    const startScanner = async () => {
      try {
        const html5Qrcode = new Html5Qrcode("reader");
        html5QrcodeRef.current = html5Qrcode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777778 // widescreen aspect ratio
        };

        await html5Qrcode.start(
          { facingMode: "environment" }, // Prioritize back camera
          config,
          (decodedText) => {
            // Success callback
            onScanSuccess(decodedText);
            stopScanner();
          },
          (errorMessage) => {
            // Verbose error callback
            if (onScanError) onScanError(errorMessage);
          }
        );
      } catch (err) {
        console.error("Failed to start barcode scanner:", err);
      }
    };

    // Slight delay to ensure DOM element is ready
    const timer = setTimeout(() => {
      startScanner();
    }, 300);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      try {
        await html5QrcodeRef.current.stop();
      } catch (err) {
        console.error("Failed to stop scanner cleanly:", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 flex flex-col space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <ScanLine className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h3 className="text-sm font-extrabold text-white">Camera Scanner</h3>
          </div>
          <button 
            onClick={() => { stopScanner().then(onClose); }}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scanner Stream Box */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
          <div id="reader" className="w-full h-full object-cover"></div>
          
          {/* Scan Line Overlay Animation */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-scan" style={{
            animation: 'scan 2s linear infinite'
          }}></div>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scan {
              0% { top: 0%; }
              50% { top: 100%; }
              100% { top: 0%; }
            }
            #reader video {
              object-fit: cover !important;
              width: 100% !important;
              height: 100% !important;
            }
          `}} />
        </div>

        {/* Footer info */}
        <div className="text-center">
          <p className="text-xs font-semibold text-slate-300">Point your camera at a barcode or QR code</p>
          <p className="text-[10px] text-slate-500 mt-1">Keep it steady and aligned in the center</p>
        </div>

      </div>
    </div>
  );
}

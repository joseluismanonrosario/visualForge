import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

const LOADING_STAGES = [
  'Iniciando aplicación...',
  'Cargando catálogo de componentes y assets...',
  'Inicializando motor de renderizado...',
  'Iniciando VisualForge Studio...',
];

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  durationMs = 2600,
}) => {
  const [stageIdx, setStageIdx] = useState(0);
  const [progress, setProgress] = useState(15);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Stage 1
    const t1 = setTimeout(() => {
      setStageIdx(1);
      setProgress(48);
    }, durationMs * 0.28);

    // Stage 2
    const t2 = setTimeout(() => {
      setStageIdx(2);
      setProgress(82);
    }, durationMs * 0.62);

    // Stage 3
    const t3 = setTimeout(() => {
      setStageIdx(3);
      setProgress(100);
    }, durationMs * 0.88);

    // Fade out and close
    const tEnd = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(onComplete, 400);
    }, durationMs);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(tEnd);
    };
  }, [durationMs, onComplete]);

  // Handle skip on click or keypress
  const handleSkip = () => {
    if (!isFadingOut) {
      setIsFadingOut(true);
      setTimeout(onComplete, 200);
    }
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0d0e12]/85 backdrop-blur-md select-none transition-opacity duration-400 cursor-pointer ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      title="Haga clic para omitir"
    >
      {/* Splash Screen Card Container (tamaño compacto optimizado) */}
      <div className="relative w-[500px] max-w-[85vw] aspect-[918/614] rounded-[18px] sm:rounded-[20px] overflow-hidden shadow-2xl shadow-black/80 border border-white/10 animate-in fade-in zoom-in-95 duration-300">
        {/* Splash Graphic Asset Background */}
        <img
          src="/splash-bg.png"
          alt="VisualForge Studio Splash"
          className="w-full h-full object-cover pointer-events-none select-none"
        />

        {/* Live Animated "Iniciando..." Overlay in the bottom-left area */}
        <div
          className="absolute flex flex-col justify-end"
          style={{
            left: '4.2%',
            bottom: '4.8%',
            width: '28%',
          }}
        >
          {/* Animated Status Text (uniforme con la tipografía pequeña de la tarjeta) */}
          <div className="flex items-center gap-1.5 text-zinc-400 text-[9.5px] sm:text-[10px] font-sans tracking-tight">
            <span className="font-normal text-zinc-300 truncate">
              {LOADING_STAGES[stageIdx]}
            </span>
          </div>

          {/* Glowing Progress Bar (delimitada estrictamente a su bloque) */}
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1 relative">
            <div
              className="h-full bg-gradient-to-r from-[#0d99ff] via-indigo-500 to-violet-500 rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(13,153,255,0.7)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};


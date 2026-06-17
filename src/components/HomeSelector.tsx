import React from 'react';
import { useImageStore } from '../stores/imageStore';
import { Zap, Crop, ShieldCheck, FileImage } from 'lucide-react';
import { motion } from 'framer-motion';

export const HomeSelector: React.FC = () => {
  const { setActiveMode } = useImageStore();

  const cards = [
    {
      mode: 'convert' as const,
      title: 'Convertir',
      description:
        'Convierte imágenes entre múltiples formatos de forma rápida y local.',
      icon: Zap,
      featured: true,
    },
    {
      mode: 'edit' as const,
      title: 'Editar',
      description:
        'Edita, recorta y redimensiona tus imágenes directamente desde el navegador.',
      icon: Crop,
      featured: false,
    },
  ];

  return (
    <div className="flex-grow flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-2xl mx-auto mb-10"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3 leading-tight">
          Editor de Imágenes
        </h1>

        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400">
          Herramienta gratuita para procesar imágenes
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {cards.map((card, idx) => {
          const Icon = card.icon;

          return (
            <motion.button
              key={card.mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: idx * 0.1,
                duration: 0.3,
              }}
              onClick={() => setActiveMode(card.mode)}
              className={`group text-left rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44 select-none w-full relative overflow-hidden ${
                card.featured
                  ? 'bg-white dark:bg-slate-900 border border-purple-400 dark:border-purple-700 shadow-lg shadow-purple-500/10'
                  : 'bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
              }`}
            >
              {card.featured && (
                <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/5 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
              )}

              <div className="flex justify-between items-start">
                <div
                  className={`p-3.5 rounded-xl transition-all duration-300 ${
                    card.featured
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-purple-50 dark:group-hover:bg-purple-950/30 group-hover:text-purple-600 dark:group-hover:text-purple-400'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {card.featured && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    Popular
                  </span>
                )}
              </div>

              <div>
                <h3
                  className={`text-base font-bold transition-colors ${
                    card.featured
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-slate-950 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400'
                  }`}
                >
                  {card.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {card.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-2xl w-full">
        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/60">
          <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />

          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Privacidad Absoluta
            </h4>

            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Procesado local en navegador
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/60">
          <Zap className="w-6 h-6 text-amber-500 shrink-0" />

          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Velocidad Instantánea
            </h4>

            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Web Workers multitarea
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/60">
          <FileImage className="w-6 h-6 text-blue-500 shrink-0" />

          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Sin Límites
            </h4>

            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Sin cuentas ni publicidad
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
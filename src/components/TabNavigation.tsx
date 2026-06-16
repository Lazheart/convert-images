import React from 'react';
import { useImageStore } from '../stores/imageStore';
import type { ImageAction } from '../types';
import { motion } from 'framer-motion';
import { 
  FileImage, 
  Image as ImageIcon, 
  Zap, 
  Maximize, 
  Crop, 
  RotateCw 
} from 'lucide-react';

interface TabItem {
  id: ImageAction;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
}

const tabs: TabItem[] = [
  {
    id: 'any-to-webp',
    label: 'Convertir a WebP',
    description: 'JPG/PNG a WebP de alta eficiencia',
    icon: Zap,
  },
  {
    id: 'webp-to-any',
    label: 'Convertir desde WebP',
    description: 'WebP a formatos estándar JPG/PNG',
    icon: FileImage,
  },
  {
    id: 'compress',
    label: 'Comprimir Imagen',
    description: 'Reduce tamaño sin perder calidad visual',
    icon: ImageIcon,
  },
  {
    id: 'resize',
    label: 'Redimensionar',
    description: 'Cambia el ancho, alto o escala porcentual',
    icon: Maximize,
  },
  {
    id: 'crop',
    label: 'Recortar Imagen',
    description: 'Recorta áreas específicas visualmente',
    icon: Crop,
  },
  {
    id: 'rotate',
    label: 'Rotar y Voltear',
    description: 'Gira 90°/180°/270° o voltea la imagen',
    icon: RotateCw,
  },
];

export const TabNavigation: React.FC = () => {
  const { currentTab, setCurrentTab, items } = useImageStore();
  const hasFiles = items.length > 0;

  if (hasFiles) {
    // Render a compact tab navigation when files are present to give space to the queue
    return (
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-2 overflow-x-auto">
        <div className="flex gap-2 max-w-7xl mx-auto px-4 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicatorCompact"
                    className="absolute bottom-0 left-2 right-2 h-0.75 bg-purple-600 dark:bg-purple-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Full beautiful hero selection tabs when no files uploaded
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-4xl font-extrabold sm:text-5xl tracking-tight text-slate-900 dark:text-white leading-none">
          Herramientas de Imagen{' '}
          <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-500 bg-clip-text text-transparent">
            100% Client-Side
          </span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          Procesa tus imágenes masivamente de forma instantánea. Tus archivos nunca salen de tu ordenador.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`group text-left p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between cursor-pointer h-44 ${
                isActive
                  ? 'border-purple-500 bg-white dark:bg-slate-900 shadow-xl shadow-purple-500/5 dark:shadow-purple-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg hover:shadow-slate-100/50 dark:hover:shadow-none'
              }`}
            >
              {/* Highlight background element for active tab */}
              {isActive && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-8 -mt-8" />
              )}

              <div className="flex justify-between items-start">
                <div className={`p-3.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/35'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-purple-50 dark:group-hover:bg-purple-950/30 group-hover:text-purple-600 dark:group-hover:text-purple-400'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                  isActive
                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {tab.id === 'webp-to-any' || tab.id === 'any-to-webp' ? 'Conversión' : 'Edición'}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-950 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {tab.label}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {tab.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

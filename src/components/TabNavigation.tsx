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
  RotateCw,
  ChevronLeft
} from 'lucide-react';

interface TabItem {
  id: ImageAction;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  mode: 'convert' | 'edit';
}

const allTabs: TabItem[] = [
  {
    id: 'any-to-webp',
    label: 'Convertir a WebP',
    description: 'JPG/PNG a WebP de alta eficiencia',
    icon: Zap,
    mode: 'convert',
  },
  {
    id: 'webp-to-any',
    label: 'Convertir desde WebP',
    description: 'WebP a formatos estándar JPG/PNG',
    icon: FileImage,
    mode: 'convert',
  },
  {
    id: 'compress',
    label: 'Comprimir Imagen',
    description: 'Reduce tamaño sin perder calidad visual',
    icon: ImageIcon,
    mode: 'edit',
  },
  {
    id: 'resize',
    label: 'Redimensionar',
    description: 'Cambia el ancho, alto o escala porcentual',
    icon: Maximize,
    mode: 'edit',
  },
  {
    id: 'crop',
    label: 'Recortar Imagen',
    description: 'Recorta áreas específicas visualmente',
    icon: Crop,
    mode: 'edit',
  },
  {
    id: 'rotate',
    label: 'Rotar y Voltear',
    description: 'Gira 90°/180°/270° o voltea la imagen',
    icon: RotateCw,
    mode: 'edit',
  },
];

export const TabNavigation: React.FC = () => {
  const { currentTab, setCurrentTab, items, activeMode, setActiveMode } = useImageStore();
  const hasFiles = items.length > 0;

  // Filter tabs according to the active mode
  const tabs = allTabs.filter((t) => t.mode === activeMode);

  const modeLabel = activeMode === 'convert' ? 'Convertir' : 'Editar';

  if (hasFiles) {
    // Compact horizontal tab bar when files are loaded
    return (
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-2 overflow-x-auto">
        <div className="flex items-center gap-2 max-w-7xl mx-auto px-4 min-w-max">
          {/* Back button */}
          <button
            onClick={() => setActiveMode('home')}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer shrink-0"
            title="Volver al inicio"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Inicio</span>
          </button>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

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

  // Full card-style tab selection when no files are uploaded
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header with back button + title */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => setActiveMode('home')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all duration-200 cursor-pointer"
          title="Volver al inicio"
        >
          <ChevronLeft className="w-4 h-4" />
          Inicio
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">
            {modeLabel} Imágenes
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Selecciona la herramienta y luego sube tus imágenes
          </p>
        </div>
      </div>

      {/* Tab cards grid */}
      <div className={`grid grid-cols-1 gap-6 ${tabs.length === 2 ? 'md:grid-cols-2 max-w-2xl' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
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
              {/* Active glow */}
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
                  {tab.mode === 'convert' ? 'Conversión' : 'Edición'}
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

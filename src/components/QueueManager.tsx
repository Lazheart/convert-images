import React from 'react';
import { useImageStore } from '../stores/imageStore';
import { ImageItemCard } from './ImageItemCard';
import { SidebarSettings } from './SidebarSettings';
import { AnimatePresence } from 'framer-motion';
import { LayoutGrid, AlertCircle } from 'lucide-react';

export const QueueManager: React.FC = () => {
  const { items } = useImageStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col lg:flex-row gap-6">
      
      {/* Queue List (Left/Main Side) */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-slate-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">
              Cola de Procesamiento ({items.length} {items.length === 1 ? 'imagen' : 'imágenes'})
            </h3>
          </div>
        </div>

        {/* List of images */}
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-16rem)] pr-1">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <ImageItemCard key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </div>

        {/* Informational Box */}
        <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl flex gap-2.5 items-start">
          <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
            <strong>Procesamiento en segundo plano:</strong> La conversión utiliza <em>Web Workers</em> y <em>OffscreenCanvas</em> para no ralentizar tu navegador. Todo ocurre en tu ordenador, manteniendo tus imágenes 100% privadas.
          </p>
        </div>
      </div>

      {/* Settings Panel (Right Side) */}
      <SidebarSettings />

    </div>
  );
};

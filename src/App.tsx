import React from 'react';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { ImageDropzone } from './components/ImageDropzone';
import { QueueManager } from './components/QueueManager';
import { useImageStore } from './stores/imageStore';
import { ShieldCheck, Heart } from 'lucide-react';

export const App: React.FC = () => {
  const { items } = useImageStore();
  const hasFiles = items.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-250">
      
      {/* Navbar Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col">
        {/* Tab Selection */}
        <TabNavigation />

        {/* Dropzone or Queue Manager */}
        {hasFiles ? (
          <QueueManager />
        ) : (
          <div className="flex-grow flex items-center justify-center py-6">
            <ImageDropzone />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Procesamiento 100% local sin servidor. Tus imágenes nunca salen de tu dispositivo.</span>
          </div>
          
          <div className="flex items-center gap-1 justify-center sm:justify-end">
            <span>Código abierto con Licencia MIT</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="flex items-center gap-0.5">
              Hecho con <Heart className="w-3 h-3 text-red-500 fill-red-500" /> para la web moderna.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

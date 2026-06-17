import React from 'react';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { ImageDropzone } from './components/ImageDropzone';
import { QueueManager } from './components/QueueManager';
import { HomeSelector } from './components/HomeSelector';
import { useImageStore } from './stores/imageStore';

export const App: React.FC = () => {
  const { items, activeMode } = useImageStore();
  const hasFiles = items.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-250">
      
      {/* Navbar Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col">
        {activeMode === 'home' ? (
          // Home: show the two main action cards
          <HomeSelector />
        ) : (
          <>
            {/* Tab Selection (Convert or Edit mode) */}
            <TabNavigation />

            {/* Dropzone or Queue Manager */}
            {hasFiles ? (
              <QueueManager />
            ) : (
              <div className="flex-grow flex items-center justify-center py-6">
                <ImageDropzone />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto transition-colors duration-200">
        <div className="flex items-center justify-center gap-2">
          <span>Código abierto con Licencia MIT</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span>Desarrollado por Lazheart</span>
        </div>
      </footer>
    </div>
  );
};

export default App;

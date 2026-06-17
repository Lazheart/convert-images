import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useImageStore } from '../stores/imageStore';
import { Upload, FileImage, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const SUPPORTED_FORMATS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

export const ImageDropzone: React.FC = () => {
  const { currentTab, addFiles, activeMode } = useImageStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      addFiles(acceptedFiles, currentTab);
    }
  }, [currentTab, addFiles]);

  const getAcceptConfig = () => {
    if (activeMode === 'convert' || currentTab === 'convert') {
      return SUPPORTED_FORMATS;
    }
    return SUPPORTED_FORMATS;
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: getAcceptConfig() as Record<string, string[]>,
  });

  const getInstructions = () => {
    if (activeMode === 'convert') {
      return {
        title: 'Arrastra tus imágenes aquí',
        subtitle: 'Soporta PNG, JPEG, WebP y JPG. Convierte todas a un formato o personaliza cada una',
      };
    }
    return {
      title: 'Arrastra tus imágenes aquí',
      subtitle: 'Soporta JPG, JPEG, PNG y WebP',
    };
  };

  const instructions = getInstructions();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div {...getRootProps()} className="outline-none">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className={`relative border-2 border-dashed rounded-3xl p-10 md:p-16 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 scale-[1.01] shadow-xl shadow-purple-500/10'
              : 'border-slate-300 dark:border-slate-700 bg-white/40 dark:bg-slate-900/20 hover:border-purple-400 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-900/60'
          }`}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center justify-center">
            <motion.div 
              animate={isDragActive ? { y: -10 } : { y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="p-5 bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:to-indigo-500/20 rounded-2xl text-purple-600 dark:text-purple-400 mb-6 relative"
            >
              <Upload className="w-10 h-10" />
              <motion.div 
                animate={isDragActive ? { scale: 1.2, opacity: 0.8 } : { scale: 1, opacity: 0 }}
                className="absolute inset-0 border border-purple-500 rounded-2xl"
              />
            </motion.div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {isDragActive ? '¡Suelta los archivos aquí!' : instructions.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {instructions.subtitle} o haz clic para explorar tus carpetas locales.
            </p>

            <button
              type="button"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition-all duration-200 shadow-md shadow-purple-500/20 hover:shadow-purple-500/35 transform hover:-translate-y-0.5 pointer-events-none"
            >
              Seleccionar Imágenes
            </button>
          </div>

          {fileRejections.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-red-600 dark:text-red-400 text-xs">
              Algunos archivos no fueron aceptados. Asegúrate de subir formatos compatibles (.png, .jpg, .jpeg, .webp).
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/60">
          <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Privacidad Absoluta</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Procesado local en navegador</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/60">
          <Zap className="w-6 h-6 text-amber-500 shrink-0" />
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Velocidad Instantánea</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Web Workers multitarea</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/60">
          <FileImage className="w-6 h-6 text-blue-500 shrink-0" />
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Sin Límites</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Sin cuentas ni publicidad</p>
          </div>
        </div>
      </div>
    </div>
  );
};

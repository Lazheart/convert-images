import React, { useState } from 'react';
import type { ImageItem, OutputFormat } from '../types';
import { useImageStore } from '../stores/imageStore';
import { formatSize, downloadSingleFile } from '../utils/helpers';
import { CropSelector } from './CropSelector';
import { 
  Trash2, 
  Download, 
  Play, 
  AlertTriangle, 
  CheckCircle, 
  Crop,
  X,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageItemCardProps {
  item: ImageItem;
}

export const ImageItemCard: React.FC<ImageItemCardProps> = ({ item }) => {
  const { 
    startProcessing, 
    removeFile, 
    updateFileOptions,
    currentTab
  } = useImageStore();

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const handleCropChange = (area: any) => {
    updateFileOptions(item.id, { cropArea: area });
  };

  const formatLabels: Record<OutputFormat, string> = {
    webp: 'WebP',
    jpeg: 'JPG',
    png: 'PNG',
  };

  const getOptionsDescription = () => {
    const { options } = item;
    switch (currentTab) {
      case 'convert': {
        const fmt = formatLabels[options.format || 'webp'];
        const quality = options.format === 'png' ? '' : ` (Calidad ${options.quality || 80}%)`;
        const dims = options.applyDimensions
          ? ` • ${options.width || 'Auto'}x${options.height || 'Auto'}px`
          : '';
        return `A ${fmt}${quality}${dims}`;
      }
      case 'compress':
        return `Compresión: ${
          options.compressionLevel === 'low' ? 'Baja' :
          options.compressionLevel === 'medium' ? 'Media' :
          options.compressionLevel === 'high' ? 'Alta' : 'Personalizada'
        } (Calidad ${options.quality}%)`;
      case 'resize':
        if (options.resizeType === 'percentage') {
          return `Escala: ${options.scalePercentage}%`;
        }
        return `Dimensionar: ${options.width || 'Auto'} x ${options.height || 'Auto'} px`;
      case 'crop':
        return `Recorte: ${options.cropArea ? `${options.cropArea.width}% x ${options.cropArea.height}%` : 'Por definir'}`;
      case 'rotate':
        return `Rotación: ${options.rotation || 0}° ${options.flipHorizontal ? '+ Volteo H' : ''} ${options.flipVertical ? '+ Volteo V' : ''}`;
      default:
        return '';
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between transition-all duration-200 ${
          item.status === 'completed' 
            ? 'border-emerald-200 dark:border-emerald-950/40 bg-emerald-50/5 dark:bg-emerald-950/5'
            : item.status === 'failed'
              ? 'border-red-200 dark:border-red-950/40 bg-red-50/5 dark:bg-red-950/5'
              : 'border-slate-200 dark:border-slate-800'
        }`}
      >
        {/* Left Side: Thumbnail & File Info */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Thumbnail Container */}
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 checkerboard flex items-center justify-center bg-slate-100 dark:bg-slate-900">
            <img 
              src={item.previewUrl} 
              alt={item.name} 
              className="w-full h-full object-cover"
            />
            
            {/* Action Icon overlay */}
            {item.status === 'completed' && (
              <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-500 fill-white dark:fill-slate-900" />
              </div>
            )}
            {item.status === 'failed' && (
              <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500 fill-white dark:fill-slate-900" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <h4 
              className="text-sm font-bold text-slate-900 dark:text-white truncate"
              title={item.name}
            >
              {item.name}
            </h4>
            
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium font-mono">{formatSize(item.size)}</span>
              {item.originalWidth && item.originalHeight && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="font-mono">{item.originalWidth}x{item.originalHeight}px</span>
                </>
              )}
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold rounded">
                {getOptionsDescription()}
              </span>
            </div>

            {/* Per-image format selector for convert */}
            {currentTab === 'convert' && item.status === 'idle' && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[10px] text-slate-400 shrink-0">Formato:</span>
                {(['webp', 'jpeg', 'png'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => updateFileOptions(item.id, { format: fmt })}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                      (item.options.format || 'webp') === fmt
                        ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {formatLabels[fmt]}
                  </button>
                ))}
              </div>
            )}

            {/* Custom parameters override in-line for Resize */}
            {currentTab === 'resize' && item.options.resizeType === 'pixels' && item.status === 'idle' && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  placeholder="W"
                  value={item.options.width || ''}
                  onChange={(e) => updateFileOptions(item.id, { width: parseInt(e.target.value) || undefined })}
                  className="w-16 px-1.5 py-0.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded text-center focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                />
                <span className="text-xs text-slate-400">x</span>
                <input
                  type="number"
                  placeholder="H"
                  value={item.options.height || ''}
                  onChange={(e) => updateFileOptions(item.id, { height: parseInt(e.target.value) || undefined })}
                  className="w-16 px-1.5 py-0.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded text-center focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                />
              </div>
            )}
          </div>
        </div>

        {/* Center: Processing status / details */}
        <div className="flex-1 w-full max-w-xs px-2 flex flex-col items-center justify-center">
          {item.status === 'processing' && (
            <div className="w-full">
              <div className="flex justify-between items-center text-[10px] text-purple-650 dark:text-purple-400 font-bold mb-1">
                <span>Procesando...</span>
                <span>{item.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  className="h-full bg-purple-600 rounded-full"
                />
              </div>
            </div>
          )}

          {item.status === 'completed' && item.result && (
            <div className="text-center sm:text-left text-[11px] text-slate-650 dark:text-slate-400 space-y-0.5">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {formatSize(item.result.size)}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="font-mono">{item.result.width}x{item.result.height}px</span>
              </div>
              
              {item.options.action === 'compress' && item.result.reductionPercent !== undefined && (
                <div className="font-bold flex items-center justify-center sm:justify-start gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span className={item.result.reductionPercent > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}>
                    {item.result.reductionPercent > 0 
                      ? `Reducido un ${item.result.reductionPercent}%`
                      : 'Sin cambios en tamaño'}
                  </span>
                </div>
              )}

              {item.result.timeMs !== undefined && (
                <span className="text-[9px] text-slate-400 font-mono block">
                  Procesado en {item.result.timeMs}ms
                </span>
              )}
            </div>
          )}

          {item.status === 'failed' && (
            <p className="text-xs text-red-500 font-semibold text-center line-clamp-2" title={item.error}>
              Error: {item.error || 'Procesamiento fallido'}
            </p>
          )}
        </div>

        {/* Right Side: Action Trigger Buttons */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
          {/* Crop Action (if crop active) */}
          {currentTab === 'crop' && item.status === 'idle' && (
            <button
              onClick={() => setIsCropModalOpen(true)}
              className="p-2 border border-purple-200 dark:border-purple-950/40 hover:bg-purple-50 dark:hover:bg-purple-950/15 text-purple-650 dark:text-purple-400 rounded-xl transition-all cursor-pointer"
              title="Ajustar recorte visual"
            >
              <Crop className="w-4 h-4" />
            </button>
          )}

          {/* Single Action Play button */}
          {item.status !== 'processing' && item.status !== 'completed' && (
            <button
              onClick={() => startProcessing(item.id)}
              className="p-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/20 dark:hover:bg-purple-950/45 text-purple-600 dark:text-purple-450 rounded-xl transition-all cursor-pointer"
              title="Procesar esta imagen"
            >
              <Play className="w-4 h-4" />
            </button>
          )}

          {/* Download individual result */}
          {item.status === 'completed' && (
            <button
              onClick={() => downloadSingleFile(item)}
              className="p-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/45 text-emerald-600 dark:text-emerald-450 rounded-xl transition-all cursor-pointer"
              title="Descargar imagen procesada"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Delete item from queue */}
          <button
            onClick={() => removeFile(item.id)}
            disabled={item.status === 'processing'}
            className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/10 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all cursor-pointer disabled:opacity-40"
            title="Quitar de la lista"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Visual Crop Modal Overlay */}
      <AnimatePresence>
        {isCropModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crop className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-md">
                    Recortar: {item.name}
                  </h3>
                </div>
                <button
                  onClick={() => setIsCropModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 flex justify-center items-center">
                <CropSelector
                  imageUrl={item.previewUrl}
                  cropArea={item.options.cropArea || { x: 10, y: 10, width: 80, height: 80 }}
                  onChange={handleCropChange}
                />
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                <button
                  onClick={() => setIsCropModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 text-xs font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Cerrar y guardar área
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

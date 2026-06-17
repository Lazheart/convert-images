import React from 'react';
import { useImageStore } from '../stores/imageStore';
import { downloadAllAsZip } from '../utils/helpers';
import type { OutputFormat } from '../types';
import { 
  Settings, 
  Play, 
  Download, 
  Trash2, 
  Plus, 
  Loader2, 
  RefreshCw, 
  FlipHorizontal,
  FlipVertical
} from 'lucide-react';

export const SidebarSettings: React.FC = () => {
  const { 
    items, 
    currentTab, 
    isProcessingAll, 
    startProcessingAll, 
    clearFiles, 
    updateAllFileOptions,
    addFiles
  } = useImageStore();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Check queue statuses
  const totalItems = items.length;
  const completedItems = items.filter(i => i.status === 'completed');
  const failedItems = items.filter(i => i.status === 'failed');
  
  const allCompleted = completedItems.length === totalItems && totalItems > 0;
  const hasResults = completedItems.length > 0;

  // Get first item's options to represent global settings state
  const firstItem = items[0];
  const options = firstItem?.options || { action: currentTab };

  const handleQualityChange = (val: number) => {
    updateAllFileOptions({ quality: val });
  };

  const handleFormatChange = (format: OutputFormat) => {
    updateAllFileOptions({ format });
  };

  const handleApplyDimensions = (applyDimensions: boolean) => {
    const updates: Partial<typeof options> = { applyDimensions };
    if (applyDimensions && firstItem) {
      updates.width = firstItem.originalWidth || options.width;
      updates.height = firstItem.originalHeight || options.height;
    }
    updateAllFileOptions(updates);
  };

  const handleCompressionLevel = (level: 'low' | 'medium' | 'high' | 'custom') => {
    let quality = 75;
    if (level === 'low') quality = 85;
    else if (level === 'medium') quality = 70;
    else if (level === 'high') quality = 50;
    updateAllFileOptions({ compressionLevel: level, quality });
  };

  const handleResizeType = (resizeType: 'pixels' | 'percentage') => {
    updateAllFileOptions({ resizeType });
  };

  const handleScalePercentage = (scalePercentage: number) => {
    updateAllFileOptions({ scalePercentage });
  };

  const handleWidthChange = (w: number) => {
    updateAllFileOptions({ width: w });
  };

  const handleHeightChange = (h: number) => {
    updateAllFileOptions({ height: h });
  };

  const handleAspectChange = (maintainAspectRatio: boolean) => {
    updateAllFileOptions({ maintainAspectRatio });
  };

  const handleRotation = (rotation: 0 | 90 | 180 | 270) => {
    updateAllFileOptions({ rotation });
  };

  const toggleFlipH = () => {
    updateAllFileOptions({ flipHorizontal: !options.flipHorizontal });
  };

  const toggleFlipV = () => {
    updateAllFileOptions({ flipVertical: !options.flipVertical });
  };

  const triggerAddFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files), currentTab);
    }
  };

  return (
    <div className="w-full lg:w-80 bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shrink-0 h-auto lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16 overflow-y-auto">
      
      {/* File input for adding more files */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileInputChange} 
        multiple 
        className="hidden" 
        accept="image/jpeg,image/png,image/webp"
      />

      {/* Main Configurations */}
      <div>
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-bold text-slate-900 dark:text-white">Ajustes Generales</h3>
        </div>

        {/* Convert settings */}
        {currentTab === 'convert' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Formato de salida (todas)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'webp' as const, label: 'WebP' },
                  { id: 'jpeg' as const, label: 'JPG / JPEG' },
                  { id: 'png' as const, label: 'PNG' },
                ]).map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => handleFormatChange(id)}
                    className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      options.format === id
                        ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">
                Se aplica a todas las imágenes. Puedes cambiar el formato de cada una en la lista.
              </p>
            </div>

            {options.format !== 'png' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Calidad
                  </label>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">
                    {options.quality || 80}%
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={options.quality || 80}
                  onChange={(e) => handleQualityChange(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.applyDimensions ?? false}
                  onChange={(e) => handleApplyDimensions(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
                  Aplicar dimensiones específicas
                </span>
              </label>

              {options.applyDimensions && (
                <div className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                        Ancho (px)
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Ancho"
                        value={options.width || ''}
                        onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                        Alto (px)
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Alto"
                        value={options.height || ''}
                        onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.maintainAspectRatio ?? true}
                      onChange={(e) => handleAspectChange(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400 select-none">
                      Mantener proporción original
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compression settings */}
        {currentTab === 'compress' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Nivel de Compresión
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['low', 'medium', 'high', 'custom'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => handleCompressionLevel(level)}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all capitalize cursor-pointer ${
                      options.compressionLevel === level
                        ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {level === 'low' && 'Baja (Max Calidad)'}
                    {level === 'medium' && 'Media (Recomendado)'}
                    {level === 'high' && 'Alta (Max Ahorro)'}
                    {level === 'custom' && 'Personalizada'}
                  </button>
                ))}
              </div>
            </div>

            {options.compressionLevel === 'custom' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Calidad de compresión
                  </label>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">
                    {options.quality || 70}%
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={options.quality || 70}
                  onChange={(e) => handleQualityChange(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            )}
          </div>
        )}

        {/* 4. Resize settings */}
        {currentTab === 'resize' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Método de Redimensión
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleResizeType('percentage')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    options.resizeType === 'percentage'
                      ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-500'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-55'
                  }`}
                >
                  Porcentaje
                </button>
                <button
                  onClick={() => handleResizeType('pixels')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    options.resizeType === 'pixels'
                      ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-500'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-55'
                  }`}
                >
                  Píxeles Exactos
                </button>
              </div>
            </div>

            {options.resizeType === 'percentage' ? (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Escala
                  </label>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">
                    {options.scalePercentage || 50}%
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={options.scalePercentage || 50}
                  onChange={(e) => handleScalePercentage(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1%</span>
                  <span>50% (Mitad)</span>
                  <span>100% (Original)</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                      Ancho (px)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Ancho"
                      value={options.width || ''}
                      onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                      Alto (px)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Alto"
                      value={options.height || ''}
                      onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                    />
                  </div>
                </div>
                
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={options.maintainAspectRatio ?? true}
                    onChange={(e) => handleAspectChange(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 select-none">
                    Mantener proporción original
                  </span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* 5. Crop settings */}
        {currentTab === 'crop' && (
          <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-2xl text-slate-600 dark:text-slate-300 text-xs leading-relaxed space-y-2">
            <p className="font-semibold text-purple-800 dark:text-purple-400">
              ¿Cómo recortar?
            </p>
            <p>
              Haz clic en el botón de edición (icono de lápiz/recorte) en la tarjeta de cualquier imagen para abrir el panel de recorte visual.
            </p>
          </div>
        )}

        {/* 6. Rotate settings */}
        {currentTab === 'rotate' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Girar
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {([0, 90, 180, 270] as const).map((deg) => (
                  <button
                    key={deg}
                    onClick={() => handleRotation(deg)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      (options.rotation || 0) === deg
                        ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {deg === 0 ? '0°' : `${deg}°`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                Voltear
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={toggleFlipH}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    options.flipHorizontal
                      ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-500'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <FlipHorizontal className="w-4 h-4" />
                  Horizontal
                </button>
                <button
                  onClick={toggleFlipV}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    options.flipVertical
                      ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-500'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <FlipVertical className="w-4 h-4" />
                  Vertical
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Buttons */}
      <div className="mt-8 space-y-3">
        {/* Statistics info if processed */}
        {hasResults && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Procesados:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {completedItems.length} de {totalItems}
              </span>
            </div>
            {failedItems.length > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Fallidos:</span>
                <span className="font-bold">{failedItems.length}</span>
              </div>
            )}
          </div>
        )}

        {/* Process button */}
        <button
          onClick={startProcessingAll}
          disabled={isProcessingAll || totalItems === 0 || allCompleted}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-200 disabled:to-slate-200 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-slate-400 dark:disabled:text-slate-655 text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-md shadow-purple-500/10 hover:shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {isProcessingAll ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Procesando...
            </>
          ) : allCompleted ? (
            <>
              <RefreshCw className="w-4 h-4" />
              Procesado completado
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Procesar {totalItems > 0 ? `(${totalItems})` : ''}
            </>
          )}
        </button>

        {/* Download ZIP button */}
        <button
          onClick={() => downloadAllAsZip(items, currentTab)}
          disabled={!hasResults}
          className="w-full py-3 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-850 dark:hover:bg-slate-700 disabled:bg-slate-100 dark:disabled:bg-slate-800/30 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-bold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Descargar todo (.ZIP)
        </button>

        {/* Add more / Clear queue controls */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={triggerAddFiles}
            className="py-2.5 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Añadir más
          </button>
          
          <button
            onClick={clearFiles}
            disabled={totalItems === 0}
            className="py-2.5 px-3 border border-red-200 dark:border-red-950/40 hover:bg-red-50 dark:hover:bg-red-950/10 text-red-650 dark:text-red-400 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpiar todo
          </button>
        </div>
      </div>
    </div>
  );
};

export type ImageAction = 'webp-to-any' | 'any-to-webp' | 'compress' | 'resize' | 'crop' | 'rotate';

export interface CropArea {
  x: number; // percentage (0-100) or pixel
  y: number;
  width: number;
  height: number;
}

export interface ProcessingOptions {
  action: ImageAction;
  // Convert Options
  format?: 'webp' | 'jpeg' | 'png';
  quality?: number; // 1-100
  // Compress Options
  compressionLevel?: 'low' | 'medium' | 'high' | 'custom';
  // Resize Options
  resizeType?: 'pixels' | 'percentage';
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  scalePercentage?: number; // 1-100
  // Crop Options
  cropArea?: CropArea;
  // Rotate Options
  rotation?: 0 | 90 | 180 | 270;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
}

export interface ImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  originalWidth?: number;
  originalHeight?: number;
  previewUrl: string;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  options: ProcessingOptions;
  result?: {
    blob: Blob;
    size: number;
    width: number;
    height: number;
    previewUrl: string;
    format: string;
    reductionPercent?: number;
    timeMs?: number;
  };
}

export interface GlobalState {
  items: ImageItem[];
  theme: 'light' | 'dark';
  currentTab: ImageAction;
  isProcessingAll: boolean;
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrentTab: (tab: ImageAction) => void;
  addFiles: (files: File[], tab: ImageAction) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  updateFileOptions: (id: string, options: Partial<ProcessingOptions>) => void;
  updateAllFileOptions: (options: Partial<ProcessingOptions>) => void;
  setProcessingStatus: (id: string, status: ImageItem['status'], progress: number, error?: string) => void;
  setProcessingResult: (id: string, result: ImageItem['result']) => void;
  startProcessing: (id: string) => Promise<void>;
  startProcessingAll: () => Promise<void>;
  cancelProcessing: (id: string) => void;
}

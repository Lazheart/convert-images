import { create } from 'zustand';
import type { GlobalState, ImageItem, ProcessingOptions, ImageAction } from '../types';

// Helper to get image dimensions
const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    if (file.type === 'image/svg+xml') {
      resolve({ width: 800, height: 600 }); // SVG fallback
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
};

const getDefaultOptions = (action: ImageAction): ProcessingOptions => {
  switch (action) {
    case 'any-to-webp':
      return { action, quality: 80 };
    case 'webp-to-any':
      return { action, format: 'jpeg', quality: 80 };
    case 'compress':
      return { action, compressionLevel: 'medium', quality: 75 };
    case 'resize':
      return { action, resizeType: 'percentage', scalePercentage: 50, maintainAspectRatio: true };
    case 'crop':
      return { action, cropArea: { x: 10, y: 10, width: 80, height: 80 } };
    case 'rotate':
      return { action, rotation: 90, flipHorizontal: false, flipVertical: false };
    default:
      return { action };
  }
};

export const useImageStore = create<GlobalState>((set, get) => {
  // Check system/local preference for theme
  const getInitialTheme = (): 'light' | 'dark' => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark';
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const initialTheme = getInitialTheme();
  // Apply theme to document
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // Active workers dictionary to handle cancellations
  const activeWorkers: Record<string, Worker> = {};

  return {
    items: [],
    theme: initialTheme,
    currentTab: 'any-to-webp',
    isProcessingAll: false,

    setTheme: (theme) => {
      localStorage.setItem('theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      set({ theme });
    },

    setCurrentTab: (currentTab) => {
      // Clean up previous results and reset state when switching tabs
      const items = get().items.map(item => {
        // Clean up preview URLs
        if (item.result?.previewUrl) {
          URL.revokeObjectURL(item.result.previewUrl);
        }
        return {
          ...item,
          status: 'idle' as const,
          progress: 0,
          error: undefined,
          result: undefined,
          options: getDefaultOptions(currentTab)
        };
      });
      set({ currentTab, items });
    },

    addFiles: async (files, tab) => {
      const currentItems = get().items;
      
      const newItemsPromises = files.map(async (file) => {
        const id = Math.random().toString(36).substring(2, 9);
        const previewUrl = URL.createObjectURL(file);
        const dimensions = await getImageDimensions(file);
        
        const defaultOpts = getDefaultOptions(tab);
        // If resize, initialize custom dimensions based on image
        if (tab === 'resize') {
          defaultOpts.width = dimensions.width;
          defaultOpts.height = dimensions.height;
        }

        const item: ImageItem = {
          id,
          file,
          name: file.name,
          size: file.size,
          originalWidth: dimensions.width,
          originalHeight: dimensions.height,
          previewUrl,
          status: 'idle',
          progress: 0,
          options: defaultOpts
        };
        return item;
      });

      const newItems = await Promise.all(newItemsPromises);
      set({ items: [...currentItems, ...newItems] });
    },

    removeFile: (id) => {
      // Cancel active worker if running
      const worker = activeWorkers[id];
      if (worker) {
        worker.terminate();
        delete activeWorkers[id];
      }

      const items = get().items.filter((item) => {
        if (item.id === id) {
          URL.revokeObjectURL(item.previewUrl);
          if (item.result?.previewUrl) {
            URL.revokeObjectURL(item.result.previewUrl);
          }
          return false;
        }
        return true;
      });
      set({ items });
    },

    clearFiles: () => {
      // Terminate all workers
      Object.keys(activeWorkers).forEach((id) => {
        activeWorkers[id].terminate();
        delete activeWorkers[id];
      });

      get().items.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
        if (item.result?.previewUrl) {
          URL.revokeObjectURL(item.result.previewUrl);
        }
      });
      set({ items: [], isProcessingAll: false });
    },

    updateFileOptions: (id, options) => {
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, options: { ...item.options, ...options } } : item
        ),
      }));
    },

    updateAllFileOptions: (options) => {
      set((state) => ({
        items: state.items.map((item) => ({
          ...item,
          options: { ...item.options, ...options },
        })),
      }));
    },

    setProcessingStatus: (id, status, progress, error) => {
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, status, progress, error } : item
        ),
      }));
    },

    setProcessingResult: (id, result) => {
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, result } : item
        ),
      }));
    },

    startProcessing: (id) => {
      const item = get().items.find((i) => i.id === id);
      if (!item) return Promise.resolve();

      // Revoke previous result previewUrl if it exists
      if (item.result?.previewUrl) {
        URL.revokeObjectURL(item.result.previewUrl);
      }

      // Mark as processing
      get().setProcessingStatus(id, 'processing', 10);

      return new Promise<void>((resolve) => {
        try {
          // Instantiate worker using Vite support
          const worker = new Worker(
            new URL('../workers/image-processor.worker.ts', import.meta.url),
            { type: 'module' }
          );

          activeWorkers[id] = worker;

          worker.onmessage = (e) => {
            const data = e.data;
            if (data.id !== id) return;

            if (data.success) {
              const res = data.result;
              const resultPreviewUrl = URL.createObjectURL(res.blob);
              const reductionPercent = item.size > 0 
                ? Math.round(((item.size - res.size) / item.size) * 100) 
                : 0;

              get().setProcessingResult(id, {
                blob: res.blob,
                size: res.size,
                width: res.width,
                height: res.height,
                previewUrl: resultPreviewUrl,
                format: res.format,
                reductionPercent,
                timeMs: res.timeMs
              });
              get().setProcessingStatus(id, 'completed', 100);
            } else {
              get().setProcessingStatus(id, 'failed', 0, data.error);
            }

            // Cleanup worker
            worker.terminate();
            delete activeWorkers[id];
            resolve();
          };

          worker.onerror = (err) => {
            get().setProcessingStatus(id, 'failed', 0, err.message || 'Worker execution failed');
            worker.terminate();
            delete activeWorkers[id];
            resolve();
          };

          // Send data to worker
          worker.postMessage({
            id,
            file: item.file,
            options: item.options
          });

          // Simulate some progress
          setTimeout(() => {
            const currentItem = get().items.find(i => i.id === id);
            if (currentItem && currentItem.status === 'processing') {
              get().setProcessingStatus(id, 'processing', 60);
            }
          }, 150);

        } catch (error: any) {
          get().setProcessingStatus(id, 'failed', 0, error.message || 'Failed to start Web Worker');
          resolve();
        }
      });
    },

    startProcessingAll: async () => {
      const idleItems = get().items.filter(item => item.status !== 'completed');
      if (idleItems.length === 0) return;

      set({ isProcessingAll: true });

      // Run multiple processing jobs in parallel (up to 4 at a time to prevent system choke)
      const concurrencyLimit = 4;
      const queue = [...idleItems];
      const activePromises: Promise<void>[] = [];

      const processQueue = async (): Promise<void> => {
        if (queue.length === 0) return;
        const item = queue.shift()!;
        await get().startProcessing(item.id);
        await processQueue();
      };

      for (let i = 0; i < Math.min(concurrencyLimit, queue.length); i++) {
        activePromises.push(processQueue());
      }

      await Promise.all(activePromises);
      set({ isProcessingAll: false });
    },

    cancelProcessing: (id) => {
      const worker = activeWorkers[id];
      if (worker) {
        worker.terminate();
        delete activeWorkers[id];
      }
      get().setProcessingStatus(id, 'idle', 0);
    }
  };
});

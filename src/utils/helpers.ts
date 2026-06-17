import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { ImageItem } from '../types';

export const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const downloadSingleFile = (item: ImageItem) => {
  if (!item.result) return;
  
  // Construct filename
  const originalNameWithoutExt = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
  const extension = item.result.format;
  
  let suffix = '';
  if (item.options.action === 'convert') suffix = '-converted';
  else if (item.options.action === 'compress') suffix = '-compressed';
  else if (item.options.action === 'resize') suffix = `-resized-${item.result.width}x${item.result.height}`;
  else if (item.options.action === 'crop') suffix = '-cropped';
  else if (item.options.action === 'rotate') suffix = '-rotated';

  const newFileName = `${originalNameWithoutExt}${suffix}.${extension}`;
  saveAs(item.result.blob, newFileName);
};

export const downloadAllAsZip = async (items: ImageItem[], actionName: string) => {
  const completedItems = items.filter(item => item.status === 'completed' && item.result);
  if (completedItems.length === 0) return;

  const zip = new JSZip();
  const folder = zip.folder('processed-images');

  completedItems.forEach((item) => {
    if (!item.result) return;
    const originalNameWithoutExt = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    const extension = item.result.format;
    
    let suffix = '';
    if (item.options.action === 'convert') suffix = '-converted';
    else if (item.options.action === 'compress') suffix = '-compressed';
    else if (item.options.action === 'resize') suffix = `-resized-${item.result.width}x${item.result.height}`;
    else if (item.options.action === 'crop') suffix = '-cropped';
    else if (item.options.action === 'rotate') suffix = '-rotated';

    const filename = `${originalNameWithoutExt}${suffix}.${extension}`;
    folder?.file(filename, item.result.blob);
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `convertimage-${actionName}-${Date.now()}.zip`);
};

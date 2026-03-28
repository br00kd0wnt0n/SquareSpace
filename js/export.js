// export.js — High-resolution PNG/JPG export for Printify

import { render } from './renderer.js';

const EXPORT_WIDTH = 4500;
const EXPORT_HEIGHT = 5400;

export function exportImage(state, format = 'png') {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = EXPORT_WIDTH;
    canvas.height = EXPORT_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Failed to create canvas context. Your device may not have enough memory.'));
      return;
    }

    try {
      render(ctx, EXPORT_WIDTH, EXPORT_HEIGHT, state);
    } catch (e) {
      // Fallback to half resolution
      canvas.width = EXPORT_WIDTH / 2;
      canvas.height = EXPORT_HEIGHT / 2;
      const ctx2 = canvas.getContext('2d');
      render(ctx2, EXPORT_WIDTH / 2, EXPORT_HEIGHT / 2, state);
    }

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpg' ? 0.95 : undefined;

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Export failed — could not generate image'));
          return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quilt-design-${state.pattern}-${Date.now()}.${format === 'jpg' ? 'jpg' : 'png'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(() => URL.revokeObjectURL(url), 5000);

        // Free memory
        canvas.width = 0;
        canvas.height = 0;

        resolve();
      },
      mimeType,
      quality
    );
  });
}

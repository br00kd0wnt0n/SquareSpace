// export.js — High-resolution PNG/JPG export (SQUARE: 4500x4500)

var EXPORT_SIZE = 4500;

function exportImage(state, format) {
  format = format || 'png';

  return new Promise(function(resolve, reject) {
    var canvas = document.createElement('canvas');
    canvas.width = EXPORT_SIZE;
    canvas.height = EXPORT_SIZE;

    var ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Failed to create canvas context.'));
      return;
    }

    try {
      render(ctx, EXPORT_SIZE, state);
    } catch (e) {
      // Fallback to half resolution
      var half = EXPORT_SIZE / 2;
      canvas.width = half;
      canvas.height = half;
      var ctx2 = canvas.getContext('2d');
      render(ctx2, half, state);
    }

    var mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    var quality = format === 'jpg' ? 0.95 : undefined;

    canvas.toBlob(
      function(blob) {
        if (!blob) {
          reject(new Error('Export failed'));
          return;
        }

        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'quilt-design-' + state.pattern + '-' + Date.now() + '.' + (format === 'jpg' ? 'jpg' : 'png');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(function() { URL.revokeObjectURL(url); }, 5000);

        canvas.width = 0;
        canvas.height = 0;

        resolve();
      },
      mimeType,
      quality
    );
  });
}

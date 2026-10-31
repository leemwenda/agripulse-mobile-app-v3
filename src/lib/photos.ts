import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';

// Shrinks a photo to at most 1600px on its long side as JPEG, so it stays
// well under the server's 5 MB upload limit.
export function compressDataUrl(dataUrl: string, name: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Could not process the photo.')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (b) => (b ? resolve(new File([b], name, { type: 'image/jpeg' })) : reject(new Error('Could not process the photo.'))),
        'image/jpeg',
        0.8,
      );
    };
    img.onerror = () => reject(new Error('Could not read the photo.'));
    img.src = dataUrl;
  });
}

export async function pickPhoto(prefix = 'photo'): Promise<File | null> {
  try {
    const shot = await CapCamera.getPhoto({
      quality: 80,
      width: 1600,
      correctOrientation: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      promptLabelHeader: 'Add a photo',
      promptLabelPhoto: 'Choose from gallery',
      promptLabelPicture: 'Take a photo',
    });
    if (!shot.dataUrl) return null;
    return await compressDataUrl(shot.dataUrl, `${prefix}-${Date.now()}.jpg`);
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (/cancel/i.test(msg)) return null;
    throw err;
  }
}

import { useCallback, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';

import Button from '@/components/Button/Button';
import { getCroppedImg } from '@/lib/getCroppedImg';

function ImageCropper({
  imageUrl,
  onCropDone,
}: {
  imageUrl: string | null;
  onCropDone: (blob: Blob) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleCrop = async () => {
    if (!imageUrl || !croppedAreaPixels) return;

    const blob = await getCroppedImg(imageUrl, croppedAreaPixels);
    onCropDone(blob);
  };

  return (
    <article>
      {imageUrl && (
        <>
          <div className="bg-gray05 absolute inset-0 w-full">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={1 / 1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <Button
            onClick={handleCrop}
            className="absolute bottom-10 left-1/2 z-10 w-[calc(100%-48px)] -translate-x-1/2"
          >
            사진 등록하기
          </Button>
        </>
      )}
    </article>
  );
}

export { ImageCropper };

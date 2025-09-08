
import React from 'react';
import { TrashIcon } from './icons/TrashIcon';
import { SourceImage } from '../App';

interface ImagePreviewGalleryProps {
  images: SourceImage[];
  onRemove: (index: number) => void;
}

export const ImagePreviewGallery: React.FC<ImagePreviewGalleryProps> = ({ images, onRemove }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-300 mb-3 text-center">المخططات المرفوعة ({images.length})</h3>
      <div className="flex overflow-x-auto space-x-4 p-2 bg-gray-900/50 rounded-lg border border-gray-700">
        {images.map((image, index) => (
          <div key={index} className="relative flex-shrink-0 w-32 h-32 group">
            <img src={image.base64} alt={image.name} className="w-full h-full object-cover rounded-md border-2 border-gray-600" />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center rounded-md">
              <button
                onClick={() => onRemove(index)}
                className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-100 scale-75"
                aria-label={`Remove ${image.name}`}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
            <p className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs text-center p-1 truncate rounded-b-md" title={image.name}>{image.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};


import React from 'react';

interface ImageDisplayProps {
  title: string;
  imageUrl: string;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ title, imageUrl }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-300 mb-2 text-center">{title}</h3>
      <div className="aspect-w-16 aspect-h-9 bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700">
        <img src={imageUrl} alt={title} className="object-contain w-full h-full" />
      </div>
    </div>
  );
};


import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onImageUpload: (files: File[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      onImageUpload(Array.from(files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [onImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const baseClasses = "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300";
  const inactiveClasses = "border-gray-600 bg-gray-700 hover:bg-gray-600";
  const activeClasses = "border-cyan-400 bg-cyan-900/50";

  return (
    <div className="w-full">
      <label
        htmlFor="dropzone-file"
        className={`${baseClasses} ${isDragging ? activeClasses : inactiveClasses}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadIcon className="w-10 h-10 mb-3 text-gray-400" />
          <p className="mb-2 text-sm text-gray-400">
            <span className="font-semibold text-cyan-400">انقر للتحميل</span> أو قم بسحب وإفلات الصور
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, WEBP (بحد أقصى 5 ميجابايت)</p>
        </div>
        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" multiple />
      </label>
    </div>
  );
};


import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-500"></div>
      <p className="mt-4 text-lg font-semibold text-gray-300">جاري إنشاء تحفتك المعمارية...</p>
      <p className="text-sm text-gray-400">قد تستغرق هذه العملية دقيقة أو دقيقتين.</p>
    </div>
  );
};

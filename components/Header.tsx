
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center p-4 rounded-2xl bg-gray-800/50 border border-gray-700">
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-500">
        محول المخططات المعمارية
      </h1>
      <p className="mt-3 text-lg text-gray-300 max-w-2xl mx-auto">
        حوّل رسوماتك المعمارية ثنائية الأبعاد إلى صور ثلاثية الأبعاد واقعية ومفروشة بالكامل بضغطة زر.
      </p>
    </header>
  );
};

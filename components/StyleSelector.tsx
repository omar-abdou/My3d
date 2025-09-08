import React from 'react';

export type RenderingStyle = 'realistic' | 'sketch' | 'wireframe' | 'minimalist' | 'cozy' | 'blueprint';

interface StyleSelectorProps {
  selectedStyle: RenderingStyle;
  onStyleChange: (style: RenderingStyle) => void;
}

const styles: { id: RenderingStyle; label: string }[] = [
  { id: 'realistic', label: 'واقعي' },
  { id: 'sketch', label: 'رسم تخطيطي' },
  { id: 'wireframe', label: 'إطار سلكي' },
  { id: 'minimalist', label: 'بسيط حديث' },
  { id: 'cozy', label: 'دافئ ومريح' },
  { id: 'blueprint', label: 'مخطط أزرق' },
];

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onStyleChange }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-300 mb-3 text-center">اختر نمط التصميم</h3>
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-700 p-1">
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleChange(style.id)}
            className={`w-full font-medium text-sm py-2 px-3 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
              selectedStyle === style.id
                ? 'bg-cyan-600 text-white shadow'
                : 'bg-transparent text-gray-300 hover:bg-gray-600'
            }`}
          >
            {style.label}
          </button>
        ))}
      </div>
    </div>
  );
};
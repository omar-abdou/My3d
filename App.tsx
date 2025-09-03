
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ImageDisplay } from './components/ImageDisplay';
import { Loader } from './components/Loader';
import { StyleSelector, RenderingStyle } from './components/StyleSelector';
import { generate3DRendering } from './services/geminiService';
import { fileToBase64 } from './utils/imageUtils';
import { DownloadIcon } from './components/icons/DownloadIcon';

interface SourceImage {
  base64: string;
  mimeType: string;
  name: string;
}

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<SourceImage | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [renderingStyle, setRenderingStyle] = useState<RenderingStyle>('realistic');

  const handleImageUpload = useCallback(async (file: File) => {
    setError(null);
    setGeneratedImage(null);
    try {
      const base64String = await fileToBase64(file);
      setSourceImage({
        base64: base64String,
        mimeType: file.type,
        name: file.name
      });
    } catch (err) {
      setError('فشل في قراءة ملف الصورة. الرجاء المحاولة مرة أخرى.');
    }
  }, []);

  const handleGenerate = async () => {
    if (!sourceImage) {
      setError('الرجاء تحميل صورة أولاً.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const pureBase64 = sourceImage.base64.split(',')[1];
      const resultBase64 = await generate3DRendering(pureBase64, sourceImage.mimeType, renderingStyle);
      setGeneratedImage(`data:image/png;base64,${resultBase64}`);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء إنشاء الصورة ثلاثية الأبعاد. قد تكون المشكلة في واجهة برمجة التطبيقات أو في الصورة المدخلة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = useCallback(() => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    const originalName = sourceImage?.name.split('.').slice(0, -1).join('.') || 'design';
    link.download = `${originalName}-${renderingStyle}-3d.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedImage, sourceImage, renderingStyle]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-7xl">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col items-center border border-gray-700">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">الخطوة 1: تحميل وتخصيص</h2>
            <FileUpload onImageUpload={handleImageUpload} imageName={sourceImage?.name} />
            {sourceImage && (
              <div className="w-full mt-6">
                <ImageDisplay title="المخطط الأصلي" imageUrl={sourceImage.base64} />
              </div>
            )}
             {sourceImage && (
                <div className="w-full mt-6">
                    <StyleSelector selectedStyle={renderingStyle} onStyleChange={setRenderingStyle} />
                </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={!sourceImage || isLoading}
              className="mt-6 w-full py-3 px-6 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الإنشاء...
                </>
              ) : (
                'الخطوة 2: إنشاء التصميم ثلاثي الأبعاد'
              )}
            </button>
          </div>

          {/* Output Panel */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col justify-center items-center border border-gray-700 min-h-[400px]">
            <h2 className="text-2xl font-bold text-teal-400 mb-4">النتيجة: التصميم ثلاثي الأبعاد</h2>
            {isLoading && <Loader />}
            {error && <p className="text-red-400 text-center bg-red-900/50 p-4 rounded-lg">{error}</p>}
            
            {!isLoading && !error && generatedImage && (
              <div className="w-full flex flex-col items-center">
                <ImageDisplay title="التصميم ثلاثي الأبعاد" imageUrl={generatedImage} />
                <button
                  onClick={handleDownload}
                  className="mt-6 w-full max-w-xs py-2 px-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
                  aria-label="Download generated image"
                >
                  <DownloadIcon className="w-5 h-5 ml-2" />
                  تحميل الصورة
                </button>
              </div>
            )}

            {!isLoading && !error && !generatedImage && (
              <div className="text-center text-gray-400">
                <p>سيظهر التصميم ثلاثي الأبعاد هنا بعد الإنشاء.</p>
                <p className="mt-2">قم بتحميل مخطط معماري وابدأ العملية.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;

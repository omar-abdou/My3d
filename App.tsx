import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ImageDisplay } from './components/ImageDisplay';
import { Loader } from './components/Loader';
import { StyleSelector, RenderingStyle } from './components/StyleSelector';
import { generate3DRendering, upscaleImage } from './services/geminiService';
import { fileToBase64 } from './utils/imageUtils';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { ImagePreviewGallery } from './components/ImagePreviewGallery';
import { SparklesIcon } from './components/icons/SparklesIcon';

export interface SourceImage {
  base64: string;
  mimeType: string;
  name: string;
}

const App: React.FC = () => {
  const [sourceImages, setSourceImages] = useState<SourceImage[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpscaling, setIsUpscaling] = useState<boolean>(false);
  const [isUpscaled, setIsUpscaled] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [renderingStyle, setRenderingStyle] = useState<RenderingStyle>('realistic');
  const [customInstructions, setCustomInstructions] = useState<string>('');

  const handleImageUpload = useCallback(async (files: File[]) => {
    setError(null);
    setGeneratedImage(null);
    try {
      const newImages = await Promise.all(
        files.map(async (file) => {
          const base64String = await fileToBase64(file);
          
          const match = base64String.match(/^data:(image\/(?:png|jpe?g|webp|bmp|tiff));base64,/);
          if (!match || !match[1]) {
            throw new Error(`نوع الملف '${file.name}' غير مدعوم. الرجاء تحميل ملفات PNG أو JPG أو WEBP أو BMP أو TIFF فقط.`);
          }
          const mimeType = match[1];

          return {
            base64: base64String,
            mimeType: mimeType,
            name: file.name,
          };
        })
      );
      setSourceImages((prev) => [...prev, ...newImages]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'فشل في قراءة ملفات الصور. الرجاء المحاولة مرة أخرى.';
      setError(errorMessage);
    }
  }, []);

  const handleRemoveImage = useCallback((indexToRemove: number) => {
    setSourceImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  const handleGenerate = async () => {
    if (sourceImages.length === 0) {
      setError('الرجاء تحميل صورة واحدة على الأقل أولاً.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setIsUpscaled(false); // Reset on new generation

    try {
      const imagesToProcess = sourceImages.map(img => ({
          base64ImageData: img.base64.split(',')[1],
          mimeType: img.mimeType
      }));
      const resultBase64 = await generate3DRendering(imagesToProcess, renderingStyle, customInstructions);
      setGeneratedImage(`data:image/png;base64,${resultBase64}`);
    } catch (err) {
      console.error(err);
      if (!navigator.onLine) {
        setError('فشل الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.');
      } else if (err instanceof Error) {
        if (err.message.includes("Invalid API Key")) {
          setError("مفتاح API غير صالح أو مفقود. يرجى التحقق من تكوين بيئة التشغيل.");
        } else if (err.message.includes("No image data found")) {
          setError('لم يتمكن الذكاء الاصطناعي من إنشاء صورة. جرب صورًا مختلفة أو تأكد من وضوح المخططات.');
        } else {
          setError('فشل طلب واجهة برمجة التطبيقات. قد تكون هناك مشكلة مؤقتة في الخادم. يرجى المحاولة مرة أخرى لاحقًا.');
        }
      } else {
        setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpscale = async () => {
    if (!generatedImage) return;

    setIsUpscaling(true);
    setError(null);

    try {
        const base64String = generatedImage;
        const match = base64String.match(/^data:(image\/(?:png|jpe?g|webp|bmp|tiff));base64,/);
        if (!match || !match[1]) {
            throw new Error("Invalid image format for upscaling.");
        }
        const mimeType = match[1];
        const base64ImageData = base64String.split(',')[1];
        
        const upscaledResultBase64 = await upscaleImage(base64ImageData, mimeType);
        setGeneratedImage(`data:image/png;base64,${upscaledResultBase64}`);
        setIsUpscaled(true);
    } catch (err) {
        console.error(err);
        if (!navigator.onLine) {
            setError('فشل الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.');
        } else if (err instanceof Error) {
            if (err.message.includes("Invalid API Key")) {
              setError("مفتاح API غير صالح أو مفقود. يرجى التحقق من تكوين بيئة التشغيل.");
            } else {
              setError('فشل تحسين جودة الصورة. قد تكون هناك مشكلة مؤقتة في الخادم. يرجى المحاولة مرة أخرى.');
            }
        } else {
            setError('حدث خطأ غير متوقع أثناء تحسين الجودة. يرجى المحاولة مرة أخرى.');
        }
    } finally {
        setIsUpscaling(false);
    }
  };


  const handleDownload = useCallback(() => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    const originalName = sourceImages[0]?.name.split('.').slice(0, -1).join('.') || 'design';
    const suffix = isUpscaled ? 'upscaled' : '3d-multi-view';
    link.download = `${originalName}-${renderingStyle}-${suffix}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedImage, sourceImages, renderingStyle, isUpscaled]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-7xl">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col items-center border border-gray-700">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">الخطوة 1: تحميل وتخصيص</h2>
            <FileUpload onImageUpload={handleImageUpload} />
            
            {error && <p className="mt-4 text-red-400 text-center bg-red-900/50 p-3 rounded-lg w-full">{error}</p>}

            {sourceImages.length > 0 && (
              <div className="w-full mt-6">
                <ImagePreviewGallery images={sourceImages} onRemove={handleRemoveImage} />
              </div>
            )}
            
             {sourceImages.length > 0 && (
                <div className="w-full mt-6 space-y-6">
                    <StyleSelector selectedStyle={renderingStyle} onStyleChange={setRenderingStyle} />
                    <div>
                      <label htmlFor="custom-instructions" className="block text-lg font-semibold text-gray-300 mb-3 text-center">
                        إضافة تعليمات خاصة (اختياري)
                      </label>
                      <textarea
                        id="custom-instructions"
                        rows={3}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-cyan-500 focus:border-cyan-500 transition"
                        placeholder="مثال: استخدم أرضيات خشبية فاتحة، اجعل المطبخ باللون الأزرق..."
                        value={customInstructions}
                        onChange={(e) => setCustomInstructions(e.target.value)}
                      />
                    </div>
                </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={sourceImages.length === 0 || isLoading || isUpscaling}
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
            {(isLoading || isUpscaling) && <Loader />}
            
            {!isLoading && !isUpscaling && generatedImage && (
              <div className="w-full flex flex-col items-center">
                <ImageDisplay title="التصميم ثلاثي الأبعاد" imageUrl={generatedImage} />
                 <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                    <button
                        onClick={handleDownload}
                        className="w-full sm:w-auto py-2 px-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
                        aria-label="Download generated image"
                    >
                        <DownloadIcon className="w-5 h-5 ml-2" />
                        تحميل الصورة
                    </button>
                    <button
                        onClick={handleUpscale}
                        disabled={isUpscaling || isUpscaled}
                        className="w-full sm:w-auto py-2 px-4 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
                        aria-label="Upscale generated image"
                    >
                        {isUpscaling ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            جاري التحسين...
                        </>
                        ) : isUpscaled ? (
                        <>
                            <SparklesIcon className="w-5 h-5 ml-2" />
                            تم تحسين الجودة
                        </>
                        ) : (
                        <>
                            <SparklesIcon className="w-5 h-5 ml-2" />
                            تحسين الجودة
                        </>
                        )}
                    </button>
                </div>
              </div>
            )}

            {!isLoading && !isUpscaling && !generatedImage && (
              <div className="text-center text-gray-400">
                {error && !isLoading ? (
                  <p className="text-red-400 text-center bg-red-900/50 p-4 rounded-lg">{error}</p>
                ) : (
                  <>
                    <p>سيظهر التصميم ثلاثي الأبعاد هنا بعد الإنشاء.</p>
                    <p className="mt-2">قم بتحميل مخطط معماري واحد أو أكثر لبدء العملية.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
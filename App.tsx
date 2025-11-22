import React, { useState, useRef } from 'react';
import { Upload, Eraser, Download, Wand2, Image as ImageIcon, AlertCircle, MoveHorizontal } from 'lucide-react';
import { Button } from './components/Button';
import { ComparisonSlider } from './components/ComparisonSlider';
import { removeWatermark, fileToBase64 } from './services/geminiService';
import { ProcessingStatus } from './types';

function App() {
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMessage("Please upload a valid image file.");
        return;
      }

      // Reset state
      setProcessedImage(null);
      setErrorMessage(null);
      setStatus(ProcessingStatus.UPLOADING);

      try {
        const base64 = await fileToBase64(file);
        const fullBase64 = `data:${file.type};base64,${base64}`;
        setOriginalImage(fullBase64);
        setStatus(ProcessingStatus.IDLE);
      } catch (error) {
        console.error("Error reading file:", error);
        setErrorMessage("Failed to read file. Please try again.");
        setStatus(ProcessingStatus.ERROR);
      }
    }
  };

  const handleRemoveWatermark = async () => {
    if (!originalImage) return;

    setStatus(ProcessingStatus.PROCESSING);
    setErrorMessage(null);

    try {
      // Extract raw base64 and mime type
      const [prefix, data] = originalImage.split(',');
      const mimeTypeMatch = prefix.match(/:(.*?);/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
      
      const result = await removeWatermark(data, mimeType);
      setProcessedImage(result);
      setStatus(ProcessingStatus.COMPLETED);
    } catch (error: any) {
      console.error("Gemini processing error:", error);
      setErrorMessage(error.message || "Failed to process image. The service might be busy.");
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'clearview-cleaned.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetApp = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setStatus(ProcessingStatus.IDLE);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <div className="bg-cyan-500/10 p-2 rounded-lg">
              <Eraser size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">ClearView<span className="text-cyan-400">.AI</span></span>
          </div>
          <div className="text-sm text-slate-400 hidden sm:block">
            AI-Powered Watermark Removal
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-start pt-12 px-4 pb-12">
        
        {/* Hero / Intro */}
        {!originalImage && (
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-sm font-medium mb-8">
              <Wand2 size={16} />
              <span>Powered by Google Gemini 2.5 Flash</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-6 tracking-tight">
              Vanish Watermarks <br /> Instantly.
            </h1>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              Upload your image and let our advanced AI restore the details hidden behind watermarks, logos, and text. Fast, clean, and high-quality.
            </p>
            
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
              <label className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/50 hover:bg-slate-900 hover:border-cyan-500/50 transition-all cursor-pointer">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="p-4 bg-slate-800 rounded-full mb-4 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors text-slate-400">
                    <Upload size={32} />
                  </div>
                  <p className="mb-2 text-sm text-slate-300"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-slate-500">PNG, JPG, WEBP (Max 10MB)</p>
                </div>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          </div>
        )}

        {/* Main Workspace */}
        {originalImage && (
          <div className="w-full max-w-6xl animate-fade-in">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 p-4 bg-slate-900/50 rounded-xl border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Button 
                  variant="secondary" 
                  onClick={resetApp}
                  disabled={status === ProcessingStatus.PROCESSING}
                  className="w-full sm:w-auto"
                >
                  New Image
                </Button>
                
                {!processedImage && (
                   <div className="flex items-center text-slate-400 text-sm gap-2">
                      <ImageIcon size={16} />
                      <span>Original Loaded</span>
                   </div>
                )}
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                {status === ProcessingStatus.IDLE && !processedImage && (
                  <Button 
                    onClick={handleRemoveWatermark} 
                    icon={<Wand2 size={18} />}
                    className="w-full sm:w-auto"
                  >
                    Remove Watermark
                  </Button>
                )}
                
                {status === ProcessingStatus.PROCESSING && (
                   <div className="text-cyan-400 font-medium animate-pulse flex items-center gap-2">
                      <Wand2 className="animate-spin-slow" size={18} />
                      Restoring details...
                   </div>
                )}

                {processedImage && (
                  <Button 
                    onClick={handleDownload} 
                    variant="primary"
                    icon={<Download size={18} />}
                    className="w-full sm:w-auto"
                  >
                    Download Clean Image
                  </Button>
                )}
              </div>
            </div>

            {/* Error Display */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                <AlertCircle size={20} />
                <p>{errorMessage}</p>
              </div>
            )}

            {/* Content Area */}
            <div className="relative min-h-[400px] flex items-center justify-center rounded-2xl bg-slate-950 border border-slate-800/50 p-4 sm:p-8 shadow-2xl">
              
              {/* Loading State Overlay */}
              {status === ProcessingStatus.PROCESSING && (
                <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-cyan-500">
                      <Wand2 size={24} />
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-white">Magic in progress...</h3>
                  <p className="text-slate-400 mt-2 text-sm text-center max-w-xs">
                    Analyzing pixels and reconstructing the background. This typically takes 5-10 seconds.
                  </p>
                </div>
              )}

              {/* Comparison View */}
              {processedImage ? (
                <div className="w-full flex flex-col items-center gap-6">
                  <ComparisonSlider 
                    beforeImage={originalImage} 
                    afterImage={processedImage} 
                  />
                  <p className="text-slate-400 text-sm flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-full">
                    <MoveHorizontal size={14} />
                    Drag slider to compare Original vs Clean
                  </p>
                </div>
              ) : (
                /* Single Image View (Before Processing) */
                <div className="relative w-full max-w-4xl">
                  <img 
                    src={originalImage} 
                    alt="Original Upload" 
                    className="w-full h-auto rounded-lg shadow-lg max-h-[70vh] object-contain mx-auto"
                  />
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10">
                    ORIGINAL
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} ClearView AI. Built with React & Gemini.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ApiKeyInput } from '@/components/api-key-input';
import { ImageUpload } from '@/components/image-upload';
import { InteractiveCanvas } from '@/components/interactive-canvas';
import { RightSidebar } from '@/components/right-sidebar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from 'react-compare-slider';

import type { ProcessImageResponse } from '@shared/schema';
import type { ProcessingParams } from '@/types/settings';

interface ProcessImageRequest {
  apiKey: string;
  image: string;
  mask: string;
  mimeType: string;
  params: ProcessingParams;
}

export default function Home() {
  const {
    apiKey,
    setApiKey,
    images,
    params,
    isProcessing,
    setOriginalImage,
    setMaskData,
    setProcessedImage,
    setIsProcessing,
    resetImages,
  } = useStore();

  const { toast } = useToast();

  // Load API key from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('gemini_api_key');
    if (stored) setApiKey(stored);
  }, [setApiKey]);

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const handleImageSelect = (file: File, previewUrl: string) => {
    setOriginalImage(file, previewUrl);
  };

  const handleImageRemove = () => {
    resetImages();
  };

  const handleMaskChange = (maskData: string) => {
    setMaskData(maskData);
  };

  const processMutation = useMutation({
    mutationFn: async (): Promise<ProcessImageResponse> => {
      if (!images.originalImage || !apiKey) {
        throw new Error('Missing image or API key');
      }

      if (!images.maskData) {
        throw new Error('Please draw a mask over the text areas to remove');
      }

      setIsProcessing(true);

      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(images.originalImage!);
      });

      const requestData: ProcessImageRequest = {
        apiKey,
        image: base64.split(',')[1],
        mask: images.maskData.split(',')[1],
        mimeType: images.originalImage.type,
        params,
      };

      const response = await apiRequest('POST', '/api/process-image', requestData);

      return response as unknown as ProcessImageResponse;
    },
    onSuccess: (data: ProcessImageResponse) => {
      setIsProcessing(false);
      if (data.success && data.processedImage) {
        setProcessedImage(`data:image/png;base64,${data.processedImage}`);
        toast({
          title: 'Success!',
          description: 'Your manga image has been processed successfully.',
        });
      } else {
        throw new Error(data.error || 'Processing failed');
      }
    },
    onError: (error: Error) => {
      setIsProcessing(false);
      toast({
        title: 'Processing Failed',
        description: error.message || 'An error occurred while processing the image.',
        variant: 'destructive',
      });
    },
  });

  const handleDownload = () => {
    if (!images.processedImage) return;

    const link = document.createElement('a');
    link.href = images.processedImage;
    link.download = `manga-redraw-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Downloaded!',
      description: 'Your processed manga image has been saved.',
    });
  };

  const canProcess = apiKey && images.originalImage && images.maskData && !isProcessing;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Manga Redraw Pro</h1>
                <p className="text-xs text-muted-foreground">
                  AI-Powered Text Removal & Inpainting
                </p>
              </div>
            </div>

            {images.originalPreview && !images.processedImage && (
              <Button
                size="lg"
                onClick={() => processMutation.mutate()}
                disabled={!canProcess}
                className="min-w-40"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Redraw
                  </>
                )}
              </Button>
            )}

            {images.processedImage && (
              <div className="flex gap-2">
                <Button onClick={handleDownload} size="lg">
                  Download Result
                </Button>
                <Button variant="outline" size="lg" onClick={handleImageRemove}>
                  New Image
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Photoshop-like Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Viewport (Left/Center) */}
        <div className="flex-1 flex flex-col">
          {/* API Key Section (Only show if not configured) */}
          {!apiKey && (
            <div className="p-4 space-y-3 bg-muted/30">
              <Alert>
                <AlertDescription>
                  Please configure your Gemini API key to start processing manga images.
                </AlertDescription>
              </Alert>
              <div className="flex justify-center">
                <ApiKeyInput apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
              </div>
            </div>
          )}

          {/* Canvas Area */}
          <div className="flex-1 relative">
            {!images.originalPreview && !images.processedImage && (
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="w-full max-w-2xl">
                  <ImageUpload
                    image={images.originalImage}
                    preview={images.originalPreview}
                    onImageSelect={handleImageSelect}
                    onImageRemove={handleImageRemove}
                    disabled={!apiKey || isProcessing}
                  />
                </div>
              </div>
            )}

            {images.originalPreview && !images.processedImage && (
              <InteractiveCanvas
                imageUrl={images.originalPreview}
                onMaskChange={handleMaskChange}
              />
            )}

            {images.processedImage && (
              <div className="h-full w-full overflow-auto bg-muted/20 p-8">
                <div className="w-full h-full flex flex-col items-center">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">Comparison View</h2>
                    <p className="text-sm text-muted-foreground">
                      Drag the slider to compare before and after
                    </p>
                  </div>
                  <div className="rounded-lg overflow-hidden border shadow-xl w-full max-w-none" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                    <ReactCompareSlider
                      itemOne={
                        <ReactCompareSliderImage
                          src={images.originalPreview!}
                          alt="Original"
                          style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                        />
                      }
                      itemTwo={
                        <ReactCompareSliderImage
                          src={images.processedImage}
                          alt="Processed"
                          style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                        />
                      }
                      style={{
                        height: '100%',
                        minHeight: '400px',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (320px Fixed) */}
        <RightSidebar />
      </div>
    </div>
  );
}

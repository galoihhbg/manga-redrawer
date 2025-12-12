import { useEffect } from 'react';
import { Sparkles, Pencil, RotateCcw } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ApiKeyInput } from '@/components/api-key-input';
import { ImageUpload } from '@/components/image-upload';
import { MaskCanvas } from '@/components/mask-canvas';
import { ControlSidebar } from '@/components/control-sidebar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from 'react-compare-slider';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

import type { ProcessImageResponse } from '@shared/schema';
import type { ProcessingParams } from '@/types/settings';

interface ProcessImageRequest {
  apiKey: string;
  image: string;
  mask: string;
  mimeType: string;
  model: string;
  params: ProcessingParams;
}

export default function HomeNew() {
  const {
    apiKey,
    model,
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
        model,
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

  const handleRegenerate = () => {
    if (!images.originalImage || !images.maskData) return;
    
    // Re-process with existing mask
    processMutation.mutate();
  };

  const handleEditMask = () => {
    if (!images.originalImage || !images.maskData) return;
    
    // Clear processed image to return to mask editing mode
    setProcessedImage(null);
    
    toast({
      title: 'Edit Mode',
      description: 'You can now adjust the mask before regenerating.',
    });
  };

  const canProcess = apiKey && images.originalImage && images.maskData && !isProcessing;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">MangaClean AI</h1>
                <p className="text-sm text-muted-foreground">
                  Professional Manga Text Removal & Inpainting
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full border-r">
              <ControlSidebar />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Main Canvas Area */}
          <ResizablePanel defaultSize={80}>
            <div className="h-full overflow-auto">
              <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
                {/* API Key Section */}
                {!apiKey && (
                  <Alert>
                    <AlertDescription>
                      Please configure your Gemini API key below to start processing manga images.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-center">
                  <ApiKeyInput apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
                </div>

                {/* Upload Section */}
                {!images.originalPreview && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">1. Upload Manga Image</h2>
                    <ImageUpload
                      image={images.originalImage}
                      preview={images.originalPreview}
                      onImageSelect={handleImageSelect}
                      onImageRemove={handleImageRemove}
                      disabled={!apiKey || isProcessing}
                    />
                  </div>
                )}

                {/* Masking Section */}
                {images.originalPreview && !images.processedImage && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">2. Draw Mask Over Text</h2>
                        <p className="text-sm text-muted-foreground">
                          Paint over the text areas you want to remove
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleImageRemove}
                        disabled={isProcessing}
                      >
                        Change Image
                      </Button>
                    </div>
                    <MaskCanvas
                      imageUrl={images.originalPreview}
                      onMaskChange={handleMaskChange}
                    />

                    {/* Process Button */}
                    <div className="flex justify-center pt-4">
                      <Button
                        size="lg"
                        onClick={() => processMutation.mutate()}
                        disabled={!canProcess}
                        className="min-w-48"
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
                    </div>
                  </div>
                )}

                {/* Comparison Section */}
                {images.processedImage && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">3. Compare Results</h2>
                        <p className="text-sm text-muted-foreground">
                          Drag the slider to compare before and after
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleDownload}>Download Result</Button>
                        <Button onClick={handleRegenerate} variant="default" disabled={isProcessing}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          {isProcessing ? 'Processing...' : 'Regenerate'}
                        </Button>
                        <Button onClick={handleEditMask} variant="outline">
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Mask
                        </Button>
                        <Button variant="outline" onClick={handleImageRemove}>
                          New Image
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-lg overflow-hidden border shadow-xl">
                      <ReactCompareSlider
                        itemOne={
                          <ReactCompareSliderImage
                            src={images.originalPreview!}
                            alt="Original"
                          />
                        }
                        itemTwo={
                          <ReactCompareSliderImage
                            src={images.processedImage}
                            alt="Processed"
                          />
                        }
                        style={{
                          height: '600px',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

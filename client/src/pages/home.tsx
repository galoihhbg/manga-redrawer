import { useState, useEffect } from "react";
import { Sparkles, AlertCircle } from "lucide-react";
import { ApiKeyInput } from "@/components/api-key-input";
import { ImageUpload } from "@/components/image-upload";
import { ImageComparison } from "@/components/image-comparison";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ProcessImageResponse } from "@shared/schema";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem("gemini_api_key");
    if (stored) setApiKey(stored);
  }, []);

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem("gemini_api_key", key);
  };

  const handleImageSelect = (file: File, previewUrl: string) => {
    setImage(file);
    setPreview(previewUrl);
    setProcessedImage(null);
  };

  const handleImageRemove = () => {
    setImage(null);
    setPreview(null);
    setProcessedImage(null);
  };

  const processMutation = useMutation({
    mutationFn: async (): Promise<ProcessImageResponse> => {
      if (!image || !apiKey) throw new Error("Missing image or API key");

      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(image);
      });

      const response = await apiRequest(
        "POST",
        "/api/process-image",
        {
          apiKey,
          image: base64.split(",")[1],
          mimeType: image.type,
        }
      );

      return response as unknown as ProcessImageResponse;
    },
    onSuccess: (data: ProcessImageResponse) => {
      if (data.success && data.processedImage) {
        setProcessedImage(`data:image/png;base64,${data.processedImage}`);
        toast({
          title: "Success!",
          description: "Your manga image has been processed successfully.",
        });
      } else {
        throw new Error(data.error || "Processing failed");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Processing Failed",
        description: error.message || "An error occurred while processing the image.",
        variant: "destructive",
      });
    },
  });

  const handleDownload = () => {
    if (!processedImage) return;

    const link = document.createElement("a");
    link.href = processedImage;
    link.download = `processed-manga-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded!",
      description: "Your processed manga image has been saved.",
    });
  };

  const canProcess = apiKey && image && !processMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-lg mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Manga Image Processor
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Remove text from manga images and naturally refill the removed areas using AI-powered image processing
          </p>
        </div>

        <div className="flex justify-center">
          <ApiKeyInput apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
        </div>

        {!apiKey && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please enter your Gemini API key above to start processing manga images.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Upload Manga Image</h2>
            <ImageUpload
              image={image}
              preview={preview}
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
              disabled={!apiKey || processMutation.isPending}
            />
          </div>

          {preview && (
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={() => processMutation.mutate()}
                disabled={!canProcess}
                className="min-w-48"
                data-testid="button-process-image"
              >
                {processMutation.isPending ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Process Image
                  </>
                )}
              </Button>
            </div>
          )}

          {(preview || processedImage) && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Comparison</h2>
              <ImageComparison
                originalImage={preview!}
                processedImage={processedImage || undefined}
                isProcessing={processMutation.isPending}
                onDownload={processedImage ? handleDownload : undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

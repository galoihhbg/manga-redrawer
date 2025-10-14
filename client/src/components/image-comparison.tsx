import { Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ImageComparisonProps {
  originalImage: string;
  processedImage?: string;
  isProcessing?: boolean;
  onDownload?: () => void;
}

export function ImageComparison({
  originalImage,
  processedImage,
  isProcessing = false,
  onDownload,
}: ImageComparisonProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Original</CardTitle>
          <Badge variant="secondary">Before</Badge>
        </CardHeader>
        <CardContent>
          <img
            src={originalImage}
            alt="Original manga"
            className="w-full h-auto rounded-lg shadow-xl object-contain"
            data-testid="img-original"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Processed</CardTitle>
          <Badge variant={processedImage ? "default" : "secondary"}>
            {processedImage ? "Complete" : "After"}
          </Badge>
        </CardHeader>
        <CardContent>
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center min-h-64 gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Processing your manga image...
              </p>
            </div>
          ) : processedImage ? (
            <div className="space-y-4">
              <img
                src={processedImage}
                alt="Processed manga"
                className="w-full h-auto rounded-lg shadow-xl object-contain"
                data-testid="img-processed"
              />
              {onDownload && (
                <Button
                  onClick={onDownload}
                  className="w-full"
                  data-testid="button-download"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Processed Image
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-64 border-2 border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">
                Processed image will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

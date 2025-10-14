import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  image: File | null;
  preview: string | null;
  onImageSelect: (file: File, preview: string) => void;
  onImageRemove: () => void;
  disabled?: boolean;
}

export function ImageUpload({
  image,
  preview,
  onImageSelect,
  onImageRemove,
  disabled = false,
}: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0 && !disabled) {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          onImageSelect(file, reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageSelect, disabled]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    disabled,
  });

  if (preview) {
    return (
      <Card className="relative overflow-hidden">
        <img
          src={preview}
          alt="Selected manga"
          className="w-full h-auto object-contain rounded-lg"
          data-testid="img-preview"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-4 right-4"
          onClick={onImageRemove}
          disabled={disabled}
          data-testid="button-remove-image"
        >
          <X className="h-4 w-4" />
        </Button>
      </Card>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-all duration-200
        ${isDragActive 
          ? "border-primary bg-primary/5" 
          : "border-border hover-elevate"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      data-testid="dropzone-upload"
    >
      <input {...getInputProps()} data-testid="input-file-upload" />
      <div className="flex flex-col items-center gap-4">
        {isDragActive ? (
          <>
            <Upload className="h-12 w-12 text-primary" />
            <p className="text-lg font-medium">Drop your manga image here</p>
          </>
        ) : (
          <>
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                Drag & drop your manga image here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse your files
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Supports PNG, JPG, WEBP up to 10MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}

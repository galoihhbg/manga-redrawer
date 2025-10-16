import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Undo, Trash2, Check } from "lucide-react";

interface Point {
  x: number;
  y: number;
}

interface PolygonEditorProps {
  imageUrl: string;
  onPolygonComplete: (polygons: Point[][], maskDataUrl: string) => void;
  onCancel: () => void;
}

export function PolygonEditor({ imageUrl, onPolygonComplete, onCancel }: PolygonEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPolygon, setCurrentPolygon] = useState<Point[]>([]);
  const [completedPolygons, setCompletedPolygons] = useState<Point[][]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      redrawCanvas();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const drawPolygon = (points: Point[], closed: boolean = false) => {
      if (points.length === 0) return;

      ctx.strokeStyle = "#a855f7";
      ctx.fillStyle = "rgba(168, 85, 247, 0.2)";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }

      if (closed) {
        ctx.closePath();
        ctx.fill();
      }
      
      ctx.stroke();

      points.forEach((point, i) => {
        ctx.fillStyle = i === 0 ? "#10b981" : "#a855f7";
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    completedPolygons.forEach(polygon => drawPolygon(polygon, true));
    
    if (currentPolygon.length > 0) {
      drawPolygon(currentPolygon, false);
    }
  }, [currentPolygon, completedPolygons]);

  useEffect(() => {
    if (imageLoaded) {
      redrawCanvas();
    }
  }, [imageLoaded, redrawCanvas]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (currentPolygon.length > 2) {
      const firstPoint = currentPolygon[0];
      const distance = Math.sqrt(Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2));
      
      if (distance < 10) {
        setCompletedPolygons([...completedPolygons, currentPolygon]);
        setCurrentPolygon([]);
        return;
      }
    }

    setCurrentPolygon([...currentPolygon, { x, y }]);
  };

  const handleUndo = () => {
    if (currentPolygon.length > 0) {
      setCurrentPolygon(currentPolygon.slice(0, -1));
    } else if (completedPolygons.length > 0) {
      const lastPolygon = completedPolygons[completedPolygons.length - 1];
      setCompletedPolygons(completedPolygons.slice(0, -1));
      setCurrentPolygon(lastPolygon);
    }
  };

  const handleClear = () => {
    setCurrentPolygon([]);
    setCompletedPolygons([]);
  };

  const generateMask = useCallback(() => {
    const img = imageRef.current;
    if (!img) return null;

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = img.width;
    maskCanvas.height = img.height;
    const ctx = maskCanvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    ctx.fillStyle = "white";
    [...completedPolygons, ...(currentPolygon.length > 2 ? [currentPolygon] : [])].forEach(polygon => {
      if (polygon.length < 3) return;
      
      ctx.beginPath();
      ctx.moveTo(polygon[0].x, polygon[0].y);
      for (let i = 1; i < polygon.length; i++) {
        ctx.lineTo(polygon[i].x, polygon[i].y);
      }
      ctx.closePath();
      ctx.fill();
    });

    return maskCanvas.toDataURL("image/png");
  }, [completedPolygons, currentPolygon]);

  const handleComplete = () => {
    const allPolygons = [...completedPolygons, ...(currentPolygon.length > 2 ? [currentPolygon] : [])];
    
    if (allPolygons.length === 0) {
      return;
    }

    const maskDataUrl = generateMask();
    if (maskDataUrl) {
      onPolygonComplete(allPolygons, maskDataUrl);
    }
  };

  const hasPolygons = completedPolygons.length > 0 || currentPolygon.length > 2;

  return (
    <div className="space-y-4">
      <div className="bg-muted p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Click to add points. Click near the first point (green) to close the polygon. You can draw multiple polygons.
        </p>
      </div>

      <div ref={containerRef} className="relative inline-block max-w-full">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="border border-border rounded-lg cursor-crosshair max-w-full h-auto"
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleUndo}
          disabled={currentPolygon.length === 0 && completedPolygons.length === 0}
        >
          <Undo className="h-4 w-4 mr-2" />
          Undo
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={currentPolygon.length === 0 && completedPolygons.length === 0}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>

        <div className="flex-1" />

        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          onClick={handleComplete}
          disabled={!hasPolygons}
        >
          <Check className="h-4 w-4 mr-2" />
          Process Selected Regions
        </Button>
      </div>
    </div>
  );
}

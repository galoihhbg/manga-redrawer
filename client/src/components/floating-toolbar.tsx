import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Paintbrush, 
  Eraser, 
  Undo, 
  Redo, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize 
} from 'lucide-react';

interface FloatingToolbarProps {
  // Brush controls
  tool: 'brush' | 'eraser';
  onToolChange: (tool: 'brush' | 'eraser') => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  
  // History controls
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  
  // Zoom controls
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function FloatingToolbar({
  tool,
  onToolChange,
  brushSize,
  onBrushSizeChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: FloatingToolbarProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-background/95 backdrop-blur border rounded-lg shadow-lg p-3">
      <div className="flex items-center gap-3">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1">
          <Button
            variant={tool === 'brush' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onToolChange('brush')}
            title="Brush (B)"
          >
            <Paintbrush className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === 'eraser' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onToolChange('eraser')}
            title="Eraser (E)"
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Brush Size */}
        <div className="flex items-center gap-2 min-w-[120px]">
          <Label className="text-xs text-muted-foreground">Size:</Label>
          <Slider
            value={[brushSize]}
            onValueChange={(value) => onBrushSizeChange(value[0])}
            min={5}
            max={100}
            step={5}
            className="w-20"
          />
          <span className="text-xs text-muted-foreground min-w-[30px]">{brushSize}px</span>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* History Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            title="Clear Mask"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomOut}
            title="Zoom Out (-)"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[45px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomIn}
            title="Zoom In (+)"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetZoom}
            title="Reset View (0)"
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

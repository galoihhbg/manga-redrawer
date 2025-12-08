import { useRef, useEffect, useState, useCallback } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { FloatingToolbar } from './floating-toolbar';
import { cn } from '@/lib/utils';

interface InteractiveCanvasProps {
  imageUrl: string;
  onMaskChange: (maskData: string) => void;
  className?: string;
}

export function InteractiveCanvas({ imageUrl, onMaskChange, className }: InteractiveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);

  // Load image and initialize canvases
  useEffect(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    if (!ctx || !maskCtx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      
      // Set canvas sizes to match image
      canvas.width = img.width;
      canvas.height = img.height;
      maskCanvas.width = img.width;
      maskCanvas.height = img.height;
      
      // Draw the image on base canvas
      ctx.drawImage(img, 0, 0);
      
      // Initialize mask canvas with transparent background
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      
      // Save initial state
      const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
      setHistory([imageData]);
      setHistoryIndex(0);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Export mask as base64
  const exportMask = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    // Create a new canvas for the final mask (black/white)
    const finalMaskCanvas = document.createElement('canvas');
    finalMaskCanvas.width = maskCanvas.width;
    finalMaskCanvas.height = maskCanvas.height;
    const finalCtx = finalMaskCanvas.getContext('2d');
    if (!finalCtx) return;

    // Fill with white background
    finalCtx.fillStyle = 'white';
    finalCtx.fillRect(0, 0, finalMaskCanvas.width, finalMaskCanvas.height);

    // Get mask canvas data
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;
    const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    
    // Create mask: black where drawn (semi-transparent red becomes black)
    const maskData = finalCtx.createImageData(maskCanvas.width, maskCanvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const alpha = imageData.data[i + 3];
      if (alpha > 0) {
        // Area with any opacity = mask area (black)
        maskData.data[i] = 0;
        maskData.data[i + 1] = 0;
        maskData.data[i + 2] = 0;
        maskData.data[i + 3] = 255;
      } else {
        // Transparent area (white)
        maskData.data[i] = 255;
        maskData.data[i + 1] = 255;
        maskData.data[i + 2] = 255;
        maskData.data[i + 3] = 255;
      }
    }
    
    finalCtx.putImageData(maskData, 0, 0);
    const maskBase64 = finalMaskCanvas.toDataURL('image/png');
    onMaskChange(maskBase64);
  }, [onMaskChange]);

  // Save state to history
  const saveState = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo action
  const undo = useCallback(() => {
    if (historyIndex <= 0) return;

    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    const newIndex = historyIndex - 1;
    maskCtx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
    exportMask();
  }, [historyIndex, history, exportMask]);

  // Redo action
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;

    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    const newIndex = historyIndex + 1;
    maskCtx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
    exportMask();
  }, [historyIndex, history, exportMask]);

  // Clear mask
  const clearMask = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    saveState();
    exportMask();
  }, [saveState, exportMask]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Redo: Ctrl+Shift+Z / Cmd+Shift+Z
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
      }
      // Brush tool: B
      if (e.key === 'b' || e.key === 'B') {
        setTool('brush');
      }
      // Eraser tool: E
      if (e.key === 'e' || e.key === 'E') {
        setTool('eraser');
      }
      // Space for panning
      if (e.key === ' ' && !isPanning) {
        e.preventDefault();
        setIsPanning(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [undo, redo, isPanning]);

  // Drawing functions
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas || !transformRef.current) return null;

    const rect = maskCanvas.getBoundingClientRect();
    const { state } = transformRef.current;
    
    // Account for zoom and pan
    const x = (e.clientX - rect.left - state.positionX) / state.scale;
    const y = (e.clientY - rect.top - state.positionY) / state.scale;
    
    return { x, y };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isPanning) return;

    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    const { x, y } = coords;

    if (tool === 'brush') {
      // Draw semi-transparent red for visual feedback
      maskCtx.globalCompositeOperation = 'source-over';
      maskCtx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    } else {
      // Eraser mode - remove mask
      maskCtx.globalCompositeOperation = 'destination-out';
      maskCtx.fillStyle = 'rgba(0, 0, 0, 1)';
    }

    maskCtx.beginPath();
    maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    maskCtx.fill();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
      exportMask();
    }
  };

  return (
    <div className={cn('relative w-full h-full overflow-hidden bg-checkered', className)}>
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.1}
        maxScale={10}
        wheel={{ step: 0.1 }}
        panning={{ disabled: !isPanning }}
        onZoom={(ref) => setZoom(ref.state.scale)}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <FloatingToolbar
              tool={tool}
              onToolChange={setTool}
              brushSize={brushSize}
              onBrushSizeChange={setBrushSize}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              onUndo={undo}
              onRedo={redo}
              onClear={clearMask}
              zoom={zoom}
              onZoomIn={() => zoomIn()}
              onZoomOut={() => zoomOut()}
              onResetZoom={() => resetTransform()}
            />
            
            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
                cursor: isPanning ? 'grab' : tool === 'brush' ? 'crosshair' : 'pointer',
              }}
            >
              <div className="relative inline-block">
                {/* Base image canvas */}
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0"
                  style={{ pointerEvents: 'none' }}
                />
                
                {/* Mask canvas (semi-transparent red overlay) */}
                <canvas
                  ref={maskCanvasRef}
                  className="absolute top-0 left-0"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  style={{
                    cursor: isPanning 
                      ? 'grab' 
                      : tool === 'brush' 
                        ? `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${brushSize}" height="${brushSize}"><circle cx="${brushSize/2}" cy="${brushSize/2}" r="${brushSize/2-1}" fill="none" stroke="red" stroke-width="2"/></svg>') ${brushSize/2} ${brushSize/2}, crosshair`
                        : 'pointer'
                  }}
                />
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
}

import { create } from 'zustand';
import type { RedrawMode, ProcessingParams, ModelType } from '@/types/settings';
import { PRESETS } from '@/lib/presets';

interface ImageState {
  originalImage: File | null;
  originalPreview: string | null;
  maskData: string | null; // Base64 encoded mask
  processedImage: string | null;
}

interface AppState {
  // Settings
  apiKey: string;
  model: ModelType;
  endpoint: string;
  
  // Current mode and parameters
  selectedMode: RedrawMode;
  params: ProcessingParams;
  
  // Image data
  images: ImageState;
  
  // Processing state
  isProcessing: boolean;
  
  // Actions
  setApiKey: (key: string) => void;
  setModel: (model: ModelType) => void;
  setEndpoint: (endpoint: string) => void;
  setMode: (mode: RedrawMode) => void;
  updateParams: (params: Partial<ProcessingParams>) => void;
  setOriginalImage: (file: File | null, preview: string | null) => void;
  setMaskData: (mask: string | null) => void;
  setProcessedImage: (image: string | null) => void;
  setIsProcessing: (processing: boolean) => void;
  resetImages: () => void;
}

const DEFAULT_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta';

// Get initial parameters from standard bubble preset
const initialPreset = PRESETS.standard_bubble;

export const useStore = create<AppState>((set) => ({
  // Initial settings
  apiKey: '',
  model: 'models/gemini-3-pro-image-preview',
  endpoint: DEFAULT_ENDPOINT,
  
  // Initial mode - Standard Bubble
  selectedMode: 'standard_bubble',
  params: {
    prompt: initialPreset.positivePrompt,
    negativePrompt: initialPreset.negativePrompt,
    denoisingStrength: initialPreset.denoisingStrength,
    maskBlur: initialPreset.maskBlur,
    padding: initialPreset.padding,
    maskContent: initialPreset.maskContent,
    inpaintArea: initialPreset.inpaintArea,
  },
  
  // Initial image state
  images: {
    originalImage: null,
    originalPreview: null,
    maskData: null,
    processedImage: null,
  },
  
  isProcessing: false,
  
  // Actions
  setApiKey: (key) => set({ apiKey: key }),
  
  setModel: (model) => set({ model }),
  
  setEndpoint: (endpoint) => set({ endpoint }),
  
  setMode: (mode) => set({ selectedMode: mode }),
  
  updateParams: (newParams) => set((state) => ({
    params: { ...state.params, ...newParams },
  })),
  
  setOriginalImage: (file, preview) => set((state) => ({
    images: {
      ...state.images,
      originalImage: file,
      originalPreview: preview,
      processedImage: null, // Reset processed image when new image is uploaded
    },
  })),
  
  setMaskData: (mask) => set((state) => ({
    images: { ...state.images, maskData: mask },
  })),
  
  setProcessedImage: (image) => set((state) => ({
    images: { ...state.images, processedImage: image },
  })),
  
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  
  resetImages: () => set({
    images: {
      originalImage: null,
      originalPreview: null,
      maskData: null,
      processedImage: null,
    },
  }),
}));

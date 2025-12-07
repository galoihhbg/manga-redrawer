// types/settings.ts

export type ModelType = 'nano-banana-pro' | 'stable-diffusion-standard';

export type RedrawMode = 'standard_bubble' | 'transparent_bubble' | 'narrative_box';

export interface AppSettings {
  apiKey: string;
  model: ModelType;
  endpoint: string; // Cho phép custom endpoint
}

export interface ProcessingParams {
  prompt: string;
  negativePrompt: string;
  denoisingStrength: number; // 0.0 to 1.0
  maskBlur: number; // pixels
  padding: number; // pixels
  maskContent: 'original' | 'fill' | 'latent_noise';
  inpaintArea: 'only_masked' | 'whole_picture';
}

// Preset configurations for each mode
export interface ModePreset {
  mode: RedrawMode;
  label: string;
  description: string;
  params: ProcessingParams;
}

export const MODE_PRESETS: Record<RedrawMode, ModePreset> = {
  standard_bubble: {
    mode: 'standard_bubble',
    label: 'Standard Bubble',
    description: 'White speech bubbles with standard text',
    params: {
      prompt: '(masterpiece, best quality, ultra-detailed:1.2), manga style, clean lineart, (context aware inpainting:1.4), seamless texture blending, matching surrounding background, restore background pattern, highres.',
      negativePrompt: '(text, signature, watermark, sfx):1.4, (low quality:1.4), (gray residue), (dirty spots), deformed.',
      denoisingStrength: 0.4,
      padding: 64,
      maskBlur: 4,
      maskContent: 'original',
      inpaintArea: 'only_masked',
    },
  },
  transparent_bubble: {
    mode: 'transparent_bubble',
    label: 'Transparent Bubble',
    description: 'Transparent speech bubbles overlaying artwork',
    params: {
      prompt: '(masterpiece:1.2), manga style, (translucent layer:1.3), (see-through background:1.3), visible background pattern behind text area, continuity of background lines.',
      negativePrompt: '(opaque fill:1.4), (white background fill:1.4), (solid color block), (text, sfx):1.4.',
      denoisingStrength: 0.45,
      padding: 32,
      maskBlur: 4,
      maskContent: 'original',
      inpaintArea: 'only_masked',
    },
  },
  narrative_box: {
    mode: 'narrative_box',
    label: 'Narrative Box',
    description: 'Square text boxes with heavy text',
    params: {
      prompt: '(clean inside text box:1.4), (clean rectangular box), (keep box border:1.4), manga style, clean lineart.',
      negativePrompt: '(remaining text residue:1.3), (erasing box outline:1.4), (broken border), (text):1.5.',
      denoisingStrength: 0.55,
      padding: 32,
      maskBlur: 4,
      maskContent: 'fill',
      inpaintArea: 'only_masked',
    },
  },
};

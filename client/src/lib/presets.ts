// Preset configurations for manga text removal modes
// These provide optimized parameters for different types of text areas

export interface PresetConfig {
  mode: 'standard_bubble' | 'transparent_bubble' | 'narrative_box';
  label: string;
  description: string;
  positivePrompt: string;
  negativePrompt: string;
  denoisingStrength: number;
  maskBlur: number;
  padding: number;
  maskContent: 'original' | 'fill' | 'latent_noise';
  inpaintArea: 'only_masked' | 'whole_picture';
}

export const PRESETS: Record<string, PresetConfig> = {
  standard_bubble: {
    mode: 'standard_bubble',
    label: 'Standard Bubble',
    description: 'White speech bubbles with standard text',
    positivePrompt: '(text removal only:1.5), (clean inside speech bubble:1.4), (empty text box:1.4), (keep original border:1.5), (preserve box outline), (white space preservation), (context aware inpainting), seamless texture blending, original screentones, manga style, best quality.',
    negativePrompt: '(text, kanji, sound effects, sfx, signature):1.6, (erasing border:1.6), (removing speech bubble:1.5), (blending bubble into background:1.5), (broken outline), (missing border), (distorted shape), (low quality:1.4), (jpeg artifacts), (dirty spots), (gray residue).',
    denoisingStrength: 0.4,
    maskBlur: 4,
    padding: 64,
    maskContent: 'original',
    inpaintArea: 'only_masked',
  },
  transparent_bubble: {
    mode: 'transparent_bubble',
    label: 'Transparent Bubble',
    description: 'Transparent speech bubbles overlaying artwork',
    positivePrompt: '(masterpiece:1.2), manga style, (translucent layer:1.3), (see-through background:1.3), visible background pattern behind text area, continuity of background lines',
    negativePrompt: '(opaque fill:1.4), (white background fill:1.4), (solid color block), (text, sfx):1.4',
    denoisingStrength: 0.45,
    maskBlur: 4,
    padding: 32,
    maskContent: 'original',
    inpaintArea: 'only_masked',
  },
  narrative_box: {
    mode: 'narrative_box',
    label: 'Narrative Box',
    description: 'Square text boxes with heavy text',
    positivePrompt: '(clean inside text box:1.4), (clean rectangular box), (keep box border:1.4), manga style, clean lineart',
    negativePrompt: '(remaining text residue:1.3), (erasing box outline:1.4), (broken border), (text):1.5',
    denoisingStrength: 0.55,
    maskBlur: 4,
    padding: 32,
    maskContent: 'fill',
    inpaintArea: 'only_masked',
  },
};

export type PresetKey = keyof typeof PRESETS;

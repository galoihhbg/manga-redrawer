import { useStore } from '@/store/useStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Sliders, MessageSquare } from 'lucide-react';
import { PRESETS, type PresetKey } from '@/lib/presets';

export function RightSidebar() {
  const {
    apiKey,
    model,
    endpoint,
    selectedMode,
    params,
    setModel,
    setEndpoint,
    setMode,
    updateParams,
  } = useStore();

  const handlePresetChange = (presetKey: string) => {
    const preset = PRESETS[presetKey as PresetKey];
    if (preset) {
      setMode(preset.mode);
      // Update all parameters from the preset
      updateParams({
        prompt: preset.positivePrompt,
        negativePrompt: preset.negativePrompt,
        denoisingStrength: preset.denoisingStrength,
        maskBlur: preset.maskBlur,
        padding: preset.padding,
        maskContent: preset.maskContent,
        inpaintArea: preset.inpaintArea,
      });
    }
  };

  // Find current preset key
  const currentPreset = Object.entries(PRESETS).find(
    ([_, preset]) => preset.mode === selectedMode
  )?.[0] || 'standard_bubble';

  return (
    <div className="h-full w-[320px] border-l bg-background overflow-y-auto">
      <div className="space-y-4 p-4">
        {/* Connection Settings */}
        <Card>
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4" />
              Connection
            </CardTitle>
            <CardDescription className="text-xs">
              API Key and Model ID
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="apiKey" className="text-xs">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                readOnly
                placeholder="Enter in main area"
                className="font-mono text-xs h-8"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="modelId" className="text-xs">Model ID</Label>
              <Select value={model} onValueChange={(value) => setModel(value as any)}>
                <SelectTrigger id="modelId" className="h-8 text-xs">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nano-banana-pro">Nano Banana Pro</SelectItem>
                  <SelectItem value="stable-diffusion-standard">Stable Diffusion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {apiKey && (
              <div className="text-xs text-green-500 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                Connected
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preset Selector */}
        <Card>
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4" />
              Preset Selector
            </CardTitle>
            <CardDescription className="text-xs">
              Choose a mode optimized for your text type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={currentPreset} onValueChange={handlePresetChange}>
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="standard_bubble" className="text-xs px-1 py-1.5">
                  Standard
                </TabsTrigger>
                <TabsTrigger value="transparent_bubble" className="text-xs px-1 py-1.5">
                  Transparent
                </TabsTrigger>
                <TabsTrigger value="narrative_box" className="text-xs px-1 py-1.5">
                  Box
                </TabsTrigger>
              </TabsList>

              {Object.entries(PRESETS).map(([key, preset]) => (
                <TabsContent key={key} value={key} className="mt-3">
                  <div className="text-xs space-y-1">
                    <p className="font-medium">{preset.label}</p>
                    <p className="text-muted-foreground">{preset.description}</p>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Prompt Editor - Fully Editable */}
        <Card>
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-base">Prompt Editor</CardTitle>
            <CardDescription className="text-xs">
              Edit prompts that will be sent to the API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="positivePrompt" className="text-xs font-medium">
                Positive Prompt
              </Label>
              <Textarea
                id="positivePrompt"
                value={params.prompt}
                onChange={(e) => updateParams({ prompt: e.target.value })}
                rows={6}
                className="font-mono text-xs resize-none"
                placeholder="Enter positive prompt..."
              />
              <p className="text-xs text-muted-foreground">
                This exact text will be sent to the AI model
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="negativePrompt" className="text-xs font-medium">
                Negative Prompt
              </Label>
              <Textarea
                id="negativePrompt"
                value={params.negativePrompt}
                onChange={(e) => updateParams({ negativePrompt: e.target.value })}
                rows={4}
                className="font-mono text-xs resize-none"
                placeholder="Enter negative prompt..."
              />
              <p className="text-xs text-muted-foreground">
                What to avoid in the generation
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Generation Settings */}
        <Card>
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sliders className="h-4 w-4" />
              Advanced Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="parameters" className="border-none">
                <AccordionTrigger className="py-2 text-sm">
                  Generation Parameters
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs">Denoising Strength</Label>
                      <span className="text-xs text-muted-foreground">
                        {params.denoisingStrength.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[params.denoisingStrength]}
                      onValueChange={(value) =>
                        updateParams({ denoisingStrength: value[0] })
                      }
                      min={0}
                      max={1}
                      step={0.01}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      0.0 = subtle, 1.0 = aggressive
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs">Mask Blur</Label>
                      <span className="text-xs text-muted-foreground">
                        {params.maskBlur}px
                      </span>
                    </div>
                    <Slider
                      value={[params.maskBlur]}
                      onValueChange={(value) =>
                        updateParams({ maskBlur: value[0] })
                      }
                      min={0}
                      max={64}
                      step={2}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs">Padding</Label>
                      <span className="text-xs text-muted-foreground">
                        {params.padding}px
                      </span>
                    </div>
                    <Slider
                      value={[params.padding]}
                      onValueChange={(value) =>
                        updateParams({ padding: value[0] })
                      }
                      min={0}
                      max={256}
                      step={8}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maskContent" className="text-xs">Mask Content</Label>
                    <Select
                      value={params.maskContent}
                      onValueChange={(value) =>
                        updateParams({ maskContent: value as any })
                      }
                    >
                      <SelectTrigger id="maskContent" className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">Original</SelectItem>
                        <SelectItem value="fill">Fill</SelectItem>
                        <SelectItem value="latent_noise">Latent Noise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inpaintArea" className="text-xs">Inpaint Area</Label>
                    <Select
                      value={params.inpaintArea}
                      onValueChange={(value) =>
                        updateParams({ inpaintArea: value as any })
                      }
                    >
                      <SelectTrigger id="inpaintArea" className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="only_masked">Only Masked</SelectItem>
                        <SelectItem value="whole_picture">Whole Picture</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
import type { RedrawMode, ModelType } from '@/types/settings';
import { MODE_PRESETS } from '@/types/settings';

export function ControlSidebar() {
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

  const handleModeChange = (mode: string) => {
    setMode(mode as RedrawMode);
  };

  return (
    <div className="h-full overflow-y-auto space-y-4 p-4">
      {/* API Configuration */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            API Configuration
          </CardTitle>
          <CardDescription>
            Configure your AI model settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={model} onValueChange={(value) => setModel(value as ModelType)}>
              <SelectTrigger id="model">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nano-banana-pro">Nano Banana Pro</SelectItem>
                <SelectItem value="stable-diffusion-standard">Stable Diffusion Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint">API Endpoint</Label>
            <Input
              id="endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.example.com"
              className="font-mono text-sm"
            />
          </div>

          {apiKey && (
            <div className="text-xs text-muted-foreground">
              ✓ API key configured
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mode Selector */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Redraw Mode
          </CardTitle>
          <CardDescription>
            Select the type of text removal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedMode} onValueChange={handleModeChange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="standard_bubble" className="text-xs">
                Standard
              </TabsTrigger>
              <TabsTrigger value="transparent_bubble" className="text-xs">
                Transparent
              </TabsTrigger>
              <TabsTrigger value="narrative_box" className="text-xs">
                Box
              </TabsTrigger>
            </TabsList>

            <TabsContent value="standard_bubble" className="mt-4">
              <div className="text-sm space-y-2">
                <p className="font-medium">{MODE_PRESETS.standard_bubble.label}</p>
                <p className="text-muted-foreground text-xs">
                  {MODE_PRESETS.standard_bubble.description}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="transparent_bubble" className="mt-4">
              <div className="text-sm space-y-2">
                <p className="font-medium">{MODE_PRESETS.transparent_bubble.label}</p>
                <p className="text-muted-foreground text-xs">
                  {MODE_PRESETS.transparent_bubble.description}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="narrative_box" className="mt-4">
              <div className="text-sm space-y-2">
                <p className="font-medium">{MODE_PRESETS.narrative_box.label}</p>
                <p className="text-muted-foreground text-xs">
                  {MODE_PRESETS.narrative_box.description}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sliders className="h-5 w-5" />
            Advanced Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="parameters">
              <AccordionTrigger>Processing Parameters</AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label>
                    Denoising Strength: {params.denoisingStrength.toFixed(2)}
                  </Label>
                  <Slider
                    value={[params.denoisingStrength]}
                    onValueChange={(value) =>
                      updateParams({ denoisingStrength: value[0] })
                    }
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher values = more aggressive inpainting
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Padding: {params.padding}px</Label>
                  <Slider
                    value={[params.padding]}
                    onValueChange={(value) =>
                      updateParams({ padding: value[0] })
                    }
                    min={0}
                    max={128}
                    step={8}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Extra area around masked region
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Mask Blur: {params.maskBlur}px</Label>
                  <Slider
                    value={[params.maskBlur]}
                    onValueChange={(value) =>
                      updateParams({ maskBlur: value[0] })
                    }
                    min={0}
                    max={32}
                    step={2}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Soften mask edges for blending
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maskContent">Mask Content</Label>
                  <Select
                    value={params.maskContent}
                    onValueChange={(value) =>
                      updateParams({ maskContent: value as any })
                    }
                  >
                    <SelectTrigger id="maskContent">
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
                  <Label htmlFor="inpaintArea">Inpaint Area</Label>
                  <Select
                    value={params.inpaintArea}
                    onValueChange={(value) =>
                      updateParams({ inpaintArea: value as any })
                    }
                  >
                    <SelectTrigger id="inpaintArea">
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

            <AccordionItem value="prompts">
              <AccordionTrigger>Prompt Override</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Positive Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={params.prompt}
                    onChange={(e) => updateParams({ prompt: e.target.value })}
                    rows={4}
                    className="font-mono text-xs"
                    placeholder="Enter positive prompt..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="negativePrompt">Negative Prompt</Label>
                  <Textarea
                    id="negativePrompt"
                    value={params.negativePrompt}
                    onChange={(e) =>
                      updateParams({ negativePrompt: e.target.value })
                    }
                    rows={4}
                    className="font-mono text-xs"
                    placeholder="Enter negative prompt..."
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

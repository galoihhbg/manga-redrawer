import { useState } from "react";
import { Eye, EyeOff, Key, Check, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export function ApiKeyInput({ apiKey, onApiKeyChange }: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false);
  const [localKey, setLocalKey] = useState(apiKey);
  const [isSaved, setIsSaved] = useState(!!apiKey);

  const handleSave = () => {
    onApiKeyChange(localKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const isValid = localKey.length > 0;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Key className="h-5 w-5 text-primary" />
          Gemini API Key
        </CardTitle>
        <CardDescription>
          Enter your Google Gemini API key to process manga images. Get one free at{" "}
          <a 
            href="https://aistudio.google.com/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Google AI Studio
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder="AIza..."
                className="font-mono pr-10"
                data-testid="input-api-key"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full hover-elevate"
                onClick={() => setShowKey(!showKey)}
                data-testid="button-toggle-key-visibility"
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button
              onClick={handleSave}
              disabled={!isValid}
              className="min-w-24"
              data-testid="button-save-key"
            >
              {isSaved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                "Save Key"
              )}
            </Button>
          </div>
        </div>
        {apiKey && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-green-500" />
            API key configured and ready to use
          </div>
        )}
        {!apiKey && localKey.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            Click "Save Key" to enable image processing
          </div>
        )}
      </CardContent>
    </Card>
  );
}

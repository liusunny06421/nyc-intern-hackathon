"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, Sparkles, X, Loader2, ImagePlus } from "lucide-react";
import Image from "next/image";

interface Props {
  roomNumber: string;
  dimensions?: { width: number; length: number; height: number };
  onStylesDetected: (styles: string[]) => void;
}

const STYLE_TAGS = [
  "minimalist", "cozy", "bohemian", "scandinavian", "industrial",
  "modern", "aesthetic", "vintage", "coastal", "dark academia",
];

export default function InspirationPanel({ roomNumber, dimensions, onStylesDetected }: Props) {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [detectedStyles, setDetectedStyles] = useState<string[]>([]);

  const onDrop = useCallback((accepted: File[]) => {
    const newImgs = accepted.slice(0, 6 - images.length).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImgs]);
  }, [images]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 6,
    disabled: images.length >= 6,
  });

  const removeImage = (i: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[i].preview);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleAnalyze = async () => {
    const styles = selectedStyles.length > 0 ? selectedStyles : ["modern", "minimalist"];
    setAnalyzing(true);
    // Simulate style analysis — in production, call Claude vision API
    await new Promise((r) => setTimeout(r, 1800));
    setDetectedStyles(styles);
    setAnalyzing(false);
    onStylesDetected(styles);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upload area */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">Upload Inspiration</h2>
          <p className="text-sm text-muted-foreground">
            Drop Pinterest screenshots, saved images, or anything that captures your vibe.
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-card"}
            ${images.length >= 6 ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium">
            {isDragActive ? "Drop it!" : "Drag & drop inspo images"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse · up to 6 images
          </p>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden group bg-secondary">
                <Image src={img.preview} alt={`Inspo ${i + 1}`} fill className="object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
            {images.length < 6 && (
              <div
                {...getRootProps()}
                className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Style picker */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">Pick Your Vibe</h2>
          <p className="text-sm text-muted-foreground">
            Select styles that match your aesthetic, or let us detect it from your uploads.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {STYLE_TAGS.map((style, i) => {
            const palette = [
              { bg: "var(--color-rose)",     text: "#120605", border: "var(--color-rose)" },
              { bg: "var(--color-sage)",     text: "#081008", border: "var(--color-sage)" },
              { bg: "var(--color-mustard)",  text: "#150f00", border: "var(--color-mustard)" },
              { bg: "var(--color-teal)",     text: "#00100f", border: "var(--color-teal)" },
              { bg: "var(--color-burgundy)", text: "#f0e0de", border: "var(--color-burgundy)" },
            ];
            const pal = palette[i % palette.length];
            const selected = selectedStyles.includes(style);
            return (
              <button
                key={style}
                onClick={() => toggleStyle(style)}
                className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all capitalize bg-secondary border-border hover:border-primary/50"
                style={selected ? { background: pal.bg, color: pal.text, borderColor: pal.border } : {}}
              >
                {style}
              </button>
            );
          })}
        </div>

        {detectedStyles.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" style={{ color: "var(--color-rose)" }} /> Detected style
            </p>
            <div className="flex flex-wrap gap-2">
              {detectedStyles.map((s) => (
                <Badge key={s} className="capitalize">{s}</Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Switching to Shop tab with matching furniture recommendations…
            </p>
          </div>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={analyzing || (images.length === 0 && selectedStyles.length === 0)}
          className="gap-2 mt-auto"
          size="lg"
        >
          {analyzing ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing vibe…</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Find matching furniture</>
          )}
        </Button>
      </div>
    </div>
  );
}

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { type Product } from "@/lib/store-config";

export type Customisation = {
  charmName?: string;
  colour?: string;
  size?: string;
  extra?: string;
};

const PASTEL_OPTIONS: { label: string; hex: string }[] = [
  { label: "Blush", hex: "#f9c5c5" },
  { label: "Peach", hex: "#f7d9b5" },
  { label: "Lemon", hex: "#f9f0a4" },
  { label: "Mint", hex: "#b9eabd" },
  { label: "Sky", hex: "#b5d9f7" },
  { label: "Lilac", hex: "#d9b5f7" },
  { label: "Rose", hex: "#f7b5d9" },
  { label: "White", hex: "#f5f5f0" },
  { label: "Black", hex: "#2a2a2a" },
];

const SIZES = [
  { label: "S", range: "14–15 cm" },
  { label: "M", range: "15–17 cm" },
  { label: "L", range: "17–19 cm" },
];

export function CustomisationDialog({
  open,
  onOpenChange,
  product,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: Product | null;
  onConfirm: (customisation: Customisation) => void;
}) {
  const [charmName, setCharmName] = useState("");
  const [colour, setColour] = useState<{ label: string; hex: string } | null>(null);
  const [size, setSize] = useState("M");
  const [extra, setExtra] = useState("");

  if (!product) return null;

  const handleConfirm = () => {
    onConfirm({
      charmName: charmName.trim().toUpperCase() || undefined,
      colour: colour ? colour.label : undefined,
      size,
      extra: extra.trim() || undefined,
    });
    setCharmName("");
    setColour(null);
    setSize("M");
    setExtra("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Personalise your {product.name}</DialogTitle>
          <DialogDescription>
            Fill in your preferences — these will be included with your order.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          {/* Charm name */}
          <div className="grid gap-2">
            <Label htmlFor="charm-name">
              Name / Letters for charm
              <span className="ml-1 text-[10px] text-muted-foreground">(e.g. SARA, N, MOM)</span>
            </Label>
            <Input
              id="charm-name"
              maxLength={10}
              placeholder="e.g. SARA"
              value={charmName}
              onChange={(e) => setCharmName(e.target.value)}
            />
          </div>

          {/* Colour picker */}
          <div className="grid gap-2">
            <Label>
              Colour preference
              {colour && (
                <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                  — {colour.label}
                </span>
              )}
            </Label>
            <div className="flex flex-wrap gap-2">
              {PASTEL_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColour(colour?.hex === c.hex ? null : c)}
                  className="relative h-8 w-8 rounded-full border-2 transition"
                  style={{
                    backgroundColor: c.hex,
                    borderColor: colour?.hex === c.hex ? "#000" : "transparent",
                    outline: colour?.hex === c.hex ? "2px solid #000" : "2px solid transparent",
                    outlineOffset: "2px",
                  }}
                  title={c.label}
                  aria-label={c.label}
                >
                  {colour?.hex === c.hex && (
                    <span
                      className="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
                      style={{ color: c.hex === "#2a2a2a" ? "#fff" : "#000" }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="grid gap-2">
            <Label>Size</Label>
            <div className="flex gap-2">
              {SIZES.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setSize(s.label)}
                  className={[
                    "flex flex-col items-center border px-4 py-2 transition",
                    size === s.label
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground hover:border-foreground",
                  ].join(" ")}
                >
                  <span className="text-sm font-medium">{s.label}</span>
                  <span className="text-[9px] opacity-70">{s.range}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Extra note */}
          <div className="grid gap-2">
            <Label htmlFor="extra-note">
              Anything else?
              <span className="ml-1 text-[10px] text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="extra-note"
              placeholder="e.g. gift wrap, specific bead pattern…"
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-none"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="flex-1 rounded-none" onClick={handleConfirm}>
            Add to cart →
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

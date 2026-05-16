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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { STORE, type Product } from "@/lib/store-config";
import { trackEvent } from "@/lib/analytics";
import { Mail } from "lucide-react";
import { type Customisation } from "@/components/CustomisationDialog";

type CartItem = {
  product: Product;
  qty: number;
  customisation?: Customisation;
  note?: string;
};

export function OrderDialog({
  open,
  onOpenChange,
  items,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items: CartItem[];
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0);

  const buildMessage = () => {
    const lines = [
      `New order from ${STORE.name}`,
      ``,
      `Name: ${name || "—"}`,
      `Phone: ${phone || "—"}`,
      ``,
      `Items:`,

      ...items.map((i) => {
        const c = i.customisation;

        const customLines = c
          ? [
              c.charmName ? `   Name/Letters: ${c.charmName}` : null,

              c.colour ? `   Colour: ${c.colour}` : null,

              c.size ? `   Size: ${c.size}` : null,

              c.extra ? `   Note: ${c.extra}` : null,
            ]
              .filter(Boolean)
              .join("\n")
          : null;

        return [`• ${i.product.name} × ${i.qty} — ₹${i.product.price * i.qty}`, customLines]
          .filter(Boolean)
          .join("\n");
      }),

      ``,
      `Total: ₹${total}`,

      notes ? `\nNotes: ${notes}` : "",
    ];

    return lines.join("\n");
  };

  const sendEmail = () => {
    const subject = `New order — ${STORE.name}`;

    trackEvent("order_placed", {
      total,
      item_count: items.length,
    });

    trackEvent("email_click", {
      source: "order_dialog",
    });

    const url = `mailto:${STORE.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(buildMessage())}`;

    window.location.href = url;
  };

  const disabled = items.length === 0 || !name || !phone;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Place your order</DialogTitle>

          <DialogDescription>
            Send your order directly to the atelier — pay on delivery confirmation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="n">Full name</Label>

            <Input id="n" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p">Phone</Label>

            <Input id="p" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="no">Notes (optional)</Label>

            <Textarea
              id="no"
              rows={2}
              placeholder="Custom name, color preference, gift wrap…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="rounded-sm border bg-muted/40 p-3 text-sm">
            <div className="mb-2 font-medium">Order summary</div>

            {items.length === 0 ? (
              <p className="text-muted-foreground">Your cart is empty.</p>
            ) : (
              <ul className="space-y-1">
                {items.map((i) => (
                  <li key={i.product.id} className="flex flex-col gap-1">
                    <div className="flex justify-between">
                      <span>
                        {i.product.name} × {i.qty}
                      </span>

                      <span>₹{i.product.price * i.qty}</span>
                    </div>

                    {i.customisation && (
                      <ul className="ml-2 space-y-0.5 text-[11px] text-muted-foreground">
                        {i.customisation.charmName && (
                          <li>
                            ↳ Name: <strong>{i.customisation.charmName}</strong>
                          </li>
                        )}

                        {i.customisation.colour && (
                          <li>
                            ↳ Colour: <strong>{i.customisation.colour}</strong>
                          </li>
                        )}

                        {i.customisation.size && (
                          <li>
                            ↳ Size: <strong>{i.customisation.size}</strong>
                          </li>
                        )}

                        {i.customisation.extra && <li>↳ Note: {i.customisation.extra}</li>}
                      </ul>
                    )}
                  </li>
                ))}

                <li className="mt-2 flex justify-between border-t pt-2 font-medium">
                  <span>Total</span>
                  <span>₹{total}</span>
                </li>
              </ul>
            )}
          </div>
        </div>

        <Button onClick={sendEmail} disabled={disabled} className="rounded-none">
          <Mail className="mr-2 h-4 w-4" />
          Send order via Email
        </Button>
      </DialogContent>
    </Dialog>
  );
}

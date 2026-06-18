import { useState, useRef, useEffect } from "react";

type Role = "bot" | "user";

interface Message {
  role: Role;
  text: string;
}

const QA: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["ship internationally", "international shipping", "ship worldwide", "worldwide shipping", "international"],
    answer: "Yes! We ship worldwide 🌍 Delivery details and international rates are calculated at checkout.",
  },
  {
    keywords: ["how long does shipping", "shipping take", "when will it arrive", "delivery time", "how long does it take to ship"],
    answer: "Since each piece is hand-strung in small batches, please allow 3–5 business days for us to make your charm before it ships.",
  },
  {
    keywords: ["how long does a custom", "custom order take", "how long to make", "processing time"],
    answer: "Each piece is lovingly hand-strung to order. Please allow 3–5 business days for production before your order ships.",
  },
  {
    keywords: ["custom name", "add my name", "signature", "custom text", "personalize", "personalise", "my name"],
    answer: "You can type your desired name or text right in the checkout notes, or use our interactive builder on the homepage!",
  },
  {
    keywords: ["length", "how long", "wrist size", "size of charm", "wrist charm size", "6 inch", "7 inch"],
    answer: "Our standard wrist charms are about 6–7 inches, made with a slight stretch to fit comfortably on most wrists.",
  },
  {
    keywords: ["color palette", "specific color", "color mix", "custom colors", "pastel", "pearl color", "colours"],
    answer: "Absolutely! If you want a specific mix of pearls or pastels, just leave a note for us at checkout. We love making it personal ✨",
  },
  {
    keywords: ["materials", "what are they made", "what do you use", "faux pearl", "acrylic", "beads", "cord"],
    answer: "We use high-quality faux pearls, pastel acrylic beads, durable nylon cords, and metallic letter beads.",
  },
  {
    keywords: ["waterproof", "water resistant", "swimming", "shower", "wet", "water"],
    answer: "To keep your charms looking pristine and prevent metallic letters from fading, we recommend removing them before swimming or showering.",
  },
  {
    keywords: ["change my order", "fix a typo", "modify order", "change custom text", "after ordering", "wrong name"],
    answer: "Please email us at shopnoorism@gmail.com within 2 hours of ordering if you need to fix a typo — we'll sort it right away!",
  },
  {
    keywords: ["returns", "return policy", "refund", "exchange", "return"],
    answer: "Because every item is made-to-order and personalised just for you, we cannot accept returns unless the item arrives damaged.",
  },
  {
    keywords: ["charm breaks", "cord breaks", "broken charm", "warranty", "replace", "damaged"],
    answer: "We want you to love your signature piece! If your cord breaks within 14 days of delivery, contact us and we'll replace it 🤍",
  },
  {
    keywords: ["contact", "email", "reach you", "get in touch", "customer service"],
    answer: "You can reach us at shopnoorism@gmail.com — we'll get back to you as soon as possible!",
  },
  {
    keywords: ["price", "cost", "how much", "pricing", "rate"],
    answer: "Prices vary by style and customisation. Check our shop page for the latest listings and bundle deals!",
  },
  {
    keywords: ["hi", "hello", "hey", "hiya", "howdy", "helo"],
    answer: "Hi there! Welcome to Noorism. I can help you with sizing, custom orders, or shipping info. What's on your mind? 🌸",
  },
  {
    keywords: ["thank you", "thanks", "thank u", "thx", "ty", "tysm"],
    answer: "You're very welcome! Let me know if you need anything else. Have a lovely day! 🤍",
  },
];

const WELCOME =
  "Hi! Welcome to Noorism. I'm EM, your automated assistant. How can I help you today? 🌸";

const FALLBACK =
  "That's a great question! For anything I can't answer here, feel free to reach us at shopnoorism@gmail.com and we'll be happy to help. 🤍";

const FAQ_PILLS = [
  { label: "Ship internationally?", query: "Do you ship internationally?" },
  { label: "Shipping time?", query: "How long does shipping take?" },
  { label: "Materials used?", query: "What materials do you use?" },
  { label: "Returns policy?", query: "Do you accept returns?" },
  { label: "Custom colours?", query: "Can I request a specific color palette?" },
];

function getReply(input: string): string {
  const lower = input.toLowerCase().trim();
  for (const qa of QA) {
    if (qa.keywords.some((k) => lower.includes(k))) return qa.answer;
  }
  return FALLBACK;
}

export default function EMChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [typing, setTyping] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function openChat() {
    setOpen(true);
    if (!greeted) {
      setGreeted(true);
      setTimeout(() => {
        setMessages([{ role: "bot", text: WELCOME }]);
      }, 180);
    }
    setTimeout(() => inputRef.current?.focus(), 300);
  }

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInputVal("");
    setTyping(true);
    setTimeout(
      () => {
        setTyping(false);
        setMessages((prev) => [...prev, { role: "bot", text: getReply(trimmed) }]);
      },
      700 + Math.random() * 400,
    );
  }

  function handlePill(query: string) {
    if (!open) setOpen(true);
    if (!greeted) {
      setGreeted(true);
      setMessages([{ role: "bot", text: WELCOME }]);
    }
    setTimeout(() => sendMessage(query), greeted ? 0 : 250);
  }

  return (
    <>
      {/* Chat Panel */}
      <div
        role="dialog"
        aria-label="Chat with EM, Noorism support assistant"
        aria-hidden={!open}
        style={{
          position: "fixed",
          bottom: "88px",
          right: "24px",
          zIndex: 9998,
          width: "340px",
          maxHeight: "560px",
          display: "flex",
          flexDirection: "column",
          background: "oklch(0.985 0.005 80)",
          border: "1px solid oklch(0.88 0.008 70)",
          borderRadius: "20px",
          overflow: "hidden",
          transform: open ? "scale(1) translateY(0)" : "scale(0.88) translateY(16px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "all" : "none",
          transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease",
          transformOrigin: "bottom right",
          fontFamily: "var(--font-sans, Inter, system-ui, sans-serif)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "oklch(0.22 0.01 60)",
            padding: "13px 14px 11px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontFamily: "var(--font-serif, Cormorant Garamond, serif)",
              fontSize: "16px",
              color: "oklch(0.972 0.006 80)",
              fontStyle: "italic",
              letterSpacing: "0.03em",
            }}
          >
            EM
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: 0,
                color: "oklch(0.972 0.006 80)",
                fontSize: "14px",
                fontWeight: 500,
                letterSpacing: "0.02em",
              }}
            >
              EM — Noorism Assistant
            </p>
            <p
              style={{
                margin: 0,
                color: "rgba(250,247,242,0.65)",
                fontSize: "11.5px",
              }}
            >
              Automated · Always here
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "rgba(250,247,242,0.7)",
              fontSize: "18px",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px 14px 6px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            scrollBehavior: "smooth",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: "7px",
              }}
            >
              {msg.role === "bot" && (
                <div
                  aria-hidden="true"
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "oklch(0.22 0.01 60)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-serif, serif)",
                    fontSize: "10px",
                    fontStyle: "italic",
                    color: "oklch(0.972 0.006 80)",
                  }}
                >
                  EM
                </div>
              )}
              <div
                style={{
                  maxWidth: "82%",
                  padding: "9px 13px",
                  borderRadius: msg.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                  fontSize: "13.5px",
                  lineHeight: 1.55,
                  background:
                    msg.role === "user"
                      ? "oklch(0.22 0.01 60)"
                      : "oklch(0.972 0.006 80)",
                  color:
                    msg.role === "user"
                      ? "oklch(0.972 0.006 80)"
                      : "oklch(0.22 0.01 60)",
                  border:
                    msg.role === "user"
                      ? "none"
                      : "1px solid oklch(0.88 0.008 70)",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: "7px" }}>
              <div
                aria-hidden="true"
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "oklch(0.22 0.01 60)",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-serif, serif)",
                  fontSize: "10px",
                  fontStyle: "italic",
                  color: "oklch(0.972 0.006 80)",
                }}
              >
                EM
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "14px 14px 14px 3px",
                  background: "oklch(0.972 0.006 80)",
                  border: "1px solid oklch(0.88 0.008 70)",
                  display: "flex",
                  gap: "5px",
                  alignItems: "center",
                }}
                aria-label="EM is typing"
              >
                {[0, 0.2, 0.4].map((delay, di) => (
                  <span
                    key={di}
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "oklch(0.5 0.012 60)",
                      display: "inline-block",
                      animation: `em-bounce 1.1s ${delay}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* FAQ Pills */}
        <div
          style={{
            padding: "4px 12px 8px",
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            flexShrink: 0,
          }}
        >
          {FAQ_PILLS.map((pill) => (
            <button
              key={pill.query}
              onClick={() => handlePill(pill.query)}
              style={{
                background: "oklch(0.972 0.006 80)",
                border: "1px solid oklch(0.82 0.012 70)",
                borderRadius: "20px",
                padding: "5px 11px",
                fontSize: "11.5px",
                color: "oklch(0.38 0.014 60)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background 0.15s, color 0.15s, border-color 0.15s",
                fontFamily: "var(--font-sans, Inter, sans-serif)",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = "oklch(0.22 0.01 60)";
                (e.target as HTMLButtonElement).style.color = "oklch(0.972 0.006 80)";
                (e.target as HTMLButtonElement).style.borderColor = "oklch(0.22 0.01 60)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = "oklch(0.972 0.006 80)";
                (e.target as HTMLButtonElement).style.color = "oklch(0.38 0.014 60)";
                (e.target as HTMLButtonElement).style.borderColor = "oklch(0.82 0.012 70)";
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "9px 12px 13px",
            borderTop: "1px solid oklch(0.88 0.008 70)",
            background: "oklch(0.985 0.005 80)",
            flexShrink: 0,
          }}
        >
          <input
            ref={inputRef}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage(inputVal);
            }}
            placeholder="Ask me anything…"
            aria-label="Type your message"
            style={{
              flex: 1,
              border: "1px solid oklch(0.85 0.009 70)",
              borderRadius: "20px",
              padding: "8px 14px",
              fontSize: "13px",
              background: "oklch(0.972 0.006 80)",
              color: "oklch(0.22 0.01 60)",
              outline: "none",
              fontFamily: "var(--font-sans, Inter, sans-serif)",
            }}
          />
          <button
            onClick={() => sendMessage(inputVal)}
            aria-label="Send message"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "oklch(0.22 0.01 60)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: "15px",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="oklch(0.972 0.006 80)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={openChat}
        aria-label="Chat with EM, Noorism support"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "oklch(0.22 0.01 60)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: open ? "scale(0.92)" : "scale(1)",
          transition: "transform 0.2s ease",
          fontFamily: "var(--font-serif, Cormorant Garamond, serif)",
          fontSize: "17px",
          fontStyle: "italic",
          color: "oklch(0.972 0.006 80)",
          letterSpacing: "0.03em",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = open ? "scale(0.92)" : "scale(1)";
        }}
      >
        {open ? "✕" : "EM"}
      </button>

      {/* Keyframe animation injected once */}
      <style>{`
        @keyframes em-bounce {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}

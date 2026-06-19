import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import EMChatWidget from "@/components/EMChatWidget";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Noorism — Handmade Customisable Wrist Charms" },
      {
        name: "description",
        content:
          "Noorism — handmade, customisable wrist charms hand-strung in small batches. Personalised name charms, pearl stacks and signature pieces.",
      },
      { name: "google-site-verification", content: "fuiWVyT-XRrw7ahEM9wZT7lhN3gbwAnqmdHYYW6_P9k" },
      { name: "author", content: "Noorism" },
      { name: "publisher", content: "Noorism" },
      { name: "copyright", content: "Noorism" },
      {
        name: "keywords",
        content:
          "Noorism, noorism, noorism bracelets, noorism wrist charms, wrist charms, handmade bracelets, personalised charms, custom name bracelet, pearl bracelet India, handmade jewellery India, charm bracelet, friendship bracelet, customisable bracelet, made to order jewellery, small batch jewellery, shopnoorism",
      },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { name: "googlebot", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { name: "bingbot", content: "index, follow" },
      { name: "rating", content: "general" },
      { name: "distribution", content: "global" },
      { name: "revisit-after", content: "7 days" },
      { name: "format-detection", content: "telephone=no" },
      { name: "theme-color", content: "#0a0a0a" },
      { name: "color-scheme", content: "light dark" },
      { name: "application-name", content: "Noorism" },
      { name: "apple-mobile-web-app-title", content: "Noorism" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "msapplication-TileColor", content: "#0a0a0a" },
      { name: "geo.region", content: "IN" },
      { name: "geo.placename", content: "India" },
      { property: "og:site_name", content: "Noorism" },
      { property: "og:title", content: "Noorism — Handmade Customisable Wrist Charms" },
      {
        property: "og:description",
        content: "Handmade, customisable wrist charms hand-strung in small batches.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://noorism.lovable.app" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@noorism" },
      { name: "twitter:creator", content: "@noorism" },
      { name: "twitter:title", content: "Noorism — Handmade Customisable Wrist Charms" },
      {
        name: "twitter:description",
        content: "Handmade, customisable wrist charms hand-strung in small batches.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/90c20adf-a311-4508-9b92-7cb3d82f3374/id-preview-50834981--32c41126-b034-470c-966f-3601984c7965.lovable.app-1778669203474.png",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Noorism — Handmade Customisable Wrist Charms" },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/90c20adf-a311-4508-9b92-7cb3d82f3374/id-preview-50834981--32c41126-b034-470c-966f-3601984c7965.lovable.app-1778669203474.png",
      },
      { name: "twitter:image:alt", content: "Noorism — Handmade Customisable Wrist Charms" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://noorism.lovable.app/#organization",
              name: "Noorism",
              alternateName: ["noorism", "Shop Noorism"],
              url: "https://noorism.lovable.app",
              email: "shopnoorism@gmail.com",
              description: "Handmade, customisable wrist charms hand-strung in small batches.",
              logo: {
                "@type": "ImageObject",
                url: "https://noorism.lovable.app/favicon.ico",
              },
              foundingLocation: {
                "@type": "Place",
                address: { "@type": "PostalAddress", addressCountry: "IN" },
              },
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  email: "shopnoorism@gmail.com",
                  contactType: "customer support",
                  areaServed: "IN",
                  availableLanguage: ["English", "Hindi"],
                },
              ],
              sameAs: [],
            },
            {
              "@type": "WebSite",
              "@id": "https://noorism.lovable.app/#website",
              url: "https://noorism.lovable.app",
              name: "Noorism",
              inLanguage: "en-IN",
              publisher: { "@id": "https://noorism.lovable.app/#organization" },
              potentialAction: {
                "@type": "SearchAction",
                target: "https://noorism.lovable.app/shop?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            },
            {
              "@type": "Store",
              "@id": "https://noorism.lovable.app/#store",
              name: "Noorism",
              url: "https://noorism.lovable.app/shop",
              image: "https://noorism.lovable.app/favicon.ico",
              priceRange: "₹₹",
              currenciesAccepted: "INR",
              paymentAccepted: "UPI, Bank Transfer",
              areaServed: "IN",
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();

  useEffect(() => {
    void import("@/lib/analytics").then((m) =>
      m.trackEvent("page_view", { path: location.pathname }),
    );
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      {!location.pathname.startsWith("/admin") && <EMChatWidget />}
    </QueryClientProvider>
  );
}

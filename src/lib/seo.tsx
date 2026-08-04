import {
  BRAND,
  SEO_PAGES,
  HOME_FAQ,
  absoluteUrl,
  type SeoPage,
} from "@/lib/brand";

export function pageHead(page: SeoPage, extras?: { jsonLd?: object[]; type?: "website" | "article" }) {
  const url = absoluteUrl(page.path);
  const ogImage = absoluteUrl("/og.png");
  const ogType = extras?.type ?? "website";

  const meta: Array<
    | { title: string }
    | { name: string; content: string }
    | { property: string; content: string }
  > = [
    { title: page.title },
    { name: "description", content: page.description },
    { name: "theme-color", content: BRAND.themeColor },
    { name: "referrer", content: "no-referrer" },
    { name: "application-name", content: BRAND.name },
    { property: "og:type", content: ogType },
    { property: "og:site_name", content: BRAND.name },
    { property: "og:title", content: page.title },
    { property: "og:description", content: page.description },
    { property: "og:url", content: url },
    { property: "og:image", content: ogImage },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: BRAND.twitter },
    { name: "twitter:title", content: page.title },
    { name: "twitter:description", content: page.description },
    { name: "twitter:image", content: ogImage },
  ];
  if (page.keywords) meta.push({ name: "keywords", content: page.keywords });

  const links = [
    { rel: "canonical", href: url },
    { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  ];

  const scripts =
    extras?.jsonLd?.map((data) => ({
      type: "application/ld+json" as const,
      children: JSON.stringify(data),
    })) ?? [];

  return { meta, links, scripts };
}

export function orgJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    url: absoluteUrl("/"),
    description: BRAND.tagline,
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND.name,
    url: absoluteUrl("/"),
    description: SEO_PAGES.home.description,
  };
}

export function softwareAppJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: BRAND.productWallet,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web Browser",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: SEO_PAGES.app.description,
    url: absoluteUrl("/app"),
  };
}

export function learningResourceJsonLd(page: SeoPage, teaches: string) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: page.title,
    url: absoluteUrl(page.path),
    educationalLevel: "Beginner",
    learningResourceType: "Interactive tutorial",
    teaches,
    isAccessibleForFree: true,
    provider: {
      "@type": "Organization",
      name: BRAND.name,
      url: absoluteUrl("/"),
    },
  };
}

export function faqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function articleJsonLd(page: SeoPage) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.title,
    description: page.description,
    author: { "@type": "Organization", name: BRAND.name },
    publisher: { "@type": "Organization", name: BRAND.name },
    mainEntityOfPage: absoluteUrl(page.path),
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

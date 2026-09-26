/**
 * Public site identity and URL helpers.
 *
 * Production URL resolution (in order):
 *  1. NEXT_PUBLIC_SITE_URL — set this to the canonical production origin
 *  2. VERCEL_PROJECT_PRODUCTION_URL — Vercel's production domain
 *  3. VERCEL_URL — current deployment host (preview or production)
 *
 * Localhost is used only when none of the above are present (local dev).
 * Do not treat localhost as the production metadata base.
 */

export const SITE_NAME = "Resonance";

export const SITE_TAGLINE = "Create a resume that represents your work.";

export const SITE_DESCRIPTION =
  "Create a professional resume with modern templates and a live editing experience. Start building for free — no account required.";

export const containerClass =
  "mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12";

export const routes = {
  home: "/",
  about: "/about",
  features: "/features",
  templates: "/templates",
  faq: "/faq",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
  blog: "/blog",
  signIn: "/auth/login",
  createResume: "/#create-resume",
  reportProblem: "/contact#report",
} as const;

export const publicIndexRoutes = [
  routes.home,
  routes.about,
  routes.features,
  routes.templates,
  routes.faq,
  routes.contact,
  routes.privacy,
  routes.terms,
  routes.blog,
] as const;

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return normalizeOrigin(explicit);
  }

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) {
    return normalizeOrigin(`https://${stripProtocol(vercelProduction)}`);
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return normalizeOrigin(`https://${stripProtocol(vercelUrl)}`);
  }

  return "http://localhost:3000";
}

function stripProtocol(value: string): string {
  return value.replace(/^https?:\/\//i, "");
}

function normalizeOrigin(value: string): string {
  return value.replace(/\/$/, "");
}

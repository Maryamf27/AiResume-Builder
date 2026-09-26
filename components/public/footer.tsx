import SiteLogo from "@/components/public/site-logo";
import { NavTextLink } from "@/components/public/nav-links";
import { containerClass, routes, SITE_NAME } from "@/lib/site";

const columns = [
  {
    title: "Product",
    links: [
      { href: routes.templates, label: "Templates" },
      { href: routes.features, label: "Features" },
      { href: routes.faq, label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: routes.about, label: "About" },
      { href: routes.contact, label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: routes.privacy, label: "Privacy Policy" },
      { href: routes.terms, label: "Terms & Conditions" },
    ],
  },
  {
    title: "Other",
    links: [
      { href: routes.blog, label: "Blog" },
      { href: routes.signIn, label: "Sign In" },
      { href: routes.createResume, label: "Create Resume" },
    ],
  },
] as const;

export default function PublicFooter() {
  return (
    <footer className="border-t border-cream-dark/60 bg-cream-light/40">
      <div className={`${containerClass} py-12 sm:py-14`}>
        <div className="grid gap-10 md:grid-cols-6">
          <div className="md:col-span-2">
            <SiteLogo compact />
            <p className="mt-4 max-w-xs text-sm leading-6 text-charcoal/65">
              Editorial resumes, written in your own words. Start immediately —
              no account required.
            </p>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-olive">
                {column.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <NavTextLink href={link.href}>{link.label}</NavTextLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-12 border-t border-cream-dark/60 pt-6 text-xs text-charcoal/55">
          {new Date().getFullYear()} {SITE_NAME}. A considered resume builder.
        </p>
      </div>
    </footer>
  );
}

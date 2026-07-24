import { Link } from "react-router-dom";
import { FaLinkedin, FaInstagram, FaFacebook, FaXTwitter } from "react-icons/fa6";

const quickLinks = [
  { label: "About Us", to: "/about" },
  { label: "Our Impact", to: "/impact" },
  { label: "Campaigns", to: "/campaign" },
  { label: "Donate", to: "/donate" },
  { label: "Achievements", to: "/achievements" },
  { label: "Documents", to: "/documents" },
];

const socialLinks = [
  { label: "LinkedIn", icon: FaLinkedin, href: "https://www.linkedin.com/" },
  { label: "Instagram", icon: FaInstagram, href: "https://www.instagram.com/" },
  { label: "Facebook", icon: FaFacebook, href: "https://www.facebook.com/" },
  { label: "X", icon: FaXTwitter, href: "https://x.com/" },
];

export const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-300 bg-[var(--color-brand-bg)] py-7">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="max-w-2xl">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-brand-dark)]">
              SpaceECE India Foundation
            </h3>
            <p className="mt-2 text-sm text-[var(--color-brand-dark)]/80">
              Creating meaningful change through transparent campaigns, community support,
              and measurable impact.
            </p>
          </div>

          <div className="mt-8 grid w-full gap-8 text-left md:grid-cols-2 md:justify-items-center">
            <div className="md:w-full md:max-w-xs">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-brand-dark)]">
                Quick Links
              </h3>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="text-[var(--color-brand-dark)] transition hover:text-[var(--color-brand-primary)]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="md:w-full md:max-w-xs">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-brand-dark)]">
                Follow Us
              </h3>
              <div className="mt-3 grid grid-cols-4 gap-4 text-sm w-fit">
                {socialLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col items-center text-[var(--color-brand-dark)] transition hover:text-[var(--color-brand-primary)]"
                    >
                      <span className="rounded-full border border-gray-300 p-2">
                        <IconComponent className="h-5 w-5" />
                      </span>
                      <span className="mt-1 text-[10px] uppercase tracking-wide">{link.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-300 pt-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-dark)]">
            © 2026 SpaceECE India Foundation
          </p>
        </div>
      </div>
    </footer>
  );
};

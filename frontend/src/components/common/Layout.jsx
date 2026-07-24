import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export const Layout = () => {
  return (
    // The page's default background was plain white, which is why a stark white band
    // showed up behind the floating navbar before the Hero section's own gradient
    // (which is scoped to inside HeroSection) kicks in. Setting the same cream tone
    // here means there's no seam anywhere on scroll, on this page or any other.
    <div className="flex min-h-screen flex-col" style={{ background: "var(--color-brand-bg)" }}>
      <Navbar />
      {/* The navbar is now `fixed` (floats over content instead of pushing it down), so
          every page needs its own top clearance to avoid sitting under it. This is a safe
          default for pages without a hero banner; HeroSection cancels it out with a
          matching negative margin so its own background can extend all the way to the
          top, right behind the transparent floating nav. */}
      <main className="flex-1 pt-24">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
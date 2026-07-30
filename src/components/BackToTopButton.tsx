import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const main = document.querySelector("main");

      const scrollTop =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        main?.scrollTop ||
        0;

      setIsVisible(scrollTop > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    toggleVisibility();

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      tabIndex={isVisible ? 0 : -1}
      aria-hidden={!isVisible}
      className={`fixed bottom-20 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-neon/40 bg-surface-mid text-neon shadow-lg shadow-neon/20 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-neon hover:text-on-primary hover:shadow-neon/40 focus:outline-none focus:ring-2 focus:ring-neon focus:ring-offset-2 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}

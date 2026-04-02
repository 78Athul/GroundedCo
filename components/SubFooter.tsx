export default function SubFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="py-8 px-6 bg-transparent border-t border-forest/10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <span className="font-display text-forest/40 text-2xl uppercase tracking-tighter">
          Grounded
        </span>

        {/* Links */}
        <nav className="flex items-center gap-6">
          {['Contact', 'Privacy', 'Shipping'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="font-sans font-bold text-forest/50 text-xs tracking-[0.2em] uppercase hover:text-forest transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </nav>

        {/* Copyright */}
        <span className="font-sans font-bold text-forest/30 text-xs tracking-wide">
          © {year} Grounded. All rights reserved.
        </span>
      </div>
    </footer>
  )
}

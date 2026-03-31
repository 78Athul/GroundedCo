export default function SubFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="py-8 px-6 bg-deep-obsidian border-t border-wool-white/5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <span className="font-serif text-wool-white/30 text-sm tracking-widest uppercase">
          Grounded
        </span>

        {/* Links */}
        <nav className="flex items-center gap-6">
          {['Contact', 'Privacy', 'Shipping'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="font-sans text-wool-white/30 text-xs tracking-widest uppercase hover:text-wool-white/60 transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </nav>

        {/* Copyright */}
        <span className="font-sans text-wool-white/20 text-xs">
          © {year} Grounded. All rights reserved.
        </span>
      </div>
    </footer>
  )
}

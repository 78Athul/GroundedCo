export default function SubFooter() {
  const year = new Date().getFullYear()

  const links = [
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Shipping', href: '/shipping' },
  ]

  return (
    <footer data-nav-theme="light" className="py-8 px-6 bg-transparent border-t border-forest/10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <span className="font-display text-forest/40 text-2xl uppercase tracking-tighter">
          Grounded
        </span>

        {/* Links */}
        <nav className="flex items-center gap-6">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-sans font-bold text-forest/50 text-xs tracking-[0.2em] uppercase hover:text-forest transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Copyright + Admin */}
        <div className="flex items-center gap-4">
          <span className="font-sans font-bold text-forest/30 text-xs tracking-wide">
            © {year} Grounded. All rights reserved.
          </span>
          <a
            href="/admin/login"
            className="font-sans font-bold text-forest/20 text-xs tracking-[0.2em] uppercase hover:text-forest/50 transition-colors duration-200"
          >
            Admin
          </a>
        </div>
      </div>
    </footer>
  )
}

import Link from 'next/link'
import { createAnonServerClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Contact — Grounded',
  description: 'Reach out to the Grounded team. We\'d love to hear from you.',
}

interface ContactSettings {
  brand_name: string
  tagline: string
  email: string
  whatsapp: string
  location: string
  story_text: string
}

const FALLBACK: ContactSettings = {
  brand_name: 'Grounded Rugs and Carpets LLP',
  tagline: 'Woven from heritage, designed for you.',
  email: 'hello@grounded.com',
  whatsapp: '',
  location: 'India',
  story_text: '',
}

async function getContactSettings(): Promise<ContactSettings> {
  try {
    const supabase = createAnonServerClient()
    const { data, error } = await supabase
      .from('contact_settings')
      .select('*')
      .limit(1)
      .single()
    if (error || !data) return FALLBACK
    return data as ContactSettings
  } catch {
    return FALLBACK
  }
}

export default async function ContactPage() {
  const contact = await getContactSettings()

  return (
    <main className="min-h-screen bg-cream">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-forest/8">
        <div className="max-w-5xl mx-auto px-6 md:px-12 flex items-center justify-between h-14">
          <Link
            href="/"
            className="font-sans font-bold text-forest/50 text-[10px] tracking-[0.2em] uppercase hover:text-forest transition-colors duration-200 flex items-center gap-2 shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back Home
          </Link>
          <span className="font-display text-forest text-sm uppercase tracking-tighter absolute left-1/2 -translate-x-1/2">
            {contact.brand_name || 'Grounded'}
          </span>
          <div className="w-20 shrink-0" />
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 md:px-12 pt-24 pb-12 text-center">
        <p className="font-sans font-bold text-forest/40 text-[10px] tracking-[0.3em] uppercase mb-8">
          Woven from Heritage, Designed for You
        </p>
        <h1 className="font-display text-forest text-[13vw] sm:text-[10vw] md:text-[8vw] uppercase tracking-tighter leading-none mb-10">
          Get in Touch
        </h1>
        <p className="font-sans text-forest/50 text-base leading-relaxed max-w-lg mx-auto">
          To be grounded, you have to know who you are, where you come from, and what you are up to.
        </p>
      </section>

      {/* Cards */}
      <section className="max-w-3xl mx-auto px-6 md:px-12 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 justify-center">

          {/* WhatsApp */}
          {contact.whatsapp && (
            <a
              href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl bg-cream shadow-lg shadow-forest/10 border border-deep-obsidian/5 p-10 flex flex-col items-center text-center transition-all duration-500 hover:shadow-xl"
            >
              {/* Forest fill slides up */}
              <div className="absolute inset-0 bg-forest translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-2xl" />

              {/* Icon */}
              <div className="relative z-10 w-12 h-12 rounded-full border border-forest/20 group-hover:border-sage/30 bg-cream group-hover:bg-forest/30 flex items-center justify-center mb-6 transition-colors duration-500">
                <svg className="w-5 h-5 text-forest group-hover:text-sage transition-colors duration-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.103 1.518 5.829L.057 23.885a.5.5 0 00.611.61l6.056-1.462A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.788 9.788 0 01-5.02-1.384l-.36-.213-3.731.901.92-3.619-.235-.372A9.79 9.79 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
                </svg>
              </div>

              <h3 className="relative z-10 font-display text-forest group-hover:text-cream text-3xl uppercase tracking-tighter mb-2 transition-colors duration-500">
                WhatsApp
              </h3>
              <p className="relative z-10 font-sans font-bold text-forest/40 group-hover:text-sage/70 text-[10px] tracking-[0.22em] uppercase mb-6 transition-colors duration-500">
                Chat with Us Directly
              </p>
              <p className="relative z-10 font-sans text-forest/60 group-hover:text-cream/80 text-sm transition-colors duration-500">
                {contact.whatsapp}
              </p>
            </a>
          )}

          {/* Email */}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="group relative overflow-hidden rounded-2xl bg-cream shadow-lg shadow-forest/10 border border-deep-obsidian/5 p-10 flex flex-col items-center text-center transition-all duration-500 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-forest translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-2xl" />

              <div className="relative z-10 w-12 h-12 rounded-full border border-forest/20 group-hover:border-sage/30 bg-cream group-hover:bg-forest/30 flex items-center justify-center mb-6 transition-colors duration-500">
                <svg className="w-5 h-5 text-forest group-hover:text-sage transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>

              <h3 className="relative z-10 font-display text-forest group-hover:text-cream text-3xl uppercase tracking-tighter mb-2 transition-colors duration-500">
                Email
              </h3>
              <p className="relative z-10 font-sans font-bold text-forest/40 group-hover:text-sage/70 text-[10px] tracking-[0.22em] uppercase mb-6 transition-colors duration-500">
                We Reply Within 24 Hours
              </p>
              <p className="relative z-10 font-sans text-forest/60 group-hover:text-cream/80 text-sm break-all transition-colors duration-500">
                {contact.email}
              </p>
            </a>
          )}

          {/* Location (full width if alone, card style) */}
          {contact.location && (
            <div className="group relative overflow-hidden rounded-2xl bg-[#eeeee4] p-10 flex flex-col items-center text-center transition-all duration-500 hover:shadow-xl">
              <div className="absolute inset-0 bg-forest translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-2xl" />

              <div className="relative z-10 w-12 h-12 rounded-full border border-forest/20 group-hover:border-sage/30 bg-cream group-hover:bg-forest/30 flex items-center justify-center mb-6 transition-colors duration-500">
                <svg className="w-5 h-5 text-forest group-hover:text-sage transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>

              <h3 className="relative z-10 font-display text-forest group-hover:text-cream text-3xl uppercase tracking-tighter mb-2 transition-colors duration-500">
                Location
              </h3>
              <p className="relative z-10 font-sans font-bold text-forest/40 group-hover:text-sage/70 text-[10px] tracking-[0.22em] uppercase mb-6 transition-colors duration-500">
                Find Us
              </p>
              <p className="relative z-10 font-sans text-forest/60 group-hover:text-cream/80 text-sm transition-colors duration-500">
                {contact.location}
              </p>
            </div>
          )}

        </div>

        {/* Story */}
        {contact.story_text && (
          <div className="mt-20 pt-16 border-t border-forest/10 text-center">
            <p className="font-sans font-bold text-forest/40 text-xs tracking-[0.25em] uppercase mb-8">Our Story</p>
            <div className="max-w-2xl mx-auto space-y-4">
              {contact.story_text.split('\n').filter(Boolean).map((para, i) => (
                <p key={i} className="font-sans text-forest/60 text-base leading-relaxed">{para}</p>
              ))}
            </div>
          </div>
        )}
      </section>

    </main>
  )
}

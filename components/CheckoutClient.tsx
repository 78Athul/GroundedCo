'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Script from 'next/script'
import { useRouter } from 'next/navigation'
import type { FeaturedProduct } from '@/data/products'

// ─── Types ────────────────────────────────────────────────────
declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void }
  }
}

interface CustomerAddress {
  name: string
  email: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  pincode: string
  notes: string
}

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh',
  'Dadra & Nagar Haveli and Daman & Diu','Delhi','Jammu and Kashmir','Ladakh',
  'Lakshadweep','Puducherry',
]

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount)
}

// ─── Step indicator ────────────────────────────────────────────
function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
            step === s ? 'bg-deep-obsidian text-wool-white' :
            step > s  ? 'bg-forest text-wool-white' :
                        'bg-deep-obsidian/10 text-deep-obsidian/40'
          }`}>
            {step > s ? '✓' : s}
          </div>
          <span className={`text-xs font-sans font-bold tracking-wider uppercase ${
            step === s ? 'text-deep-obsidian' : 'text-deep-obsidian/30'
          }`}>
            {s === 1 ? 'Address' : 'Review & Pay'}
          </span>
          {s < 2 && <div className="w-8 h-px bg-deep-obsidian/15 mx-1" />}
        </div>
      ))}
    </div>
  )
}

// ─── Input helper ─────────────────────────────────────────────
function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-sans text-xs font-bold tracking-[0.15em] uppercase text-deep-obsidian/50">
        {label}{required && <span className="text-muted-earth ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = `w-full font-sans text-sm text-deep-obsidian bg-transparent border border-deep-obsidian/20
  px-4 py-3 focus:outline-none focus:border-forest transition-colors duration-200 placeholder:text-deep-obsidian/25`

// ─── Step 1: Address Form ──────────────────────────────────────
function AddressStep({
  value,
  onChange,
  onNext,
  quantity,
  maxQty,
  onQtyChange,
  price,
}: {
  value: CustomerAddress
  onChange: (v: CustomerAddress) => void
  onNext: () => void
  quantity: number
  maxQty: number
  onQtyChange: (q: number) => void
  price: number
}) {
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerAddress, string>>>({})
  const [showDetails, setShowDetails] = useState(false)
  const [mounted, setMounted] = useState(false)
  const backdropDownTarget = useRef<EventTarget | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!showDetails) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowDetails(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [showDetails])

  function set(field: keyof CustomerAddress, val: string) {
    onChange({ ...value, [field]: val })
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }))
  }

  function validate(): boolean {
    const e: Partial<Record<keyof CustomerAddress, string>> = {}
    if (!value.name.trim())         e.name = 'Required'
    if (!value.email.trim() || !/\S+@\S+\.\S+/.test(value.email)) e.email = 'Valid email required'
    if (!value.phone.trim() || value.phone.replace(/\D/g,'').length < 10) e.phone = '10-digit mobile required'
    if (!value.addressLine1.trim()) e.addressLine1 = 'Required'
    if (!value.city.trim())         e.city = 'Required'
    if (!value.state.trim())        e.state = 'Required'
    if (!value.pincode.trim() || !/^\d{6}$/.test(value.pincode)) e.pincode = '6-digit pincode required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (validate()) {
      setShowDetails(false)
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <StepIndicator step={1} />

      {/* Quantity */}
      <div className="flex items-center justify-between py-3 border-y border-deep-obsidian/10">
        <span className="font-sans text-xs font-bold tracking-[0.15em] uppercase text-deep-obsidian/50">Quantity</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onQtyChange(Math.max(1, quantity - 1))}
            className="w-8 h-8 flex items-center justify-center border border-deep-obsidian/20 text-deep-obsidian hover:border-forest transition-colors"
          >−</button>
          <span className="font-sans font-bold text-sm w-6 text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => onQtyChange(Math.min(maxQty, quantity + 1))}
            className="w-8 h-8 flex items-center justify-center border border-deep-obsidian/20 text-deep-obsidian hover:border-forest transition-colors"
          >+</button>
        </div>
      </div>

      <p className="font-sans text-xs font-bold text-deep-obsidian/40 tracking-wider uppercase -mt-3">
        Total: <span className="text-deep-obsidian">{formatINR(price * quantity)}</span>
      </p>

      <button
        type="button"
        onClick={() => setShowDetails(true)}
        className="w-full font-sans text-xs tracking-[0.2em] uppercase bg-deep-obsidian text-wool-white py-4 hover:bg-forest transition-colors duration-300"
      >
        Buy Now →
      </button>

      {showDetails && mounted && createPortal(
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
        onPointerDown={(e) => { backdropDownTarget.current = e.target }}
        onPointerUp={(e) => {
          if (backdropDownTarget.current === e.currentTarget && e.target === e.currentTarget) {
            setShowDetails(false)
          }
          backdropDownTarget.current = null
        }}
      >
      <div
        className="bg-wool-white max-w-2xl w-full max-h-[90vh] overflow-y-auto overscroll-contain p-6 sm:p-8 space-y-6 relative"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setShowDetails(false)}
          className="absolute top-3 right-4 text-deep-obsidian/50 hover:text-deep-obsidian text-2xl leading-none"
          aria-label="Close"
        >×</button>

      {/* Contact */}
      <div>
        <p className="font-sans text-xs font-bold tracking-[0.2em] uppercase text-forest mb-4">Contact</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" required>
            <input className={inputCls} value={value.name} onChange={e => set('name', e.target.value)} placeholder="Arjun Kumar" />
            {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
          </Field>
          <Field label="Email" required>
            <input className={inputCls} type="email" value={value.email} onChange={e => set('email', e.target.value)} placeholder="arjun@email.com" />
            {errors.email && <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>}
          </Field>
          <Field label="Phone" required>
            <input className={inputCls} type="tel" value={value.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
            {errors.phone && <p className="text-xs text-red-500 mt-0.5">{errors.phone}</p>}
          </Field>
        </div>
      </div>

      {/* Address */}
      <div>
        <p className="font-sans text-xs font-bold tracking-[0.2em] uppercase text-forest mb-4">Shipping Address</p>
        <div className="grid grid-cols-1 gap-4">
          <Field label="Address Line 1" required>
            <input className={inputCls} value={value.addressLine1} onChange={e => set('addressLine1', e.target.value)} placeholder="House / Flat No., Street Name" />
            {errors.addressLine1 && <p className="text-xs text-red-500 mt-0.5">{errors.addressLine1}</p>}
          </Field>
          <Field label="Address Line 2">
            <input className={inputCls} value={value.addressLine2} onChange={e => set('addressLine2', e.target.value)} placeholder="Landmark, Area (optional)" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City" required>
              <input className={inputCls} value={value.city} onChange={e => set('city', e.target.value)} placeholder="Kozhikode" />
              {errors.city && <p className="text-xs text-red-500 mt-0.5">{errors.city}</p>}
            </Field>
            <Field label="Pincode" required>
              <input className={inputCls} value={value.pincode} maxLength={6} onChange={e => set('pincode', e.target.value.replace(/\D/g,''))} placeholder="673001" />
              {errors.pincode && <p className="text-xs text-red-500 mt-0.5">{errors.pincode}</p>}
            </Field>
          </div>
          <Field label="State" required>
            <select className={inputCls} value={value.state} onChange={e => set('state', e.target.value)}>
              <option value="">Select state…</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.state && <p className="text-xs text-red-500 mt-0.5">{errors.state}</p>}
          </Field>
          <Field label="Order Notes">
            <textarea className={`${inputCls} resize-none`} rows={2} value={value.notes} onChange={e => set('notes', e.target.value)} placeholder="Special delivery instructions (optional)" />
          </Field>
        </div>
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="w-full font-sans text-xs tracking-[0.2em] uppercase bg-deep-obsidian text-wool-white py-4 hover:bg-forest transition-colors duration-300"
      >
        Continue to Payment →
      </button>
      </div>
      </div>,
      document.body
      )}
    </div>
  )
}

// ─── Step 2: Review + Pay ──────────────────────────────────────
function ReviewStep({
  address,
  product,
  quantity,
  onBack,
}: {
  address: CustomerAddress
  product: FeaturedProduct
  quantity: number
  onBack: () => void
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePayment = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: product.price * quantity * 100,
          productId: product.id,
          productName: product.name,
          quantity,
          customer: {
            name: address.name,
            email: address.email,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            notes: address.notes,
          },
        }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Failed to create order')
      }

      const order = await res.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'Grounded',
        description: product.name,
        order_id: order.id,
        prefill: {
          name: address.name,
          email: address.email,
          contact: address.phone,
        },
        notes: { product_id: product.id },
        theme: { color: '#01472e' },
        modal: { ondismiss: () => setLoading(false) },
        handler: async (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) => {
          try {
            const confirmRes = await fetch('/api/orders/confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                productId: product.id,
                quantity,
              }),
            })
            const confirmData = await confirmRes.json()
            const ref = confirmData.order_ref ?? order.order_ref
            router.push(`/order-confirmation?ref=${ref}&product=${encodeURIComponent(product.name)}&amount=${product.price * quantity}`)
          } catch (err) {
            console.error('Order confirm error:', err)
            router.push('/order-confirmation?ref=unknown')
          }
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error('Razorpay error:', err)
      alert(err instanceof Error ? err.message : 'Payment failed. Please try again.')
      setLoading(false)
    }
  }

  const addressLines = [
    address.addressLine1,
    address.addressLine2,
    `${address.city}, ${address.state} — ${address.pincode}`,
  ].filter(Boolean)

  return (
    <div className="space-y-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <StepIndicator step={2} />

      {/* Order summary */}
      <div className="bg-deep-obsidian/5 p-5 space-y-2">
        <p className="font-sans text-xs font-bold tracking-[0.2em] uppercase text-deep-obsidian/40 mb-3">Order Summary</p>
        <div className="flex justify-between items-start">
          <div>
            <p className="font-sans font-bold text-sm text-deep-obsidian">{product.name}</p>
            <p className="font-sans text-xs text-deep-obsidian/50">Qty: {quantity}</p>
          </div>
          <p className="font-sans font-bold text-sm text-deep-obsidian">{formatINR(product.price * quantity)}</p>
        </div>
        <div className="border-t border-deep-obsidian/10 pt-2 flex justify-between">
          <span className="font-sans text-xs text-deep-obsidian/50">Shipping</span>
          <span className="font-sans text-xs font-bold text-forest">Free</span>
        </div>
        <div className="flex justify-between">
          <span className="font-sans font-bold text-sm text-deep-obsidian">Total</span>
          <span className="font-sans font-bold text-sm text-deep-obsidian">{formatINR(product.price * quantity)}</span>
        </div>
      </div>

      {/* Address recap */}
      <div className="border border-deep-obsidian/10 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="font-sans text-xs font-bold tracking-[0.2em] uppercase text-deep-obsidian/40">Shipping To</p>
          <button type="button" onClick={onBack} className="font-sans text-xs text-muted-earth hover:text-forest transition-colors">
            Edit
          </button>
        </div>
        <p className="font-sans font-bold text-sm text-deep-obsidian">{address.name}</p>
        <p className="font-sans text-xs text-deep-obsidian/60 mt-0.5">{address.phone} · {address.email}</p>
        <p className="font-sans text-xs text-deep-obsidian/60 mt-1">{addressLines.join(', ')}</p>
        {address.notes && <p className="font-sans text-xs text-muted-earth mt-1 italic">Note: {address.notes}</p>}
      </div>

      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className="w-full font-sans text-xs tracking-[0.2em] uppercase bg-deep-obsidian text-wool-white py-4 hover:bg-forest transition-colors duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Processing…
          </>
        ) : (
          `Pay ${formatINR(product.price * quantity)} →`
        )}
      </button>

      <p className="font-sans text-deep-obsidian/30 text-xs text-center tracking-wider">
        Secure checkout · Razorpay · All taxes included
      </p>
    </div>
  )
}

// ─── Main export ───────────────────────────────────────────────
export default function CheckoutClient({ product }: { product: FeaturedProduct }) {
  const [step, setStep] = useState<1 | 2>(1)
  const [quantity, setQuantity] = useState(1)
  const [address, setAddress] = useState<CustomerAddress>({
    name: '', email: '', phone: '',
    addressLine1: '', addressLine2: '',
    city: '', state: '', pincode: '', notes: '',
  })

  const maxQty = product.stockCount ?? 0

  if (maxQty === 0) {
    return (
      <div className="space-y-4">
        <div className="w-full text-center font-sans text-xs tracking-[0.2em] uppercase bg-deep-obsidian/20 text-deep-obsidian/40 py-4 cursor-not-allowed">
          Out of Stock
        </div>
        <p className="font-sans text-deep-obsidian/30 text-xs text-center tracking-wider">
          Join our waitlist — contact us to be notified
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="font-sans text-xs tracking-wider mb-4">
        <span className="text-amber-600 font-bold">Only {maxQty} left</span>
        <span className="text-deep-obsidian/40"> — Secure yours!</span>
      </p>

      {step === 1 ? (
        <AddressStep
          value={address}
          onChange={setAddress}
          onNext={() => setStep(2)}
          quantity={quantity}
          maxQty={maxQty}
          onQtyChange={setQuantity}
          price={product.price}
        />
      ) : (
        <ReviewStep
          address={address}
          product={product}
          quantity={quantity}
          onBack={() => setStep(1)}
        />
      )}
    </div>
  )
}

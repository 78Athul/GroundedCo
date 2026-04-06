import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { paymentId, orderId, signature, productId, quantity } = (await req.json()) as {
      paymentId?: string
      orderId?: string
      signature?: string
      productId?: string
      quantity?: number
    }

    if (!paymentId || !orderId || !signature) {
      return NextResponse.json({ error: 'Missing payment verification fields' }, { status: 400 })
    }

    // Validate Razorpay signature server-side
    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      console.error('RAZORPAY_KEY_SECRET not set')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Update order status to paid in Supabase
    const supabase = createServerClient()
    const { data, error: dbError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        razorpay_payment_id: paymentId,
      })
      .eq('razorpay_order_id', orderId)
      .select('order_ref, product_id, quantity')
      .single()

    if (dbError) {
      console.error('Failed to update order status:', dbError)
    }

    // Auto-decrement stock on successful payment
    if (data?.product_id) {
      const qty = data.quantity ?? quantity ?? 1

      // Get current stock
      const { data: product } = await supabase
        .from('featured_products')
        .select('stock_count')
        .eq('id', data.product_id)
        .single()

      const currentStock = product?.stock_count ?? 0
      const newStock = Math.max(0, currentStock - qty)

      // Update stock_count
      await supabase
        .from('featured_products')
        .update({ stock_count: newStock })
        .eq('id', data.product_id)

      // Insert stock_entries audit record
      await supabase.from('stock_entries').insert({
        product_id: data.product_id,
        admin_email: 'system@grounded.in',
        change_type: 'sale',
        delta: -qty,
        new_total: newStock,
        notes: `Auto: Order ${data.order_ref} — Razorpay ${paymentId}`,
      }).then(({ error }) => {
        if (error) console.error('Stock entry insert failed:', error)
      })
    }

    return NextResponse.json({
      success: true,
      order_ref: data?.order_ref ?? null,
      productId: data?.product_id ?? productId,
      quantity: data?.quantity ?? quantity,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

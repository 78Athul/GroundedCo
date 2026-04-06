import { NextRequest, NextResponse } from 'next/server'
import { getRazorpay } from '@/lib/razorpay'
import { createServerClient } from '@/lib/supabase/server'

function generateOrderRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous chars (0,O,1,I)
  let ref = 'GRD-'
  for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)]
  return ref
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      amount: number
      productId: string
      productName: string
      quantity: number
      customer: {
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
    }

    const { amount, productId, productName, quantity, customer } = body

    if (!amount || amount < 100) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const orderRef = generateOrderRef()
    const razorpay = getRazorpay()

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: orderRef,
      notes: { productId, orderRef } as Record<string, string>,
    })

    // Save pending order to Supabase using service role
    const supabase = createServerClient()
    const { error: dbError } = await supabase.from('orders').insert({
      order_ref: orderRef,
      razorpay_order_id: order.id,
      product_id: productId,
      product_name: productName,
      quantity,
      amount_paise: amount,
      status: 'pending',
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      address_line1: customer.addressLine1,
      address_line2: customer.addressLine2,
      address_city: customer.city,
      address_state: customer.state,
      address_pincode: customer.pincode,
      notes: customer.notes,
    })

    if (dbError) {
      console.error('Supabase insert failed:', JSON.stringify(dbError))
      return NextResponse.json(
        { error: `Failed to save order: ${dbError.message} (code: ${dbError.code})` },
        { status: 500 }
      )
    }


    return NextResponse.json({ ...order, order_ref: orderRef })
  } catch (err) {
    const rzpErr = err as { error?: { description?: string } }
    const message = err instanceof Error
      ? err.message
      : rzpErr?.error?.description ?? 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

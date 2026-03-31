import { NextRequest, NextResponse } from 'next/server'
import { getRazorpay } from '@/lib/razorpay'

export async function POST(req: NextRequest) {
  try {
    const { amount, productId } = (await req.json()) as {
      amount: number      // in paise (rupees × 100)
      productId: string
    }

    if (!amount || amount < 100) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const razorpay = getRazorpay()

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${productId}_${Date.now()}`,
      notes: { productId } as Record<string, string>,
    })

    return NextResponse.json(order)
  } catch (err) {
    const rzpErr = err as { error?: { description?: string } }
    const message = err instanceof Error
      ? err.message
      : rzpErr?.error?.description ?? 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

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

    // TODO: validate Razorpay signature server-side once public and secret keys are configured.
    // This placeholder ensures the endpoint exists and avoids 404 from client payment confirmation.

    return NextResponse.json({ success: true, productId, quantity })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

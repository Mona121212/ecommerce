import { NextResponse } from "next/server";
import { stripe } from "../../../_utils/stripe";

export async function POST(req) {
  try {
    const { amount } = await req.json();

    const cleanAmount = Number(amount);
    if (!Number.isFinite(cleanAmount) || cleanAmount < 50) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: cleanAmount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}

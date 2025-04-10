// stripeController.ts
import express, { Request, Response } from "express";
import Stripe from "stripe";
import db from '../db/db.Config';
import {
  getAllPayment,
  getOnePayment,
  updatePayment,
  createPayment,
  deletePayment,
} from "../queries/paymentQueries";

import { updateUser } from "../queries/user";

const Payments = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});


export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  console.log("⚡ Webhook received!");

  try {
    const event = stripe.webhooks.constructEvent(
      req.body, // raw body (buffer)
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "payment_intent.created") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const userId = parseInt(paymentIntent.metadata.user_id);

      const user = await db.oneOrNone(
        'SELECT id, is_premium FROM users WHERE id = $1',
        [userId]
      );

      if (user && !user.is_premium) {
        console.log("⏳ Updating user to premium...");
        await updateUser(userId, { is_premium: true });
        console.log("✅ User should be updated");
      }

      await updatePayment(paymentIntent.id, "succeeded");

      res.json({ received: true });
    } else {
      console.log("Unhandled event type:", event.type);
      res.json({ received: true });
    }
  } catch (err) {
    console.error("Webhook Error:", err);
    res.status(400).send("Webhook error");
  }
};


Payments.post("/", async (req: Request, res: Response) => {
  try {
    const { user_id, amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
      metadata: { user_id: user_id.toString() },
    });

    await createPayment({
      user_id,
      amount,
      stripe_payment_intent_id: paymentIntent.id,
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent", error);
    res.status(500).send("Internal server error");
  }
});

export default Payments;

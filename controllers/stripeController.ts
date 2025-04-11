// stripeController.ts
import express, { Request, Response } from "express";
import Stripe from "stripe";
import db from "../db/db.Config";
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
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET! 
    );

    
    if (event.type === "payment_intent.created") {
   
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      
      const userId = parseInt(paymentIntent.metadata.user_id);

     
      const user = await db.oneOrNone(
        "SELECT id, is_premium FROM users WHERE id = $1",
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

//Create Payments

Payments.post("/", async (req: Request, res: Response) => {
  try {
   
    const { user_id, amount, metadata = {} } = req.body;

    
    const fullMetadata = {
      user_id: user_id.toString(),
      ...metadata, 
    };

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, 
      currency: "usd",
      metadata: fullMetadata, 
    });

    
    await createPayment({
      user_id,
      amount,
      stripe_payment_intent_id: paymentIntent.id,
      metadata: fullMetadata,
    });

  
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
 
    console.error("Error creating payment intent", error);
    res.status(500).send("Internal server error");
  }
});

//Get all payments details
Payments.get("/", async (req: Request, res: Response) => {
  try {
    const allPayment = await getAllPayment();
    res.status(200).json({ success: true, payload: allPayment });
  } catch (error) {
    console.error("Error getting payment information", error);
    throw error;
  }
});

//Get one payment detail
Payments.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const onePayment = await getOnePayment(Number(id));
    if (onePayment) {
      res.status(200).json({ success: true, payload: onePayment });
    } else {
      res.status(404).json({ succcess: false, error: "Payment not Found" });
    }
  } catch (error) {
    console.error("Error getting one payment", error);
    res.status(500).json({ success: false, error: "Internal error" });
  }
});
//Delete Payment
Payments.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedPayment = await deletePayment(Number(id));
    if (deletedPayment) {
      res.status(200).json({ success: true, payload: deletedPayment });
    } else {
      res
        .status(404)
        .json({ success: false, error: "Deleted Payment NOT FOUND" });
    }
  } catch (error) {
    console.error("Error deleting payment", error);
    res
      .status(500)
      .json({ success: false, error: "Internal Issues deleting payment" });
  }
});


export default Payments;

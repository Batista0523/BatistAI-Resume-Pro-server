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
// Handles incoming Stripe webhook events
export const handleStripeWebhook = async (req: Request, res: Response) => {
  // Retrieve Stripe signature from request headers for verification
  const sig = req.headers["stripe-signature"] as string;
  console.log("⚡ Webhook received!");

  try {
    // Construct the Stripe event using the raw request body and signature
    const event = stripe.webhooks.constructEvent(
      req.body, // Raw body buffer required for Stripe webhook verification
      sig,
      process.env.STRIPE_WEBHOOK_SECRET! // Secret used to validate Stripe webhook authenticity
    );

    // Listen for the "payment_intent.created" event type
    if (event.type === "payment_intent.created") {
      // Extract the PaymentIntent object from the event payload
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // Parse the user ID from metadata attached during payment intent creation
      const userId = parseInt(paymentIntent.metadata.user_id);

      // Check if the user exists and whether they're already a premium user
      const user = await db.oneOrNone(
        "SELECT id, is_premium FROM users WHERE id = $1",
        [userId]
      );

      // If user exists and is not premium, upgrade them
      if (user && !user.is_premium) {
        console.log("⏳ Updating user to premium...");
        await updateUser(userId, { is_premium: true }); // Update user's premium status in DB
        console.log("✅ User should be updated");
      }

      // Mark the payment as succeeded in the local database
      await updatePayment(paymentIntent.id, "succeeded");

      // Respond to Stripe to acknowledge successful receipt of the webhook
      res.json({ received: true });
    } else {
      // For other event types, log and acknowledge without taking further action
      console.log("Unhandled event type:", event.type);
      res.json({ received: true });
    }
  } catch (err) {
    // Handle any errors in processing the webhook (e.g. invalid signature)
    console.error("Webhook Error:", err);
    res.status(400).send("Webhook error");
  }
};

//Create Payments
// Endpoint to create a new Stripe PaymentIntent and store it in the database
Payments.post("/", async (req: Request, res: Response) => {
  try {
    // Extract user ID, amount, and optional metadata from the request body
    const { user_id, amount, metadata = {} } = req.body;

    // Combine the required user_id with any additional metadata (e.g., plan: "premium")
    const fullMetadata = {
      user_id: user_id.toString(),
      ...metadata, // Enables attaching custom info like plan type to the payment
    };

    // Create a new Stripe PaymentIntent with the given amount and metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency: "usd",
      metadata: fullMetadata, // Attach all metadata to the Stripe payment
    });

    // Persist the payment information in your database, including metadata
    await createPayment({
      user_id,
      amount,
      stripe_payment_intent_id: paymentIntent.id,
      metadata: fullMetadata,
    });

    // Return the client secret to the frontend so they can complete the payment
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    // Handle errors (e.g., Stripe errors or DB failures)
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

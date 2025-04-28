// // stripeController.ts
// import express, { Request, Response } from "express";
// import Stripe from "stripe";
// import db from "../db/db.Config";
// import {
//   getAllPayment,
//   getOnePayment,
//   updatePayment,
//   createPayment,
//   deletePayment,
// } from "../queries/paymentQueries";

// import { updateUser } from "../queries/user";

// const Payments = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2023-10-16" as any,
// });

// export const handleStripeWebhook = async (req: Request, res: Response) => {
//   const sig = req.headers["stripe-signature"] as string;


//   try {
//     const event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET!
//     );
//     console.log("✅ Webhook signature verified, event type:", event.type);
//     if (event.type === "payment_intent.succeeded") {
//       const paymentIntent = event.data.object as Stripe.PaymentIntent;
//       const userId = parseInt(paymentIntent.metadata.user_id);

     

//       const user = await db.oneOrNone(
//         "SELECT id, is_premium FROM users WHERE id = $1",
//         [userId]
//       );

   

//       if (user && !user.is_premium) {
//         console.log("⏳ Updating user to premium...");
//         const updated = await updateUser(userId, { is_premium: true });
//         console.log("✅ Update result:", updated);
//       } else {
//         console.log("⚠️ User already premium or not found.");
//       }

//       await updatePayment(paymentIntent.id, "succeeded");

//       res.json({ received: true });
//     } else {
//       console.log("Unhandled event type:", event.type);
//       res.json({ received: true });
//     }
//   } catch (err) {
//     console.error("Webhook Error:", err);
//     res.status(400).send("Webhook error");
//   }
// };

// //Create Payments

// Payments.post("/", async (req: Request, res: Response) => {
//   try {
//     const { user_id, amount, metadata = {} } = req.body;

//     const fullMetadata = {
//       user_id: user_id.toString(),
//       ...metadata,
//     };

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amount * 100,
//       currency: "usd",
//       metadata: fullMetadata,
//     });

//     await createPayment({
//       user_id,
//       amount,
//       stripe_payment_intent_id: paymentIntent.id,
//       metadata: fullMetadata,
//     });

//     res.send({ clientSecret: paymentIntent.client_secret });
//   } catch (error) {
//     console.error("Error creating payment intent", error);
//     res.status(500).send("Internal server error");
//   }
// });

// //Get all payments details
// Payments.get("/", async (req: Request, res: Response) => {
//   try {
//     const allPayment = await getAllPayment();
//     res.status(200).json({ success: true, payload: allPayment });
//   } catch (error) {
//     console.error("Error getting payment information", error);
//     throw error;
//   }
// });

// //Get one payment detail
// Payments.get("/:id", async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const onePayment = await getOnePayment(Number(id));
//     if (onePayment) {
//       res.status(200).json({ success: true, payload: onePayment });
//     } else {
//       res.status(404).json({ succcess: false, error: "Payment not Found" });
//     }
//   } catch (error) {
//     console.error("Error getting one payment", error);
//     res.status(500).json({ success: false, error: "Internal error" });
//   }
// });
// //Delete Payment
// Payments.delete("/:id", async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const deletedPayment = await deletePayment(Number(id));
//     if (deletedPayment) {
//       res.status(200).json({ success: true, payload: deletedPayment });
//     } else {
//       res
//         .status(404)
//         .json({ success: false, error: "Deleted Payment NOT FOUND" });
//     }
//   } catch (error) {
//     console.error("Error deleting payment", error);
//     res
//       .status(500)
//       .json({ success: false, error: "Internal Issues deleting payment" });
//   }
// });

// export default Payments;
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
  // 1) Cabecera de firma y body crudo para verificar que Stripe realmente llama
  console.log("🔐 stripe-signature:", sig);
  console.log("📬 raw body (primeros 200 chars):", req.body.toString().slice(0, 200));

  let event: Stripe.Event;
  try {
    // 2) Verificamos la firma
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("✅ Webhook signature verified, event type:", event.type);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    // 3) Detalles del PaymentIntent
    console.log("💰 payment_intent.succeeded:", paymentIntent.id, "livemode?", paymentIntent.livemode);
    console.log("🔍 metadata:", paymentIntent.metadata);

    const userId = parseInt(paymentIntent.metadata.user_id);
    console.log("👤 Parsed user_id from metadata:", userId);

    try {
      // 4) Fetch user en la base de datos
      const user = await db.oneOrNone(
        "SELECT id, is_premium FROM users WHERE id = $1",
        [userId]
      );
      console.log("📋 User record fetched:", user);

      if (user && !user.is_premium) {
        console.log("⏳ Updating user to premium...");
        const updatedUser = await updateUser(userId, { is_premium: true });
        console.log("✅ updateUser result:", updatedUser);
      } else {
        console.log("⚠️ User already premium or not found, skipping update.");
      }

      // 5) Actualizamos el registro de pago
      const updatedPayment = await updatePayment(paymentIntent.id, "succeeded");
      console.log("💾 updatePayment result:", updatedPayment);

    } catch (dbErr) {
      console.error("❌ Database error during webhook handling:", dbErr);
      // No interrumpimos la respuesta a Stripe, pero sí queda marcado en tus logs.
    }

    return res.json({ received: true });
  }

  // Otros eventos que podrías manejar
  console.log("⚠️ Unhandled event type:", event.type);
  res.json({ received: true });
};

// ... el resto de tu código (rutas POST /, GET /, etc.) no cambia

export default Payments;
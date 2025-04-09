import db from "../db/db.Config";

export interface Payment {
  id?: number;
  user_id: number;
  amount: number;
  currency?: string;
  stripe_payment_intent_id?: string;
  status?: any;
  metadata?: any;
  created_at?: string;
}

// Get all Payments
const getAllPayment = async (): Promise<Payment[]> => {
  try {
    const allPayment = await db.any<Payment>("SELECT * FROM payments");
    return allPayment;
  } catch (err) {
    console.error("Error getting all payments", err);
    throw err;
  }
};

// Get one payment
const getOnePayment = async (id: number): Promise<Payment | null> => {
  try {
    const onePayment = await db.oneOrNone<Payment>(
      "SELECT * FROM payments WHERE id=$1",
      [id]
    );
    return onePayment;
  } catch (err) {
    console.error("Error getting one payment", err);
    throw err;
  }
};

// Create a new payment register
const createPayment = async (payment: Payment): Promise<Payment> => {
  try {
    const {
      user_id,
      amount,
      currency = "usd",
      stripe_payment_intent_id,
      status = "pending",
      metadata,
    } = payment;

    const createdPayment = await db.one<Payment>(
      "INSERT INTO payments (user_id, amount, currency, stripe_payment_intent_id, status, metadata) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
      [user_id, amount, currency, stripe_payment_intent_id, status, metadata]
    );
    return createdPayment;
  } catch (err) {
    console.error("Unable to make the payment", err);
    throw err;
  }
};

// Update the payment
const updatePayment = async (
  stripe_payment_intent_id: string,
  newStatus: string
): Promise<Payment> => {
  try {
    const updatedPayment = await db.one<Payment>(
      `UPDATE payments
         SET status = $1
         WHERE stripe_payment_intent_id = $2
         RETURNING *`,
      [newStatus, stripe_payment_intent_id]
    );
    return updatedPayment;
  } catch (err) {
    console.error("Error updating payment status", err);
    throw err;
  }
};

// Delete payment
const deletePayment = async (id: number): Promise<Payment | null> => {
  try {
    const deletedPayment = await db.oneOrNone<Payment>(
      "DELETE FROM payments WHERE id=$1 RETURNING *",
      [id]
    );
    return deletedPayment;
  } catch (err) {
    console.error("Error deleting payment", err);
    throw err;
  }
};

export {
  getAllPayment,
  getOnePayment,
  updatePayment,
  createPayment,
  deletePayment,
};

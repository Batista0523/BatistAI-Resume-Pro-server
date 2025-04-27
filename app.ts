import express, { Request, Response } from "express";
import cors from "cors";
import User from "./controllers/userController";
import Resume from "./controllers/resumeControllers";
import Optimize from "./controllers/openAIOptimizedController";
import Payments, { handleStripeWebhook } from "./controllers/stripeController";

const app = express();


app.post(
  "/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// Middlewares for other routes
app.use(cors());
app.use(express.json()); 

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Resume Optimizer API");
});

app.use("/users", User);
app.use("/resumes", Resume);
app.use("/optimize", Optimize);
app.use("/payments", Payments); 

export default app;

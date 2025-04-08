import express, { Request, Response } from "express";
import cors from "cors";  // Import CORS with types
import User from "./controllers/userController";
import Resume from "./controllers/resumeControllers";  
import Optimize from "./controllers/openAIOptimizedController";

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Routes setup
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Resume Optimizer API");
});

app.use("/users", User);  // Users route
app.use("/resumes", Resume);  // Resumes route
app.use("/optimize", Optimize );  // Optimize route

export default app;

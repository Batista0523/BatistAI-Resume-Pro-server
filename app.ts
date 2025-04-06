import express, { Request, Response } from "express";  // Import express and types
import cors from "cors";  // Import CORS with types

const app = express();  // Create an Express app

// Middleware setup
app.use(cors());  // Use CORS for handling cross-origin requests
app.use(express.json());  // Parse JSON request bodies

// Define your routes
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Resume Optimizer API");
});

// Add other routes here
// Example for a resume optimization route
app.post("/optimize", (req: Request, res: Response) => {
  const { resume } = req.body;
  // Imagine calling an AI function to optimize the resume here
  res.send({ message: "Resume optimized successfully!", optimizedResume: resume });
});

export default app;  // Export the app as default

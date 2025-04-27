import express, { Router, Request, Response } from "express";
import { optimizeResumeWithAI } from "../services/openaiService";
import db from "../db/db.Config";

const Optimize: Router = express.Router();

interface PremiumUser {
  is_premium: boolean;
}

Optimize.post("/", async (req: Request, res: Response): Promise<void> => {
  const { resume, userId } = req.body;

  if (!resume || !userId ) {
    res.status(400).json({ success: false, error: "Missing resume or userId" });
    return;
  }

  const numericUserId = Number(userId );
  if (isNaN(numericUserId)) {
    res
      .status(400)
      .json({
        success: false,
        error: "Invalid userId Backend recieved userId as a string",
      });
    return;
  }

  try {

    const user = await db.oneOrNone<PremiumUser>(
      "SELECT is_premium FROM users WHERE id = $1",
      [numericUserId]
    );

    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }
 
    if (!user.is_premium) {
      res.status(403).json({
        success: false,
        error: "Access denied. You must be a premium user to use this feature.",
      });
      return;
    }

    const result = await optimizeResumeWithAI(resume);
 
    res.status(200).json({
      message: "Resume optimized successfully!",
      optimizedResume: result.optimized_text,
      feedback: result.feedback,
    });

  } catch (error) {
    console.error("Error optimizing resume:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default Optimize;

import express, { Router, Request, Response } from "express";
import { optimizeResumeWithAI } from "../services/openaiService";
import db from "../db/db.Config";

const Optimize: Router = express.Router();
//Define the type of user is supposed to recieve from data base
interface PremiumUser {
  is_premium: boolean;
}

Optimize.post("/", async (req: Request, res: Response): Promise<void> => {
  const { resume, userId } = req.body;
  //Check if there is resume and user
  if (!resume || !userId) {
    res.status(400).json({ success: false, error: "Missing resume or userId" });
    return;
  }
  // Fucntion to convert userId to number and check if the userId is string then return error
  const numericUserId = Number(userId);
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
    //Look the user in the data base
    const user = await db.oneOrNone<PremiumUser>(
      "SELECT is_premium FROM users WHERE id = $1",
      [numericUserId]
    );
    // If the user does not exist return error
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }
    //Check if the user is premium if not then denied the access
    if (!user.is_premium) {
      res.status(403).json({
        success: false,
        error: "Access denied. You must be a premium user to use this feature.",
      });
      return;
    }
    //If everything is good call the function that communicate with OpenAI to optimize the resume
    const result = await optimizeResumeWithAI(resume);
    //Send the response optimized
    res.status(200).json({
      message: "Resume optimized successfully!",
      optimizedResume: result.optimized_text,
      feedback: result.feedback,
    });
    //Catch errors
  } catch (error) {
    console.error("Error optimizing resume:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default Optimize;

import express, { Request, Response } from "express";
import {
  getAllResumes,
  getOneResume,
  updateResume,
  createResume,
  deleteResume,
  getResumesByUserId
} from "../queries/resumeQueries";
import { optimizeResumeWithAI } from "../services/openaiService";
const Resume = express.Router();


Resume.post("/:id/optimize", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { original_text } = req.body;

  try {
    const { optimized_text, feedback } = await optimizeResumeWithAI(original_text);

    const updated = await updateResume(Number(id), {
      optimized_text,
      feedback,
    });

    if (updated) {
      res.status(200).json({
        success: true,
        optimized_text,
        feedback,
      });
    } else {
      res.status(404).json({ success: false, error: "Resume not found" });
    }
  } catch (err) {
    console.error("Error optimizing resume:", err);
    res.status(500).json({ success: false, error: "Internal error optimizing resume" });
  }
});


//Get all Resume
Resume.get("/", async (req: Request, res: Response) => {
  try {
    const allResume = await getAllResumes();
    res.status(200).json({ success: true, payload: allResume });
  } catch (err) {
    console.error("Error getting all resume", err);
    res
      .status(500)
      .json({ success: false, error: "Internal error getting resume" });
  }
});

//Get One Resume
Resume.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const oneResume = await getOneResume(Number(id));
    if (oneResume) {
      res.status(200).json({ success: true, payload: oneResume });
    } else {
      res.status(404).json({ success: false, error: "Resume not found" });
    }
  } catch (err) {
    console.error("Error getting one resume", err);
    res
      .status(500)
      .json({ success: false, error: "internal error getting resume" });
  }
});

//Create Resume
Resume.post("/", async (req: Request, res: Response) => {
  try {
    const createdResume = await createResume(req.body);
    res.status(200).json({ success: true, payload: createdResume });
  } catch (err) {
    console.error("Error creating resume", err);
    res
      .status(400)
      .json({ success: false, error: "Internal error creating resume" });
  }
});
//Delete Resume
Resume.delete("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
  try {
    const deletedResume = await deleteResume(Number(id));
    if (deletedResume) {
      res.status(200).json({ success: true, payload: deletedResume });
    } else {
      res.status(404).json({ success: false, error: "resume not found" });
    }
  } catch (err) {
    console.error("Error Deleting resume", err);
    res
      .status(500)
      .json({ success: false, error: "Internal error deleting resume" });
  }
});
//Update Resume
Resume.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedResume = await updateResume(Number(id), req.body);
    if (updatedResume) {
      res.status(200).json({ success: true, payload: updatedResume });
    } else {
      res.status(404).json({ success: false, error: "resume not found" });
    }
  } catch (err) {
    console.error("Error updating resume", err);
    res.status(500).json({ success: false, error: "Internal error" });
  }
});

// Get Resume by User ID
Resume.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const resume = await getResumesByUserId(Number(userId));
    if (resume) {
      res.status(200).json({ success: true, payload: resume });
    } else {
      res.status(404).json({ success: false, error: "Resume not found for this user" });
    }
  } catch (err) {
    console.error("Error getting resume by user", err);
    res.status(500).json({ success: false, error: "Internal error getting resume by user" });
  }
});


export default Resume;

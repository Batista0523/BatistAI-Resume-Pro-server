import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

interface OptimizeResumeResponse {
  optimized_text: string;
  feedback: string;
}

export const optimizeResumeWithAI = async (
  originalText: string
): Promise<OptimizeResumeResponse> => {
  try {
   
    const OPENAI_API_KEY = process.env.OPENAI_KEY;
    if (!OPENAI_API_KEY) throw new Error("OpenAI API key is missing.");

 
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo", 
        messages: [
          {
            role: "system",
            content:
              "You are a professional career coach and resume optimizer.",
          },
          {
            role: "user",
            content: `Please improve the following resume and provide two things:\n
            1. The optimized resume.
            2. Specific feedback on how it was improved and what could be added to make it even stronger.\n\n
            Resume:\n${originalText}`,
          },
        ],
        max_tokens: 800, 
        temperature: 0.7, 
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`, 
        },
      }
    );
   
    const content = response.data.choices[0].message.content.trim();
    
    const [optimizedPart, feedbackPart] = content.split(/Feedback:/i); 
    const optimized_text = optimizedPart
      .replace(/^Optimized Resume:/i, "")
      .trim();
    const feedback = feedbackPart
      ? feedbackPart.trim()
      : "No detailed feedback provided.";

    return { optimized_text, feedback };
  } catch (error) {
    console.error("Error optimizing resume with OpenAI:", error);
    throw new Error("Failed to optimize resume.");
  }
};

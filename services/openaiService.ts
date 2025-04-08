import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
// Define the expected structure of the response returned by the function
interface OptimizeResumeResponse {
  optimized_text: string;
  feedback: string;
}
// Function to send the resume to OpenAI and receive optimization + feedback
export const optimizeResumeWithAI = async (
  originalText: string
): Promise<OptimizeResumeResponse> => {
  try {
    // Get the OpenAI API key from environment variables
    const OPENAI_API_KEY = process.env.OPENAI_KEY;
    if (!OPENAI_API_KEY) throw new Error("OpenAI API key is missing.");

    // Make a POST request to the OpenAI API with the  prompt and configuration
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo", // Using the GPT-3.5 model for generating text
        messages: [
          {
            role: "system",
            content:
              "You are a professional career coach and resume optimizer.", // Tells the AI what role to play
          },
          {
            role: "user",
            content: `Please improve the following resume and provide two things:\n
            1. The optimized resume.
            2. Specific feedback on how it was improved and what could be added to make it even stronger.\n\n
            Resume:\n${originalText}`, // The prompt including the user's original resume
          },
        ],
        max_tokens: 800, // Max tokens (length of the AI response)
        temperature: 0.7, // Temperature affects randomness (0.7 = balanced creativity)
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`, // Auth header for OpenAI
        },
      }
    );
    // Extract the content from the response
    const content = response.data.choices[0].message.content.trim();
    // Split the result into optimized text and feedback
    const [optimizedPart, feedbackPart] = content.split(/Feedback:/i); // /i in a regular expression makes the match case-insensitive FEEDBACK = feedback 
    const optimized_text = optimizedPart
      .replace(/^Optimized Resume:/i, "")// /^ indicate the start of the string 
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

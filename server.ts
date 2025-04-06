import app from "./app";  // Use ES6 import syntax
import dotenv from "dotenv";  // Import dotenv for environment variable management

dotenv.config();  // Load environment variables from .env file

const PORT = process.env.PORT || 9090;  // Set port from environment variables or default to 9090

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

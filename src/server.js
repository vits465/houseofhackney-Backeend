import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

import app from "./app.js";
import connectDatabase from "./config/Database.js";

const PORT = process.env.PORT || 5000;

// Connect Database
connectDatabase();

// Start Server
    app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
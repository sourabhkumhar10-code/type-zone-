const path = require("path");
const dotenv = require("dotenv");

// Load environment variables from the project root `.env` if present.
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const config = {
  port: Number(process.env.PORT) || 3001,
  jwtSecret: process.env.JWT_SECRET || "replace-this-secret-in-production",
  tokenExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  dbPath:
    process.env.DB_PATH ||
    path.resolve(__dirname, "..", "data", "typezone.sqlite"),
  
  // Email configuration (optional - for production password reset)
  emailEnabled: process.env.EMAIL_ENABLED === "true",
  emailHost: process.env.EMAIL_HOST || "smtp.gmail.com",
  emailPort: Number(process.env.EMAIL_PORT) || 587,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  emailFrom: process.env.EMAIL_FROM || "TypeZone <noreply@typezone.com>",
  appUrl: process.env.APP_URL || "http://localhost:3001",
};

module.exports = config;



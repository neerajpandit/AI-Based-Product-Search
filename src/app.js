import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import routes from "./routes/routes.js";
import helmet from "helmet";
import { setupLogger } from "./utils/logger.js";

const app = express();
const IS_PROD = process.env.NODE_ENV === "production";
const ENV = {
  CORS_ORIGIN: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : [],
};

const logger = setupLogger(app);
// Trust proxy
app.set("trust proxy", 1);
// Security: Remove powered-by header
app.disable("x-powered-by");

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ENV.CORS_ORIGIN.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-CSRF-Token",
      "x-signature",
    ],
  }),
);

// Middlewares
// Parsers
app.use(express.json({ limit: process.env.EXPRESS_JSON_LIMIT || "10mb" }));
app.use(express.urlencoded({ extended: true, limit: process.env.EXPRESS_URLENCODED_LIMIT || "10mb" }));

// Cookie parser
app.use(
  cookieParser(process.env.COOKIE_SECRET_KEY, {
    httpOnly: true,
    secure: IS_PROD === "true",
    sameSite: "strict",
  })
);

// Helmet Security Middleware
app.use(helmet({ xPoweredBy: true }));
app.use(
  helmet({
    crossOriginEmbedderPolicy: true,
    hidePoweredBy: true,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://trusted.cdn.com",
        ],
        objectSrc: ["'none'"],
        imgSrc: ["'self'", "data:", "blob:"],
        styleSrc: ["'self'"],
        connectSrc: [
          "'self'",
          process.env.FRONTEND_BASE_URL,
        ],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],

        fontSrc: ["'self'", "data:"],
        workerSrc: ["'self'", "blob:"],

        formAction: ["'self'"],
        manifestSrc: ["'self'"],

        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: parseInt(process.env.HSTS_MAX_AGE, 10) || 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    // Clickjacking protection
    frameguard: { action: "deny" },

    // MIME sniffing protection
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);
// X-XSS-Protection (Explicit for audit)
app.use((req, res, next) => {
    res.setHeader("X-XSS-Protection", "1; mode=block");
    next();
});
// Cache-Control (Sensitive Data Protection)
app.use((req, res, next) => {
    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, private"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
});
// enforce HTTPS in production
if (process.env.IS_PROD) {
  app.use((req, res, next) => {
    if (req.secure || req.headers["x-forwarded-proto"] === "https") {
      return next();
    }
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  });
}
// Routes
app.use("/api", routes); 

// Health check
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

export default app;

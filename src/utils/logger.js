// logger.js
import winston from "winston";
import fs from "fs";
import morgan from "morgan";
import moment from "moment-timezone";
import { resolveSafePath } from "./safePath.js";
import { __dirname, UPLOAD_DIR_LOGS } from "../config/constants.js";

/* --------------------------------------------------
   Ensure logs directory exists
-------------------------------------------------- */
const logsDir = resolveSafePath(UPLOAD_DIR_LOGS, "logs");
try {
  fs.mkdirSync(logsDir, { recursive: true });
} catch (err) {
  console.error("Failed to create logs directory:", err.message);
}

/* --------------------------------------------------
   Safe stringify for logging
-------------------------------------------------- */
const safeStringify = (obj) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return '"[Circular]"';
  }
};

/* --------------------------------------------------
   Winston base logger
-------------------------------------------------- */
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message, ...rest }) => {
      return `${timestamp} [${level}]: ${safeStringify({ message, ...rest })}`;
    }),
  ),
  transports: [
    new winston.transports.File({
      filename: resolveSafePath(logsDir, "success.log"),
      level: "info",
      handleExceptions: true,
    }),
    new winston.transports.File({
      filename: resolveSafePath(logsDir, "error.log"),
      level: "error",
      handleExceptions: true,
    }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

/* --------------------------------------------------
   User-specific loggers cache
-------------------------------------------------- */
const userLoggers = new Map();

const getUserLogger = (userId) => {
  const sanitizedUserId = userId.replace(/[^a-zA-Z0-9-_]/g, "_");
  const userLogFile = resolveSafePath(logsDir, `${sanitizedUserId}.log`);

  if (userLoggers.has(sanitizedUserId)) return userLoggers.get(sanitizedUserId);

  const userLogger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(({ timestamp, level, message, ...rest }) => {
        return `${timestamp} [${level}]: ${safeStringify({ message, ...rest })}`;
      }),
    ),
    transports: [
      new winston.transports.File({
        filename: userLogFile,
        flags: "a",
        handleExceptions: true,
      }),
    ],
  });

  userLoggers.set(sanitizedUserId, userLogger);
  return userLogger;
};

/* --------------------------------------------------
   Controller logging function
-------------------------------------------------- */
const logActivity = (req, res, controllerName, action, additionalData = {}) => {
  const ip = req.ip ?? req.connection?.remoteAddress ?? "unknown";
  const userId = req.user?.id ?? req.body?.userId ?? "anonymous";
  const logData = {
    controller: controllerName,
    action,
    userId,
    ip,
    method: req.method,
    url: req.originalUrl,
    status: res.statusCode,
    request: { ...req.body, password: "REDACTED" },
    ...additionalData,
  };

  try {
    if (res.statusCode >= 400) logger.error(logData);
    else logger.info(logData);

    const userLogger = getUserLogger(userId);
    userLogger.info(logData);
  } catch (err) {
    console.error("Logging failed:", err.message, logData);
  }
};

/* --------------------------------------------------
   Morgan HTTP logger setup
-------------------------------------------------- */
function setupLogger(app) {
  // Capture response body middleware
  app.use((req, res, next) => {
    const oldWrite = res.write;
    const oldEnd = res.end;
    const chunks = [];

    res.write = function (chunk, ...args) {
      chunks.push(Buffer.from(chunk));
      return oldWrite.apply(res, [chunk, ...args]);
    };

    res.end = function (chunk, ...args) {
      if (chunk) chunks.push(Buffer.from(chunk));
      const buffer = Buffer.concat(chunks);
      res.body =
        buffer.toString("utf8").slice(0, 3000) +
        (buffer.length > 3000 ? "...[truncated]" : "");
      return oldEnd.apply(res, [chunk, ...args]);
    };

    next();
  });

  // Morgan tokens
  morgan.token("ist-date", () =>
    moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
  );
  morgan.token("request-body", (req) =>
    req.body && Object.keys(req.body).length
      ? safeStringify(req.body)
      : "No Body",
  );
  morgan.token("response-body", (req, res) => res.body ?? "No Response Body");

  const customMorganFormat =
    "[:ist-date] :method :url :status\n" +
    "IP: :remote-addr\n" +
    "User-Agent: :user-agent\n" +
    "Response Time: :response-time ms\n" +
    "Request Body: :request-body\n" +
    "Response Body: :response-body\n" +
    "--------------------------------------------------\n";

  // Create method-based log streams
  const createStream = (name) =>
    fs.createWriteStream(resolveSafePath(logsDir, `${name}.log`), {
      flags: "a",
    });

  const streams = {
    GET: createStream("GET"),
    POST: createStream("POST"),
    PUT: createStream("PUT"),
    DELETE: createStream("DELETE"),
    ERROR: createStream("ERROR"),
  };

  // Morgan middleware
  app.use((req, res, next) => {
    const stream = streams[req.method] || null;
    if (!stream) return next();

    morgan(customMorganFormat, { stream })(req, res, () => {
      res.on("finish", () => {
        if (res.statusCode >= 400) {
          const logLine = morgan.compile(customMorganFormat)(morgan, req, res);
          streams.ERROR.write(logLine);
        }
      });
      next();
    });
  });

  // Console logging in development
  if (!process.env.IS_SSL) app.use(morgan(customMorganFormat));
}

/* --------------------------------------------------
   Exports
-------------------------------------------------- */
export { logger, getUserLogger, logActivity, setupLogger };

// import { __dirname,__filename, UPLOAD_DIR_LOGS } from "../config/constants.js";
// import { resolveSafePath } from './safePath.js';

/* --------------------------------------------------
   Ensure log directory exists
-------------------------------------------------- */
const logDirectory = resolveSafePath(UPLOAD_DIR_LOGS, "logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

/* --------------------------------------------------
   Create log streams by HTTP method
-------------------------------------------------- */
const getLogStream = fs.createWriteStream(
  resolveSafePath(logDirectory, "GET.log"),
  {
    flags: "a",
  },
);
const postLogStream = fs.createWriteStream(
  resolveSafePath(logDirectory, "POST.log"),
  { flags: "a" },
);
const putLogStream = fs.createWriteStream(
  resolveSafePath(logDirectory, "PUT.log"),
  {
    flags: "a",
  },
);
const deleteLogStream = fs.createWriteStream(
  resolveSafePath(logDirectory, "DELETE.log"),
  { flags: "a" },
);
// 🔴 Error log file
const errorLogStream = fs.createWriteStream(
  resolveSafePath(logDirectory, "ERROR.log"),
  { flags: "a" },
);

/* --------------------------------------------------
   Binary detection helpers
-------------------------------------------------- */
const isBinaryContentType = (res) => {
  const ct = res.getHeader("content-type");
  if (!ct) return false;

  return (
    ct.includes("application/octet-stream") ||
    ct.includes("application/pdf") ||
    ct.includes("image/") ||
    ct.includes("video/") ||
    ct.includes("audio/") ||
    ct.includes("application/zip") ||
    ct.includes("application/vnd") ||
    ct.includes("multipart/form-data")
  );
};

const isProbablyBinary = (text) => {
  if (!text) return false;
  return /[\x00-\x08\x0E-\x1F\x7F]/.test(text);
};
/* --------------------------------------------------
   Middleware to capture response body
-------------------------------------------------- */
const captureResponseBody = (req, res, next) => {
  const oldWrite = res.write;
  const oldEnd = res.end;
  const chunks = [];

  res.write = function (chunk, ...args) {
    chunks.push(Buffer.from(chunk));
    return oldWrite.apply(res, [chunk, ...args]);
  };

  res.end = function (chunk, ...args) {
    if (chunk) chunks.push(Buffer.from(chunk));

    const buffer = Buffer.concat(chunks);

    if (isBinaryContentType(res)) {
      res.body = `[BINARY DATA: ${res.getHeader("content-type")}]`;
    } else {
      const text = buffer.toString("utf8");

      if (isProbablyBinary(text)) {
        res.body = "[BINARY DATA DETECTED]";
      } else {
        res.body =
          text.length > 3000 ? text.slice(0, 3000) + "...[truncated]" : text;
      }
    }

    return oldEnd.apply(res, [chunk, ...args]);
  };

  next();
};

/* --------------------------------------------------
   Morgan Custom Tokens
-------------------------------------------------- */
morgan.token("ist-date", () =>
  moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
);

morgan.token("request-body", (req) =>
  req.body && Object.keys(req.body).length
    ? JSON.stringify(req.body)
    : "No Body",
);

morgan.token("response-body", (req, res) =>
  res.body ? res.body : "No Response Body",
);

/* --------------------------------------------------
   Morgan Log Format
-------------------------------------------------- */
const customMorganFormat =
  `[:ist-date] :method :url :status\n` +
  `IP: :remote-addr\n` +
  `User-Agent: :user-agent\n` +
  `Response Time: :response-time ms\n` +
  `Request Body: :request-body\n` +
  `Response Body: :response-body\n` +
  `--------------------------------------------------\n`;

/* --------------------------------------------------
   Helper: detect failure
-------------------------------------------------- */
const isFailureResponse = (req, res) => {
  // HTTP error
  if (res.statusCode >= 400) return true;

  // success:false in JSON body
  try {
    const body = JSON.parse(res.body || "{}");
    if (body.success === false) return true;
  } catch {
    // ignore JSON parse error
  }

  return false;
};

/* --------------------------------------------------
   Setup Logger
-------------------------------------------------- */
// function setupLogger(app) {
//   // Capture response body FIRST
//   app.use(captureResponseBody);

//   // Method-based log files
//   app.use((req, res, next) => {
//     let stream;

//     switch (req.method) {
//       case "GET":
//         stream = getLogStream;
//         break;
//       case "POST":
//         stream = postLogStream;
//         break;
//       case "PUT":
//         stream = putLogStream;
//         break;
//       case "DELETE":
//         stream = deleteLogStream;
//         break;
//       default:
//         stream = null;
//     }

//     if (stream) {
//       morgan(customMorganFormat, { stream: stream })(req, res, () => {
//         // AFTER response finished
//         res.on("finish", () => {
//           if (isFailureResponse(req, res)) {
//             const logLine = morgan.compile(customMorganFormat)(
//               morgan,
//               req,
//               res,
//             );
//             errorLogStream.write(logLine);
//           }
//         });

//         next();
//       });
//     } else {
//       next();
//     }
//   });

//   // Console logging in development
//   if (!process.env.IS_SSL) {
//     app.use(morgan(customMorganFormat));
//   }
// }

// export default setupLogger;

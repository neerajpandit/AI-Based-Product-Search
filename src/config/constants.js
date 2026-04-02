import { fileURLToPath } from "url";
import path from "path";

/* ------------------------------------
   Resolve __dirname safely (ESM)
------------------------------------ */
export const __filename = fileURLToPath(import.meta.url);
const __currentDir = path.dirname(__filename);

// Project root (two levels up from config/)
export const __dirname = path.resolve(__currentDir, "../../");

/* ------------------------------------
   Express body parser limits
------------------------------------ */
export const EXPRESS_JSON_LIMIT = "50mb";
export const EXPRESS_URLENCODED_LIMIT = "50mb";

/* ------------------------------------
   Upload & file size limits
------------------------------------ */
export const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB

/* ------------------------------------
   Base upload directories
------------------------------------ */
export const UPLOAD_DIR = path.resolve(__dirname, "public", "uploads");
export const UPLOAD_DIR_IMAGES = path.resolve(UPLOAD_DIR, "images");

/* ------------------------------------
   Logs directory (NOT public)
------------------------------------ */
export const UPLOAD_DIR_LOGS = path.resolve(__dirname, "logs");

/**
 * Single place for backend origin (port/path). Override with REACT_APP_API_URL in .env
 * e.g. REACT_APP_API_URL=http://localhost:8081
 */
const raw = process.env.REACT_APP_API_URL || "http://localhost:8081";
export const API_ORIGIN = String(raw).replace(/\/+$/, "");

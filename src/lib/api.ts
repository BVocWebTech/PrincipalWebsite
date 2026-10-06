// src/lib/api.js (or api.ts)
 
export const API_BASE = import.meta.env.PROD
  ? "https://drsrbeenajose.tech"
  : "http://localhost:5000";
 
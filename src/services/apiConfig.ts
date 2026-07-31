const configured = import.meta.env.VITE_ML_API_URL?.trim();

if (!configured && import.meta.env.PROD) {
  throw new Error('WorldSphere configuration error: VITE_ML_API_URL is required for production builds.');
}

export const API_BASE_URL = (configured || 'http://localhost:8000').replace(/\/+$/, '');

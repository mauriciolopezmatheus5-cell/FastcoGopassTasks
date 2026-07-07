const API_URL = import.meta.env.VITE_API_URL as string | undefined;

if (!API_URL) {
  console.warn('[Config] VITE_API_URL no definida. Usando http://localhost:3000/api');
}

export const ENV = {
  API_URL: API_URL ?? 'http://localhost:3000/api',
  NODE_ENV: import.meta.env.MODE as 'development' | 'production',
  ES_PRODUCCION: import.meta.env.MODE === 'production',
} as const;

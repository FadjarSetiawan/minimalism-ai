export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3000';
    }
  }
  // Replace this with your actual deployed Vercel backend URL
  return 'https://api.ai.minimalism.web.id';
}

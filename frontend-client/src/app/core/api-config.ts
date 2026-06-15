export function getApiUrl(): string {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  // Replace this with your actual deployed Vercel backend URL
  return 'https://minimalism-ai-backend.vercel.app';
}

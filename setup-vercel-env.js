import { execSync } from 'child_process';

const envVars = {
  VITE_FIREBASE_API_KEY: 'AIzaSyDZkMUjrL73s-AzY-MkrEer1S2gM-_3nXQ',
  VITE_FIREBASE_AUTH_DOMAIN: 'elparte-obras.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'elparte-obras',
  VITE_FIREBASE_STORAGE_BUCKET: 'elparte-obras.firebasestorage.app',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '317860677294',
  VITE_FIREBASE_APP_ID: '1:317860677294:web:4406171593805b094a8f3f',
  VITE_ADMIN_EMAILS: 'eladiomateosoto@gmail.com,amrosquet@hotmail.com'
};

console.log('Setting Vercel environment variables...\n');

for (const [key, value] of Object.entries(envVars)) {
  try {
    const cmd = `vercel env add ${key} production`;
    console.log(`Setting ${key}...`);
    execSync(cmd, { 
      input: value + '\n',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(`✓ ${key} set\n`);
  } catch (e) {
    console.error(`✗ Failed to set ${key}:`, e.message);
  }
}

console.log('Environment variables setup complete!');

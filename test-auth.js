import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDZkMUjrL73s-AzY-MkrEer1S2gM-_3nXQ',
  authDomain: 'elparte-obras.firebaseapp.com',
  projectId: 'elparte-obras',
  storageBucket: 'elparte-obras.firebasestorage.app',
  messagingSenderId: '317860677294',
  appId: '1:317860677294:web:4406171593805b094a8f3f',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testLogin(email, password) {
  console.log(`\nTesting login for: ${email}`);
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log(`✓ Login successful!`);
    console.log(`  UID: ${result.user.uid}`);
    console.log(`  Email: ${result.user.email}`);
    console.log(`  Auth Token: ${(await result.user.getIdToken()).substring(0, 50)}...`);
    return true;
  } catch (error) {
    console.error(`✗ Login failed`);
    console.error(`  Code: ${error.code}`);
    console.error(`  Message: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('=== Firebase Authentication Test ===');
  console.log(`Project: elparte-obras`);
  
  const credentials = [
    { email: 'eladiomateosoto@gmail.com', password: 'vinicola' },
    { email: 'amrosquet@hotmail.com', password: 'rosquet' }
  ];

  for (const cred of credentials) {
    await testLogin(cred.email, cred.password);
  }
  
  console.log('\n=== Test Complete ===');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

import https from 'https';

const API_KEY = 'AIzaSyDZkMUjrL73s-AzY-MkrEer1S2gM-_3nXQ';

// Test user credentials
const users = [
  { email: 'eladiomateosoto@gmail.com', password: 'vinicola' },
  { email: 'amrosquet@hotmail.com', password: 'rosquet' }
];

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'identitytoolkit.googleapis.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function createOrLoginUser(email, password) {
  console.log(`\n=== Processing user: ${email} ===`);
  
  // Try to create user
  const createRes = await makeRequest('POST', `/v1/accounts:signUp?key=${API_KEY}`, {
    email,
    password,
    returnSecureToken: true
  });

  if (createRes.status === 200) {
    console.log(`✓ User created successfully`);
    console.log(`  UID: ${createRes.data.localId}`);
    return createRes.data;
  } else if (createRes.data.error?.message === 'EMAIL_EXISTS') {
    console.log(`ℹ User already exists, attempting to login...`);
    
    // Login if user exists
    const loginRes = await makeRequest('POST', `/v1/accounts:signInWithPassword?key=${API_KEY}`, {
      email,
      password,
      returnSecureToken: true
    });

    if (loginRes.status === 200) {
      console.log(`✓ Login successful`);
      console.log(`  UID: ${loginRes.data.localId}`);
      return loginRes.data;
    } else {
      console.error(`✗ Login failed:`, loginRes.data.error?.message);
      return null;
    }
  } else {
    console.error(`✗ Creation failed:`, createRes.data.error?.message);
    return null;
  }
}

async function main() {
  console.log('Starting user setup...');
  
  for (const user of users) {
    await createOrLoginUser(user.email, user.password);
  }
  
  console.log('\n=== User setup complete ===');
}

main().catch(console.error);

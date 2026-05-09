import { useEffect, useState } from 'react';

export default function Debug() {
  const [envVars, setEnvVars] = useState({});

  useEffect(() => {
    setEnvVars({
      API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || 'NOT SET',
      AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'NOT SET',
      PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'NOT SET',
      STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'NOT SET',
      MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'NOT SET',
      APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || 'NOT SET',
      ADMIN_EMAILS: import.meta.env.VITE_ADMIN_EMAILS || 'NOT SET',
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-orange-500">🔧 Debug Environment</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Firebase Configuration</h2>
          <div className="space-y-3 font-mono text-sm">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="border-b border-gray-700 pb-2">
                <span className="text-blue-400">{key}:</span>
                <div className="text-gray-300 break-all">
                  {value === 'NOT SET' ? (
                    <span className="text-red-400">❌ {value}</span>
                  ) : (
                    <span className="text-green-400">✓ {String(value).substring(0, 50)}{String(value).length > 50 ? '...' : ''}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-900 border border-blue-500 rounded-lg p-4 mb-6">
          <p className="text-sm">
            If you see ❌ marks above, the environment variables are not loaded in production.
            Check the Vercel dashboard: Project Settings → Environment Variables
          </p>
        </div>

        <a href="/" className="inline-block bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded font-bold">
          ← Back to Home
        </a>
      </div>
    </div>
  );
}

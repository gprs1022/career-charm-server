import admin from 'firebase-admin';
import { config } from 'dotenv';

config();

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    storageBucket: 'carrer-charm-app.firebasestorage.app'
  });
}

// Get Firebase storage bucket - use default bucket if not specified
export const bucket = admin.storage().bucket();
export { admin }; 
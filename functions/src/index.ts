
'use server';

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

// Helper function to get all admin FCM tokens from Firestore
async function getAdminFcmTokens(): Promise<string[]> {
  const adminUsersSnapshot = await db.collection('users').where('role', '==', 'admin').get();
  if (adminUsersSnapshot.empty) {
    console.log('No admin users found.');
    return [];
  }

  const adminUids = adminUsersSnapshot.docs.map(doc => doc.id);
  const tokens: string[] = [];

  // Firestore `in` queries are limited to 30 items. 
  // If you have more than 30 admins, this needs to be chunked.
  // For this app, we assume fewer than 30 admins.
  if (adminUids.length > 0) {
    const fcmTokensSnapshot = await db.collection('fcmTokens').where('uid', 'in', adminUids).get();
    fcmTokensSnapshot.forEach(doc => {
      tokens.push(doc.data().token);
    });
  }
  
  return [...new Set(tokens)]; // Return unique tokens
}


// Function to trigger when a new driver application is created
export const onNewDriverApplication = functions.region('us-central1').firestore
  .document('drivers/{driverId}')
  .onCreate(async (snap, context) => {
    const driverData = snap.data();
    const { driverId } = context.params;

    console.log(`New driver application from ${driverData.name}.`);

    const tokens = await getAdminFcmTokens();

    if (tokens.length === 0) {
      console.log('No admin FCM tokens to send notification to.');
      return null;
    }

    const payload = {
      notification: {
        title: 'Новая заявка на регистрацию!',
        body: `Водитель ${driverData.name} подал заявку.`,
        icon: '/icon-192.png',
        badge: '/badge-taxi.png'
      },
      data: {
        url: `/admin/applications/${driverId}`
      }
    };
    
    console.log('Sending notification to admin tokens:', tokens);
    return admin.messaging().sendToDevice(tokens, payload);
  });


// Function to trigger when a new ride application is created (status is 'pending')
export const onNewRideApplication = functions.region('us-central1').firestore
  .document('rides/{rideId}')
  .onCreate(async (snap, context) => {
    const rideData = snap.data();

    // We only care about rides created with 'pending' status
    if (rideData.status !== 'pending') {
      return null;
    }

    console.log(`New ride application from ${rideData.from} to ${rideData.to}.`);

    const tokens = await getAdminFcmTokens();

    if (tokens.length === 0) {
      console.log('No admin FCM tokens to send notification to.');
      return null;
    }

    const payload = {
      notification: {
        title: 'Новая заявка на поездку!',
        body: `Новая поездка: ${rideData.from} -> ${rideData.to}. Нажмите, чтобы проверить.`,
        icon: '/icon-192.png',
        badge: '/badge-taxi.png'
      },
      data: {
        url: '/admin/ride-applications'
      }
    };

    console.log('Sending notification to admin tokens:', tokens);
    return admin.messaging().sendToDevice(tokens, payload);
  });


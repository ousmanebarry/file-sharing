require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');
const { getFirestore } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);
const firestore = getFirestore(firebaseApp);

module.exports = { storage, firestore };

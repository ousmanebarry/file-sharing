require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');
const { getFirestore } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTHDOMAIN,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId: process.env.MESSAGINGSENDERID,
  appId: process.env.APPID,
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp, `gs://${firebaseConfig.storageBucket}`);
const firestore = getFirestore(firebaseApp);

module.exports = { storage, firestore };

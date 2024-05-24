import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDbvKOfCz7DUp6P9VuSlTNPZvoJ-mHm3SI',
  authDomain: 'proyecttpi.firebaseapp.com',
  projectId: 'proyecttpi',
  storageBucket: 'proyecttpi.appspot.com',
  messagingSenderId: '402297753912',
  appId: '1:402297753912:web:b6dff2a5d6b8c8d9fe31cd',
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Obtén la instancia de Firestore
export const storage = getStorage(app);
export const db = getFirestore(app);
export default app;

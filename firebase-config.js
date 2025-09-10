// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDumpxwLaw4yL_Dp9No7MX2zC-q4puL8GU",
    authDomain: "holas-12f70.firebaseapp.com",
    projectId: "holas-12f70",
    storageBucket: "holas-12f70.firebasestorage.app",
    messagingSenderId: "127821988783",
    appId: "1:127821988783:web:9f7ed7bf8f2c0384db255a",
    measurementId: "G-1J0G865Y00"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obtener referencias a los servicios
const db = firebase.firestore();
const storage = firebase.storage();

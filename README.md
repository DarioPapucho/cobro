# Crear Perfil - Firebase

Una aplicación web simple en vanilla JavaScript que permite crear perfiles con imagen y coordenadas geográficas, guardándolos en Firebase.

## Características

- 📸 Subida de imagen de perfil
- 📍 Captura de coordenadas geográficas (latitud y longitud)
- 🌍 Geolocalización automática
- ☁️ Almacenamiento en Firebase Storage y Firestore
- 📱 Diseño responsive
- ✅ Validación de datos

## Configuración

### 1. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita Firestore Database y Storage
4. Ve a "Configuración del proyecto" > "Tus apps" > "Web"
5. Copia la configuración de Firebase

### 2. Actualizar configuración

Edita el archivo `firebase-config.js` y reemplaza los valores con tu configuración:

```javascript
const firebaseConfig = {
    apiKey: "tu-api-key-aqui",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "tu-app-id"
};
```

### 3. Configurar reglas de Firestore

En Firebase Console > Firestore Database > Reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{document} {
      allow read, write: if true;
    }
  }
}
```

### 4. Configurar reglas de Storage

En Firebase Console > Storage > Reglas:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile_images/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

## Uso

1. Abre `index.html` en tu navegador
2. Selecciona una imagen de perfil
3. Ingresa las coordenadas o usa el botón "Obtener mi ubicación"
4. Haz clic en "Crear Perfil"

## Estructura de datos

Los perfiles se guardan en Firestore con la siguiente estructura:

```javascript
{
  imageUrl: "https://firebasestorage.googleapis.com/...",
  latitude: 40.7128,
  longitude: -74.0060,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Validaciones

- **Imagen**: Solo archivos JPG, PNG, GIF menores a 5MB
- **Coordenadas**: Latitud entre -90 y 90, longitud entre -180 y 180
- **Campos requeridos**: Imagen y coordenadas son obligatorios

## Tecnologías utilizadas

- HTML5
- CSS3
- Vanilla JavaScript
- Firebase Firestore
- Firebase Storage
- Geolocation API

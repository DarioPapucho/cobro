# Sistema de Cobro

Sistema de cobro que registra pagos con ubicación automática.

## Características

- 💳 **Código de cobro** de 5 caracteres
- 📱 **Subida de QR** de pago
- 📍 **Ubicación automática** en segundo plano
- ☁️ **Almacenamiento** en Firebase
- 📊 **Registro de coordenadas** para tracking

## Estructura de datos

Los cobros se guardan en Firestore con la siguiente estructura:

```javascript
{
  paymentCode: "DLSKG",
  qrImageUrl: "https://firebasestorage.googleapis.com/...",
  latitude: 40.7128,
  longitude: -74.0060,
  timestamp: timestamp,
  status: "pending"
}
```

## Configuración

1. **Firebase Storage**: Para guardar las imágenes QR
2. **Firestore**: Para guardar los datos del cobro
3. **Geolocalización**: Automática al cargar la página

## Uso

1. Abre `index.html` en tu navegador
2. Permite el acceso a la ubicación cuando se solicite
3. Ingresa el código de cobro de 5 caracteres
4. Sube la imagen del QR de pago
5. Haz clic en "Procesar Cobro"

## Validaciones

- **Código**: Exactamente 5 caracteres alfanuméricos
- **QR**: Imagen válida menor a 5MB
- **Ubicación**: Obligatoria para procesar el cobro
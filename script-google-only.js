// Referencias a elementos del DOM
const profileForm = document.getElementById('profileForm');
const profileImageInput = document.getElementById('profileImage');
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');
const getGoogleLocationBtn = document.getElementById('getGoogleLocationBtn');
const confirmLocationBtn = document.getElementById('confirmLocationBtn');
const locateMeBtn = document.getElementById('locateMeBtn');
const mapControls = document.getElementById('mapControls');
const mapDiv = document.getElementById('map');
const submitBtn = document.getElementById('submitBtn');
const statusDiv = document.getElementById('status');
const imagePreview = document.getElementById('imagePreview');

// Variables globales
let selectedImage = null;
let map = null;
let marker = null;
let selectedLocation = null;

// Event listeners
profileImageInput.addEventListener('change', handleImageSelect);
getGoogleLocationBtn.addEventListener('click', showGoogleMap);
confirmLocationBtn.addEventListener('click', confirmLocation);
locateMeBtn.addEventListener('click', locateMe);
profileForm.addEventListener('submit', handleFormSubmit);

// Función para manejar la selección de imagen
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (file) {
        if (validateImageFile(file)) {
            selectedImage = file;
            displayImagePreview(file);
        } else {
            event.target.value = ''; // Limpiar el input
        }
    }
}

// Función para mostrar preview de la imagen
function displayImagePreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
}

// Función para mostrar Google Maps
function showGoogleMap() {
    if (typeof google === 'undefined') {
        showStatus('Google Maps no está cargado. Verifica tu API key.', 'error');
        return;
    }

    getGoogleLocationBtn.textContent = 'Obteniendo tu ubicación...';
    getGoogleLocationBtn.disabled = true;

    // NO mostrar el mapa hasta obtener la ubicación real
    showStatus('🔍 Obteniendo tu ubicación real...', 'loading');

    // Obtener ubicación actual automáticamente
    if (navigator.geolocation) {
        // Opciones para máxima precisión
        const options = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            function(position) {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                showStatus('✅ Ubicación real obtenida!', 'success');
                
                // Ahora sí mostrar el mapa con la ubicación real
                mapDiv.style.display = 'block';
                mapControls.style.display = 'block';
                
                initializeMap(userLocation);
            },
            function(error) {
                let errorMessage = 'No se pudo obtener tu ubicación: ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Permiso denegado. Por favor, permite el acceso a la ubicación.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Ubicación no disponible. Intenta en un lugar más abierto.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Tiempo agotado. Intenta de nuevo.';
                        break;
                    default:
                        errorMessage += 'Error desconocido.';
                        break;
                }
                
                showStatus(errorMessage, 'error');
                getGoogleLocationBtn.textContent = '📍 Obtener mi ubicación con Google Maps';
                getGoogleLocationBtn.disabled = false;
            },
            options
        );
    } else {
        showStatus('Geolocalización no disponible en este navegador.', 'error');
        getGoogleLocationBtn.textContent = '📍 Obtener mi ubicación con Google Maps';
        getGoogleLocationBtn.disabled = false;
    }
}

// Función para inicializar el mapa
function initializeMap(centerLocation) {
    // Crear el mapa centrado en tu ubicación real
    map = new google.maps.Map(mapDiv, {
        zoom: 15, // Zoom cercano para ver tu ubicación
        center: centerLocation,
        mapTypeId: 'hybrid', // Vista satelital para mejor precisión
        mapTypeControl: true, // Permitir cambiar tipo de mapa
        streetViewControl: true, // Permitir Street View
        fullscreenControl: true // Permitir pantalla completa
    });

    // Crear marcador en tu ubicación real
    marker = new google.maps.Marker({
        position: centerLocation,
        map: map,
        draggable: true,
        title: 'Arrastra para seleccionar ubicación exacta'
    });

    // Llenar automáticamente los campos con tu ubicación real
    selectedLocation = centerLocation;
    latitudeInput.value = centerLocation.lat.toFixed(6);
    longitudeInput.value = centerLocation.lng.toFixed(6);
    
    showStatus(`🎯 Tu ubicación real: ${centerLocation.lat.toFixed(6)}, ${centerLocation.lng.toFixed(6)}`, 'success');
    
    // Rehabilitar el botón
    getGoogleLocationBtn.textContent = '📍 Obtener mi ubicación con Google Maps';
    getGoogleLocationBtn.disabled = false;

    // Actualizar ubicación cuando se arrastra el marcador
    marker.addListener('dragend', function() {
        const position = marker.getPosition();
        selectedLocation = {
            lat: position.lat(),
            lng: position.lng()
        };
        
        // Actualizar campos de entrada
        latitudeInput.value = selectedLocation.lat.toFixed(6);
        longitudeInput.value = selectedLocation.lng.toFixed(6);
        
        showStatus(`Ubicación seleccionada: ${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`, 'success');
    });

    // Actualizar ubicación cuando se hace clic en el mapa
    map.addListener('click', function(event) {
        const clickedLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        };
        
        marker.setPosition(clickedLocation);
        selectedLocation = clickedLocation;
        
        // Actualizar campos de entrada
        latitudeInput.value = selectedLocation.lat.toFixed(6);
        longitudeInput.value = selectedLocation.lng.toFixed(6);
        
        showStatus(`Ubicación seleccionada: ${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`, 'success');
    });
}

// Función para localizarme en el mapa
function locateMe() {
    if (!navigator.geolocation) {
        showStatus('Geolocalización no disponible', 'error');
        return;
    }

    locateMeBtn.textContent = 'Obteniendo ubicación...';
    locateMeBtn.disabled = true;

    // Opciones para máxima precisión
    const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
        function(position) {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            // Centrar el mapa en la ubicación del usuario
            map.setCenter(userLocation);
            map.setZoom(15); // Zoom cercano
            
            // Mover el marcador a la ubicación del usuario
            marker.setPosition(userLocation);
            selectedLocation = userLocation;
            
            // Actualizar campos de entrada
            latitudeInput.value = userLocation.lat.toFixed(6);
            longitudeInput.value = userLocation.lng.toFixed(6);
            
            showStatus(`🎯 Localizado en: ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`, 'success');
            
            locateMeBtn.textContent = '🎯 Localizarme';
            locateMeBtn.disabled = false;
        },
        function(error) {
            let errorMessage = 'Error al obtener ubicación: ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Permiso denegado. Por favor, permite el acceso a la ubicación.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Ubicación no disponible. Intenta en un lugar más abierto.';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Tiempo agotado. Intenta de nuevo.';
                    break;
                default:
                    errorMessage += 'Error desconocido';
                    break;
            }
            showStatus(errorMessage, 'error');
            
            locateMeBtn.textContent = '🎯 Localizarme';
            locateMeBtn.disabled = false;
        },
        options
    );
}

// Función para confirmar ubicación seleccionada
function confirmLocation() {
    if (selectedLocation) {
        latitudeInput.value = selectedLocation.lat.toFixed(6);
        longitudeInput.value = selectedLocation.lng.toFixed(6);
        
        showStatus(`✅ Ubicación confirmada: ${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`, 'success');
        
        // Ocultar el mapa
        mapDiv.style.display = 'none';
        mapControls.style.display = 'none';
    } else {
        showStatus('Por favor selecciona una ubicación en el mapa', 'error');
    }
}

// Función para subir imagen a Firebase Storage
async function uploadImageToStorage(file) {
    try {
        const timestamp = Date.now();
        const fileName = `profile_images/${timestamp}_${file.name}`;
        const storageRef = storage.ref(fileName);
        
        const snapshot = await storageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        return downloadURL;
    } catch (error) {
        console.error('Error al subir imagen:', error);
        throw new Error('Error al subir la imagen');
    }
}

// Función para guardar perfil en Firestore
async function saveProfileToFirestore(imageUrl, latitude, longitude) {
    try {
        const profileData = {
            imageUrl: imageUrl,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('profiles').add(profileData);
        return docRef.id;
    } catch (error) {
        console.error('Error al guardar perfil:', error);
        throw new Error('Error al guardar el perfil');
    }
}

// Función para manejar el envío del formulario
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validar que se haya seleccionado una imagen
    if (!selectedImage) {
        showStatus('Por favor selecciona una imagen', 'error');
        return;
    }

    // Validar coordenadas
    const latitude = latitudeInput.value.trim();
    const longitude = longitudeInput.value.trim();
    
    if (!latitude || !longitude) {
        showStatus('Por favor ingresa las coordenadas de ubicación', 'error');
        return;
    }

    // Validar que las coordenadas sean números válidos
    if (isNaN(latitude) || isNaN(longitude)) {
        showStatus('Las coordenadas deben ser números válidos', 'error');
        return;
    }

    // Validar rango de coordenadas
    if (latitude < -90 || latitude > 90) {
        showStatus('La latitud debe estar entre -90 y 90', 'error');
        return;
    }
    
    if (longitude < -180 || longitude > 180) {
        showStatus('La longitud debe estar entre -180 y 180', 'error');
        return;
    }

    // Deshabilitar botón de envío
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creando perfil...';
    showStatus('Creando perfil, por favor espera...', 'loading');

    try {
        // Subir imagen a Firebase Storage
        const imageUrl = await uploadImageToStorage(selectedImage);
        
        // Guardar perfil en Firestore
        const profileId = await saveProfileToFirestore(imageUrl, latitude, longitude);
        
        // Mostrar éxito
        showStatus(`🎉 Perfil creado exitosamente con ID: ${profileId}`, 'success');
        
        // Limpiar formulario
        profileForm.reset();
        imagePreview.innerHTML = '';
        selectedImage = null;
        
    } catch (error) {
        console.error('Error:', error);
        showStatus(`❌ Error: ${error.message}`, 'error');
    } finally {
        // Rehabilitar botón de envío
        submitBtn.disabled = false;
        submitBtn.textContent = 'Crear Perfil';
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

// Función para validar archivo de imagen
function validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
        showStatus('Por favor selecciona una imagen válida (JPG, PNG, GIF)', 'error');
        return false;
    }
    
    if (file.size > maxSize) {
        showStatus('La imagen debe ser menor a 5MB', 'error');
        return false;
    }
    
    return true;
}

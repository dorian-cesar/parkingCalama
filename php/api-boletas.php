<?php

$url = "https://qa.pullman.cl/srv-dte-web/rest/emisionDocumentoElectronico/generarDocumento";

// Datos del payload
$data = [
    "codigoEmpresa" => "89",
    "tipoDocumento" => "39",
    "total" => "450",
    "detalleBoleta" => "53-450-1-dsa-BANO"
];

// Inicializar cURL
$ch = curl_init($url);

// Configurar opciones de cURL
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

// Ejecutar la solicitud
$response = curl_exec($ch);

// Manejo de errores
if (curl_errno($ch)) {
    echo 'Error en cURL: ' . curl_error($ch);
} else {
    // Mostrar respuesta
    echo "Respuesta de la API: " . $response;
}

// Cerrar conexión cURL
curl_close($ch);

?>

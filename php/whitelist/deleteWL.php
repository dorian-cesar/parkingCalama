<?php
// Configuración de la API
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// API Token y servidor (guárdalos en un archivo seguro si es posible)
$serverIP = "52.87.32.226"; // Cambia esto por el IP correcto del servidor
$serverPort = "8098"; // Puerto de la API
$apiToken = "019752C5986566CF780ED580D0BBB02B0637F48E4AC5481FF3BD4278C1128274";

// Obtener los datos enviados en la solicitud POST
$input = json_decode(file_get_contents("php://input"), true);

// Validar que se recibió la patente
if (!isset($input['patente']) || empty($input['patente'])) {
    echo json_encode(["error" => "Debe proporcionar una patente válida."], JSON_PRETTY_PRINT);
    exit;
}

$patente = strtoupper($input['patente']); // Convertir la patente a mayúsculas

// Construcción de la URL con el PIN del usuario (patente)
$apiUrl = "http://$serverIP:$serverPort/api/v2/person/delete?pin=$patente&access_token=$apiToken";

// Inicializar cURL
$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => '',
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "POST",
]);

// Ejecutar solicitud y obtener la respuesta
$response = curl_exec($curl);
$http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

// Verificar si la eliminación fue exitosa
if ($http_code === 200) {
    echo json_encode([
        "message" => "Usuario eliminado con éxito.",
        "patente" => $patente
    ], JSON_PRETTY_PRINT);
} else {
    echo json_encode([
        "error" => "No se pudo eliminar el usuario.",
        "response" => $response
    ], JSON_PRETTY_PRINT);
}
?>
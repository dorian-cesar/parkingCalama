<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Configuración de la API
header("Content-Type: application/json"); // Respuesta en JSON

include 'config.php';


//$doorId = "2c9a86e09499c21c0194b82245b7251d"; // ID de la puerta de salida Andenes

//$doorId = "2c9a86e09499c21c0194e674b01916ce"; // ID de la puerta de salida parking

$doorId = "2c9a86e09499c21c0194e674b01916cd"; // ID de la puerta de Entrada parking

$interval = 1; // Tiempo de apertura en segundos

// Construcción de la URL del endpoint
$apiUrl = "http://$serverIP:$serverPort/api/door/remoteOpenById?doorId=$doorId&interval=$interval&access_token=$apiToken";

// Inicializar cURL
$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_HTTPHEADER => ["Content-Type: application/json"]
]);

// Ejecutar la solicitud
$response = curl_exec($curl);

// Manejo de errores
if (curl_errno($curl)) {
    echo json_encode(["status" => "error", "message" => curl_error($curl)]);
    curl_close($curl);
    exit;
}

// Cerrar cURL
curl_close($curl);

// Decodificar respuesta JSON
$data = json_decode($response, true);

// Formatear respuesta JSON
if ($data && isset($data['code']) && $data['code'] === 0) {
    echo json_encode([
        "status" => "success",
        "message" => "Puerta abierta exitosamente",
        "door_id" => $doorId,
        "interval" => $interval . " segundos"
    ], JSON_PRETTY_PRINT);
} else {
    echo json_encode([
        "status" => "error",
        "message" => $data['message'] ?? "Error desconocido al abrir la puerta"
    ], JSON_PRETTY_PRINT);
}
?>


<?php
// Configuración de la API
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// API Token (deberías guardarlo en un archivo de configuración seguro)
$apiToken = "019752C5986566CF780ED580D0BBB02B0637F48E4AC5481FF3BD4278C1128274";
$baseUrl = "http://52.87.32.226:8098/api";

// Niveles de acceso predefinidos (puedes cambiarlos si es necesario)
$levelIds = "2c9a86e09499c21c0194f0dcb16e013c,2c9a86e09499c21c0194e74e1d602a7d,2c9a86e09499c21c0194b8a3ead12628,2c9a86e09499c21c0194b8a31c062624";

// Obtener los datos enviados en la solicitud POST
$input = json_decode(file_get_contents("php://input"), true);

// Validar que se recibió la patente
if (!isset($input['patente']) || empty($input['patente'])) {
    echo json_encode(["error" => "Debe proporcionar una patente válida."], JSON_PRETTY_PRINT);
    exit;
}

$patente = strtoupper($input['patente']); // Convertir la patente a mayúsculas

// **1. Crear Usuario en la API**
$createUserUrl = "$baseUrl/person/add?access_token=$apiToken";
$createUserData = json_encode([
    "deptCode" => "2",
    "isDisabled" => false,
    "pin" => $patente,
    "name" => "Lista-Blanca"
]);

$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => $createUserUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_POSTFIELDS => $createUserData,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Accept: application/json"
    ],
]);

$response = curl_exec($curl);
$http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

// Verificar si el usuario se creó correctamente
if ($http_code !== 200) {
    echo json_encode(["error" => "Error al crear el usuario", "response" => $response], JSON_PRETTY_PRINT);
    exit;
}

// **2. Asignar Niveles de Acceso**
$assignAccessUrl = "$baseUrl/accLevel/addLevelPerson?levelIds=$levelIds&pin=$patente&access_token=$apiToken";

$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => $assignAccessUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Accept: application/json"
    ],
]);

$responseAccess = curl_exec($curl);
$http_code_access = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

// Verificar si los niveles de acceso se asignaron correctamente
if ($http_code_access !== 200) {
    echo json_encode(["error" => "Error al asignar niveles de acceso", "response" => $responseAccess], JSON_PRETTY_PRINT);
    exit;
}

// Respuesta final exitosa
echo json_encode([
    "message" => "Usuario creado y niveles de acceso asignados con éxito.",
    "patente" => $patente
], JSON_PRETTY_PRINT);
?>

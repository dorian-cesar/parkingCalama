<?php
// Configuración de la API
header("Content-Type: application/json"); // Respuesta en JSON
include 'config.php'; // Archivo con credenciales de BD y API
date_default_timezone_set('America/Santiago'); // Establece la zona horaria de Santiago de Chile


// Verificar si se enviaron los datos necesarios
if (!isset($_POST['tipoSalida']) || !isset($_POST['patente'])) {
    echo json_encode(["status" => "error", "message" => "Faltan datos en la solicitud"]);
    exit;
}

// Obtener valores desde la solicitud
$tipoSalida = trim($_POST['tipoSalida']);
$patente = trim($_POST['patente']);

// Definir el ID de la puerta según el tipo de salida
$doorIds = [
    "Parking" => "2c9a86e09499c21c0194e674b01916ce",
    "Andenes" => "2c9a86e09499c21c0194b82245b7251d"
];

// Validar si el tipo de salida es válido
if (!array_key_exists($tipoSalida, $doorIds)) {
    echo json_encode(["status" => "error", "message" => "Tipo de salida no válido"]);
    exit;
}

$doorId = $doorIds[$tipoSalida]; // Asignar el doorId correcto
$interval = 1; // Tiempo de apertura en segundos

// Conectar a la base de datos
$conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Error de conexión a la base de datos"]);
    exit;
}

// Obtener la última entrada de la patente
$sql = "SELECT idmov FROM movParking WHERE patente = ? ORDER BY idmov DESC LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $patente);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

if (!$row) {
    echo json_encode(["status" => "error", "message" => "No se encontró un registro de entrada para esta patente"]);
    $stmt->close();
    $conn->close();
    exit;
}

$idmov = $row['idmov']; // ID del registro de entrada

// Obtener fecha y hora actual
$fechaSalida = date("Y-m-d");
$horaSalida = date("H:i:s");

// Actualizar el registro con la salida
$sqlUpdate = "UPDATE movParking SET fechasal = ?, horasal = ?, estado = 'Salida Manual' WHERE idmov = ?";
$stmtUpdate = $conn->prepare($sqlUpdate);
$stmtUpdate->bind_param("ssi", $fechaSalida, $horaSalida, $idmov);
$stmtUpdate->execute();

if ($stmtUpdate->affected_rows > 0) {
    $mensajeBD = "Salida registrada exitosamente";
} else {
    $mensajeBD = "No se pudo registrar la salida";
}

// Cerrar conexión a la base de datos
$stmt->close();
$stmtUpdate->close();
$conn->close();

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

// Manejo de errores de cURL
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
        "tipo_salida" => $tipoSalida,
        "patente" => $patente,
        "fecha_salida" => $fechaSalida,
        "hora_salida" => $horaSalida,
        "door_id" => $doorId,
        "interval" => "$interval segundos",
        "db_message" => $mensajeBD
    ], JSON_PRETTY_PRINT);
} else {
    echo json_encode([
        "status" => "error",
        "message" => $data['message'] ?? "Error desconocido al abrir la puerta"
    ], JSON_PRETTY_PRINT);
}
?>

<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Incluir la configuración de la base de datos
include("../conf.php");
include('../auth.php');

// Manejar solicitudes GET (consultar tarifas)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Obtener el tipo de movimiento desde la solicitud GET
    $tipo = $_GET['tipo'];

    // Validar que el tipo no esté vacío
    if (empty($tipo)) {
        http_response_code(400); // Bad Request
        echo json_encode(["error" => "El parámetro 'tipo' es requerido"]);
        exit;
    }

    // Consultar la tarifa en la base de datos
    $query = "SELECT valor_minuto FROM tarifasParking WHERE tipo = ? AND activa = 1 AND (fecha_fin IS NULL OR fecha_fin >= CURDATE())";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $tipo);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $tarifa = $result->fetch_assoc();
        echo json_encode(["valor_minuto" => $tarifa['valor_minuto']]);
    } else {
        http_response_code(404); // Not Found
        echo json_encode(["error" => "Tarifa no encontrada o no activa"]);
    }

    $stmt->close();
}
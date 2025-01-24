<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Incluir la configuración de la base de datos
include("../conf.php");

// Obtener los parámetros de la solicitud GET
$patente = $_GET['patente'];
$fechaEntrada = $_GET['fechaEntrada'];
$horaEntrada = $_GET['horaEntrada'];
$fechaSalida = $_GET['fechaSalida'];
$horaSalida = $_GET['horaSalida'];

// Validar que los parámetros no estén vacíos
if (empty($patente) || empty($fechaEntrada) || empty($horaEntrada) || empty($fechaSalida) || empty($horaSalida)) {
    http_response_code(400); // Bad Request
    echo json_encode(["error" => "Todos los parámetros son requeridos"]);
    exit;
}

// Obtener el tipo de movimiento desde la tabla movParking
$query = "SELECT tipo FROM movParking WHERE patente = ? AND fechaent = ? AND horaent = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("sss", $patente, $fechaEntrada, $horaEntrada);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404); // Not Found
    echo json_encode(["error" => "Movimiento no encontrado"]);
    exit;
}

$movimiento = $result->fetch_assoc();
$tipo = $movimiento['tipo'];

// Obtener la tarifa por minuto desde la tabla tarifas
$query = "SELECT valor_minuto FROM tarifas WHERE tipo = ? AND activa = TRUE";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $tipo);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404); // Not Found
    echo json_encode(["error" => "Tarifa no encontrada"]);
    exit;
}

$tarifa = $result->fetch_assoc();
$valorMinuto = $tarifa['valor_minuto'];

// Calcular el tiempo de estacionamiento
$fechaHoraEntrada = new DateTime("$fechaEntrada $horaEntrada");
$fechaHoraSalida = new DateTime("$fechaSalida $horaSalida");
$diferencia = $fechaHoraEntrada->diff($fechaHoraSalida);

$minutosTotales = ($diferencia->days * 1440) + ($diferencia->h * 60) + $diferencia->i;

// Aplicar el tope diario de 480 minutos
$minutosPorDia = [];
$fechaActual = clone $fechaHoraEntrada;

while ($fechaActual <= $fechaHoraSalida) {
    $inicioDia = clone $fechaActual;
    $inicioDia->setTime(0, 0, 0); // Medianoche del día actual

    $finDia = clone $fechaActual;
    $finDia->setTime(23, 59, 59); // Final del día actual

    $minutosDia = min(
        ($fechaHoraSalida < $finDia ? $fechaHoraSalida : $finDia)->getTimestamp() -
        ($fechaHoraEntrada > $inicioDia ? $fechaHoraEntrada : $inicioDia)->getTimestamp(),
        480 * 60 // Tope diario en segundos
    ) / 60; // Convertir a minutos

    $minutosPorDia[] = round($minutosDia); // Redondear al minuto más cercano
    $fechaActual->modify('+1 day'); // Siguiente día
}

$minutosCobrados = array_sum($minutosPorDia);
$valorTotal = $minutosCobrados * $valorMinuto;

// Devolver el resultado
echo json_encode([
    "patente" => $patente,
    "tipo" => $tipo,
    "fechaEntrada" => $fechaEntrada,
    "horaEntrada" => $horaEntrada,
    "fechaSalida" => $fechaSalida,
    "horaSalida" => $horaSalida,
    "minutosTotales" => $minutosTotales,
    "minutosCobrados" => $minutosCobrados,
    "valorMinuto" => $valorMinuto,
    "valorTotal" => $valorTotal
]);

$stmt->close();
$conn->close();
?>
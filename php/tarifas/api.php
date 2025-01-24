<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Incluir la configuración de la base de datos
include("../conf.php");

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

// Manejar solicitudes POST (crear registros de movimientos)
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener los datos del cuerpo de la solicitud
    $data = json_decode(file_get_contents("php://input"), true);

    // Validar que los datos requeridos estén presentes
    $camposFaltantes = [];
    if (empty($data['fechaent'])) $camposFaltantes[] = "fechaent";
    if (empty($data['horaent'])) $camposFaltantes[] = "horaent";
    if (empty($data['fechasal'])) $camposFaltantes[] = "fechasal";
    if (empty($data['horasal'])) $camposFaltantes[] = "horasal";
    if (empty($data['patente'])) $camposFaltantes[] = "patente";
    if (empty($data['empresa'])) $camposFaltantes[] = "empresa";
    if (empty($data['tipo'])) $camposFaltantes[] = "tipo";

    if (!empty($camposFaltantes)) {
        http_response_code(400); // Bad Request
        echo json_encode(["error" => "Campos requeridos faltantes", "camposFaltantes" => $camposFaltantes]);
        exit;
    }

    // Validar formato de fechas y horas
    if (!DateTime::createFromFormat('Y-m-d', $data['fechaent'])) {
        http_response_code(400); // Bad Request
        echo json_encode(["error" => "Formato de fecha de entrada no válido"]);
        exit;
    }
    if (!DateTime::createFromFormat('H:i:s', $data['horaent'])) {
        http_response_code(400); // Bad Request
        echo json_encode(["error" => "Formato de hora de entrada no válido"]);
        exit;
    }
    if (!DateTime::createFromFormat('Y-m-d', $data['fechasal'])) {
        http_response_code(400); // Bad Request
        echo json_encode(["error" => "Formato de fecha de salida no válido"]);
        exit;
    }
    if (!DateTime::createFromFormat('H:i:s', $data['horasal'])) {
        http_response_code(400); // Bad Request
        echo json_encode(["error" => "Formato de hora de salida no válido"]);
        exit;
    }

    // Verificar que el tipo de movimiento exista en la tabla tarifasParking
    $query = "SELECT valor_minuto FROM tarifasParking WHERE tipo = ? AND activa = 1 AND (fecha_fin IS NULL OR fecha_fin >= CURDATE())";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $data['tipo']);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404); // Not Found
        echo json_encode(["error" => "Tipo de movimiento no válido o tarifa no activa"]);
        exit;
    }

    // Obtener la tarifa por minuto
    $tarifa = $result->fetch_assoc();
    $valorMinuto = $tarifa['valor_minuto'];

    // Calcular el tiempo de estacionamiento
    $fechaHoraEntrada = new DateTime($data['fechaent'] . ' ' . $data['horaent']);
    $fechaHoraSalida = new DateTime($data['fechasal'] . ' ' . $data['horasal']);

    // Validar que la fecha y hora de salida sean posteriores a la fecha y hora de entrada
    if ($fechaHoraEntrada >= $fechaHoraSalida) {
        http_response_code(400); // Bad Request
        echo json_encode(["error" => "La fecha y hora de salida deben ser posteriores a la fecha y hora de entrada"]);
        exit;
    }

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

    // Insertar el registro en la tabla movParking
    $query = "INSERT INTO movParking (fechaent, horaent, fechasal, horasal, patente, empresa, tipo, valor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sssssisi", $data['fechaent'], $data['horaent'], $data['fechasal'], $data['horasal'], $data['patente'], $data['empresa'], $data['tipo'], $valorTotal);

    if ($stmt->execute()) {
        http_response_code(201); // Created
        echo json_encode([
            "message" => "Registro creado exitosamente",
            "idmov" => $stmt->insert_id,
            "valorTotal" => $valorTotal
        ]);
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode(["error" => "Error al crear el registro: " . $stmt->error]);
    }

    $stmt->close();
}

// Método no permitido
else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["error" => "Método no permitido"]);
}

$conn->close();
?>
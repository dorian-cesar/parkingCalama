<?php
if ($token->nivel < $LVLUSER) {
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(['error' => 'Autoridad insuficiente']);
    exit;
}

$json_data = file_get_contents("php://input");
$data = json_decode($json_data, true);

if ($data !== null) {
    $fecha = $data['fecha'];
    $hora = $data['hora'];
    $patente = str_replace('-', '', $data['patente']);
    $empresa = $data['empresa'];
    $tipo = $data['tipo'];

    // Consultar tarifa activa
    $stmtTarifa = $conn->prepare("
        SELECT valor_minuto 
        FROM tarifasParking 
        WHERE tipo = ? 
          AND activa = 1 
          AND (fecha_inicio <= ? AND (fecha_fin IS NULL OR fecha_fin >= ?))
        LIMIT 1
    ");
    $stmtTarifa->bind_param("sss", $tipo, $fecha, $fecha);
    $stmtTarifa->execute();
    $resultTarifa = $stmtTarifa->get_result();

    if ($resultTarifa->num_rows > 0) {
        $tarifa = $resultTarifa->fetch_assoc()['valor_minuto'];

        // Verificar si ya existe un registro activo
        $chck = $conn->prepare("SELECT idmov FROM movParking WHERE patente = ? AND fechasal = '0000-00-00'");
        $chck->bind_param("s", $patente);
        $chck->execute();
        $result = $chck->get_result();

        if ($result->num_rows == 0) {
            $stmt = $conn->prepare("
                INSERT INTO movParking (fechaent, horaent, patente, empresa, tipo, tarifa, fechasal, horasal) 
                VALUES (?, ?, ?, ?, ?, ?, '0', '0')
            ");
            $stmt->bind_param("sssssd", $fecha, $hora, $patente, $empresa, $tipo, $tarifa);

            if ($stmt->execute()) {
                echo json_encode(['id' => $conn->insert_id, 'msg' => 'Insertado correctamente', 'tarifa' => $tarifa]);
            } else {
                echo json_encode(['error' => $conn->error]);
            }
        } else {
            echo json_encode(['error' => 'Ya existe registro!']);
        }
    } else {
        echo json_encode(['error' => 'No se encontró una tarifa activa para este tipo y fecha']);
    }
} else {
    echo json_encode(['error' => 'Error al decodificar JSON']);
}

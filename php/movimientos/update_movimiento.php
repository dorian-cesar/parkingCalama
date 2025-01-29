<?php
require_once '../config/db.php'; // Asegúrate de incluir la conexión a la BD
require_once '../auth/validate_token.php'; // Incluir validación de token si es necesario

if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    if ($token->nivel < $LVLUSER) {
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['error' => 'Autoridad insuficiente']);
        exit;
    }

    $json_data = file_get_contents("php://input");
    $data = json_decode($json_data, true);

    if ($data !== null) {
        $fecha_salida = $data['fecha'];
        $hora_salida = $data['hora'];
        $id = $data['id'];

        if (empty($fecha_salida) || empty($hora_salida) || empty($id)) {
            echo json_encode(['error' => 'Todos los campos son requeridos.']);
            exit;
        }

        // Obtener la fecha y hora de entrada
        $stmt = $conn->prepare("SELECT fechaent, horaent FROM movParking WHERE idmov = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $registro = $result->fetch_assoc();

        if (!$registro) {
            echo json_encode(['error' => 'Registro no encontrado']);
            exit;
        }

        $fecha_ent = $registro['fechaent'];
        $hora_ent = $registro['horaent'];

        // Convertir a objetos DateTime
        $entrada = new DateTime("$fecha_ent $hora_ent");
        $salida = new DateTime("$fecha_salida $hora_salida");

        if ($salida <= $entrada) {
            echo json_encode(['error' => 'La fecha y hora de salida no pueden ser anteriores a la entrada']);
            exit;
        }

        // Calcular minutos cobrados
        $intervalo = $entrada->diff($salida);
        $total_minutos = ($intervalo->days * 1440) + ($intervalo->h * 60) + $intervalo->i;

        $minutos_cobrados = 0;
        $tope_diario = 480;

        while ($entrada->format('Y-m-d') < $salida->format('Y-m-d')) {
            $minutos_cobrados += min($tope_diario, 1440);
            $entrada->modify('+1 day')->setTime(0, 0);
        }

        $minutos_restantes = ($salida->format('U') - $entrada->format('U')) / 60;
        $minutos_cobrados += min($tope_diario, round($minutos_restantes));

        $costo_por_minuto = 10; // Define este valor en tu config/db.php
        $costo_total = $minutos_cobrados * $costo_por_minuto;

        // Actualizar la base de datos
        $stmt = $conn->prepare("UPDATE movParking SET fechasal = ?, horasal = ?, valor = ? WHERE idmov = ?");
        $stmt->bind_param("ssii", $fecha_salida, $hora_salida, $costo_total, $id);

        if ($stmt->execute()) {
            echo json_encode([
                'id' => $id,
                'minutos_cobrados' => $minutos_cobrados,
                'costo_total' => $costo_total,
                'msg' => 'Salida actualizada correctamente'
            ]);
        } else {
            echo json_encode(['error' => 'Error al actualizar la salida.']);
        }
    } else {
        echo json_encode(['error' => 'Datos no válidos.']);
    }
}
?>

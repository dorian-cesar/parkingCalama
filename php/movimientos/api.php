<?php
declare(strict_types=1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header('Content-Type: application/json; charset=utf-8');

// Manejar solicitud OPTIONS
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');
    header("HTTP/1.1 200 OK");
    exit;
}

// Desactivar errores visibles en producción
error_reporting(0);
ini_set('display_errors', 0);

include("../conf.php");
include('../auth.php');

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if ($token->nivel < $LVLUSER) {
        http_response_code(401);
        echo json_encode(['error' => 'Autoridad insuficiente']);
        exit;
    }

    $date = date('Y-m-d');

    try {
        if (isset($_GET['patente'])) {
            $patente = str_replace('-', '', $_GET['patente']);
            $stmt = $conn->prepare("
                SELECT 
                    m.idmov, m.fechaent, m.horaent, m.fechasal, m.horasal, 
                    m.patente, e.nombre AS empresa, m.tipo, m.valor, 
                    m.tarifa, m.estado
                FROM 
                    movParking AS m 
                JOIN 
                    empParking AS e ON m.empresa = e.idemp
                WHERE 
                    m.patente = ? AND m.fechaent = ?
                ORDER BY 
                    m.idmov DESC
            ");
            $stmt->bind_param("ss", $patente, $date);

            $stmt->execute();
            $result = $stmt->get_result();
            $datos = $result->fetch_assoc();

            if ($datos) {
                echo json_encode($datos);
            } else {
                echo json_encode(['error' => 'No se encontraron datos']);
            }
        } else {
            $stmt = $conn->prepare("
                SELECT 
                    m.idmov, m.fechaent, m.horaent, m.fechasal, m.horasal, 
                    m.patente, e.nombre AS empresa, m.tipo, m.valor, 
                    m.tarifa, m.estado
                FROM 
                    movParking AS m 
                JOIN 
                    empParking AS e ON m.empresa = e.idemp
                WHERE 
                    m.fechaent = ?
                ORDER BY 
                    m.idmov
            ");
            $stmt->bind_param("s", $date);

            $stmt->execute();
            $result = $stmt->get_result();
            $datos = $result->fetch_all(MYSQLI_ASSOC);

            if ($datos) {
                echo json_encode($datos);
            } else {
                echo json_encode(['error' => 'No se encontraron datos']);
            }
        }
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// Insert
e// Manejo de solicitudes POST (Registrar entrada)
else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Verificar permisos del token
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
        $stmtTarifa = $conn->prepare("SELECT valor_minuto FROM tarifasParking WHERE tipo = ? AND activa = 1 AND (fecha_inicio <= ? AND (fecha_fin IS NULL OR fecha_fin >= ?)) LIMIT 1");
        $stmtTarifa->bind_param("sss", $tipo, $fecha, $fecha);
        $stmtTarifa->execute();
        $resultTarifa = $stmtTarifa->get_result();

        if ($resultTarifa->num_rows > 0) {
            $tarifa = $resultTarifa->fetch_assoc()['valor_minuto'];

            // Verificar registros activos para la patente
            $chck = $conn->prepare("SELECT idmov FROM movParking WHERE patente = ? AND fechasal IS NULL");
            $chck->bind_param("s", $patente);
            $chck->execute();
            $result = $chck->get_result();

            if ($result->num_rows == 0) {
                // Insertar un nuevo registro de entrada
                $stmt = $conn->prepare(
                    "INSERT INTO movParking (fechaent, horaent, patente, empresa, tipo, tarifa, estado, fechasal, horasal) VALUES (?, ?, ?, ?, ?, ?, 'En Estacionamiento', NULL, NULL)"
                );
                $stmt->bind_param("sssssd", $fecha, $hora, $patente, $empresa, $tipo, $tarifa);

                if ($stmt->execute()) {
                    $id = $conn->insert_id;
                    echo json_encode(['id' => $id, 'msg' => 'Insertado correctamente', 'tarifa' => $tarifa]);
                } else {
                    echo json_encode(['error' => $conn->error]);
                }
            } else {
                echo json_encode(['error' => 'Ya existe registro activo para esta patente']);
            }
        } else {
            echo json_encode(['error' => 'No se encontró una tarifa activa para este tipo y fecha']);
        }
    } else {
        echo json_encode(['error' => 'Error al decodificar JSON']);
    }
}

// Manejo de solicitudes PUT (Actualizar salida y calcular costo)
else if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    // Verificar permisos del token
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

        // Obtener datos de entrada y estado actual
        $stmt = $conn->prepare("SELECT fechaent, horaent, estado FROM movParking WHERE idmov = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $registro = $result->fetch_assoc();

        if (!$registro) {
            echo json_encode(['error' => 'Registro no encontrado']);
            exit;
        }

        // Verificar si el estado ya es "Pagado"
        if ($registro['estado'] === 'Pagado') {
            echo json_encode(['error' => 'El vehículo ya ha sido registrado como pagado']);
            exit;
        }

        $fecha_ent = $registro['fechaent'];
        $hora_ent = $registro['horaent'];

        $entrada = new DateTime("$fecha_ent $hora_ent");
        $salida = new DateTime("$fecha_salida $hora_salida");

        if ($salida <= $entrada) {
            echo json_encode(['error' => 'La fecha y hora de salida no pueden ser anteriores a la entrada']);
            exit;
        }

        // Calcular el costo total
        $intervalo = $entrada->diff($salida);
        $total_minutos = ($intervalo->days * 1440) + ($intervalo->h * 60) + $intervalo->i;

        $minutos_cobrados = 0;
        $tope_diario = 480; // Tope máximo de minutos a cobrar por día

        while ($entrada->format('Y-m-d') < $salida->format('Y-m-d')) {
            $minutos_cobrados += min($tope_diario, 1440);
            $entrada->modify('+1 day')->setTime(0, 0);
        }

        $minutos_restantes = ($salida->format('U') - $entrada->format('U')) / 60;
        $minutos_cobrados += min($tope_diario, round($minutos_restantes));

        $costo_total = $minutos_cobrados * $costo_por_minuto;

        // Actualizar el registro con la salida y el estado "Pagado"
        $estado_pagado = 'Pagado';
        $stmt = $conn->prepare("UPDATE movParking SET fechasal = ?, horasal = ?, valor = ?, estado = ? WHERE idmov = ?");
        $stmt->bind_param("ssisi", $fecha_salida, $hora_salida, $costo_total, $estado_pagado, $id);

        if ($stmt->execute()) {
            echo json_encode([
                'id' => $id,
                'minutos_cobrados' => $minutos_cobrados,
                'costo_total' => $costo_total,
                'estado' => $estado_pagado,
                'msg' => 'Salida actualizada correctamente'
            ]);
        } else {
            echo json_encode(['error' => 'Error al actualizar la salida.']);
        }
    } else {
        echo json_encode(['error' => 'Datos no válidos.']);
    }
}

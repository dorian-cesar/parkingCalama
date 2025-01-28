<?php
// Declaración estricta de tipos para garantizar la coherencia en el tipo de datos
declare(strict_types=1);

// Establece los encabezados CORS para permitir solicitudes desde cualquier origen y métodos POST
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Verifica si la solicitud es OPTIONS (solicitud de pre-vuelo)
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS, se establecen los encabezados permitidos
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK");
    exit;
}

// Incluye el archivo de configuración de la base de datos
include("../conf.php");
include('../auth.php');

// Get
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if ($token->nivel < $LVLUSER) {
        header('HTTP/1.1 401 Unauthorized'); // Devolver un código de error de autorización si el token no es válido
        echo json_encode(['error' => 'Autoridad insuficiente']);
        exit;
    }

    if (isset($_GET['patente'])) {
        $patente = str_replace('-', '', $_GET['patente']);
        $date = date('Y-m-d');
        $stmt = $conn->prepare("
            SELECT 
                m.idmov, m.fechaent, m.horaent, m.fechasal, m.horasal, m.patente, e.nombre AS empresa, m.tipo, m.valor, m.tarifa
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

        try {
            $stmt->execute();
            $result = $stmt->get_result();
            $datos = $result->fetch_assoc();

            echo json_encode($datos);
        } catch (mysqli_sql_exception $e) {
            echo json_encode(['error' => mysqli_errno($conn)]);
        } catch (Exception $e) {
            echo json_encode(['error' => $e]);
        }
    } else if (isset($_GET['id'])) {
        $id = $_GET['id'];
        $date = date('Y-m-d');
        $stmt = $conn->prepare("
            SELECT 
                m.idmov, m.fechaent, m.horaent, m.fechasal, m.horasal, m.patente, e.nombre AS empresa, m.tipo, m.valor, m.tarifa
            FROM 
                movParking AS m 
            JOIN 
                empParking AS e ON m.empresa = e.idemp
            WHERE 
                m.idmov = ? AND m.fechaent = ?
        ");
        $stmt->bind_param("is", $id, $date);

        try {
            $stmt->execute();
            $result = $stmt->get_result();
            $datos = $result->fetch_assoc();

            echo json_encode($datos);
        } catch (mysqli_sql_exception $e) {
            echo json_encode(['error' => mysqli_errno($conn)]);
        } catch (Exception $e) {
            echo json_encode(['error' => $e]);
        }
    } else {
        $date = date('Y-m-d');
        $stmt = $conn->prepare("
            SELECT 
                m.idmov, m.fechaent, m.horaent, m.fechasal, m.horasal, m.patente, e.nombre AS empresa, m.tipo, m.valor, m.tarifa
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

        try {
            $stmt->execute();
            $result = $stmt->get_result();
            $datos = $result->fetch_all(MYSQLI_ASSOC);

            echo json_encode($datos);
        } catch (mysqli_sql_exception $e) {
            echo json_encode(['error' => mysqli_errno($conn)]);
        } catch (Exception $e) {
            echo json_encode(['error' => $e]);
        }
    }
}

/// Insert
else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if ($token->nivel < $LVLUSER) {
        header('HTTP/1.1 401 Unauthorized'); // Devolver un código de error de autorización si el token no es válido
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

        // Consultar tarifa activa para el tipo y fecha
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

            // Verificar si ya existe un registro activo para la patente
            $chck = $conn->prepare("SELECT idmov FROM movParking WHERE patente = ? AND fechasal = '0000-00-00'");
            $chck->bind_param("s", $patente);
            $chck->execute();
            $result = $chck->get_result();

            if ($result->num_rows == 0) {
                // Insertar registro en movParking con la tarifa obtenida
                $stmt = $conn->prepare("
                    INSERT INTO movParking (fechaent, horaent, patente, empresa, tipo, tarifa, fechasal, horasal) 
                    VALUES (?, ?, ?, ?, ?, ?, '0', '0')
                ");
                $stmt->bind_param("sssssd", $fecha, $hora, $patente, $empresa, $tipo, $tarifa);

                if ($stmt->execute()) {
                    $id = $conn->insert_id;
                    echo json_encode(['id' => $id, 'msg' => 'Insertado correctamente', 'tarifa' => $tarifa]);
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
}

// Update (Pagado)
else if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    if ($token->nivel < $LVLUSER) {
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['error' => 'Autoridad insuficiente']);
        exit;
    }

    $json_data = file_get_contents("php://input");
    $data = json_decode($json_data, true);

    if ($data !== null) {
        $fecha_salida = $data['fecha']; // Fecha de salida
        $hora_salida = $data['hora'];   // Hora de salida
        $id = $data['id'];              // ID del movimiento

        // Validar que los datos no estén vacíos
        if (empty($fecha_salida) || empty($hora_salida) || empty($id)) {
            echo json_encode(['error' => 'Todos los campos son requeridos.']);
            exit;
        }

        // Obtener los datos de entrada del vehículo
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

        // Convertir fechas y horas a objetos DateTime
        $entrada = new DateTime("$fecha_ent $hora_ent");
        $salida = new DateTime("$fecha_salida $hora_salida");

        // Verificar que la salida sea posterior a la entrada
        if ($salida <= $entrada) {
            echo json_encode(['error' => 'La fecha y hora de salida no pueden ser anteriores a la entrada']);
            exit;
        }

        // Calcular la diferencia total en minutos
        $intervalo = $entrada->diff($salida);
        $total_minutos = ($intervalo->days * 1440) + ($intervalo->h * 60) + $intervalo->i;

        // Aplicar reglas de negocio
        $minutos_cobrados = 0;
         // Puedes ajustar este valor según lo requerido
        $tope_diario = 480;

        // Calcular minutos y costo por cada día
        while ($entrada->format('Y-m-d') < $salida->format('Y-m-d')) {
            $minutos_cobrados += min($tope_diario, 1440); // Días completos: máximo 480 minutos
            $entrada->modify('+1 day')->setTime(0, 0);
        }

        // Calcular minutos del día de salida
        $minutos_restantes = ($salida->format('U') - $entrada->format('U')) / 60; // Diferencia en minutos
        $minutos_cobrados += min($tope_diario, round($minutos_restantes));

        // Calcular costo total
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
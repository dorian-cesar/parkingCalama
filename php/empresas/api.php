<?php
declare(strict_types=1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');
    header("HTTP/1.1 200 OK");
    exit;
}

include("../conf.php");
include('../auth.php');

// Función para manejar errores y devolver respuesta JSON
function sendError(string $message, int $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}

// Función para manejar respuestas exitosas
function sendSuccess($data) {
    echo json_encode($data);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if ($token->nivel < $LVLUSER) {
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['error' => 'Autoridad insuficiente']);
        exit;
    }

    // Si hay un ID en los datos, buscar solo ese registro
    if (isset($_GET['id'])) {
        $id = $_GET['id'];

        // Prepara y ejecuta una consulta SQL para obtener el registro por ID
        $stmt = $conn->prepare("SELECT idemp, nombre, contacto FROM empParking WHERE idemp = ?");
        $stmt->bind_param("i", $id);

        try {
            $stmt->execute();
            $result = $stmt->get_result();
            $datos = $result->fetch_assoc();

            if ($datos) {
                sendSuccess($datos);
            } else {
                sendError('Registro no encontrado', 404);
            }
        } catch (mysqli_sql_exception $e) {
            sendError('Error en la base de datos: ' . $e->getMessage());
        }
    } else {
        // Si no hay ID, devolver todos los registros de empresas
        $stmt = $conn->prepare("SELECT idemp, nombre, contacto FROM empParking");

        try {
            $stmt->execute();
            $result = $stmt->get_result();
            $datos = $result->fetch_all(MYSQLI_ASSOC);

            sendSuccess($datos);
        } catch (mysqli_sql_exception $e) {
            sendError('Error en la base de datos: ' . $e->getMessage());
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if ($token->nivel < $LVLADMIN) {
        sendError('Autoridad insuficiente', 401);
    }

    $json_data = file_get_contents("php://input");
    $data = json_decode($json_data, true);

    if ($data === null) {
        sendError('Error al decodificar JSON');
    }

    $nombre = $data["nombre"];
    $contacto = $data["contacto"];

    $chck = $conn->prepare("SELECT nombre FROM empParking WHERE nombre = ?");
    $chck->bind_param("s", $nombre);
    $chck->execute();
    $result = $chck->get_result();

    if ($result->num_rows == 0) {
        $stmt = $conn->prepare("INSERT INTO empParking (nombre, contacto) VALUES (?, ?)");
        $stmt->bind_param("ss", $nombre, $contacto);

        if ($stmt->execute()) {
            sendSuccess(['id' => $conn->insert_id, 'msg' => 'Insertado correctamente']);
        } else {
            sendError('Error en la base de datos: ' . $conn->error);
        }
    } else {
        sendError('Ya existe registro con ese nombre');
    }
} elseif ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    if ($token->nivel < $LVLADMIN) {
        sendError('Autoridad insuficiente', 401);
    }

    $json_data = file_get_contents("php://input");
    $data = json_decode($json_data, true);

    if ($data === null) {
        sendError('Error al decodificar JSON');
    }

    $id = $data["id"];
    $nombre = $data["nombre"];
    $contacto = $data["contacto"];

    $chck = $conn->prepare("SELECT nombre FROM empParking WHERE idemp = ?");
    $chck->bind_param("i", $id);
    $chck->execute();
    $result = $chck->get_result();

    if ($result->num_rows >= 1) {
        $stmt = $conn->prepare("UPDATE empParking SET nombre = ?, contacto = ? WHERE idemp = ?");
        $stmt->bind_param("ssi", $nombre, $contacto, $id);

        try {
            if ($stmt->execute()) {
                sendSuccess(['id' => $id, 'msg' => 'Actualizado correctamente']);
            } else {
                sendError('Error al actualizar: ' . $conn->error);
            }
        } catch (mysqli_sql_exception $e) {
            sendError('Error en la base de datos: ' . $e->getMessage());
        }
    } else {
        sendError('ID no existe!');
    }
} elseif ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    if ($token->nivel < $LVLADMIN) {
        sendError('Autoridad insuficiente', 401);
    }

    $json_data = file_get_contents("php://input");
    $data = json_decode($json_data, true);

    if ($data === null || !isset($data["id"])) {
        sendError('Error al decodificar JSON o ID no proporcionado');
    }

    $id = $data["id"];
    $chck = $conn->prepare("SELECT nombre FROM empParking WHERE idemp = ?");
    $chck->bind_param("i", $id);
    $chck->execute();
    $result = $chck->get_result();

    if ($result->num_rows >= 1) {
        $stmt = $conn->prepare("DELETE FROM empParking WHERE idemp = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            sendSuccess(['id' => $id, 'msg' => 'Eliminado correctamente']);
        } else {
            sendError('Error al eliminar: ' . $conn->error);
        }
    } else {
        sendError('ID no existe!');
    }
}

$conn->close();
?>
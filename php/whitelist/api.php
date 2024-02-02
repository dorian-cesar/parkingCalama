<?php
// Declaración estricta de tipos para garantizar la coherencia en el tipo de datos
declare(strict_types=1);

// Establece los encabezados CORS para permitir solicitudes desde cualquier origen y métodos POST
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");

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

if($_SERVER['REQUEST_METHOD'] == 'GET'){
    if($token->nivel < $LVLUSER){
        header('HTTP/1.1 401 Unauthorized'); // Devolver un código de error de autorización si el token no es válido
        echo json_encode(['error' => 'Autoridad insuficiente']);
        exit;
    }

    // Seleccionar por ID
    if(isset($_GET['id'])) {
        $stmt = $conn->prepare("SELECT idwl, patente, empresa FROM wlParking WHERE idwl = ?");
        $stmt->bind_param("i", $_GET['id']);

        try {
            $stmt->execute();
            $result = $stmt->get_result();
            $datos = $result->fetch_assoc();

            echo json_encode($datos);
        } catch (mysqli_sql_exception $e) {
            echo json_encode(['error' => mysqli_errno($conn)]);
        } catch (Excepttion $e) {
            echo json_encode(['error' => $e]);
        }
    } else if(isset($_GET['patente'])) {
        $stmt = $conn->prepare("SELECT idwl, patente, empresa FROM wlParking WHERE patente = ?");
        $stmt->bind_param("s", $_GET['patente']);

        try {
            $stmt->execute();
            $result = $stmt->get_result();
            $datos = $result->fetch_assoc();

            echo json_encode($datos);
        } catch (mysqli_sql_exception $e) {
            echo json_encode(['error' => mysqli_errno($conn)]);
        } catch (Excepttion $e) {
            echo json_encode(['error' => $e]);
        }
    } else {
        $stmt = $conn->prepare("SELECT w.idwl, w.patente, e.nombre FROM wlParking AS w JOIN empParking AS e ON w.empresa = e.idemp ORDER BY w.idwl");

        try {
            // Ejecutar la consulta
            $stmt->execute();
            // Obtener el resultado de la consulta
            $result = $stmt->get_result();
            $datos = array();

            // Recorrer los resultados y agregarlos al array
            while ($row = $result->fetch_assoc()) {
                $datos[] = $row;
            }

            echo json_encode($datos);
        } catch (mysqli_sql_exception $e) {
            echo json_encode(['error' => mysqli_errno($conn)]);
        } catch (Excepttion $e) {
            echo json_encode(['error' => $e]);
        }
    }
}

else if($_SERVER['REQUEST_METHOD'] == 'POST') {
    if($token->nivel < $LVLUSER){
        header('HTTP/1.1 401 Unauthorized'); // Devolver un código de error de autorización si el token no es válido
        echo json_encode(['error' => 'Autoridad insuficiente']);
        exit;
    }

    // Leer datos JSON del cuerpo de la solicitud POST
    $json_data = file_get_contents("php://input");

    // Decodificar los datos JSON en un array asociativo
    $data = json_decode($json_data, true);

    // Verificar si se decodificó correctamente el JSON
    if ($data !== null) {
        // Obtener los datos de JSON
        $patente = $data["patente"];
        $empresa = $data["empresa"];

        // Consultar la base de datos para verificar si la patente ya existe
        $chck = $conn->prepare("SELECT patente FROM wlParking WHERE patente = ?");
        $chck->bind_param("s", $patente);
        $chck->execute();
        $result = $chck->get_result();

        // Si la patente no existe en la base de datos, insertarla
        if ($result->num_rows == 0) {
            // Consulta SQL segura para insertar la patente y la empresa
            $stmt = $conn->prepare("INSERT INTO wlParking (patente, empresa) VALUES (?, ?)");
            $stmt->bind_param("si", $patente, $empresa);

            // Ejecutar la consulta de inserción
            if ($stmt->execute()) {
                // Obtener el ID de la última inserción
                $id = $conn->insert_id;
                // Establecer el tipo de contenido de la respuesta como JSON y devolver el ID
                echo json_encode(['id' => $id, 'msg' => 'Insertado correctamente en lista blanca']);
            } else {
                // Si hay un error en la inserción, devolver un mensaje de error
                echo json_encode(['error' => $conn->error]);
            }
        } else {
            // Si la patente ya existe, devolver false
                echo json_encode(['error' => 'Patente ya existe']);
        }
    } else {
        // Devolver un código de respuesta HTTP 400 si hubo un error al decodificar el JSON
        http_response_code(400);
        echo json_encode(['error' => 'Error al decodificar JSON']);
    }
}

else if ($_SERVER["REQUEST_METHOD"] == "PUT") {
    // Leer datos JSON del cuerpo de la solicitud POST
    $json_data = file_get_contents("php://input");

    // Decodificar los datos JSON en un array asociativo
    $data = json_decode($json_data, true);

    // Verificar si se decodificó correctamente el JSON
    if ($data !== null) {
        // Obtener datos desde JSON
        $id = $data["id"];
        $patente = $data["patente"];
        $empresa = $data["empresa"];

        // Validar que la entrada existe
        $chck = $conn->prepare("SELECT idwl FROM wlParking WHERE idwl = ?");
        $chck->bind_param("i", $id);
        $chck->execute();
        $result = $chck->get_result();

        // Si la entrada existe, actualizar los datos
        if ($result->num_rows >= 1) {
            // Consulta SQL segura para actualizar la entrada
            $stmt = $conn->prepare("UPDATE wlParking SET patente = ?, empresa = ? WHERE idwl = ?");
            $stmt->bind_param("sii", $patente, $empresa, $id);

            try {
                // Ejecutar la consulta de actualización
                $stmt->execute();
                echo json_encode(['msg' => 'Actualizado correctamente en lista blanca']);
            } catch (mysqli_sql_exception $e) {
                // Capturar excepciones de MySQLi y devolver el código de error
                echo json_encode(['error' => mysqli_errno($conn)]);
            } catch (Exception $e) {
                echo json_encode(['error' => $e->message]);
            }
        } else {
            echo json_encode(['error' => 'Registro inexistente']);
        }
    } else {
        // Devolver un código de respuesta HTTP 400 si hubo un error al decodificar el JSON
        http_response_code(400);
        echo json_encode(['error' => 'Error al decodificar JSON']);
    }
}

else if ($_SERVER["REQUEST_METHOD"] == "DELETE") {
    if($token->nivel < $LVLADMIN){
        header('HTTP/1.1 401 Unauthorized'); // Devolver un código de error de autorización si el token no es válido
        echo json_encode(['error' => 'Autoridad insuficiente']);
        exit;
    }
    // Leer datos JSON del cuerpo de la solicitud POST
    $json_data = file_get_contents("php://input");

    // Decodificar los datos JSON en un array asociativo
    $data = json_decode($json_data, true);

    // Verificar si se decodificó correctamente el JSON
    if ($data !== null) {
        $id = $data;

        // Consultar la base de datos para verificar si existe una entrada con el ID proporcionado
        $chck = $conn->prepare("SELECT idwl FROM wlParking WHERE idwl = ?");
        $chck->bind_param("i", $id);
        $chck->execute();
        $result = $chck->get_result();

        // Si existe una entrada con el ID proporcionado, eliminarla
        if ($result->num_rows >= 1) {
            // Preparar y ejecutar una consulta para eliminar la entrada
            $stmt = $conn->prepare("DELETE FROM wlParking WHERE idwl = ?");
            $stmt->bind_param("i", $id);

            try {
                $stmt->execute();
                echo json_encode(['msg' => 'Eliminado correctamente en lista blanca']);
            } catch (mysqli_sql_exception $e) {
                // Capturar excepciones de MySQLi y devolver el código de error
                echo json_encode(['error' => mysqli_errno($conn)]);
            } catch (Exception $e) {
                echo json_encode(['error' => $e->message]);
            }

        } else {
            echo json_encode(['error' => 'Registro inexistente']);
        }
    } else {
        // Devolver un código de respuesta HTTP 400 si hubo un error al decodificar el JSON
        http_response_code(400);
        echo json_encode(['error' => 'Error al decodificar JSON']);
    }
}
$conn->close();
?>
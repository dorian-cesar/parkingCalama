<?php
declare(strict_types=1); // Declaración para habilitar el modo estricto de tipos en PHP

header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Methods: POST"); // Permitir solicitudes POST

// Manejo de solicitudes OPTIONS (preflight)
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS
    header('Access-Control-Allow-Headers: Content-Type, Authorize'); // Permitir los encabezados Content-Type y Authorize
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK"); // Envía un código de respuesta HTTP 200 OK
    exit; // Sale del script
}

use Firebase\JWT\JWT; // Importar la clase JWT de la biblioteca Firebase JWT
require_once('../../vendor/autoload.php'); // Incluir el archivo de carga automática de la biblioteca

include("../conf.php"); // Incluir el archivo de configuración

// Obtener registros de listas blancas
// id: ID a obtener (opcional)

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json_data = file_get_contents("php://input");

    // Si existe json_data asumir que buscaremos por ID
    if ($json_data) {
        $data = json_decode($json_data, true);

        // Verificar si se decodificó correctamente el JSON
        if ($data !== null) {
            $id = $data['id'];

            // Consultar la base de datos para obtener los datos según el ID proporcionado
            $stmt = $conn->prepare("SELECT idwl, patente, empresa FROM wlParking WHERE idwl = ?");
            $stmt->bind_param("i", $id);

            try {
                // Ejecutar la consulta
                $stmt->execute();
                // Obtener el resultado de la consulta
                $result = $stmt->get_result();
                // Obtener los datos como un array asociativo
                $datos = $result->fetch_assoc();

                // Establecer la cabecera de tipo de contenido JSON
                header("Content-Type: application/json");
                // Devolver los datos como JSON
                echo json_encode($datos);
            } catch (mysqli_sql_exception $e) {
                // Si hay un error en la consulta, devolver el código de error de MySQLi
                header('Content-Type: application/json');
                echo json_encode(mysqli_errno($conn));
            }
        } else {
            // Si el JSON no se pudo decodificar correctamente, devolver un código de respuesta HTTP 400
            http_response_code(400);
            echo 'NullData';
        }
    }
    // De lo contrario, devolver todo
    else {
        // Consultar la base de datos para obtener todos los registros de wlParking y empParking
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

            // Establecer la cabecera de tipo de contenido JSON
            header("Content-Type: application/json");
            // Devolver los datos como JSON
            echo json_encode($datos);
        } catch (mysqli_sql_exception $e) {
            // Si hay un error en la consulta, devolver el código de error de MySQLi
            header('Content-Type: application/json');
            echo json_encode(mysqli_errno($conn));
        }
    }
} else {
    // Devolver un código de respuesta HTTP 405 si la solicitud no es POST
    http_response_code(405);
    echo 'InvalidRequest';
}

// Cerrar la conexión a la base de datos
$conn->close();
?>

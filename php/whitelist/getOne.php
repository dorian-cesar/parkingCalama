<?php
declare(strict_types=1); // Declara que todas las declaraciones de tipos deben ser estrictas

header("Access-Control-Allow-Origin: *"); // Establece cabecera para permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Methods: POST"); // Establece cabecera para permitir solicitudes POST

// Manejo de solicitudes OPTIONS (preflight)
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS
    header('Access-Control-Allow-Headers: Content-Type'); // Establece cabecera para permitir el encabezado Content-Type
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK"); // Envía un código de respuesta HTTP 200 OK
    exit; // Sale del script
}

use Firebase\JWT\JWT; // Importa la clase JWT de la biblioteca Firebase JWT
require_once('../../vendor/autoload.php'); // Incluye el archivo de carga automática de la biblioteca

include("../conf.php"); // Incluye el archivo de configuración

// Manejo de solicitudes POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Leer datos JSON del cuerpo de la solicitud POST
    $json_data = file_get_contents("php://input");

    // Decodificar los datos JSON en un array asociativo
    $data = json_decode($json_data, true);

    // Verificar si se decodificó correctamente el JSON
    if ($data !== null) {
        // Obtener el valor del campo "id" del array
        $id = $data["id"];

        // Consultar la base de datos para obtener datos relacionados con el ID proporcionado
        $stmt = $conn->prepare("SELECT idwl, patente, empresa FROM wlParking WHERE idwl = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
+
        // Verificar si se encontraron resultados en la consulta
        if ($result->num_rows > 0) {
            // Obtener los datos del resultado como un array asociativo
            $datos = $result->fetch_assoc();

            // Establecer cabecera de tipo de contenido JSON
            header("Content-Type: application/json");
            // Devolver los datos como JSON
            echo json_encode($datos);
        } else {
            // Si no se encontraron registros, devolver un mensaje JSON
            header("Content-Type: application/json");
            echo json_encode("No existen registros de empresa");
        }
    } else {
        // Devolver un código de respuesta HTTP 400 si hubo un error al decodificar el JSON
        http_response_code(400);
        echo $data;
        echo "Error al decodificar JSON";
    }
} else {
    // Devolver un código de respuesta HTTP 405 si la solicitud no es POST
    http_response_code(405);
    echo "Solicitud no permitida";
}

// Cerrar la conexión a la base de datos
$conn->close();
?>

<?php
declare(strict_types=1); // Declaración para habilitar el modo estricto de tipos en PHP

header("Access-Control-Allow-Origin: *"); // Cabecera para permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Methods: POST"); // Cabecera para permitir solicitudes POST

use Firebase\JWT\JWT; // Importar la clase JWT de la biblioteca Firebase JWT
require_once('../../vendor/autoload.php'); // Incluir el archivo de carga automática de la biblioteca

include("../conf.php"); // Incluir el archivo de configuración

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Consulta SQL para seleccionar datos de la tabla wlParking y empParking mediante una operación JOIN
    $stmt = "SELECT w.idwl, w.patente, e.nombre FROM wlParking AS w JOIN empParking AS e ON w.empresa = e.idemp ORDER BY w.idwl";
    // Ejecutar la consulta
    $result = $conn->query($stmt);

    // Verificar si se encontraron resultados en la consulta
    if ($result->num_rows > 0) {
        $datos = array(); // Inicializar un array para almacenar los datos

        // Recorrer los resultados y agregarlos al array
        while ($row = $result->fetch_assoc()) {
            $datos[] = $row;
        }

        // Establecer la cabecera de tipo de contenido JSON
        header("Content-Type: application/json");
        // Devolver los datos como JSON
        echo json_encode($datos);
    } else {
        // Si no se encontraron registros, devolver un mensaje JSON
        header("Content-Type: application/json");
        echo json_encode("No existen registros de empresa");
    }
} else {
    // Devolver un código de respuesta HTTP 405 si la solicitud no es POST
    http_response_code(405);
    echo "Solicitud no permitida";
}

// Cerrar la conexión a la base de datos
$conn->close();
?>

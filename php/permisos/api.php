<?php
// Declaración estricta de tipos para garantizar la coherencia en el tipo de datos


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



if($_SERVER['REQUEST_METHOD'] == 'GET'){

    // Seleccionar por ID
    if(isset($_GET['id'])) {
        $stmt = $conn->prepare("SELECT idperm, nivel, descriptor FROM permParking WHERE idperm = ?");
        $stmt->bind_param("i", $_GET['id']);

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
        $stmt = $conn->prepare("SELECT idperm, nivel, descriptor FROM permParking");

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
        } catch (Exception $e) {
            echo json_encode(['error' => $e]);
        }
    }
}
$conn->close();
?>
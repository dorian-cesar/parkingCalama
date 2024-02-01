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

if($_SERVER['REQUEST_METHOD'] == 'GET') {
    if($token->nivel < $LVLUSER){
        header('HTTP/1.1 401 Unauthorized'); // Devolver un código de error de autorización si el token no es válido
        echo json_encode(['error' => 'Autoridad insuficiente']);
        exit;
    }

    $stmt = $conn->prepare("SELECT m.idmov, m.fechaent, m.horaent, m.fechasal, m.horasal, m.patente, e.nombre AS empresa, m.tipo, m.valor FROM movParking as m JOIN empParking as e ON m.empresa = e.idemp ORDER BY m.idmov");

    try {
        $stmt->execute();

        $result = $stmt->get_result();

        $datos = $result->fetch_all(MYSQLI_ASSOC);

        echo json_encode($datos);
    } catch (mysqli_sql_exception $e) {
        echo json_encode(['error' => mysqli_errno($conn)]);
    } catch (Excepttion $e) {
        echo json_encode(['error' => $e]);
    }
}
?>
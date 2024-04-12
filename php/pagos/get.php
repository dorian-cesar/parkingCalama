<?php
//en construccion 


header("Access-Control-Allow-Origin: *"); // Establece el encabezado CORS para permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Especifica que solo se permiten solicitudes POST

if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // Si la solicitud es OPTIONS (solicitud previa), se configuran los encabezados CORS necesarios
    header('Access-Control-Allow-Headers: Content-Type, Authorize');
    header('Access-Control-Max-Age: 86400'); // Cache la solicitud previa durante 1 día
    header("HTTP/1.1 200 OK");
    exit;
}

 // Se utiliza la clase JWT del paquete Firebase\JWT

require_once('../../vendor/autoload.php'); // Se incluye el archivo autoload.php necesario para cargar las clases automáticamente

include("../conf.php"); // Se incluye el archivo conf.php que probablemente contenga configuraciones y credenciales de la base de datos

if($_SERVER["REQUEST_METHOD"] == "POST"){ // Verifica que la solicitud sea POST
    $json_data = file_get_contents("php://input"); // Obtiene los datos JSON de la solicitud

    // Si existen datos JSON, se asume que se busca por ID
    if($json_data){
        $data = json_decode($json_data, true); // Decodifica los datos JSON a un array asociativo

        if($data!==null){ // Verifica si la decodificación fue exitosa
            $id = $data['id']; // Obtiene el ID del array de datos

            $stmt = $conn->prepare("SELECT idwl, patente, empresa FROM wlParking WHERE idwl = ?"); // Prepara una consulta SQL para obtener registros por ID
            $stmt->bind_param("i",$id); // Asocia el parámetro ID a la consulta preparada

            try{
                $stmt->execute(); // Ejecuta la consulta preparada
                $result = $stmt->get_result(); // Obtiene el resultado de la consulta
                $datos = $result->fetch_assoc(); // Obtiene los datos como un array asociativo

                header("Content-Type: application/json"); // Establece el encabezado de respuesta como JSON
                echo json_encode($datos); // Devuelve los datos como JSON
            } catch(mysqli_sql_exception $e){ // Captura excepciones de MySQLi
                header('Content-Type: application/json');
                echo json_encode(mysqli_errno($conn)); // Devuelve el código de error MySQL
            }
        } else {
            http_response_code(400); // Devuelve un código de respuesta HTTP 400 para indicar una solicitud incorrecta
            echo 'NullData'; // Devuelve un mensaje indicando que no se recibieron datos
        }
    }
    // De lo contrario, devuelve todos los registros
    else {
        $stmt = $conn->prepare("SELECT w.idwl, w.patente, e.nombre FROM wlParking AS w JOIN empParking AS e ON w.empresa = e.idemp ORDER BY w.idwl");
        // Prepara una consulta SQL para obtener todos los registros con información adicional de otra tabla relacionada

        try{
            $stmt->execute(); // Ejecuta la consulta preparada
            $result = $stmt->get_result(); // Obtiene el resultado de la consulta
            $datos = array(); // Inicializa un array para almacenar los datos

            // Recorre los resultados y los agrega al array
            while ($row = $result->fetch_assoc()) {
                $datos[] = $row;
            }

            header("Content-Type: application/json"); // Establece el encabezado de respuesta como JSON
            echo json_encode($datos); // Devuelve los datos como JSON
        } catch(mysqli_sql_exception $e){ // Captura excepciones de MySQLi
            header('Content-Type: application/json');
            echo json_encode(mysqli_errno($conn)); // Devuelve el código de error MySQL
        }
    }
} else {
    http_response_code(405); // Devuelve un código de respuesta HTTP 405 para indicar un método no permitido
    echo 'InvalidRequest'; // Devuelve un mensaje indicando que la solicitud es inválida
}

$conn->close(); // Cierra la conexión a la base de datos al final del script
?>

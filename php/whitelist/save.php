<?php
//Crea nuevos registros en la lista blanca 

header("Access-Control-Allow-Origin: *"); // Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Permitir solicitudes POST y OPTIONS

// Manejo de solicitudes OPTIONS (preflight)
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
    // El navegador está realizando una solicitud de pre-vuelo OPTIONS
    header('Access-Control-Allow-Headers: Content-Type'); // Permitir el encabezado Content-Type
    header('Access-Control-Max-Age: 86400'); // Cache preflight request for 1 day
    header("HTTP/1.1 200 OK"); // Envía un código de respuesta HTTP 200 OK
    exit; // Sale del script
}

include("../conf.php"); // Incluir el archivo de configuración

// Manejo de solicitudes POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
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
                header('Content-Type: application/json');
                echo json_encode($id);
            } else {
                // Si hay un error en la inserción, devolver un mensaje de error
                header('Content-Type: application/json');
                echo json_encode("Error: " . $conn->error);
            }
        } else {
            // Si la patente ya existe, devolver false
            header('Content-Type: application/json');
            echo json_encode(false);
        }

        // Cerrar la conexión a la base de datos
        $conn->close();
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
?>

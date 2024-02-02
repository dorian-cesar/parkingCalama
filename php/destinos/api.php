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

    if(isset($_GET['id'])){
        // Si hay un ID en los datos, buscar solo ese registro
        $id = $_GET['id'];

        // Prepara y ejecuta una consulta SQL para obtener el registro por ID
        $stmt = $conn->prepare("SELECT iddest, ciudad, valor FROM destParking WHERE iddest = ?");
        $stmt->bind_param("i",$id);

        try{
            $stmt->execute();
            $result = $stmt->get_result();
            $datos = $result->fetch_assoc();

            // Devuelve el resultado en formato JSON
            header("Content-Type: application/json");
            echo json_encode($datos);
        } catch(mysqli_sql_exception $e){
            // En caso de error, devuelve el código de error en formato JSON
            header('Content-Type: application/json');
            echo json_encode(['error' => mysqli_errno($conn)]);
            exit;
        }
    }
    // Si no hay datos JSON, devolver todos los registros
    else {
        // Prepara y ejecuta una consulta SQL para obtener todos los registros
        $stmt = $conn->prepare("SELECT iddest, ciudad, valor FROM destParking");
        
        try{
            $stmt->execute();
            $result = $stmt->get_result();
            $datos = array();

            // Recorre los resultados y los agrega al array
            while ($row = $result->fetch_assoc()) {
                $datos[] = $row;
            }

            // Devuelve todos los resultados en formato JSON
            header("Content-Type: application/json");
            echo json_encode($datos);
        } catch(mysqli_sql_exception $e){
            // En caso de error, devuelve el código de error en formato JSON
            header('Content-Type: application/json');
            echo json_encode(['error' => mysqli_errno($conn)]);
            exit;
        }
    }
}

else if($_SERVER['REQUEST_METHOD'] == "POST"){
    if($token->nivel < $LVLADMIN){
        header('HTTP/1.1 401 Unauthorized'); // Devolver un código de error de autorización si el token no es válido
        echo json_encode(['error' => 'Autoridad insuficiente']);
        exit;
    }

    // Obtiene los datos JSON del cuerpo de la solicitud
    $json_data = file_get_contents("php://input");

    // Decodifica los datos JSON
    $data = json_decode($json_data, true);

    // Verifica si la decodificación de JSON fue exitosa
    if ($data !== null){
        // Obtener datos desde JSON
        $ciudad = $data["ciudad"];
        $valor = $data["valor"];

        // Prepara y ejecuta una consulta SQL para verificar si ya existe una ciudad en la tabla
        $chck = $conn->prepare("SELECT ciudad FROM destParking WHERE ciudad = ?");
        $chck->bind_param("s",$ciudad);
        $chck->execute();
        $result = $chck->get_result();

        // Verifica si no existe ya una ciudad con el mismo nombre en la tabla
        if($result->num_rows == 0){
            // Si no existe, prepara y ejecuta una consulta SQL para insertar una nueva ciudad y su valor en la tabla
            $stmt = $conn->prepare("INSERT INTO destParking (ciudad, valor) VALUES (?, ?)");
            $stmt->bind_param("si", $ciudad, $valor);
    
            // Ejecuta la consulta SQL para insertar los datos
            if($stmt->execute()){
                // Si la inserción es exitosa, devuelve el ID del nuevo registro en formato JSON
                $id = $conn->insert_id;
                header('Content-Type: application/json');
                echo json_encode(['id' => $id, 'msg' => 'Insertado correctamente']);
            } else {
                // Si hay un error en la inserción, devuelve un mensaje de error en formato JSON
                header('Content-Type: application/json');
                echo json_encode("Error: " . $conn->error);
            }
        } else {
            // Si ya existe una ciudad con el mismo nombre, devuelve false en formato JSON
            header('Content-Type: application/json');
            echo json_encode(false);
        }

        // Cierra la conexión a la base de datos
        $conn->close();
    } else {
        // Si hay un error al decodificar JSON, devuelve un código de respuesta HTTP 400 (Bad Request) y un mensaje de error
        http_response_code(400);
        echo $data;
        echo "Error al decodificar JSON";
    }
}

else if($_SERVER['REQUEST_METHOD'] == "PUT"){
    if($token->nivel < $LVLADMIN){
        header('HTTP/1.1 401 Unauthorized'); // Devolver un código de error de autorización si el token no es válido
        echo json_encode(['error' => 'Autoridad insuficiente']);
        exit;
    }

    // Obtiene los datos JSON del cuerpo de la solicitud
    $json_data = file_get_contents("php://input");

    // Decodifica los datos JSON
    $data = json_decode($json_data, true);

    // Verifica si la decodificación de JSON fue exitosa
    if ($data !== null){
        // Obtener datos desde JSON
        $id = $data["id"];
        $ciudad = $data["ciudad"];
        $valor = $data["valor"];

        // Prepara y ejecuta una consulta SQL para verificar si existe un registro con el ID dado
        $chck = $conn->prepare("SELECT ciudad FROM destParking WHERE iddest = ?");
        $chck->bind_param("i",$id);
        $chck->execute();
        $result = $chck->get_result();

        // Verifica si existe al menos un registro con el ID dado
        if($result->num_rows >= 1){
            // Si existe, prepara y ejecuta una consulta SQL para actualizar el registro
            $stmt = $conn->prepare("UPDATE destParking SET ciudad = ?, valor = ? WHERE iddest = ?");
            $stmt->bind_param("sii", $ciudad, $valor, $id);
    
            // Ejecuta la consulta SQL de actualización
            try{
                if($stmt->execute()){
                    // Si la actualización es exitosa, devuelve true en formato JSON
                    header('Content-Type: application/json');
                    echo json_encode(true);
                } else {
                    // Si hay un error en la actualización, devuelve false en formato JSON
                    header('Content-Type: application/json');
                    echo json_encode(false);
                }
            } catch (mysqli_sql_exception $e){
                // Si hay una excepción en la consulta, devuelve el código de error en formato JSON
                header('Content-Type: application/json');
                echo json_encode(mysqli_errno($conn));
                $conn->close();
                exit;
            }
        } else {
            // Si no existe un registro con el ID dado, devuelve false en formato JSON
            header('Content-Type: application/json');
            echo json_encode(false);
        }
    } else {
        // Si hay un error al decodificar JSON, devuelve un código de respuesta HTTP 400 (Bad Request) y un mensaje de error
        http_response_code(400);
        echo $data;
        echo "Error al decodificar JSON";
    }
}

else if($_SERVER['REQUEST_METHOD'] == "DELETE"){
    if($token->nivel < $LVLADMIN){
        header('HTTP/1.1 401 Unauthorized'); // Devolver un código de error de autorización si el token no es válido
        echo json_encode(['error' => 'Autoridad insuficiente']);
        exit;
    }

    // Obtiene los datos JSON del cuerpo de la solicitud
    $json_data = file_get_contents("php://input");

    // Decodifica los datos JSON
    $data = json_decode($json_data, true);

    // Verifica si la decodificación de JSON fue exitosa
    if ($data !== null){
        // Obtener datos desde JSON
        $id = $data["id"];

        // Preparar y ejecutar consulta SQL para verificar la existencia del registro
        $chck = $conn->prepare("SELECT ciudad FROM destParking WHERE iddest = ?");
        $chck->bind_param("i",$id);
        $chck->execute();
        $result = $chck->get_result();

        // Verificar si hay al menos una fila devuelta
        if($result->num_rows >= 1){
            // Preparar y ejecutar consulta SQL para eliminar el registro
            $stmt = $conn->prepare("DELETE FROM destParking WHERE iddest = ?");
            $stmt->bind_param("i", $id);
    
            // Ejecutar la consulta SQL para eliminar el registro
            if($stmt->execute()){
                // Si se elimina correctamente, devolver true en formato JSON
                header('Content-Type: application/json');
                echo json_encode(true);
            } else {
                // Si hay un error al eliminar, devolver false en formato JSON
                header('Content-Type: application/json');
                echo json_encode(false);
            }
        } else {
            // Si no se encuentra el registro, devolver false en formato JSON
            header('Content-Type: application/json');
            echo json_encode(false);
        }

        // Cerrar la conexión a la base de datos
        $conn->close();
    } else {
        // Si hay un error al decodificar JSON, devolver un código de respuesta HTTP 400 (Bad Request)
        http_response_code(400);
        echo "Error al decodificar JSON";
    }
}

$conn->close();
?>
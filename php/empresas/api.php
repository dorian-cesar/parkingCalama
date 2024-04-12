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
include(dirname(__DIR__)."/conf.php"); 



if($_SERVER['REQUEST_METHOD'] == 'GET'){

    if(isset($_GET['id'])){
        // Si hay un ID en los datos, buscar solo ese registro
        $id = $_GET['id'];

        // Prepara y ejecuta una consulta SQL para obtener el registro por ID
        $stmt = $conn->prepare("SELECT idemp, nombre, contacto FROM empParking WHERE idemp = ?");
        $stmt->bind_param("i",$id);

        try{
            $stmt->execute();
            $result = $stmt->get_result();
            $datos = $result->fetch_assoc();

            // Devuelve el resultado en formato JSON
            echo json_encode($datos);
        } catch(mysqli_sql_exception $e){
            // En caso de error, devuelve el código de error en formato JSON
            echo json_encode(['error' => mysqli_errno($conn)]);
        }
    }
    // Si no hay datos JSON, devolver todos los registros
    else {
        // Prepara y ejecuta una consulta SQL para obtener todos los registros
        $stmt = $conn->prepare("SELECT idemp, nombre, contacto FROM empParking");
        
        try{
            $stmt->execute();
            $result = $stmt->get_result();
            $datos = $result->fetch_all(MYSQLI_ASSOC);
            
            echo json_encode($datos);
        } catch (mysqli_sql_exception $e) {
            echo json_encode(['error' => mysqli_errno($conn)]);
        } catch (Exception $e) {
            echo json_encode(['error' => $e]);
        }
    }
}

else if($_SERVER['REQUEST_METHOD'] == "POST"){

    // Obtiene los datos JSON del cuerpo de la solicitud
    $json_data = file_get_contents("php://input");

    // Decodifica los datos JSON
    $data = json_decode($json_data, true);

    // Verifica si la decodificación de JSON fue exitosa
    if ($data !== null){
        // Obtener datos desde JSON
        $nombre = $data["nombre"];
        $contacto = $data["contacto"];

        // Prepara y ejecuta una consulta SQL para verificar si ya existe una ciudad en la tabla
        $chck = $conn->prepare("SELECT nombre FROM empParking WHERE nombre = ?");
        $chck->bind_param("s",$nombre);
        $chck->execute();
        $result = $chck->get_result();

        // Verifica si no existe ya una ciudad con el mismo nombre en la tabla
        if($result->num_rows == 0){
            $stmt = $conn->prepare("INSERT INTO empParking (nombre, contacto) VALUES (?, ?)");
            $stmt->bind_param("ss", $nombre, $contacto);
    
            // Ejecuta la consulta SQL para insertar los datos
            if($stmt->execute()){
                // Si la inserción es exitosa, devuelve el ID del nuevo registro en formato JSON
                $id = $conn->insert_id;
                echo json_encode(['id' => $id, 'msg' => 'Insertado correctamente']);
            } else {
                // Si hay un error en la inserción, devuelve un mensaje de error en formato JSON
                echo json_encode(['error' => $conn->error]);
            }
        } else {
            echo json_encode(['error' => 'Ya existe registro!']);
        }
    } else {
        echo json_encode(['error' => 'Error al decodificar JSON']);
    }
}

else if($_SERVER['REQUEST_METHOD'] == "PUT"){

    // Obtiene los datos JSON del cuerpo de la solicitud
    $json_data = file_get_contents("php://input");

    // Decodifica los datos JSON
    $data = json_decode($json_data, true);

    // Verifica si la decodificación de JSON fue exitosa
    if ($data !== null){
        // Obtener datos desde JSON
        $id = $data["id"];
        $nombre = $data["nombre"];
        $contacto = $data["contacto"];

        // Prepara y ejecuta una consulta SQL para verificar si existe un registro con el ID dado
        $chck = $conn->prepare("SELECT nombre FROM empParking WHERE idemp = ?");
        $chck->bind_param("i",$id);
        $chck->execute();
        $result = $chck->get_result();

        // Verifica si existe al menos un registro con el ID dado
        if($result->num_rows >= 1){
            // Si existe, prepara y ejecuta una consulta SQL para actualizar el registro
            $stmt = $conn->prepare("UPDATE empParking SET nombre = ?, contacto = ? WHERE idemp = ?");
            $stmt->bind_param("ssi", $nombre, $contacto, $id);
    
            // Ejecuta la consulta SQL de actualización
            try{
                if($stmt->execute()){
                    echo json_encode(['id' => $id, 'msg' => 'Actualizado correctamente']);
                } else {
                    echo json_encode(['error' => $conn->error]);
                }
            } catch (mysqli_sql_exception $e){
                echo json_encode(['error' => mysqli_errno($conn)]);
            }
        } else {
            echo json_encode(['error' => 'ID no existe!']);
        }
    } else {
        echo json_encode(['error' => 'Error al decodificar JSON']);
    }
}

else if($_SERVER['REQUEST_METHOD'] == "DELETE"){
    if(isset($_GET['id'])){
        // Si hay un ID en los datos, buscar solo ese registro
        $id = $_GET['id'];

        // Preparar y ejecutar consulta SQL para verificar la existencia del registro
        $chck = $conn->prepare("SELECT nombre FROM empParking WHERE idemp = ?");
        $chck->bind_param("i",$id);
        $chck->execute();
        $result = $chck->get_result();

        // Verificar si hay al menos una fila devuelta
        if($result->num_rows >= 1){
            // Preparar y ejecutar consulta SQL para eliminar el registro
            $stmt = $conn->prepare("DELETE FROM empParking WHERE idemp = ?");
            $stmt->bind_param("i", $id);
    
            // Ejecutar la consulta SQL para eliminar el registro
            if($stmt->execute()){
                echo json_encode(['id' => $id, 'msg' => 'Eliminado correctamente']);
            } else {
                echo json_encode(['error' => $conn->error]);
            }
        } else {
            echo json_encode(['error' => 'ID no existe!']);
        }
    } else {
        echo json_encode(['error' => 'Error al decodificar JSON']);
    }
}

$conn->close();
?>
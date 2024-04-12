<?php
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
        $stmt = $conn->prepare("SELECT iddest, ciudad, valor FROM destParking WHERE iddest = ?");
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
        $stmt = $conn->prepare("SELECT iddest, ciudad, valor FROM destParking");
        
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
        $ciudad = $data["ciudad"];
        $valor = $data["valor"];

        if($valor < 0){
            echo json_encode(['error' => 'Valor no puede ser negativo']);
            exit();
        }

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
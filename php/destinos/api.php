<?php
// Declaración estricta de tipos para garantizar la coherencia en el tipo de datos
declare(strict_types=1);

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

include('../auth.php');

// ... Código anterior ...

if($_SERVER['REQUEST_METHOD'] == 'GET'){
    if($token->nivel < $LVLUSER){
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['error' => 'Autoridad insuficiente']);
        exit;
    }

    if(isset($_GET['id'])){
        // Si hay un ID en los datos, buscar solo ese registro
        $id = $_GET['id'];

        // Prepara y ejecuta una consulta SQL para obtener el registro por ID, incluyendo el campo tipo
        $stmt = $conn->prepare("SELECT iddest, ciudad, valor, tipo FROM destParking WHERE iddest = ?");
        $stmt->bind_param("i",$id);

        try{
            $stmt->execute();
            $result = $stmt->get_result();
            $datos = $result->fetch_assoc();

            // Devuelve el resultado en formato JSON, ahora con el campo 'tipo'
            echo json_encode($datos);
        } catch(mysqli_sql_exception $e){
            echo json_encode(['error' => mysqli_errno($conn)]);
        }
    }
    // Si no hay datos JSON, devolver todos los registros
    else {
        // Prepara y ejecuta una consulta SQL para obtener todos los registros, incluyendo el campo tipo
        $stmt = $conn->prepare("SELECT iddest, ciudad, valor, tipo FROM destParking");
        
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
    if($token->nivel < $LVLADMIN){
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['error' => 'Autoridad insuficiente']);
        exit;
    }

    // Obtiene los datos JSON del cuerpo de la solicitud
    $json_data = file_get_contents("php://input");

    // Decodifica los datos JSON
    $data = json_decode($json_data, true);

    if ($data !== null){
        // Obtener datos desde JSON, incluyendo 'tipo'
        $ciudad = $data["ciudad"];
        $valor = $data["valor"];
        $tipo = $data["tipo"];  // Agregar el tipo

        if($valor < 0){
            echo json_encode(['error' => 'Valor no puede ser negativo']);
            exit();
        }

        // Prepara y ejecuta una consulta SQL para verificar si ya existe una ciudad en la tabla
        $chck = $conn->prepare("SELECT ciudad FROM destParking WHERE ciudad = ?");
        $chck->bind_param("s",$ciudad);
        $chck->execute();
        $result = $chck->get_result();

        if($result->num_rows == 0){
            // Si no existe, inserta el nuevo destino con el tipo
            $stmt = $conn->prepare("INSERT INTO destParking (ciudad, valor, tipo) VALUES (?, ?, ?)");
            $stmt->bind_param("sis", $ciudad, $valor, $tipo);  // Asegúrate de que el tipo esté en el parámetro

            if($stmt->execute()){
                $id = $conn->insert_id;
                echo json_encode(['id' => $id, 'msg' => 'Insertado correctamente']);
            } else {
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
    if($token->nivel < $LVLADMIN){
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['error' => 'Autoridad insuficiente']);
        exit;
    }

    // Obtiene los datos JSON del cuerpo de la solicitud
    $json_data = file_get_contents("php://input");

    // Decodifica los datos JSON
    $data = json_decode($json_data, true);

    if ($data !== null){
        // Obtener datos desde JSON
        $id = $data["id"];
        $ciudad = $data["ciudad"];
        $valor = $data["valor"];
        $tipo = $data["tipo"];  // Agregar tipo

        // Prepara y ejecuta una consulta SQL para verificar si existe un registro con el ID dado
        $chck = $conn->prepare("SELECT ciudad FROM destParking WHERE iddest = ?");
        $chck->bind_param("i",$id);
        $chck->execute();
        $result = $chck->get_result();

        if($result->num_rows >= 1){
            // Si existe, actualiza el registro con el tipo también
            $stmt = $conn->prepare("UPDATE destParking SET ciudad = ?, valor = ?, tipo = ? WHERE iddest = ?");
            $stmt->bind_param("sisi", $ciudad, $valor, $tipo, $id);

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
    if($token->nivel < $LVLADMIN){
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['error' => 'Autoridad insuficiente']);
        exit;
    }

    // Obtiene los datos JSON del cuerpo de la solicitud
    $json_data = file_get_contents("php://input");

    // Decodifica los datos JSON
    $data = json_decode($json_data, true);

    if ($data !== null){
        // Obtener ID desde JSON
        $id = $data["id"];

        // Prepara y ejecuta consulta SQL para verificar la existencia del registro
        $chck = $conn->prepare("SELECT ciudad FROM destParking WHERE iddest = ?");
        $chck->bind_param("i",$id);
        $chck->execute();
        $result = $chck->get_result();

        if($result->num_rows >= 1){
            // Preparar y ejecutar consulta SQL para eliminar el registro
            $stmt = $conn->prepare("DELETE FROM destParking WHERE iddest = ?");
            $stmt->bind_param("i", $id);

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

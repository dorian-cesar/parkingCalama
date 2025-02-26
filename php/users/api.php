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
        $stmt = $conn->prepare("SELECT iduser, mail, nivel, seccion FROM userParking WHERE iduser = ?");
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
        $stmt = $conn->prepare("SELECT u.iduser, u.mail, u.seccion, n.descriptor FROM userParking AS u JOIN permParking AS n ON u.nivel = n.idperm ORDER BY iduser");       
        try{
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
        $mail = $data["mail"];
        $lvl = $data["lvl"];
        $seccion = $data["seccion"];
        $pass = password_hash($data["pass"], PASSWORD_DEFAULT); // Hashear la contraseña
                
        $chck = $conn->prepare("SELECT mail FROM userParking WHERE mail = ?");
        $chck->bind_param("s",$mail);
        $chck->execute();
        $result = $chck->get_result();

        // Verifica si no existe ya una ciudad con el mismo nombre en la tabla
        if($result->num_rows == 0){
            $stmt = $conn->prepare("INSERT INTO userParking (mail, pass, nivel, seccion) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssis", $mail, $pass, $lvl, $seccion);
    
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
        $id = $data["id"]; // ID del usuario
        $mail = $data["mail"]; // Correo electrónico
        $lvl = $data["lvl"]; // Nivel
        $seccion = $data["seccion"];
        $passOld = $data['passOld']; // Contraseña antigua
        $passHash = password_hash($data["pass"], PASSWORD_DEFAULT); // Hash de la nueva contraseña

        // Prepara y ejecuta una consulta SQL para verificar si existe un registro con el ID dado
        $chck = $conn->prepare("SELECT mail, pass FROM userParking WHERE mail = ?");
        $chck->bind_param("s",$mail);
        $chck->execute();
        $result = $chck->get_result();

        $accountExists = false;

        if($chck->execute()){
            $result = $chck->get_result(); // Obtener el resultado de la consulta

            if($result->num_rows > 0){
                $retrn = $result->fetch_Assoc(); // Obtener los datos del usuario como un array asociativo

                // Verificar si la contraseña antigua proporcionada coincide con la almacenada en la base de datos
                if(password_verify($passOld,$retrn['pass'])){
                    $accountExists = true; // La cuenta existe si la contraseña coincide
                } else {
                    echo json_encode(['error' => 'Contraseña incorrecta']);
                    exit;
                }
            } else {
                echo json_encode(['error' => 'ID no existe!']);
            }
        }

        if($accountExists == true ){
            $stmt = $conn->prepare("UPDATE userParking SET mail = ?, pass = ?, nivel = ?, seccion = ? WHERE iduser = ?");
            $stmt->bind_param("ssisi", $mail, $passHash, $lvl, $seccion, $id);

            try{
                if($stmt->execute()){
                    echo json_encode(['id' => $id, 'msg' => 'Actualizado correctamente']);
                } else {
                    echo json_encode(['error' => $conn->error]);
                }
            } catch(mysqli_sql_exception $e) {
                echo json_encode(['error' => mysqli_errno($conn)]);
            }
        }
    } else {
        echo json_encode(['error' => 'Error al decodificar JSON']);
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
        $id = $data;

        // Preparar y ejecutar consulta SQL para verificar la existencia del registro
        $chck = $conn->prepare("SELECT iduser FROM userParking WHERE iduser = ?");
        $chck->bind_param("i",$id);
        $chck->execute();
        $result = $chck->get_result();

        // Verificar si hay al menos una fila devuelta
        if($result->num_rows >= 1){
            // Preparar y ejecutar consulta SQL para eliminar el registro
            $stmt = $conn->prepare("DELETE FROM userParking WHERE iduser = ?");
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
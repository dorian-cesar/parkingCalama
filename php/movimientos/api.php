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

// Get
if($_SERVER['REQUEST_METHOD'] == 'GET') {
    if($token->nivel < $LVLUSER){
        header('HTTP/1.1 401 Unauthorized'); // Devolver un código de error de autorización si el token no es válido
        echo json_encode(['error' => 'Autoridad insuficiente']);
        exit;
    }

    if(isset($_GET['patente'])){
        $patente = str_replace('-','',$_GET['patente']);
        $date = date('Y-m-d');
        $stmt = $conn->prepare("SELECT m.idmov, m.fechaent, m.horaent, m.fechasal, m.horasal, m.patente, e.nombre AS empresa, m.tipo, m.valor FROM movParking as m JOIN empParking as e ON m.empresa = e.idemp WHERE m.patente = ? AND m.fechaent = ? ORDER BY m.idmov DESC");
        $stmt->bind_param("ss",$patente, $date);
    
        try {
            $stmt->execute();
            $result = $stmt->get_result();
            $datos = $result->fetch_assoc();
    
            echo json_encode($datos);
        } catch (mysqli_sql_exception $e) {
            echo json_encode(['error' => mysqli_errno($conn)]);
        } catch (Excepttion $e) {
            echo json_encode(['error' => $e]);
        }
    } else if(isset($_GET['id'])){
        $id = $_GET['id'];
        $date = date('Y-m-d');
        $stmt = $conn->prepare("SELECT m.idmov, m.fechaent, m.horaent, m.fechasal, m.horasal, m.patente, e.nombre AS empresa, m.tipo, m.valor FROM movParking as m JOIN empParking as e ON m.empresa = e.idemp WHERE m.idmov = ? AND m.fechaent = ?");
        $stmt->bind_param("is",$id,$date);
    
        try {
            $stmt->execute();
    
            $result = $stmt->get_result();
    
            $datos = $result->fetch_assoc();
    
            echo json_encode($datos);
        } catch (mysqli_sql_exception $e) {
            echo json_encode(['error' => mysqli_errno($conn)]);
        } catch (Excepttion $e) {
            echo json_encode(['error' => $e]);
        }
    } else {
        $date = date('Y-m-d');
        $stmt = $conn->prepare("SELECT m.idmov, m.fechaent, m.horaent, m.fechasal, m.horasal, m.patente, e.nombre AS empresa, m.tipo, m.valor FROM movParking as m JOIN empParking as e ON m.empresa = e.idemp WHERE m.fechaent = ? ORDER BY m.idmov");
        $stmt->bind_param("s",$date);
    
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
}
// Insert
else if($_SERVER['REQUEST_METHOD'] == 'POST') {
    if($token->nivel < $LVLUSER){
        header('HTTP/1.1 401 Unauthorized'); // Devolver un código de error de autorización si el token no es válido
        echo json_encode(['error' => 'Autoridad insuficiente']);
        exit;
    }

    $json_data = file_get_contents("php://input");

    $data = json_decode($json_data, true);

    if ($data !== null) {
        $fecha = $data['fecha'];
        $hora = $data['hora'];
        $patente = str_replace('-','',$data['patente']);
        $empresa = $data['empresa'];
        $tipo = $data['tipo'];

        $chck = $conn->prepare("SELECT idmov FROM movParking WHERE patente = ? AND fechasal = '0000-00-00'");
        $chck->bind_param("s",$patente);
        $chck->execute();
        $result = $chck->get_result();

        if($result->num_rows == 0){
            $stmt = $conn->prepare("INSERT INTO movParking (fechaent, horaent, patente, empresa, tipo, fechasal, horasal) VALUES (?,?,?,?,?,'0','0')");
            $stmt->bind_param("sssis",$fecha,$hora,$patente,$empresa,$tipo);

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
// Update (Pagado)
else if($_SERVER['REQUEST_METHOD'] == 'PUT') {
    if($token->nivel < $LVLUSER){
        header('HTTP/1.1 401 Unauthorized'); // Devolver un código de error de autorización si el token no es válido
        echo json_encode(['error' => 'Autoridad insuficiente']);
        exit;
    }

    $json_data = file_get_contents("php://input");

    $data = json_decode($json_data, true);

    if ($data !== null) {
        $fecha = $data['fecha'];
        $hora = $data['hora'];
        $valor = $data['valor'];
        $id = $data['id'];

        $stmt = $conn->prepare("UPDATE movParking SET fechasal = ?, horasal = ?, valor = ? WHERE idmov = ?");
        $stmt->bind_param("ssii",$fecha,$hora,$valor,$id);

        if($stmt->execute()) {
            echo json_encode(['id' => $id, 'msg' => 'Actualizado correctamente']);
        } else {
            echo json_encode(['error' => 'Error al actualizar']);
        }
    } else {
        echo json_encode(['error' => 'Error al decodificar JSON']);
    }
}
$conn->close();
?>
<?php
if ($token->nivel < $LVLUSER) {
    header('HTTP/1.1 401 Unauthorized');
    echo json_encode(['error' => 'Autoridad insuficiente']);
    exit;
}

$date = date('Y-m-d');
if (isset($_GET['patente'])) {
    $patente = str_replace('-', '', $_GET['patente']);
    $stmt = $conn->prepare("
        SELECT 
            m.idmov, m.fechaent, m.horaent, m.fechasal, m.horasal, m.patente, e.nombre AS empresa, m.tipo, m.valor, m.tarifa
        FROM 
            movParking AS m 
        JOIN 
            empParking AS e ON m.empresa = e.idemp
        WHERE 
            m.patente = ? AND m.fechaent = ? 
        ORDER BY 
            m.idmov DESC
    ");
    $stmt->bind_param("ss", $patente, $date);
} elseif (isset($_GET['id'])) {
    $id = $_GET['id'];
    $stmt = $conn->prepare("
        SELECT 
            m.idmov, m.fechaent, m.horaent, m.fechasal, m.horasal, m.patente, e.nombre AS empresa, m.tipo, m.valor, m.tarifa
        FROM 
            movParking AS m 
        JOIN 
            empParking AS e ON m.empresa = e.idemp
        WHERE 
            m.idmov = ? AND m.fechaent = ?
    ");
    $stmt->bind_param("is", $id, $date);
} else {
    $stmt = $conn->prepare("
        SELECT 
            m.idmov, m.fechaent, m.horaent, m.fechasal, m.horasal, m.patente, e.nombre AS empresa, m.tipo, m.valor, m.tarifa
        FROM 
            movParking AS m 
        JOIN 
            empParking AS e ON m.empresa = e.idemp
        WHERE 
            m.fechaent = ? 
        ORDER BY 
            m.idmov
    ");
    $stmt->bind_param("s", $date);
}

try {
    $stmt->execute();
    $result = $stmt->get_result();
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
} catch (mysqli_sql_exception $e) {
    echo json_encode(['error' => mysqli_errno($conn)]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

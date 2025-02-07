<?php
// confValoresAnden.php

$valores = [
    'nacional' => [
        'valorBase' => 0,
        'bloques' => 20
    ],
    'internacional' => [
        'valorBase' => 0,
        'bloques' => 30
    ]
];

header('Content-Type: application/json');

// Esto imprimirá el contenido antes de enviarlo
var_dump($valores);  // Verifica si los datos están correctamente formateados
echo json_encode($valores);

?>

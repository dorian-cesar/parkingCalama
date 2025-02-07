<?php

// En esta Seccion podras configurar cada cuantos minutos se realizara el cobro de anden
// Configuración de minutos por tipo de destino
$configuracion = [
    'nacional' => 20,  // Cada cuánto tiempo se cobra en destinos nacionales (en minutos)
    'internacional' => 30, // Cada cuánto tiempo se cobra en destinos internacionales (en minutos)
    'iva' => 0.21 // Porcentaje del IVA (21%)
];

// Devolver los valores como JSON
echo json_encode($configuracion);
?>

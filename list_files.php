<?php
$uploadDir = 'uploads/';

// Create uploads directory if it doesn't exist
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Obtener lista de archivos, excluyendo directorios especiales
$files = array_diff(scandir($uploadDir), array('..', '.'));

$fileList = [];
foreach ($files as $file) {
    $filePath = $uploadDir . $file;
    $fileList[] = [
        'name' => $file,
        'date' => date('Y-m-d H:i:s', filemtime($filePath))
    ];
}

header('Content-Type: application/json');
echo json_encode($fileList);
?>
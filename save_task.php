<?php
$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $uploadDir = 'uploads/';

    if (isset($data['action'])) {
        if ($data['action'] === 'rename') {
            $oldName = $uploadDir . $data['oldName'];
            $newName = $uploadDir . $data['newName'];

            if (file_exists($oldName)) {
                if (rename($oldName, $newName)) {
                    $response['success'] = true;
                    $response['message'] = 'Archivo renombrado exitosamente.';
                } else {
                    $response['message'] = 'Error al renombrar el archivo.';
                }
            } else {
                $response['message'] = 'Archivo original no encontrado.';
            }
        } elseif ($data['action'] === 'delete') {
            $fileName = $uploadDir . $data['fileName'];

            if (file_exists($fileName)) {
                if (unlink($fileName)) {
                    $response['success'] = true;
                    $response['message'] = 'Archivo eliminado exitosamente.';
                } else {
                    $response['message'] = 'Error al eliminar el archivo.';
                }
            } else {
                $response['message'] = 'Archivo no encontrado.';
            }
        }
    } elseif (isset($_FILES['file'])) {
        $file = $_FILES['file'];
        $uploadFilePath = $uploadDir . basename($file['name']);

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        if (move_uploaded_file($file['tmp_name'], $uploadFilePath)) {
            $response['success'] = true;
            $response['message'] = 'Archivo subido exitosamente.';
        } else {
            $response['message'] = 'Error al subir el archivo.';
        }
    }
} else {
    $response['message'] = 'Método no permitido.';
}

header('Content-Type: application/json');
echo json_encode($response);

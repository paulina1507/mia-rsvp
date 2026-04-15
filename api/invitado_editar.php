<?php
header("Content-Type: application/json; charset=UTF-8");

session_start();

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, "Método no permitido", null, 405);
}

if (!isset($_SESSION['usuario'])) {
    jsonResponse(false, "No autenticado", null, 401);
}

$input = json_decode(file_get_contents("php://input"), true);

if (!is_array($input)) {
    jsonResponse(false, "JSON inválido", null, 400);
}

$id_usuario = $_SESSION['usuario']['id_usuario'];
$id_invitado = isset($input['id_invitado']) ? (int)$input['id_invitado'] : 0;
$pases = isset($input['pases']) ? (int)$input['pases'] : 0;

if ($id_invitado <= 0 || $pases <= 0) {
    jsonResponse(false, "Datos incompletos o inválidos", null, 400);
}

$db = new DB();
$pdo = $db->connect();

try {
    $checkSql = "SELECT i.id_invitado
                 FROM invitados i
                 INNER JOIN eventos e ON e.id_evento = i.id_evento
                 WHERE i.id_invitado = :id_invitado
                   AND e.id_usuario = :id_usuario
                 LIMIT 1";

    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([
        'id_invitado' => $id_invitado,
        'id_usuario'  => $id_usuario
    ]);

    $invitado = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$invitado) {
        jsonResponse(false, "Invitado no encontrado o sin permisos", null, 404);
    }

    $sql = "UPDATE invitados
            SET pases = :pases,
                acompanantes_permitidos = :acompanantes_permitidos
            WHERE id_invitado = :id_invitado";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'pases' => $pases,
        'acompanantes_permitidos' => $pases,
        'id_invitado' => $id_invitado
    ]);

    jsonResponse(true, "Invitado actualizado correctamente");
} catch (Exception $e) {
    jsonResponse(false, "Error al actualizar invitado", null, 500);
}
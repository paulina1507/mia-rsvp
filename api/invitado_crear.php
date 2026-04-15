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

$id_usuario = $id_usuario = $_SESSION['usuario']['id_usuario'];
$id_evento = isset($input['id_evento']) ? (int)$input['id_evento'] : 0;
$nombre = trim((string)($input['nombre'] ?? ''));
$telefono = trim((string)($input['telefono'] ?? ''));
$pases = isset($input['pases']) ? (int)$input['pases'] : 1;
$acompanantes_permitidos = isset($input['acompanantes_permitidos']) ? (int)$input['acompanantes_permitidos'] : $pases;

if ($id_evento <= 0 || $nombre === '') {
    jsonResponse(false, "Faltan campos obligatorios", null, 400);
}

if ($pases < 1) {
    jsonResponse(false, "Los pases deben ser mínimo 1", null, 400);
}

if ($acompanantes_permitidos < 0) {
    jsonResponse(false, "Acompañantes permitidos inválidos", null, 400);
}

$db = new DB();
$pdo = $db->connect();

try {
    $checkSql = "SELECT id_evento, slug
                 FROM eventos
                 WHERE id_evento = :id_evento
                   AND id_usuario = :id_usuario
                 LIMIT 1";

    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([
        'id_evento' => $id_evento,
        'id_usuario' => $id_usuario
    ]);

    $evento = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$evento) {
        jsonResponse(false, "Evento no encontrado o sin permisos", null, 404);
    }

    $prefix = 'EV' . $id_evento;

    $maxSql = "SELECT MAX(CAST(SUBSTRING(codigo_invitado, :start_pos) AS UNSIGNED)) AS ultimo
               FROM invitados
               WHERE id_evento = :id_evento
                 AND codigo_invitado LIKE :prefix_like";

    $maxStmt = $pdo->prepare($maxSql);
    $maxStmt->execute([
        'start_pos'   => strlen($prefix) + 1,
        'id_evento'   => $id_evento,
        'prefix_like' => $prefix . '%'
    ]);

    $row = $maxStmt->fetch(PDO::FETCH_ASSOC);
    $siguiente = ((int)($row['ultimo'] ?? 0)) + 1;

    $codigo_invitado = $prefix . str_pad((string)$siguiente, 3, '0', STR_PAD_LEFT);

    $link_personalizado = "https://shiny-maker.com/events/xv/" . $evento['slug'] . "/?codigo=" . urlencode($codigo_invitado);

    $sql = "INSERT INTO invitados (
                id_evento,
                nombre,
                telefono,
                codigo_invitado,
                link_personalizado,
                pases,
                acompanantes_permitidos,
                estado_invitado,
                cantidad_confirmada
            ) VALUES (
                :id_evento,
                :nombre,
                :telefono,
                :codigo_invitado,
                :link_personalizado,
                :pases,
                :acompanantes_permitidos,
                'pendiente',
                0
            )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        'id_evento' => $id_evento,
        'nombre' => $nombre,
        'telefono' => $telefono !== '' ? $telefono : null,
        'codigo_invitado' => $codigo_invitado,
        'link_personalizado' => $link_personalizado,
        'pases' => $pases,
        'acompanantes_permitidos' => $acompanantes_permitidos
    ]);

    $id_invitado = $pdo->lastInsertId();

    jsonResponse(true, "Invitado agregado correctamente", [
        'id_invitado' => $id_invitado,
        'codigo_invitado' => $codigo_invitado,
        'link_personalizado' => $link_personalizado
    ]);

} catch (Throwable $e) {
    jsonResponse(false, "Error al agregar invitado: " . $e->getMessage(), null, 500);
}
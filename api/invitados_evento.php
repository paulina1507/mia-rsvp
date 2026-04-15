<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Content-Type: application/json; charset=UTF-8");

session_start();

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/helpers/response.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        jsonResponse(false, "Método no permitido", null, 405);
    }

    if (!isset($_SESSION['usuario'])) {
        jsonResponse(false, "No autenticado", null, 401);
    }

    $id_usuario = $_SESSION['usuario']['id_usuario'];
    $id_evento = $_GET['id_evento'] ?? null;

    if (!$id_evento) {
        jsonResponse(false, "Falta id_evento", null, 400);
    }

    $db = new DB();
    $pdo = $db->connect();

    $checkSql = "SELECT id_evento
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

    $sql = "SELECT
                id_invitado,
                nombre,
                telefono,
                codigo_invitado,
                link_personalizado,
                pases,
                acompanantes_permitidos,
                numero_mesa,
                grupo_familiar,
                estado_invitado,
                cantidad_confirmada,
                mensaje_confirmacion,
                fecha_confirmacion
            FROM invitados
            WHERE id_evento = :id_evento
            ORDER BY id_invitado DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id_evento' => $id_evento]);

    $invitados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse(true, "Invitados cargados", $invitados);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "message" => "Error interno en invitados_evento.php",
        "error" => $e->getMessage(),
        "file" => $e->getFile(),
        "line" => $e->getLine()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
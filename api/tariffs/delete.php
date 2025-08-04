<?php
// api/tariffs/delete.php - Удаление тарифа (только админ)

require_once '../config.php';

// Проверяем права администратора
if (!checkAdmin()) {
    http_response_code(403);
    sendJsonResponse(['success' => false, 'error' => 'Access denied']);
}

// Принимаем только POST запросы
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    sendJsonResponse(['success' => false, 'error' => 'Method not allowed']);
}

// Получаем данные
$input = json_decode(file_get_contents('php://input'), true);
$id = $input['id'] ?? null;

if (!$id) {
    sendJsonResponse(['success' => false, 'error' => 'Tariff ID is required']);
}

try {
    $pdo = getDbConnection();
    
    // Проверяем, не является ли это единственным активным тарифом
    $countStmt = $pdo->prepare("SELECT COUNT(*) as count FROM tariffs WHERE is_active = TRUE");
    $countStmt->execute();
    $count = $countStmt->fetch()['count'];
    
    if ($count <= 1) {
        sendJsonResponse(['success' => false, 'error' => 'Cannot delete the last active tariff']);
    }
    
    // Проверяем, не является ли это тарифом по умолчанию
    $checkStmt = $pdo->prepare("SELECT is_default, name FROM tariffs WHERE id = ? LIMIT 1");
    $checkStmt->execute([$id]);
    $tariff = $checkStmt->fetch();
    
    if (!$tariff) {
        sendJsonResponse(['success' => false, 'error' => 'Tariff not found']);
    }
    
    // Мягкое удаление - просто деактивируем
    $updateStmt = $pdo->prepare("
        UPDATE tariffs 
        SET is_active = FALSE, 
            is_default = FALSE,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ");
    $updateStmt->execute([$id]);
    
    // Если это был тариф по умолчанию, назначаем новый
    if ($tariff['is_default']) {
        $newDefaultStmt = $pdo->prepare("
            UPDATE tariffs 
            SET is_default = TRUE 
            WHERE is_active = TRUE 
            ORDER BY year DESC, id DESC 
            LIMIT 1
        ");
        $newDefaultStmt->execute();
    }
    
    // Логируем действие
    error_log("Admin {$_SESSION['user_email']} deleted tariff: {$tariff['name']} (ID: {$id})");
    
    sendJsonResponse([
        'success' => true,
        'message' => 'Tariff deleted successfully'
    ]);
    
} catch (Exception $e) {
    error_log("Delete tariff error: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Internal server error']);
}
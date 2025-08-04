<?php
// api/tariffs/set-default.php - Установка тарифа по умолчанию (только админ)

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
    
    // Проверяем существование и активность тарифа
    $checkStmt = $pdo->prepare("SELECT id, name, is_active FROM tariffs WHERE id = ? LIMIT 1");
    $checkStmt->execute([$id]);
    $tariff = $checkStmt->fetch();
    
    if (!$tariff) {
        sendJsonResponse(['success' => false, 'error' => 'Tariff not found']);
    }
    
    if (!$tariff['is_active']) {
        sendJsonResponse(['success' => false, 'error' => 'Cannot set inactive tariff as default']);
    }
    
    // Начинаем транзакцию
    $pdo->beginTransaction();
    
    try {
        // Убираем флаг default у всех тарифов
        $resetStmt = $pdo->prepare("UPDATE tariffs SET is_default = FALSE");
        $resetStmt->execute();
        
        // Устанавливаем новый тариф по умолчанию
        $setStmt = $pdo->prepare("UPDATE tariffs SET is_default = TRUE WHERE id = ?");
        $setStmt->execute([$id]);
        
        // Подтверждаем транзакцию
        $pdo->commit();
        
        // Логируем действие
        error_log("Admin {$_SESSION['user_email']} set default tariff: {$tariff['name']} (ID: {$id})");
        
        sendJsonResponse([
            'success' => true,
            'message' => 'Default tariff set successfully'
        ]);
        
    } catch (Exception $e) {
        // Откатываем транзакцию при ошибке
        $pdo->rollBack();
        throw $e;
    }
    
} catch (Exception $e) {
    error_log("Set default tariff error: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Internal server error']);
}
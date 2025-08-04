<?php
// api/tariffs/list.php - Получение списка всех тарифов

require_once '../config.php';

// Проверяем авторизацию
if (!checkAuth()) {
    http_response_code(401);
    sendJsonResponse(['success' => false, 'error' => 'Unauthorized']);
}

try {
    $pdo = getDbConnection();
    
    // Получаем список активных тарифов
    $stmt = $pdo->prepare("
        SELECT 
            id,
            name,
            year,
            is_active,
            is_default,
            created_at,
            updated_at
        FROM tariffs
        WHERE is_active = TRUE
        ORDER BY year DESC, name ASC
    ");
    $stmt->execute();
    $tariffs = $stmt->fetchAll();
    
    // Если нет тарифа по умолчанию, устанавливаем первый активный
    $hasDefault = false;
    foreach ($tariffs as $tariff) {
        if ($tariff['is_default']) {
            $hasDefault = true;
            break;
        }
    }
    
    if (!$hasDefault && count($tariffs) > 0) {
        $updateStmt = $pdo->prepare("UPDATE tariffs SET is_default = TRUE WHERE id = ?");
        $updateStmt->execute([$tariffs[0]['id']]);
        $tariffs[0]['is_default'] = true;
    }
    
    sendJsonResponse([
        'success' => true,
        'tariffs' => $tariffs
    ]);
    
} catch (Exception $e) {
    error_log("Get tariffs list error: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Internal server error']);
}
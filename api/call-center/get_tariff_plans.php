<?php
// api/call-center/get_tariff_plans.php - Получение тарифных планов КЦ

require_once '../config.php';

// Проверяем авторизацию
if (!checkAuth()) {
    http_response_code(401);
    sendJsonResponse(['success' => false, 'error' => 'Unauthorized']);
}

try {
    $pdo = getDbConnection();
    
    $sql = "SELECT * FROM tariff_plans ORDER BY id";
    $stmt = $pdo->query($sql);
    $plans = $stmt->fetchAll();
    
    sendJsonResponse([
        'success' => true,
        'data' => $plans
    ]);
    
} catch (Exception $e) {
    error_log("Get CC tariff plans error: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Internal server error']);
}
?>
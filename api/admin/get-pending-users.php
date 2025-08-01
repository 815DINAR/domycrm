<?php
// api/admin/get-pending-users.php - Получение списка пользователей, ожидающих одобрения

require_once '../config.php';

// Проверяем права администратора
if (!checkAdmin()) {
    http_response_code(403);
    sendJsonResponse(['success' => false, 'error' => 'Access denied']);
}

try {
    $pdo = getDbConnection();
    
    // Получаем всех пользователей со статусом pending
    $stmt = $pdo->prepare("
        SELECT id, email, name, created_at 
        FROM users 
        WHERE status = 'pending' 
        ORDER BY created_at DESC
    ");
    $stmt->execute();
    $users = $stmt->fetchAll();
    
    sendJsonResponse([
        'success' => true,
        'users' => $users
    ]);
    
} catch (Exception $e) {
    error_log("Get pending users error: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Internal server error']);
}
?>
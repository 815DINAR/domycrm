<?php
// api/admin/get-all-users.php - Получение списка всех пользователей

require_once '../config.php';

// Проверяем права администратора
if (!checkAdmin()) {
    http_response_code(403);
    sendJsonResponse(['success' => false, 'error' => 'Access denied']);
}

try {
    $pdo = getDbConnection();
    
    // Получаем всех пользователей
    $stmt = $pdo->prepare("
        SELECT id, email, name, role, status, created_at, updated_at
        FROM users 
        ORDER BY created_at DESC
    ");
    $stmt->execute();
    $users = $stmt->fetchAll();
    
    sendJsonResponse([
        'success' => true,
        'users' => $users
    ]);
    
} catch (Exception $e) {
    error_log("Get all users error: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Internal server error']);
}
?>
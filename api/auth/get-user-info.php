<?php
// api/auth/get-user-info.php - Получение информации о текущем пользователе

require_once '../config.php';

// Проверяем авторизацию
if (!checkAuth()) {
    http_response_code(401);
    sendJsonResponse(['success' => false, 'error' => 'Unauthorized']);
}

try {
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("
        SELECT id, email, name, role, status, created_at, updated_at
        FROM users 
        WHERE id = ? 
        LIMIT 1
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        sendJsonResponse(['success' => false, 'error' => 'User not found']);
    }
    
    sendJsonResponse([
        'success' => true,
        'id' => $user['id'],
        'email' => $user['email'],
        'name' => $user['name'],
        'role' => $user['role'],
        'status' => $user['status'],
        'created_at' => $user['created_at'],
        'updated_at' => $user['updated_at']
    ]);
    
} catch (Exception $e) {
    error_log("Get user info error: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Internal server error']);
}
?>
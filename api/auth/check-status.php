<?php
// api/auth/check-status.php - Проверка статуса авторизации

require_once '../config.php';

startSecureSession();

// Проверяем наличие сессии
if (!isset($_SESSION['user_id'])) {
    sendJsonResponse([
        'authorized' => false,
        'status' => null,
        'role' => null
    ]);
}

try {
    // Получаем актуальные данные из БД
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("
        SELECT id, email, name, status, role, created_at 
        FROM users 
        WHERE id = ? 
        LIMIT 1
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        // Пользователь не найден - очищаем сессию
        session_destroy();
        sendJsonResponse([
            'authorized' => false,
            'status' => null,
            'role' => null
        ]);
    }
    
    // Обновляем данные сессии
    $_SESSION['user_status'] = $user['status'];
    $_SESSION['user_role'] = $user['role'];
    $_SESSION['user_email'] = $user['email'];
    
    // Возвращаем данные
    sendJsonResponse([
        'authorized' => true,
        'status' => $user['status'],
        'role' => $user['role'],
        'email' => $user['email'],
        'name' => $user['name']
    ]);
    
} catch (Exception $e) {
    error_log("Check status error: " . $e->getMessage());
    sendJsonResponse([
        'authorized' => false,
        'status' => null,
        'role' => null,
        'error' => 'Internal server error'
    ]);
}
?>
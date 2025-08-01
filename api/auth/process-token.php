<?php
// api/auth/process-token.php - Обработка токена от Яндекса

require_once '../config.php';

// Принимаем только POST запросы
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    sendJsonResponse(['success' => false, 'error' => 'Method not allowed']);
}

// Получаем данные из запроса
$input = json_decode(file_get_contents('php://input'), true);
$accessToken = $input['token'] ?? null;

if (!$accessToken) {
    sendJsonResponse(['success' => false, 'error' => 'Token not provided']);
}

try {
    // Получаем данные пользователя от Яндекса
    $ch = curl_init('https://login.yandex.ru/info');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: OAuth ' . $accessToken
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        sendJsonResponse(['success' => false, 'error' => 'Failed to get user info from Yandex']);
    }
    
    $yandexUser = json_decode($response, true);
    
    if (!$yandexUser || !isset($yandexUser['id'])) {
        sendJsonResponse(['success' => false, 'error' => 'Invalid user data from Yandex']);
    }
    
    // Подключаемся к БД
    $pdo = getDbConnection();
    
    // Проверяем, существует ли пользователь
    $stmt = $pdo->prepare("SELECT id, status, role FROM users WHERE yandex_id = ? LIMIT 1");
    $stmt->execute([$yandexUser['id']]);
    $existingUser = $stmt->fetch();
    
    if ($existingUser) {
        // Пользователь существует
        $userId = $existingUser['id'];
        $status = $existingUser['status'];
        $role = $existingUser['role'];
        
        // Обновляем последний вход
        $updateStmt = $pdo->prepare("UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $updateStmt->execute([$userId]);
    } else {
        // Новый пользователь
        $email = $yandexUser['default_email'] ?? $yandexUser['emails'][0] ?? null;
        $name = $yandexUser['display_name'] ?? $yandexUser['real_name'] ?? null;
        
        if (!$email) {
            sendJsonResponse(['success' => false, 'error' => 'Email not provided by Yandex']);
        }
        
        // Проверяем, есть ли email в предодобренных
        $preapprovedStmt = $pdo->prepare("SELECT id FROM pre_approved_emails WHERE email = ? LIMIT 1");
        $preapprovedStmt->execute([$email]);
        $isPreapproved = $preapprovedStmt->fetch();
        
        // Определяем статус
        $status = $isPreapproved ? 'approved' : 'pending';
        $role = 'employee'; // По умолчанию обычный пользователь
        
        // Создаем нового пользователя
        $insertStmt = $pdo->prepare("
            INSERT INTO users (yandex_id, email, name, role, status) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $insertStmt->execute([
            $yandexUser['id'],
            $email,
            $name,
            $role,
            $status
        ]);
        
        $userId = $pdo->lastInsertId();
    }
    
    // Создаем сессию
    startSecureSession();
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_status'] = $status;
    $_SESSION['user_role'] = $role;
    $_SESSION['user_email'] = $email ?? $existingUser['email'] ?? '';
    
    // Возвращаем результат
    sendJsonResponse([
        'success' => true,
        'status' => $status,
        'role' => $role
    ]);
    
} catch (Exception $e) {
    error_log("Process token error: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'error' => 'Internal server error']);
}
?>
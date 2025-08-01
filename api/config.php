<?php
// api/config.php - Конфигурация и подключение к БД

// Запрещаем прямой доступ к файлу
if (basename($_SERVER['PHP_SELF']) == basename(__FILE__)) {
    die('Direct access denied');
}

// Параметры подключения к БД
define('DB_HOST', 'localhost');
define('DB_NAME', 'u3000935_default');
define('DB_USER', 'u3000935_default');
define('DB_PASS', 'Ci6A4KalBiJUr47J');

// Параметры сайта
define('SITE_URL', 'https://xml-editor.ru');
define('YANDEX_CLIENT_ID', 'c712414d0b7f462a8275474444e00239');

// Установка часового пояса
date_default_timezone_set('Europe/Moscow');

// Включаем отображение ошибок (отключить на продакшене)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Функция подключения к БД
function getDbConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS);
        
        // Настройки PDO
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        
        return $pdo;
    } catch (PDOException $e) {
        // Логируем ошибку
        error_log("Database connection error: " . $e->getMessage());
        
        // Возвращаем общую ошибку пользователю
        http_response_code(500);
        die(json_encode(['success' => false, 'error' => 'Database connection error']));
    }
}

// Функция для безопасного старта сессии
function startSecureSession() {
    if (session_status() == PHP_SESSION_NONE) {
        // Настройки безопасности сессии
        ini_set('session.cookie_httponly', 1);
        ini_set('session.use_only_cookies', 1);
        ini_set('session.cookie_secure', 1); // Только HTTPS
        
        session_start();
        
        // Регенерируем ID сессии для безопасности
        if (!isset($_SESSION['created'])) {
            $_SESSION['created'] = time();
        } else if (time() - $_SESSION['created'] > 3600) {
            // Регенерируем ID каждый час
            session_regenerate_id(true);
            $_SESSION['created'] = time();
        }
    }
}

// Функция проверки авторизации
function checkAuth() {
    startSecureSession();
    
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['user_status'])) {
        return false;
    }
    
    // Дополнительная проверка в БД
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("SELECT id, status, role FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        
        if (!$user || $user['status'] !== 'approved') {
            // Очищаем сессию если пользователь не найден или не одобрен
            session_destroy();
            return false;
        }
        
        // Обновляем данные сессии
        $_SESSION['user_status'] = $user['status'];
        $_SESSION['user_role'] = $user['role'];
        
        return true;
    } catch (Exception $e) {
        error_log("Auth check error: " . $e->getMessage());
        return false;
    }
}

// Функция проверки роли администратора
function checkAdmin() {
    if (!checkAuth()) {
        return false;
    }
    
    return isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';
}

// Функция для отправки JSON ответа
function sendJsonResponse($data) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Функция для защиты от CSRF
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}
?>
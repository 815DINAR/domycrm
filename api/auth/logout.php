<?php
// api/auth/logout.php - Выход из системы

require_once '../config.php';

startSecureSession();

// Уничтожаем сессию
$_SESSION = array();

// Удаляем куки сессии
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Уничтожаем сессию
session_destroy();

// Перенаправляем на главную
header('Location: ' . SITE_URL);
exit();
?>
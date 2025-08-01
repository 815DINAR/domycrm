// auth.js - Общая логика авторизации для всех страниц

// Функция проверки авторизации
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/check-status.php');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        return { authorized: false };
    }
}

// Функция выхода из системы
async function logout() {
    try {
        await fetch('/api/auth/logout.php');
        window.location.href = '/';
    } catch (error) {
        console.error('Ошибка при выходе:', error);
        window.location.href = '/';
    }
}

// Функция для получения информации о текущем пользователе
async function getCurrentUser() {
    try {
        const response = await fetch('/api/auth/get-user-info.php');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка получения данных пользователя:', error);
        return null;
    }
}

// Защита страниц от неавторизованного доступа
async function protectPage(requiredStatus = 'approved') {
    const auth = await checkAuth();
    
    if (!auth.authorized) {
        window.location.href = '/login.html';
        return false;
    }
    
    if (auth.status !== requiredStatus && requiredStatus !== 'any') {
        if (auth.status === 'pending') {
            window.location.href = '/waiting.html';
        } else {
            window.location.href = '/login.html';
        }
        return false;
    }
    
    return auth;
}

// Функция для отображения ошибок из URL
function displayUrlError() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error) {
        let message = '';
        switch (error) {
            case 'rejected':
                message = 'Ваша заявка была отклонена';
                break;
            case 'processing':
                message = 'Ошибка обработки данных авторизации';
                break;
            case 'network':
                message = 'Ошибка сети. Попробуйте позже';
                break;
            case 'no_token':
                message = 'Ошибка авторизации. Попробуйте снова';
                break;
            default:
                message = 'Произошла ошибка';
        }
        
        if (message) {
            showNotification(message, 'error');
        }
    }
}

// Функция показа уведомлений
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}
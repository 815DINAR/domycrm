// admin.js - Логика работы админ панели

// Переключение вкладок админки
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, что мы на странице с админкой
    if (!document.querySelector('.admin-tabs')) return;
    
    // Обработчики для вкладок
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Убираем активный класс со всех вкладок
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });
            
            // Активируем текущую вкладку
            this.classList.add('active');
            const content = document.getElementById(`${tabName}-tab`);
            if (content) {
                content.style.display = 'block';
                content.classList.add('active');
            }
            
            // Загружаем данные для вкладки
            loadTabData(tabName);
        });
    });
    
    // Загружаем данные первой вкладки
    loadTabData('pending');
});

// Загрузка данных для вкладки
async function loadTabData(tabName) {
    switch (tabName) {
        case 'pending':
            await loadPendingUsers();
            break;
        case 'users':
            await loadAllUsers();
            break;
        case 'preapproved':
            await loadPreapprovedEmails();
            break;
    }
}

// Загрузка списка ожидающих одобрения
async function loadPendingUsers() {
    const container = document.getElementById('pendingUsersList');
    container.innerHTML = '<p>Загрузка...</p>';
    
    try {
        const response = await fetch('/api/admin/get-pending-users.php');
        const data = await response.json();
        
        if (data.success && data.users.length > 0) {
            container.innerHTML = data.users.map(user => `
                <div class="user-item" data-user-id="${user.id}">
                    <div class="user-info-admin">
                        <div class="user-email-admin">${user.email}</div>
                        <div class="user-meta">
                            ${user.name ? `${user.name} • ` : ''}
                            Заявка от ${new Date(user.created_at).toLocaleDateString('ru-RU')}
                        </div>
                    </div>
                    <div class="user-actions">
                        <button class="btn-approve" onclick="approveUser(${user.id})">Одобрить</button>
                        <button class="btn-reject" onclick="rejectUser(${user.id})">Отклонить</button>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 11l3 3L22 4"></path>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                    </svg>
                    <p>Нет пользователей, ожидающих одобрения</p>
                </div>
            `;
        }
    } catch (error) {
        container.innerHTML = '<p style="color: red;">Ошибка загрузки данных</p>';
        console.error('Ошибка загрузки pending users:', error);
    }
}

// Одобрение пользователя
async function approveUser(userId) {
    if (!confirm('Одобрить доступ этому пользователю?')) return;
    
    try {
        const response = await fetch('/api/admin/approve-user.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAdminNotification('Пользователь одобрен', 'success');
            // Удаляем элемент из списка
            const userItem = document.querySelector(`[data-user-id="${userId}"]`);
            if (userItem) userItem.remove();
            
            // Проверяем, остались ли еще пользователи
            const container = document.getElementById('pendingUsersList');
            if (!container.querySelector('.user-item')) {
                loadPendingUsers();
            }
        } else {
            showAdminNotification('Ошибка: ' + data.error, 'error');
        }
    } catch (error) {
        showAdminNotification('Ошибка сети', 'error');
        console.error('Ошибка одобрения:', error);
    }
}

// Отклонение пользователя
async function rejectUser(userId) {
    if (!confirm('Отклонить заявку этого пользователя?')) return;
    
    try {
        const response = await fetch('/api/admin/reject-user.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAdminNotification('Заявка отклонена', 'success');
            const userItem = document.querySelector(`[data-user-id="${userId}"]`);
            if (userItem) userItem.remove();
            
            const container = document.getElementById('pendingUsersList');
            if (!container.querySelector('.user-item')) {
                loadPendingUsers();
            }
        } else {
            showAdminNotification('Ошибка: ' + data.error, 'error');
        }
    } catch (error) {
        showAdminNotification('Ошибка сети', 'error');
        console.error('Ошибка отклонения:', error);
    }
}

// Загрузка всех пользователей
async function loadAllUsers() {
    const container = document.getElementById('allUsersList');
    container.innerHTML = '<p>Загрузка...</p>';
    
    try {
        const response = await fetch('/api/admin/get-all-users.php');
        const data = await response.json();
        
        if (data.success && data.users.length > 0) {
            container.innerHTML = data.users.map(user => `
                <div class="user-item">
                    <div class="user-info-admin">
                        <div class="user-email-admin">
                            ${user.email}
                            <span class="user-status ${user.status}">${getStatusText(user.status)}</span>
                        </div>
                        <div class="user-meta">
                            ${user.name ? `${user.name} • ` : ''}
                            ${user.role === 'admin' ? 'Администратор • ' : ''}
                            Зарегистрирован: ${new Date(user.created_at).toLocaleDateString('ru-RU')}
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>Нет пользователей</p>';
        }
    } catch (error) {
        container.innerHTML = '<p style="color: red;">Ошибка загрузки данных</p>';
        console.error('Ошибка загрузки all users:', error);
    }
}

// Загрузка предодобренных email
async function loadPreapprovedEmails() {
    const container = document.getElementById('preapprovedList');
    container.innerHTML = '<p>Загрузка...</p>';
    
    try {
        const response = await fetch('/api/admin/get-preapproved-emails.php');
        const data = await response.json();
        
        if (data.success && data.emails.length > 0) {
            container.innerHTML = data.emails.map(item => `
                <div class="user-item">
                    <div class="user-info-admin">
                        <div class="user-email-admin">${item.email}</div>
                        <div class="user-meta">
                            Добавлен: ${new Date(item.created_at).toLocaleDateString('ru-RU')}
                        </div>
                    </div>
                    <div class="user-actions">
                        <button class="btn-remove-email" onclick="removePreapprovedEmail(${item.id})">Удалить</button>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>Нет предодобренных email адресов</p>';
        }
    } catch (error) {
        container.innerHTML = '<p style="color: red;">Ошибка загрузки данных</p>';
        console.error('Ошибка загрузки preapproved emails:', error);
    }
}

// Добавление предодобренного email
document.getElementById('addPreapprovedBtn')?.addEventListener('click', async function() {
    const emailInput = document.getElementById('newPreapprovedEmail');
    const email = emailInput.value.trim();
    
    if (!email) {
        showAdminNotification('Введите email адрес', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showAdminNotification('Введите корректный email адрес', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/add-preapproved-email.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAdminNotification('Email добавлен', 'success');
            emailInput.value = '';
            loadPreapprovedEmails();
        } else {
            showAdminNotification('Ошибка: ' + data.error, 'error');
        }
    } catch (error) {
        showAdminNotification('Ошибка сети', 'error');
        console.error('Ошибка добавления email:', error);
    }
});

// Удаление предодобренного email
async function removePreapprovedEmail(emailId) {
    if (!confirm('Удалить этот email из списка предодобренных?')) return;
    
    try {
        const response = await fetch('/api/admin/remove-preapproved-email.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: emailId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAdminNotification('Email удален', 'success');
            loadPreapprovedEmails();
        } else {
            showAdminNotification('Ошибка: ' + data.error, 'error');
        }
    } catch (error) {
        showAdminNotification('Ошибка сети', 'error');
        console.error('Ошибка удаления email:', error);
    }
}

// Поиск пользователей
document.getElementById('userSearch')?.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const userItems = document.querySelectorAll('#allUsersList .user-item');
    
    userItems.forEach(item => {
        const email = item.querySelector('.user-email-admin').textContent.toLowerCase();
        const meta = item.querySelector('.user-meta').textContent.toLowerCase();
        
        if (email.includes(searchTerm) || meta.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
});

// Фильтр по статусу
document.getElementById('statusFilter')?.addEventListener('change', function(e) {
    const filterValue = e.target.value;
    const userItems = document.querySelectorAll('#allUsersList .user-item');
    
    userItems.forEach(item => {
        const status = item.querySelector('.user-status')?.className.split(' ')[1];
        
        if (!filterValue || status === filterValue) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
});

// Вспомогательные функции
function getStatusText(status) {
    const statusMap = {
        'approved': 'Одобрен',
        'pending': 'Ожидает',
        'rejected': 'Отклонен'
    };
    return statusMap[status] || status;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showAdminNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
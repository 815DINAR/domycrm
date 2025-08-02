// admin.js - Логика работы админ панели

// Глобальные функции для управления пользователями (должны быть доступны из HTML)
window.approveUser = async function(userId) {
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

window.rejectUser = async function(userId) {
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

window.changeUserStatus = async function(userId, newStatus) {
    try {
        const response = await fetch('/api/admin/update-user-status.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                user_id: userId,
                status: newStatus 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAdminNotification('Статус пользователя изменен', 'success');
            // Обновляем отображение статуса
            const userItem = document.querySelector(`[data-user-id="${userId}"]`);
            if (userItem) {
                const statusSpan = userItem.querySelector('.user-status');
                statusSpan.className = `user-status ${newStatus}`;
                statusSpan.textContent = getStatusText(newStatus);
            }
        } else {
            showAdminNotification('Ошибка: ' + data.error, 'error');
            // Возвращаем предыдущее значение в селекте
            loadAllUsers();
        }
    } catch (error) {
        showAdminNotification('Ошибка сети', 'error');
        console.error('Ошибка изменения статуса:', error);
        loadAllUsers();
    }
}

window.changeUserRole = async function(userId, newRole) {
    if (!confirm(`Изменить роль пользователя на "${newRole === 'admin' ? 'Администратор' : 'Сотрудник'}"?`)) {
        loadAllUsers();
        return;
    }
    
    try {
        const response = await fetch('/api/admin/update-user-role.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                user_id: userId,
                role: newRole 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAdminNotification('Роль пользователя изменена', 'success');
            loadAllUsers(); // Перезагружаем список для обновления отображения
        } else {
            showAdminNotification('Ошибка: ' + data.error, 'error');
            loadAllUsers();
        }
    } catch (error) {
        showAdminNotification('Ошибка сети', 'error');
        console.error('Ошибка изменения роли:', error);
        loadAllUsers();
    }
}

window.deleteUser = async function(userId) {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя? Это действие необратимо.')) {
        return;
    }
    
    try {
        const response = await fetch('/api/admin/delete-user.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAdminNotification('Пользователь удален', 'success');
            // Удаляем элемент из списка
            const userItem = document.querySelector(`[data-user-id="${userId}"]`);
            if (userItem) {
                userItem.style.transition = 'all 0.3s ease';
                userItem.style.opacity = '0';
                userItem.style.transform = 'translateX(-20px)';
                setTimeout(() => userItem.remove(), 300);
            }
        } else {
            showAdminNotification('Ошибка: ' + data.error, 'error');
        }
    } catch (error) {
        showAdminNotification('Ошибка сети', 'error');
        console.error('Ошибка удаления:', error);
    }
}

window.removePreapprovedEmail = async function(emailId) {
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
                    <p>Нет пользователей, ожидающих одобрения</p>
                </div>
            `;
        }
    } catch (error) {
        container.innerHTML = '<p style="color: red;">Ошибка загрузки данных</p>';
        console.error('Ошибка загрузки pending users:', error);
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
                <div class="user-item" data-user-id="${user.id}">
                    <div class="user-info-admin">
                        <div class="user-email-admin">
                            ${user.email}
                            <span class="user-status ${user.status}">${getStatusText(user.status)}</span>
                            ${user.role === 'admin' ? '<span class="user-role admin">Администратор</span>' : ''}
                        </div>
                        <div class="user-meta">
                            ${user.name ? `${user.name} • ` : ''}
                            Зарегистрирован: ${new Date(user.created_at).toLocaleDateString('ru-RU')}
                        </div>
                    </div>
                    <div class="user-actions">
                        <select class="status-select" onchange="changeUserStatus(${user.id}, this.value)" ${user.id == window.currentUser?.id ? 'disabled' : ''}>
                            <option value="pending" ${user.status === 'pending' ? 'selected' : ''}>Ожидает</option>
                            <option value="approved" ${user.status === 'approved' ? 'selected' : ''}>Одобрен</option>
                            <option value="rejected" ${user.status === 'rejected' ? 'selected' : ''}>Отклонен</option>
                        </select>
                        <select class="role-select" onchange="changeUserRole(${user.id}, this.value)">
                            <option value="employee" ${user.role === 'employee' ? 'selected' : ''}>Сотрудник</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Администратор</option>
                        </select>
                        <button class="btn-delete" onclick="deleteUser(${user.id})" ${user.id == window.currentUser?.id ? 'disabled' : ''}>Удалить</button>
                    </div>
                </div>
            `).join('');
            
            // Сохраняем ID текущего пользователя для проверок
            window.currentUserId = window.currentUser?.id;
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
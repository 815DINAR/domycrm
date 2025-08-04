// products.js - Управление тарифами и продуктами

// Глобальные переменные для редактора
let editingTariff = null;
let editingCategory = null;
let editingProduct = null;
let currentPropertyType = 'многоквартирный дом';

// Загрузка тарифов для редактирования
async function loadTariffsForEdit() {
    try {
        const response = await fetch('/api/tariffs/list.php');
        const data = await response.json();
        
        if (data.success) {
            const selector = document.getElementById('tariffSelector');
            const copySelector = document.getElementById('copyFromTariff');
            
            selector.innerHTML = '<option value="">Выберите тариф для редактирования</option>';
            copySelector.innerHTML = '<option value="">Создать пустой тариф</option>';
            
            data.tariffs.forEach(tariff => {
                const option = document.createElement('option');
                option.value = tariff.id;
                option.textContent = `${tariff.name} (${tariff.year})${tariff.is_default ? ' - По умолчанию' : ''}`;
                selector.appendChild(option);
                
                // Добавляем также в список для копирования
                const copyOption = option.cloneNode(true);
                copySelector.appendChild(copyOption);
            });
        }
    } catch (error) {
        console.error('Ошибка загрузки тарифов:', error);
        showNotification('Ошибка загрузки тарифов', 'error');
    }
}

// Обработчик выбора тарифа для редактирования
document.getElementById('tariffSelector')?.addEventListener('change', async function() {
    const tariffId = this.value;
    
    if (!tariffId) {
        document.getElementById('tariffEditor').style.display = 'none';
        document.getElementById('copyTariffBtn').disabled = true;
        document.getElementById('setDefaultBtn').disabled = true;
        document.getElementById('deleteTariffBtn').disabled = true;
        return;
    }
    
    // Активируем кнопки управления
    document.getElementById('copyTariffBtn').disabled = false;
    document.getElementById('setDefaultBtn').disabled = false;
    document.getElementById('deleteTariffBtn').disabled = false;
    
    // Загружаем данные тарифа
    try {
        const response = await fetch(`/api/tariffs/get.php?id=${tariffId}`);
        const data = await response.json();
        
        if (data.success) {
            editingTariff = data.tariff;
            displayTariffEditor();
        } else {
            showNotification('Ошибка загрузки тарифа', 'error');
        }
    } catch (error) {
        console.error('Ошибка загрузки тарифа:', error);
        showNotification('Ошибка загрузки тарифа', 'error');
    }
});

// Отображение редактора тарифа
function displayTariffEditor() {
    const editor = document.getElementById('tariffEditor');
    editor.style.display = 'block';
    
    // Заполняем информацию о тарифе
    document.getElementById('tariffName').value = editingTariff.name;
    document.getElementById('tariffYear').value = editingTariff.data.year || editingTariff.year;
    
    // Отображаем категории и продукты
    displayCategories();
}

// Отображение категорий и продуктов
function displayCategories() {
    const container = document.getElementById('categoriesList');
    container.innerHTML = '';
    
    const categories = editingTariff.data.categories || {};
    
    for (const [categoryName, categoryData] of Object.entries(categories)) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-item';
        categoryDiv.innerHTML = `
            <div class="category-header-edit">
                <h4>${categoryName}</h4>
                <div class="category-actions">
                    <button onclick="editCategory('${categoryName}')" class="btn-edit">Редактировать</button>
                    <button onclick="deleteCategory('${categoryName}')" class="btn-delete">Удалить</button>
                    <button onclick="addProduct('${categoryName}')" class="btn-primary">Добавить продукт</button>
                </div>
            </div>
            <div class="products-list" id="products-${categoryName.replace(/\s+/g, '-')}">
                ${renderProducts(categoryName, categoryData.products || {})}
            </div>
        `;
        container.appendChild(categoryDiv);
    }
}

// Рендеринг продуктов категории
function renderProducts(categoryName, products) {
    let html = '';
    
    for (const [productName, productData] of Object.entries(products)) {
        html += `
            <div class="product-item-edit">
                <div class="product-header-edit">
                    <span class="product-name">${productName}</span>
                    <div class="product-actions">
                        <button onclick="editProduct('${categoryName}', '${productName}')" class="btn-edit">Редактировать</button>
                        <button onclick="deleteProduct('${categoryName}', '${productName}')" class="btn-delete">Удалить</button>
                    </div>
                </div>
                <div class="product-prices">
                    ${renderProductPrices(productData)}
                </div>
            </div>
        `;
    }
    
    return html || '<p class="empty-products">Нет продуктов в этой категории</p>';
}

// Рендеринг цен продукта
function renderProductPrices(productData) {
    let html = '';
    
    for (const [propertyType, ranges] of Object.entries(productData)) {
        if (Array.isArray(ranges) && ranges.length > 0) {
            html += `
                <div class="property-type-prices">
                    <strong>${propertyType}:</strong>
                    <div class="price-ranges-display">
                        ${ranges.map(range => `
                            <span class="price-range">
                                ${range.range}: 
                                ${range.basePrice !== null ? `${range.basePrice}₽` : ''}
                                ${range.unitPrice !== null ? `${range.unitPrice}₽/ед` : ''}
                            </span>
                        `).join(' | ')}
                    </div>
                </div>
            `;
        }
    }
    
    return html;
}

// Создание нового тарифа
document.getElementById('createTariffBtn')?.addEventListener('click', function() {
    document.getElementById('newTariffModal').style.display = 'block';
});

document.getElementById('createNewTariffBtn')?.addEventListener('click', async function() {
    const name = document.getElementById('newTariffName').value.trim();
    const year = document.getElementById('newTariffYear').value;
    const copyFromId = document.getElementById('copyFromTariff').value;
    
    if (!name || !year) {
        showNotification('Заполните название и год тарифа', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/tariffs/create.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                year: parseInt(year),
                copy_from_id: copyFromId || null
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Тариф успешно создан', 'success');
            document.getElementById('newTariffModal').style.display = 'none';
            document.getElementById('newTariffName').value = '';
            document.getElementById('newTariffYear').value = '';
            document.getElementById('copyFromTariff').value = '';
            loadTariffsForEdit();
            // Также обновляем список тарифов в калькуляторе
            loadTariffs();
        } else {
            showNotification(data.error || 'Ошибка создания тарифа', 'error');
        }
    } catch (error) {
        console.error('Ошибка создания тарифа:', error);
        showNotification('Ошибка создания тарифа', 'error');
    }
});

// Копирование тарифа
document.getElementById('copyTariffBtn')?.addEventListener('click', function() {
    if (!editingTariff) return;
    
    const newName = prompt(`Введите название для копии тарифа "${editingTariff.name}":`);
    if (!newName) return;
    
    const newYear = prompt('Введите год для нового тарифа:', new Date().getFullYear());
    if (!newYear) return;
    
    createTariffCopy(newName, newYear);
});

async function createTariffCopy(name, year) {
    try {
        const response = await fetch('/api/tariffs/create.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                year: parseInt(year),
                copy_from_id: editingTariff.id
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Копия тарифа создана успешно', 'success');
            loadTariffsForEdit();
            loadTariffs();
        } else {
            showNotification(data.error || 'Ошибка копирования тарифа', 'error');
        }
    } catch (error) {
        console.error('Ошибка копирования тарифа:', error);
        showNotification('Ошибка копирования тарифа', 'error');
    }
}

// Установка тарифа по умолчанию
document.getElementById('setDefaultBtn')?.addEventListener('click', async function() {
    if (!editingTariff) return;
    
    if (!confirm(`Установить тариф "${editingTariff.name}" по умолчанию?`)) return;
    
    try {
        const response = await fetch('/api/tariffs/set-default.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: editingTariff.id
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Тариф установлен по умолчанию', 'success');
            loadTariffsForEdit();
            loadTariffs();
        } else {
            showNotification(data.error || 'Ошибка установки тарифа по умолчанию', 'error');
        }
    } catch (error) {
        console.error('Ошибка установки тарифа по умолчанию:', error);
        showNotification('Ошибка установки тарифа по умолчанию', 'error');
    }
});

// Удаление тарифа
document.getElementById('deleteTariffBtn')?.addEventListener('click', async function() {
    if (!editingTariff) return;
    
    if (!confirm(`Вы уверены, что хотите удалить тариф "${editingTariff.name}"?`)) return;
    
    try {
        const response = await fetch('/api/tariffs/delete.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: editingTariff.id
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Тариф удален', 'success');
            document.getElementById('tariffEditor').style.display = 'none';
            editingTariff = null;
            loadTariffsForEdit();
            loadTariffs();
        } else {
            showNotification(data.error || 'Ошибка удаления тарифа', 'error');
        }
    } catch (error) {
        console.error('Ошибка удаления тарифа:', error);
        showNotification('Ошибка удаления тарифа', 'error');
    }
});

// Сохранение информации о тарифе
document.getElementById('saveTariffInfo')?.addEventListener('click', async function() {
    if (!editingTariff) return;
    
    const name = document.getElementById('tariffName').value.trim();
    const year = document.getElementById('tariffYear').value;
    
    if (!name || !year) {
        showNotification('Заполните название и год тарифа', 'error');
        return;
    }
    
    // Обновляем данные локально
    editingTariff.name = name;
    editingTariff.year = parseInt(year);
    editingTariff.data.name = name;
    editingTariff.data.year = parseInt(year);
    
    // Сохраняем на сервер
    await saveTariff();
});

// Сохранение тарифа на сервер
async function saveTariff() {
    if (!editingTariff) return;
    
    try {
        const response = await fetch('/api/tariffs/update.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: editingTariff.id,
                name: editingTariff.name,
                year: editingTariff.year,
                data: editingTariff.data
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Тариф сохранен', 'success');
            loadTariffsForEdit();
            loadTariffs();
        } else {
            showNotification(data.error || 'Ошибка сохранения тарифа', 'error');
        }
    } catch (error) {
        console.error('Ошибка сохранения тарифа:', error);
        showNotification('Ошибка сохранения тарифа', 'error');
    }
}

// Добавление категории
document.getElementById('addCategoryBtn')?.addEventListener('click', function() {
    editingCategory = null;
    document.getElementById('categoryModalTitle').textContent = 'Добавить категорию';
    document.getElementById('categoryName').value = '';
    document.getElementById('categoryModal').style.display = 'block';
});

// Редактирование категории
window.editCategory = function(categoryName) {
    editingCategory = categoryName;
    document.getElementById('categoryModalTitle').textContent = 'Редактировать категорию';
    document.getElementById('categoryName').value = categoryName;
    document.getElementById('categoryModal').style.display = 'block';
}

// Сохранение категории
document.getElementById('saveCategoryBtn')?.addEventListener('click', function() {
    const newName = document.getElementById('categoryName').value.trim();
    
    if (!newName) {
        showNotification('Введите название категории', 'error');
        return;
    }
    
    if (!editingTariff.data.categories) {
        editingTariff.data.categories = {};
    }
    
    if (editingCategory) {
        // Редактирование существующей категории
        if (editingCategory !== newName) {
            editingTariff.data.categories[newName] = editingTariff.data.categories[editingCategory];
            delete editingTariff.data.categories[editingCategory];
        }
    } else {
        // Добавление новой категории
        if (editingTariff.data.categories[newName]) {
            showNotification('Категория с таким названием уже существует', 'error');
            return;
        }
        editingTariff.data.categories[newName] = { products: {} };
    }
    
    document.getElementById('categoryModal').style.display = 'none';
    displayCategories();
    saveTariff();
});

// Удаление категории
window.deleteCategory = function(categoryName) {
    if (!confirm(`Удалить категорию "${categoryName}" со всеми продуктами?`)) return;
    
    delete editingTariff.data.categories[categoryName];
    displayCategories();
    saveTariff();
}

// Добавление продукта
window.addProduct = function(categoryName) {
    editingCategory = categoryName;
    editingProduct = null;
    document.getElementById('productModalTitle').textContent = 'Добавить продукт';
    document.getElementById('productName').value = '';
    displayProductModal({});
}

// Редактирование продукта
window.editProduct = function(categoryName, productName) {
    editingCategory = categoryName;
    editingProduct = productName;
    document.getElementById('productModalTitle').textContent = 'Редактировать продукт';
    document.getElementById('productName').value = productName;
    
    const productData = editingTariff.data.categories[categoryName].products[productName];
    displayProductModal(productData);
}

// Отображение модального окна продукта
function displayProductModal(productData) {
    document.getElementById('productModal').style.display = 'block';
    
    // Устанавливаем первую вкладку активной
    document.querySelectorAll('.property-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector('.property-tab').classList.add('active');
    
    // Отображаем диапазоны цен для первого типа недвижимости
    currentPropertyType = 'многоквартирный дом';
    displayPriceRanges(productData[currentPropertyType] || []);
}

// Переключение типов недвижимости
document.querySelectorAll('.property-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.property-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        currentPropertyType = this.dataset.property;
        
        // Сохраняем текущие данные и переключаемся
        const productData = collectProductData();
        displayPriceRanges(productData[currentPropertyType] || []);
    });
});

// Отображение диапазонов цен
function displayPriceRanges(ranges) {
    const container = document.getElementById('priceRangesContainer');
    container.innerHTML = '';
    
    if (currentPropertyType === 'фиксированная цена') {
        // Для фиксированной цены показываем только одно поле
        const range = ranges[0] || { basePrice: null };
        container.innerHTML = `
            <div class="price-range-item">
                <div class="form-group">
                    <label>Фиксированная цена (₽):</label>
                    <input type="number" class="base-price" value="${range.basePrice || ''}" min="0" step="0.01">
                </div>
            </div>
        `;
    } else {
        // Для обычных типов показываем диапазоны
        ranges.forEach((range, index) => {
            container.appendChild(createRangeElement(range, index));
        });
        
        if (ranges.length === 0) {
            container.innerHTML = '<p>Нет диапазонов цен. Нажмите "Добавить диапазон"</p>';
        }
    }
}

// Создание элемента диапазона
function createRangeElement(range, index) {
    const div = document.createElement('div');
    div.className = 'price-range-item';
    div.innerHTML = `
        <div class="range-header">
            <span>Диапазон ${index + 1}</span>
            <button onclick="removeRange(${index})" class="btn-delete-small">Удалить</button>
        </div>
        <div class="range-inputs">
            <div class="form-group">
                <label>Название диапазона:</label>
                <input type="text" class="range-name" value="${range.range || ''}" placeholder="например: до 1000">
            </div>
            <div class="form-group">
                <label>От:</label>
                <input type="number" class="range-min" value="${range.min || 0}" min="0">
            </div>
            <div class="form-group">
                <label>До:</label>
                <input type="number" class="range-max" value="${range.max || ''}" min="0">
            </div>
            <div class="form-group">
                <label>Базовая цена (₽):</label>
                <input type="number" class="base-price" value="${range.basePrice || ''}" min="0" step="0.01">
            </div>
            <div class="form-group">
                <label>Цена за единицу (₽):</label>
                <input type="number" class="unit-price" value="${range.unitPrice || ''}" min="0" step="0.01">
            </div>
        </div>
    `;
    return div;
}

// Удаление диапазона
window.removeRange = function(index) {
    const ranges = collectCurrentRanges();
    ranges.splice(index, 1);
    displayPriceRanges(ranges);
}

// Добавление диапазона
document.getElementById('addRangeBtn')?.addEventListener('click', function() {
    if (currentPropertyType === 'фиксированная цена') {
        showNotification('Для фиксированной цены нельзя добавить диапазоны', 'error');
        return;
    }
    
    const ranges = collectCurrentRanges();
    ranges.push({
        range: '',
        min: 0,
        max: 0,
        basePrice: null,
        unitPrice: null
    });
    displayPriceRanges(ranges);
});

// Сбор данных о диапазонах
function collectCurrentRanges() {
    const ranges = [];
    const items = document.querySelectorAll('.price-range-item');
    
    items.forEach(item => {
        if (currentPropertyType === 'фиксированная цена') {
            ranges.push({
                range: 'фиксированный тариф',
                min: 0,
                max: 999999,
                basePrice: parseFloat(item.querySelector('.base-price').value) || null,
                unitPrice: null
            });
        } else {
            const range = {
                range: item.querySelector('.range-name').value,
                min: parseInt(item.querySelector('.range-min').value) || 0,
                max: parseInt(item.querySelector('.range-max').value) || 0,
                basePrice: parseFloat(item.querySelector('.base-price').value) || null,
                unitPrice: parseFloat(item.querySelector('.unit-price').value) || null
            };
            ranges.push(range);
        }
    });
    
    return ranges;
}

// Сбор всех данных продукта
function collectProductData() {
    const productData = {};
    
    // Сохраняем текущие диапазоны
    if (currentPropertyType) {
        productData[currentPropertyType] = collectCurrentRanges();
    }
    
    // Если есть сохраненные данные для других типов, добавляем их
    if (editingProduct) {
        const existingData = editingTariff.data.categories[editingCategory].products[editingProduct];
        for (const [type, ranges] of Object.entries(existingData)) {
            if (type !== currentPropertyType) {
                productData[type] = ranges;
            }
        }
    }
    
    return productData;
}

// Сохранение продукта
document.getElementById('saveProductBtn')?.addEventListener('click', function() {
    const productName = document.getElementById('productName').value.trim();
    
    if (!productName) {
        showNotification('Введите название продукта', 'error');
        return;
    }
    
    const productData = collectProductData();
    
    // Проверяем, есть ли хотя бы один диапазон
    let hasData = false;
    for (const ranges of Object.values(productData)) {
        if (ranges && ranges.length > 0) {
            hasData = true;
            break;
        }
    }
    
    if (!hasData) {
        showNotification('Добавьте хотя бы один диапазон цен', 'error');
        return;
    }
    
    // Сохраняем продукт
    if (!editingTariff.data.categories[editingCategory].products) {
        editingTariff.data.categories[editingCategory].products = {};
    }
    
    // Если редактируем и изменилось название
    if (editingProduct && editingProduct !== productName) {
        delete editingTariff.data.categories[editingCategory].products[editingProduct];
    }
    
    editingTariff.data.categories[editingCategory].products[productName] = productData;
    
    document.getElementById('productModal').style.display = 'none';
    displayCategories();
    saveTariff();
});

// Удаление продукта
window.deleteProduct = function(categoryName, productName) {
    if (!confirm(`Удалить продукт "${productName}"?`)) return;
    
    delete editingTariff.data.categories[categoryName].products[productName];
    displayCategories();
    saveTariff();
}

// Закрытие модальных окон
document.querySelectorAll('.modal .close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

document.getElementById('cancelCategoryBtn')?.addEventListener('click', function() {
    document.getElementById('categoryModal').style.display = 'none';
});

document.getElementById('cancelProductBtn')?.addEventListener('click', function() {
    document.getElementById('productModal').style.display = 'none';
});

document.getElementById('cancelNewTariffBtn')?.addEventListener('click', function() {
    document.getElementById('newTariffModal').style.display = 'none';
});

// Функция показа уведомлений
function showNotification(message, type = 'info') {
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
// products.js - Управление тарифами и продуктами

// Глобальные переменные для редактора
let editingTariff = null;
let editingCategory = null;
let editingProduct = null;
let currentPropertyType = 'многоквартирный дом';
let draggedProduct = null;
let draggedCategory = null;

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
    
    // Сначала проверяем и назначаем order для категорий, у которых его нет
    let needsOrderUpdate = false;
    Object.entries(categories).forEach(([categoryName, categoryData], index) => {
        if (categoryData.order === undefined || categoryData.order === null) {
            categoryData.order = index * 10; // Умножаем на 10 для возможности вставки между элементами
            needsOrderUpdate = true;
        }
    });
    
    // Если были категории без order, сохраняем
    if (needsOrderUpdate) {
        saveTariff();
    }
    
    // Сортируем категории по order
    const sortedCategories = Object.entries(categories).sort((a, b) => {
        const orderA = a[1].order !== undefined ? a[1].order : 999;
        const orderB = b[1].order !== undefined ? b[1].order : 999;
        return orderA - orderB;
    });
    
    for (const [categoryName, categoryData] of sortedCategories) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-item';
        categoryDiv.draggable = true;
        categoryDiv.dataset.categoryName = categoryName;
        
        // Обработчики drag & drop для категорий
        categoryDiv.addEventListener('dragstart', handleCategoryDragStart);
        categoryDiv.addEventListener('dragover', handleCategoryDragOver);
        categoryDiv.addEventListener('drop', handleCategoryDrop);
        categoryDiv.addEventListener('dragend', handleCategoryDragEnd);
        categoryDiv.addEventListener('dragenter', e => e.preventDefault());
        
        categoryDiv.innerHTML = `
            <div class="category-header-edit">
                <div class="drag-handle" title="Перетащите для изменения порядка">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                        <circle cx="19" cy="5" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="19" cy="19" r="1"></circle>
                        <circle cx="5" cy="5" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                        <circle cx="5" cy="19" r="1"></circle>
                    </svg>
                </div>
                <h4>${categoryName}</h4>
                <div class="category-actions">
                    <button onclick="editCategory('${categoryName}')" class="btn-edit">Редактировать</button>
                    <button onclick="deleteCategory('${categoryName}')" class="btn-delete">Удалить</button>
                    <button onclick="addProduct('${categoryName}')" class="btn-primary">Добавить продукт</button>
                </div>
            </div>
            <div class="products-list" id="products-${categoryName.replace(/\s+/g, '-')}" data-category="${categoryName}">
                ${renderProducts(categoryName, categoryData.products || {})}
            </div>
        `;
        container.appendChild(categoryDiv);
    }
    
    // Инициализируем drag & drop для продуктов после создания DOM
    setTimeout(initializeProductsDragDrop, 100);
}

// Рендеринг продуктов категории
function renderProducts(categoryName, products) {
    let html = '<div class="products-sortable">';
    
    // Проверяем и назначаем order для продуктов, у которых его нет
    let needsOrderUpdate = false;
    Object.entries(products).forEach(([productName, productData], index) => {
        if (typeof productData === 'object' && !Array.isArray(productData)) {
            if (productData.order === undefined || productData.order === null) {
                productData.order = index * 10;
                needsOrderUpdate = true;
            }
        }
    });
    
    // Сортируем продукты по order
    const sortedProducts = Object.entries(products).sort((a, b) => {
        const orderA = (a[1] && typeof a[1] === 'object' && !Array.isArray(a[1])) ? (a[1].order !== undefined ? a[1].order : 999) : 999;
        const orderB = (b[1] && typeof b[1] === 'object' && !Array.isArray(b[1])) ? (b[1].order !== undefined ? b[1].order : 999) : 999;
        return orderA - orderB;
    });
    
    for (const [productName, productData] of sortedProducts) {
        html += `
            <div class="product-item-edit" draggable="true" data-product-name="${productName}" data-category="${categoryName}">
                <div class="drag-handle-product" title="Перетащите для изменения порядка">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                        <circle cx="19" cy="5" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="19" cy="19" r="1"></circle>
                        <circle cx="5" cy="5" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                        <circle cx="5" cy="19" r="1"></circle>
                    </svg>
                </div>
                <div class="product-content">
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
            </div>
        `;
    }
    
    html += '</div>';
    
    // Если нет продуктов
    if (sortedProducts.length === 0) {
        html = '<p class="empty-products">Нет продуктов в этой категории</p>';
    }
    
    return html;
}

// После отображения категорий инициализируем drag & drop для продуктов
function initializeProductsDragDrop() {
    document.querySelectorAll('.product-item-edit').forEach(item => {
        item.addEventListener('dragstart', handleProductDragStart);
        item.addEventListener('dragover', handleProductDragOver);
        item.addEventListener('drop', handleProductDrop);
        item.addEventListener('dragend', handleProductDragEnd);
        item.addEventListener('dragenter', e => e.preventDefault());
    });
}

// Обработчики drag & drop для категорий
function handleCategoryDragStart(e) {
    draggedCategory = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleCategoryDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    
    // Только если перетаскиваем категорию
    if (!draggedCategory || !draggedCategory.classList.contains('category-item')) {
        return false;
    }
    
    const container = document.getElementById('categoriesList');
    const afterElement = getDragAfterElement(container, e.clientY, '.category-item');
    
    if (afterElement == null) {
        container.appendChild(draggedCategory);
    } else {
        container.insertBefore(draggedCategory, afterElement);
    }
    
    return false;
}

function handleCategoryDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    updateCategoryOrder();
    
    return false;
}

function handleCategoryDragEnd(e) {
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('dragging');
    });
    draggedCategory = null;
}

// Обработчики drag & drop для продуктов
function handleProductDragStart(e) {
    draggedProduct = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleProductDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    
    // Только если перетаскиваем продукт
    if (!draggedProduct || !draggedProduct.classList.contains('product-item-edit')) {
        return false;
    }
    
    const container = this.closest('.products-sortable');
    if (!container) return false;
    
    const afterElement = getDragAfterElement(container, e.clientY, '.product-item-edit');
    
    if (afterElement == null) {
        container.appendChild(draggedProduct);
    } else {
        container.insertBefore(draggedProduct, afterElement);
    }
    
    return false;
}

function handleProductDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    const categoryName = this.closest('.category-item').dataset.categoryName;
    updateProductOrder(categoryName);
    
    return false;
}

function handleProductDragEnd(e) {
    document.querySelectorAll('.product-item-edit').forEach(item => {
        item.classList.remove('dragging');
    });
    draggedProduct = null;
}

// Вспомогательная функция для определения позиции при перетаскивании
function getDragAfterElement(container, y, selector) {
    const draggableElements = [...container.querySelectorAll(`${selector}:not(.dragging)`)];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Обновление порядка категорий
function updateCategoryOrder() {
    const categories = document.querySelectorAll('.category-item');
    
    categories.forEach((cat, index) => {
        const categoryName = cat.dataset.categoryName;
        if (editingTariff.data.categories[categoryName]) {
            editingTariff.data.categories[categoryName].order = index;
        }
    });
    
    // Сохраняем изменения
    saveTariff();
}

// Обновление порядка продуктов
function updateProductOrder(categoryName) {
    const container = document.querySelector(`.products-list[data-category="${categoryName}"] .products-sortable`);
    if (!container) return;
    
    const products = container.querySelectorAll('.product-item-edit');
    
    products.forEach((prod, index) => {
        const productName = prod.dataset.productName;
        if (editingTariff.data.categories[categoryName] && 
            editingTariff.data.categories[categoryName].products[productName]) {
            editingTariff.data.categories[categoryName].products[productName].order = index;
        }
    });
    
    // Сохраняем изменения
    saveTariff();
}

// Рендеринг цен продукта
function renderProductPrices(productData) {
    let html = '';
    
    for (const [propertyType, ranges] of Object.entries(productData)) {
        if (propertyType === 'order') continue; // Пропускаем поле order
        
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
            const oldData = editingTariff.data.categories[editingCategory];
            editingTariff.data.categories[newName] = oldData;
            delete editingTariff.data.categories[editingCategory];
        }
    } else {
        // Добавление новой категории
        if (editingTariff.data.categories[newName]) {
            showNotification('Категория с таким названием уже существует', 'error');
            return;
        }
        
        // Определяем order для новой категории
        const maxOrder = Math.max(...Object.values(editingTariff.data.categories).map(c => c.order || 0), -1);
        
        editingTariff.data.categories[newName] = { 
            products: {},
            order: maxOrder + 10
        };
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
        for (const [type, data] of Object.entries(existingData)) {
            if (type !== currentPropertyType && type !== 'order') {
                productData[type] = data;
            } else if (type === 'order') {
                productData.order = data; // Сохраняем order
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
    for (const [key, value] of Object.entries(productData)) {
        if (key !== 'order' && value && Array.isArray(value) && value.length > 0) {
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
    
    // Если это новый продукт, назначаем ему order
    if (!editingProduct) {
        const products = editingTariff.data.categories[editingCategory].products;
        const maxOrder = Math.max(...Object.values(products).map(p => (p && typeof p === 'object' && !Array.isArray(p) && p.order !== undefined) ? p.order : 0), -1);
        productData.order = maxOrder + 10;
    }
    
    // Если редактируем и изменилось название
    if (editingProduct && editingProduct !== productName) {
        delete editingTariff.data.categories[editingCategory].products[editingProduct];
    }
    
    editingTariff.data.categories[editingCategory].products[productName] = productData;
    
    document.getElementById('productModal').style.display = 'none';
    displayCategories();
    setTimeout(initializeProductsDragDrop, 100); // Инициализируем drag & drop после обновления DOM
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

// Инициализация после загрузки DOM для страницы редактирования
document.addEventListener('DOMContentLoaded', function() {
    // Обновляем обработчик для отображения категорий, чтобы инициализировать drag & drop
    const originalDisplayCategories = window.displayCategories;
    window.displayCategories = function() {
        originalDisplayCategories.call(this);
        setTimeout(initializeProductsDragDrop, 100);
    };
});
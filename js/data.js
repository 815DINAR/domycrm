// Данные о ценах на продукты
const PRICING_DATA = {
    "Аварийно-диспетчерская служба": {
        "многоквартирный дом": [
            { range: "до 1 000", min: 0, max: 1000, basePrice: 9360, unitPrice: null },
            { range: "От 1 000 до 2 000", min: 1000, max: 2000, basePrice: 9360, unitPrice: 7.49 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 5.62 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 3.28 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 1.60 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.66 }
        ],
        "коттеджный поселок": [
            { range: "до 300", min: 0, max: 300, basePrice: 5616, unitPrice: null },
            { range: "От 300 до 2 000", min: 300, max: 2000, basePrice: 5616, unitPrice: 14.98 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 11.24 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 6.56 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 3.20 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 1.32 }
        ]
    },
    "Мини приложения(3шт)": {
        "многоквартирный дом": [
            { range: "до 1 000", min: 0, max: 1000, basePrice: 24900, unitPrice: null },
            { range: "От 1 000 до 2 000", min: 1000, max: 2000, basePrice: 24900, unitPrice: 18.15 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 12.70 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 7.72 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 3.85 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 1.59 }
        ],
        "коттеджный поселок": [
            { range: "до 300", min: 0, max: 300, basePrice: 7470, unitPrice: null },
            { range: "От 300 до 2 000", min: 300, max: 2000, basePrice: 7470, unitPrice: 18.15 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 12.70 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 7.72 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 3.85 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 1.59 }
        ]
    },
    "Сайт управляющей организации": {
        "многоквартирный дом": [
            { range: "фиксированный тариф", min: 0, max: 999999, basePrice: 5000, unitPrice: null }
        ],
        "коттеджный поселок": [
            { range: "фиксированный тариф", min: 0, max: 999999, basePrice: 5000, unitPrice: null }
        ]
    },
    
    "Учет рабочего времени": {
        "многоквартирный дом": [
            { range: "до 1 000", min: 0, max: 1000, basePrice: 4060, unitPrice: null },
            { range: "От 1 000 до 2 000", min: 1000, max: 2000, basePrice: 4060, unitPrice: 3.24 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 2.44 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 1.42 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 0.68 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.28 }
        ],
        "коттеджный поселок": [
            { range: "до 300", min: 0, max: 300, basePrice: 3654, unitPrice: null },
            { range: "От 300 до 2 000", min: 300, max: 2000, basePrice: 3654, unitPrice: 9.72 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 7.32 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 4.26 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 2.04 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.84 }
        ]
    },
    "Охрана": {
        "многоквартирный дом": [
            { range: "до 1 000", min: 0, max: 1000, basePrice: 3120, unitPrice: null },
            { range: "От 1 000 до 2 000", min: 1000, max: 2000, basePrice: 3120, unitPrice: 2.50 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 1.75 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 1.06 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 0.53 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.22 }
        ],
        "коттеджный поселок": [
            { range: "до 300", min: 0, max: 300, basePrice: 4680, unitPrice: null },
            { range: "От 300 до 2 000", min: 300, max: 2000, basePrice: 4680, unitPrice: 12.50 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 8.75 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 5.30 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 2.65 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 1.10 }
        ]
    },
    "Счета за ЖКУ": {
        "многоквартирный дом": [
            { range: "до 1 000", min: 0, max: 1000, basePrice: 3120, unitPrice: null },
            { range: "От 1 000 до 2 000", min: 1000, max: 2000, basePrice: 3120, unitPrice: 2.50 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 1.75 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 1.06 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 0.53 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.22 }
        ],
        "коттеджный поселок": [
            { range: "до 300", min: 0, max: 300, basePrice: 2808, unitPrice: null },
            { range: "От 300 до 2 000", min: 300, max: 2000, basePrice: 2808, unitPrice: 7.50 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 5.25 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 3.18 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 1.59 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.66 }
        ]
    },
    "Счетчики": {
        "многоквартирный дом": [
            { range: "до 1 000", min: 0, max: 1000, basePrice: 3120, unitPrice: null },
            { range: "От 1 000 до 2 000", min: 1000, max: 2000, basePrice: 3120, unitPrice: 2.50 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 1.87 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 1.09 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 0.53 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.22 }
        ],
        "коттеджный поселок": [
            { range: "до 300", min: 0, max: 300, basePrice: 1404, unitPrice: null },
            { range: "От 300 до 2 000", min: 300, max: 2000, basePrice: 1404, unitPrice: 3.75 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 2.81 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 1.37 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 0.80 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.33 }
        ]
    },
    "Каталог проектов": {
        "общий": [
            { range: "до 1 000", min: 0, max: 1000, basePrice: 45000, unitPrice: null },
            { range: "От 1 000 до 5 000", min: 1000, max: 5000, basePrice: 45000, unitPrice: 10 },
            { range: "От 5 000 до 30 000", min: 5000, max: 30000, basePrice: null, unitPrice: 9 },
            { range: "От 30 000 до 50 000", min: 30000, max: 50000, basePrice: null, unitPrice: 8 }
        ]
    },
    "Видеонаблюдение": {
        "многоквартирный дом": [
            { range: "до 1 000", min: 0, max: 1000, basePrice: 4500, unitPrice: null },
            { range: "От 1 000 до 2 000", min: 1000, max: 2000, basePrice: 4500, unitPrice: 3.60 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 2.52 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 1.53 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 0.78 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.33 }
        ],
        "коттеджный поселок": [
            { range: "до 300", min: 0, max: 300, basePrice: 4050, unitPrice: null },
            { range: "От 300 до 2 000", min: 300, max: 2000, basePrice: 4050, unitPrice: 10.80 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 7.56 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 4.59 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 2.34 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.99 }
        ]
    },
    "Управление Домофонами": {
        "многоквартирный дом": [
            { range: "до 1 000", min: 0, max: 1000, basePrice: 9000, unitPrice: null },
            { range: "От 1 000 до 2 000", min: 1000, max: 2000, basePrice: 9000, unitPrice: 7.20 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 5.04 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 3.06 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 1.53 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.63 }
        ],
        "коттеджный поселок": [
            { range: "до 300", min: 0, max: 300, basePrice: 8100, unitPrice: null },
            { range: "От 300 до 2 000", min: 300, max: 2000, basePrice: 8100, unitPrice: 21.60 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 15.12 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 9.18 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 4.59 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 1.89 }
        ]
    },
    "Паркинг": {
        "многоквартирный дом": [
            { range: "до 1 000", min: 0, max: 1000, basePrice: 4500, unitPrice: null },
            { range: "От 1 000 до 2 000", min: 1000, max: 2000, basePrice: 4500, unitPrice: 3.60 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 2.52 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 1.53 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 0.78 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.33 }
        ],
        "коттеджный поселок": [
            { range: "до 300", min: 0, max: 300, basePrice: 4050, unitPrice: null },
            { range: "От 300 до 2 000", min: 300, max: 2000, basePrice: 4050, unitPrice: 10.80 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 7.56 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 4.59 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 2.34 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.99 }
        ]
    },
    "СКУД": {
        "многоквартирный дом": [
            { range: "до 1 000", min: 0, max: 1000, basePrice: 7200, unitPrice: null },
            { range: "От 1 000 до 2 000", min: 1000, max: 2000, basePrice: 7200, unitPrice: 5.76 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 4.04 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 2.45 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 1.23 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.51 }
        ],
        "коттеджный поселок": [
            { range: "до 300", min: 0, max: 300, basePrice: 6480, unitPrice: null },
            { range: "От 300 до 2 000", min: 300, max: 2000, basePrice: 6480, unitPrice: 17.28 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 12.12 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 7.35 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 3.69 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 1.53 }
        ]
    },
    "Управление квартирой": {
        "многоквартирный дом": [
            { range: "до 1 000", min: 0, max: 1000, basePrice: 6000, unitPrice: null },
            { range: "От 1 000 до 2 000", min: 1000, max: 2000, basePrice: 6000, unitPrice: 4.80 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 3.36 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 2.04 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 1.02 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.42 }
        ],
        "коттеджный поселок": [
            { range: "до 300", min: 0, max: 300, basePrice: 5400, unitPrice: null },
            { range: "От 300 до 2 000", min: 300, max: 2000, basePrice: 5400, unitPrice: 14.40 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 10.08 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 6.12 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 3.06 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 1.26 }
        ]
    },
    "Клуб привилегий": {
        "многоквартирный дом": [
            { range: "до 1 000", min: 0, max: 1000, basePrice: 4200, unitPrice: null },
            { range: "От 1 000 до 2 000", min: 1000, max: 2000, basePrice: 4200, unitPrice: 3.36 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 2.35 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 1.43 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 0.73 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.31 }
        ],
        "коттеджный поселок": [
            { range: "до 300", min: 0, max: 300, basePrice: 3780, unitPrice: null },
            { range: "От 300 до 2 000", min: 300, max: 2000, basePrice: 3780, unitPrice: 10.08 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 7.05 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 4.29 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 2.19 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.93 }
        ]
    },
    "Доска объявлений": {
        "многоквартирный дом": [
            { range: "до 1 000", min: 0, max: 1000, basePrice: 13200, unitPrice: null },
            { range: "От 1 000 до 2 000", min: 1000, max: 2000, basePrice: 13200, unitPrice: 10.56 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 7.39 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 4.57 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 2.28 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.94 }
        ],
        "коттеджный поселок": [
            { range: "до 300", min: 0, max: 300, basePrice: 3960, unitPrice: null },
            { range: "От 300 до 2 000", min: 300, max: 2000, basePrice: 3960, unitPrice: 10.56 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 7.39 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 4.57 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 2.28 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.94 }
        ]
    },
    "Маркетплейс": {
        "многоквартирный дом": [
            { range: "до 1 000", min: 0, max: 1000, basePrice: 21350, unitPrice: null },
            { range: "От 1 000 до 2 000", min: 1000, max: 2000, basePrice: 21350, unitPrice: 17.08 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 11.95 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 7.26 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 3.63 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 1.50 }
        ],
        "коттеджный поселок": [
            { range: "до 300", min: 0, max: 300, basePrice: 6405, unitPrice: null },
            { range: "От 300 до 2 000", min: 300, max: 2000, basePrice: 6405, unitPrice: 17.08 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 11.95 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 7.26 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 3.63 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 1.50 }
        ]
    },
    "Новости": {
        "многоквартирный дом": [
            { range: "до 1 000", min: 0, max: 1000, basePrice: 1600, unitPrice: null },
            { range: "От 1 000 до 2 000", min: 1000, max: 2000, basePrice: 1600, unitPrice: 1.28 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 0.89 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 0.54 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 0.27 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.11 }
        ],
        "коттеджный поселок": [
            { range: "до 300", min: 0, max: 300, basePrice: 1440, unitPrice: null },
            { range: "От 300 до 2 000", min: 300, max: 2000, basePrice: 1440, unitPrice: 3.84 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 2.67 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 1.62 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 0.81 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.33 }
        ]
    },
    "Акции": {
        "многоквартирный дом": [
            { range: "до 1 000", min: 0, max: 1000, basePrice: 1630, unitPrice: null },
            { range: "От 1 000 до 2 000", min: 1000, max: 2000, basePrice: 1630, unitPrice: 1.31 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 0.92 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 0.57 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 0.30 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.14 }
        ],
        "коттеджный поселок": [
            { range: "до 300", min: 0, max: 300, basePrice: 1467, unitPrice: null },
            { range: "От 300 до 2 000", min: 300, max: 2000, basePrice: 1467, unitPrice: 3.93 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 2.76 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 1.71 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 0.90 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.42 }
        ]
    },
    "Опросы": {
        "многоквартирный дом": [
            { range: "до 1 000", min: 0, max: 1000, basePrice: 1650, unitPrice: null },
            { range: "От 1 000 до 2 000", min: 1000, max: 2000, basePrice: 1650, unitPrice: 1.33 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 0.94 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 0.59 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 0.32 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.16 }
        ],
        "коттеджный поселок": [
            { range: "до 300", min: 0, max: 300, basePrice: 1485, unitPrice: null },
            { range: "От 300 до 2 000", min: 300, max: 2000, basePrice: 1485, unitPrice: 3.99 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 2.82 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 1.77 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 0.96 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.48 }
        ]
    },
    "Баннеры": {
        "многоквартирный дом": [
            { range: "до 1 000", min: 0, max: 1000, basePrice: 3040, unitPrice: null },
            { range: "От 1 000 до 2 000", min: 1000, max: 2000, basePrice: 3040, unitPrice: 2.43 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 1.83 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 1.06 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 0.51 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.21 }
        ],
        "коттеджный поселок": [
            { range: "до 300", min: 0, max: 300, basePrice: 912, unitPrice: null },
            { range: "От 300 до 2 000", min: 300, max: 2000, basePrice: 912, unitPrice: 2.43 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 1.83 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 1.06 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 0.51 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.21 }
        ]
    },
    "Афиша мероприятий": {
        "многоквартирный дом": [
            { range: "до 1 000", min: 0, max: 1000, basePrice: 13270, unitPrice: null },
            { range: "От 1 000 до 2 000", min: 1000, max: 2000, basePrice: 13270, unitPrice: 10.62 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 7.43 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 4.52 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 2.23 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.92 }
        ],
        "коттеджный поселок": [
            { range: "до 300", min: 0, max: 300, basePrice: 3981, unitPrice: null },
            { range: "От 300 до 2 000", min: 300, max: 2000, basePrice: 3981, unitPrice: 10.62 },
            { range: "От 2 000 до 5 000", min: 2000, max: 5000, basePrice: null, unitPrice: 7.43 },
            { range: "От 5 000 до 10 000", min: 5000, max: 10000, basePrice: null, unitPrice: 4.52 },
            { range: "От 10 000 до 20 000", min: 10000, max: 20000, basePrice: null, unitPrice: 2.23 },
            { range: "От 20 000 до 50 000", min: 20000, max: 50000, basePrice: null, unitPrice: 0.92 }
        ]
    }
};

// Функции для работы с данными
function savePricingData(data) {
    localStorage.setItem('pricingData', JSON.stringify(data));
}

function loadPricingData() {
    const saved = localStorage.getItem('pricingData');
    return saved ? JSON.parse(saved) : PRICING_DATA;
}

function getProductNames() {
    const data = loadPricingData();
    return Object.keys(data);
}

function getPropertyTypes() {
    return ['многоквартирный дом', 'коттеджный поселок'];
}
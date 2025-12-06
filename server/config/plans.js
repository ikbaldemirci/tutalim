const PLANS = {
    "1_MONTH": {
        id: "1_MONTH",
        name: "1 Aylık Abonelik",
        price: "300.00",
        months: 1,
        description: "Kısa vadeli ihtiyaçlar için ideal.",
        features: [
            "10 İlan Hakkı",
            "AI Belge Okuma Desteği",
            "Sözleşme Yönetimi",
            "Hatırlatıcı Servisi",
            "7/24 Destek"
        ],
        recommended: false
    },
    "2_MONTHS": {
        id: "2_MONTHS",
        name: "2 Aylık Abonelik",
        price: "500.00",
        months: 2,
        description: "Orta vadeli plan, daha ekonomik.",
        features: [
            "25 İlan Hakkı",
            "Sınırsız AI Belge Okuma",
            "Gelişmiş Sözleşme Yönetimi",
            "Öncelikli Hatırlatıcı Servisi",
            "Premium Destek"
        ],
        recommended: true
    },
    "6_MONTHS": {
        id: "6_MONTHS",
        name: "6 Aylık Abonelik",
        price: "1500.00",
        months: 6,
        description: "Uzun vadeli ve avantajlı.",
        features: [
            "Sınırsız İlan Hakkı",
            "Tüm Premium Özellikler",
            "Kurumsal Panel Desteği",
            "Kişisel Danışman",
            "Detaylı İstatistikler"
        ],
        recommended: false
    },
    "12_MONTHS": {
        id: "12_MONTHS",
        name: "12 Aylık Abonelik",
        price: "3000.00",
        months: 12,
        description: "En avantajlı yıllık paket.",
        features: [
            "Her Şey Sınırsız",
            "VIP Müşteri Hizmetleri",
            "Erken Erişim Özellikleri",
            "Çoklu Kullanıcı Desteği",
            "API Erişimi"
        ],
        recommended: false
    }
};

module.exports = PLANS;

const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        if (req.user.id !== userId) {
            return res.status(403).json({
                status: "fail",
                message: "Kendi bildirim geçmişinizi görüntüleyebilirsiniz.",
            });
        }

        const list = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(30);

        res.json({ status: "success", notifications: list });
    } catch (err) {
        console.error("Bildirim geçmişi hatası:", err);
        res.status(500).json({
            status: "error",
            message: "Bildirim geçmişi alınamadı.",
        });
    }
};

const Reminder = require("../models/Reminder");
const Property = require("../propertyModel");

exports.createReminder = async (req, res) => {
    try {
        const { propertyId, message, remindAt, type, dayOfMonth, monthsBeforeEnd } =
            req.body;

        let finalRemindAt = remindAt ? new Date(remindAt) : null;

        if (!type) {
            if (!finalRemindAt || finalRemindAt <= new Date()) {
                return res.status(400).json({
                    status: "fail",
                    message: "Geçmiş bir zamana hatırlatıcı oluşturamazsınız.",
                });
            }
        }

        if (type && !propertyId) {
            return res.status(400).json({
                status: "fail",
                message: "Bu hatırlatıcı bir mülke bağlı olmalıdır.",
            });
        }

        if (!message || !remindAt) {
            return res.status(400).json({
                status: "fail",
                message: "Eksik alanlar mevcut.",
            });
        }

        let property = null;
        if (propertyId) {
            property = await Property.findById(propertyId);
            if (!property) {
                return res.status(400).json({
                    status: "fail",
                    message: "Mülk bulunamadı.",
                });
            }
        }

        if (type === "monthlyPayment") {
            if (!dayOfMonth || dayOfMonth < 1 || dayOfMonth > 31) {
                return res.status(400).json({
                    status: "fail",
                    message: "Gün değeri 1 ile 31 arasında olmalıdır.",
                });
            }

            if (!finalRemindAt || finalRemindAt <= new Date()) {
                return res.status(400).json({
                    status: "fail",
                    message: "Geçmiş tarihe hatırlatıcı eklenemez.",
                });
            }

            if (new Date(finalRemindAt) > new Date(property.endDate)) {
                return res.status(400).json({
                    status: "fail",
                    message: "Sözleşme bitiş tarihinden sonraya hatırlatıcı eklenemez.",
                });
            }

            if (new Date(finalRemindAt) < new Date(property.startDate)) {
                return res.status(400).json({
                    status: "fail",
                    message: "Sözleşme başlangıç tarihinden önce hatırlatıcı eklenemez.",
                });
            }
        }

        if (type === "contractEnd") {
            if (!monthsBeforeEnd || monthsBeforeEnd < 1 || monthsBeforeEnd > 24) {
                return res.status(400).json({
                    status: "fail",
                    message: "Ay değeri 1 ile 24 arasında olmalıdır.",
                });
            }

            finalRemindAt = new Date(remindAt);

            if (finalRemindAt <= new Date()) {
                return res.status(400).json({
                    status: "fail",
                    message: "Bu hatırlatma geçmiş bir tarihe denk geliyor.",
                });
            }
        }

        const reminder = await Reminder.create({
            userId: req.user.id,
            propertyId: propertyId || null,
            message,
            remindAt: finalRemindAt,
            type: type || null,
            dayOfMonth: dayOfMonth || null,
            monthsBeforeEnd: monthsBeforeEnd || null,
        });

        return res.json({
            status: "success",
            reminder,
        });
    } catch (err) {
        console.error("Reminder create error:", err);
        return res.status(500).json({
            status: "error",
            message: "Hatırlatıcı eklenemedi.",
        });
    }
};

exports.getReminders = async (req, res) => {
    try {
        const { userId } = req.params;

        if (req.user.id !== userId) {
            return res.status(403).json({
                status: "fail",
                message: "Bu hatırlatıcıları göremezsiniz.",
            });
        }

        const list = await Reminder.find({ userId })
            .sort({ remindAt: 1 })
            .limit(30)
            .populate("propertyId", "location rentDate endDate");

        res.json({ status: "success", reminders: list });
    } catch (err) {
        console.error("Reminder fetch error:", err);
        res.status(500).json({
            status: "error",
            message: "Hatırlatıcılar alınamadı.",
        });
    }
};

exports.completeReminder = async (req, res) => {
    try {
        const reminder = await Reminder.findById(req.params.id);
        if (!reminder)
            return res
                .status(404)
                .json({ status: "fail", message: "Hatırlatıcı bulunamadı." });

        if (reminder.userId.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                status: "fail",
                message: "Bu hatırlatıcı size ait değil.",
            });
        }

        reminder.isDone = true;
        await reminder.save();

        res.json({
            status: "success",
            message: "Hatırlatıcı tamamlandı olarak işaretlendi.",
        });
    } catch (err) {
        console.error("Reminder complete error:", err);
        res.status(500).json({
            status: "error",
            message: "İşlem başarısız.",
        });
    }
};

exports.deleteReminder = async (req, res) => {
    try {
        const reminder = await Reminder.findById(req.params.id);
        if (!reminder)
            return res
                .status(404)
                .json({ status: "fail", message: "Hatırlatıcı bulunamadı." });

        if (reminder.userId.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                status: "fail",
                message: "Bu hatırlatıcı size ait değil.",
            });
        }

        await reminder.deleteOne();
        res.json({ status: "success", message: "Hatırlatıcı silindi." });
    } catch (err) {
        console.error("Reminder delete error:", err);
        res.status(500).json({
            status: "error",
            message: "Silme işlemi başarısız.",
        });
    }
};

exports.createPropertyReminder = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { message, type, dayOfMonth, monthsBeforeEnd } = req.body;

        const property = await Property.findById(propertyId);
        if (!property)
            return res
                .status(404)
                .json({ status: "fail", message: "Mülk bulunamadı." });

        let remindAt;

        if (type === "monthlyPayment") {
            const now = new Date();
            const currentDay = now.getDate();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            if (currentDay < dayOfMonth) {
                remindAt = new Date(currentYear, currentMonth, dayOfMonth, 9, 0, 0);
            } else {
                remindAt = new Date(
                    currentYear,
                    currentMonth + 1,
                    dayOfMonth,
                    9,
                    0,
                    0
                );
            }
        } else if (type === "contractEnd" && property.endDate) {
            const endDate = new Date(property.endDate);
            remindAt = new Date(endDate);
            remindAt.setMonth(remindAt.getMonth() - monthsBeforeEnd);
            remindAt.setHours(9, 0, 0, 0);
        } else {
            return res.status(400).json({
                status: "fail",
                message: "Geçersiz reminder tipi veya veri.",
            });
        }

        if (property.endDate) {
            const end = new Date(property.endDate);
            if (remindAt >= end) {
                return res.status(400).json({
                    status: "fail",
                    message:
                        "Bu sözleşme için hatırlatıcı oluşturulamaz. Sözleşme süresi dolmuş.",
                });
            }
        }

        const reminder = await Reminder.create({
            userId: req.user.id,
            propertyId,
            message: message || "Mülk hatırlatıcısı",
            type,
            dayOfMonth: dayOfMonth || null,
            monthsBeforeEnd: monthsBeforeEnd || null,
            remindAt,
        });

        res.json({ status: "success", reminder });
    } catch (err) {
        console.error("Property reminder oluşturma hatası:", err);
        res
            .status(500)
            .json({ status: "error", message: "Hatırlatıcı oluşturulamadı." });
    }
};

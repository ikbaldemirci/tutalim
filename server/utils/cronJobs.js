const cron = require("node-cron");
const Reminder = require("../models/Reminder");
const {
  sendMail,
  reminderMailText,
  reminderMailHtml,
} = require("../utils/mailer");

const Subscription = require("../models/Subscription");

cron.schedule("*/5 * * * *", async () => {
  console.log("Hatırlatıcı kontrolü başlatıldı...");

  try {
    const now = new Date();
    const reminders = await Reminder.find({
      remindAt: { $lte: now },
      isDone: false,
    })
      .populate("userId", "name mail")
      .populate("propertyId", "location endDate");

    for (const r of reminders) {
      if (r.type === "contractEnd") {
        if (new Date(r.remindAt) <= now) {
          console.log("Atlandı (contractEnd geçmiş tarih):", r._id);
          continue;
        }
      }
      await sendMail({
        to: r.userId.mail,
        subject: "Tutalım | Hatırlatıcınızın Zamanı Geldi",
        text: reminderMailText({
          name: r.userId.name,
          message: r.message,
          remindAt: r.remindAt,
        }),
        html: reminderMailHtml({
          name: r.userId.name,
          message: r.message,
          remindAt: r.remindAt,
        }),
        userId: r.userId._id,
        propertyId: r.propertyId,
      });

      r.isDone = true;
      await r.save();

      if (r.propertyId && r.type === "monthlyPayment") {
        const prop = r.propertyId;
        if (prop.endDate && new Date(prop.endDate) > now) {
          const nextMonth = new Date(r.remindAt);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          nextMonth.setHours(9, 0, 0, 0);

          await Reminder.create({
            userId: r.userId._id,
            propertyId: prop._id,
            message: r.message,
            type: "monthlyPayment",
            dayOfMonth: r.dayOfMonth,
            remindAt: nextMonth,
          });
        }
      }

      if (r.propertyId && r.type === "contractEnd") {
      }
    }
  } catch (err) {
    console.error("Cron reminder kontrol hatası:", err);
  }
});

cron.schedule("0 0 * * *", async () => {
  console.log("Abonelik süresi kontrolü başlatıldı...");
  try {
    const now = new Date();
    const result = await Subscription.updateMany(
      {
        status: "ACTIVE",
        endDate: { $lt: now },
      },
      {
        $set: { status: "EXPIRED" },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `${result.modifiedCount} adet süresi dolan abonelik EXPIRED olarak işaretlendi.`
      );
    } else {
      console.log("Süresi dolan abonelik bulunamadı.");
    }
  } catch (err) {
    console.error("Cron abonelik kontrol hatası:", err);
  }
});

module.exports = cron;

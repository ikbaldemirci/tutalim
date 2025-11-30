const Assignment = require("../models/Assignment");
const Property = require("../propertyModel");
const collection = require("../config");
const {
  sendMail,
  assignmentInviteHtml,
  assignmentAcceptedHtml,
  assignmentRejectedHtml,
} = require("../utils/mailer");

exports.createAssignment = async (req, res) => {
  try {
    const { propertyId, targetMail, role } = req.body;
    if (!propertyId || !targetMail || !role)
      return res.status(400).json({ status: "fail", message: "Eksik alanlar" });

    if (!["owner", "realtor"].includes(role))
      return res.status(400).json({ status: "fail", message: "Geçersiz rol" });

    const property = await Property.findById(propertyId);
    if (!property)
      return res
        .status(404)
        .json({ status: "fail", message: "Mülk bulunamadı" });
    if (role === "owner") {
      if (
        req.user.role !== "realtor" ||
        property.realtor?.toString() !== req.user.id.toString()
      ) {
        return res
          .status(403)
          .json({ status: "fail", message: "Daveti oluşturma yetkiniz yok" });
      }
    } else if (role === "realtor") {
      if (
        req.user.role !== "owner" ||
        property.owner?.toString() !== req.user.id.toString()
      ) {
        return res
          .status(403)
          .json({ status: "fail", message: "Daveti oluşturma yetkiniz yok" });
      }
    }

    const targetUser = await collection.findOne({ mail: targetMail });
    if (!targetUser)
      return res
        .status(404)
        .json({ status: "fail", message: "Kullanıcı bulunamadı" });

    if (role === "owner" && targetUser.role !== "owner")
      return res
        .status(400)
        .json({ status: "fail", message: "Lütfen bir ev sahibi maili girin." });
    if (role === "realtor" && targetUser.role !== "realtor")
      return res
        .status(400)
        .json({ status: "fail", message: "Lütfen bir emlakçı maili girin." });

    const existing = await Assignment.findOne({
      property: propertyId,
      role,
      status: "pending",
    });
    if (existing) {
      return res.json({
        status: "success",
        message: "Zaten bekleyen bir davet mevcut.",
      });
    }

    await Assignment.create({
      property: propertyId,
      fromUser: req.user.id,
      toUser: targetUser._id,
      role,
      status: "pending",
    });

    await sendMail({
      to: targetUser.mail,
      subject: "Tutalım | Yeni Mülk Daveti",
      html: assignmentInviteHtml({
        fromName: `${req.user.name} ${req.user.surname}`,
        propertyLocation: property.location,
        link: `${process.env.PUBLIC_BASE_URL}/owner`,
      }),
      userId: targetUser._id,
      propertyId: property._id,
    });

    res.json({
      status: "success",
      message: "Davet gönderildi. Onay bekleniyor.",
    });
  } catch (err) {
    console.error("Create assignment error:", err);
    res.status(500).json({ status: "error", message: "Sunucu hatası" });
  }
};

exports.getPendingAssignments = async (req, res) => {
  try {
    const list = await Assignment.find({
      toUser: req.user.id,
      status: "pending",
    })
      .sort({ createdAt: -1 })
      .populate("property", "location rentPrice rentDate endDate")
      .populate("fromUser", "name mail role");
    res.json({ status: "success", assignments: list });
  } catch (err) {
    console.error("List pending assignments error:", err);
    res.status(500).json({ status: "error", message: "Sunucu hatası" });
  }
};

exports.getSentAssignments = async (req, res) => {
  try {
    const list = await Assignment.find({
      fromUser: req.user.id,
      status: "pending",
    })
      .select("property role toUser status createdAt")
      .populate("property", "location rentPrice rentDate endDate");
    res.json({ status: "success", assignments: list });
  } catch (err) {
    console.error("List sent assignments error:", err);
    res.status(500).json({ status: "error", message: "Sunucu hatası" });
  }
};

exports.acceptAssignment = async (req, res) => {
  try {
    const invite = await Assignment.findById(req.params.id);
    if (!invite || invite.status !== "pending") {
      return res
        .status(404)
        .json({ status: "fail", message: "Davet bulunamadı" });
    }
    if (invite.toUser.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ status: "fail", message: "Bu daveti kabul etme yetkiniz yok" });
    }

    const property = await Property.findById(invite.property);
    if (!property) {
      return res
        .status(404)
        .json({ status: "fail", message: "Mülk bulunamadı" });
    }

    if (invite.role === "owner") {
      property.owner = invite.toUser;
    } else if (invite.role === "realtor") {
      property.realtor = invite.toUser;
    }
    await property.save();

    invite.status = "accepted";
    await invite.save();

    const fromUser = await collection.findById(invite.fromUser);

    await sendMail({
      to: fromUser.mail,
      subject: "Tutalım | Davet Onaylandı",
      html: assignmentAcceptedHtml({
        toName: `${req.user.name} ${req.user.surname}`,
        propertyLocation: property.location,
        link: `${process.env.PUBLIC_BASE_URL}/realtor`,
      }),
      userId: fromUser._id,
      propertyId: property._id,
    });

    const populated = await Property.findById(property._id)
      .populate("realtor", "name mail")
      .populate("owner", "name mail");

    res.json({
      status: "success",
      message: "Davet kabul edildi.",
      property: populated,
    });
  } catch (err) {
    console.error("Accept assignment error:", err);
    res.status(500).json({ status: "error", message: "Sunucu hatası" });
  }
};

exports.rejectAssignment = async (req, res) => {
  try {
    const invite = await Assignment.findById(req.params.id);
    if (!invite || invite.status !== "pending") {
      return res
        .status(404)
        .json({ status: "fail", message: "Davet bulunamadı" });
    }
    if (invite.toUser.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ status: "fail", message: "Bu daveti reddetme yetkiniz yok" });
    }
    invite.status = "rejected";
    await invite.save();

    try {
      const property = await Property.findById(invite.property);
      const fromUser = await collection.findById(invite.fromUser);

      if (fromUser?.mail) {
        await sendMail({
          to: fromUser.mail,
          subject: "Tutalım | Davet Reddedildi",
          html: assignmentRejectedHtml({
            toName: `${req.user.name} ${req.user.surname}`,
            propertyLocation: property ? property.location : "",
            link: `${process.env.PUBLIC_BASE_URL}/realtor`,
          }),
          userId: fromUser._id,
          propertyId: property._id,
        });
      }
    } catch (mailErr) {
      console.error("Mail gönderim hatası:", mailErr);
    }
    res.json({ status: "success", message: "Davet reddedildi." });
  } catch (err) {
    console.error("Reddetme hatası:", err);
    res.status(500).json({ status: "error", message: "Sunucu hatası" });
  }
};

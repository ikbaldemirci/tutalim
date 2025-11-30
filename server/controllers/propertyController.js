const fs = require("fs");
const path = require("path");
const Property = require("../propertyModel");
const collection = require("../config"); // User model

function canEditProperty(property, user) {
    const isOwner = property.owner?.toString() === user.id.toString();
    const isRealtor = property.realtor?.toString() === user.id.toString();
    return { isOwner, isRealtor, allowed: isOwner || isRealtor };
}

exports.createProperty = async (req, res) => {
    try {
        const { rentPrice, rentDate, endDate, location, tenantName } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (userRole !== "realtor") {
            return res.status(403).json({
                status: "fail",
                message: "Sadece emlakçılar ilan ekleyebilir.",
            });
        }

        if (!rentPrice || !rentDate || !endDate || !location) {
            return res
                .status(400)
                .json({ status: "fail", message: "Eksik alanlar var" });
        }

        const property = await Property.create({
            rentPrice,
            rentDate: new Date(rentDate),
            endDate: new Date(endDate),
            location,
            realtor: userId,
            tenantName: tenantName || "",
            owner: null,
        });

        const populatedProperty = await Property.findById(property._id)
            .populate("realtor", "name mail")
            .populate("owner", "name mail");

        res.json({
            status: "success",
            message: "Yeni ilan başarıyla eklendi.",
            property: populatedProperty,
        });
    } catch (err) {
        console.error("Property ekleme hatası:", err);
        res
            .status(500)
            .json({ status: "error", message: "Sunucu hatası (ilan ekleme)" });
    }
};

exports.getProperties = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const filter = {};

        if (userRole === "realtor") {
            filter.realtor = userId;
        } else if (userRole === "owner") {
            filter.owner = userId;
        } else {
            return res
                .status(403)
                .json({ status: "fail", message: "Erişim yetkiniz yok" });
        }

        const properties = await Property.find(filter)
            .populate("realtor", "name mail")
            .populate("owner", "name mail");

        res.json({ status: "success", properties });
    } catch (err) {
        console.error("Property fetch error:", err);
        res.status(500).json({ status: "error", message: "Server error" });
    }
};

exports.updateProperty = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const propertyId = req.params.id;

        const { rentPrice, rentDate, endDate, location, tenantName } = req.body;

        const property = await Property.findById(propertyId);

        if (!property) {
            return res
                .status(404)
                .json({ status: "fail", message: "Mülk bulunamadı" });
        }

        if (
            userRole === "realtor" &&
            property.realtor?.toString() !== userId.toString()
        ) {
            return res.status(403).json({
                status: "fail",
                message: "Bu ilana yalnızca kendi ilan sahibi (emlakçı) erişebilir.",
            });
        }

        if (
            userRole === "owner" &&
            property.owner?.toString() !== userId.toString()
        ) {
            return res.status(403).json({
                status: "fail",
                message: "Bu ilana yalnızca kendi sahibi (ev sahibi) erişebilir.",
            });
        }

        property.rentPrice = rentPrice ?? property.rentPrice;
        property.rentDate = rentDate ? new Date(rentDate) : property.rentDate;
        property.endDate = endDate ? new Date(endDate) : property.endDate;
        property.location = location ?? property.location;
        property.tenantName = tenantName ?? property.tenantName;

        await property.save();

        const updatedProperty = await Property.findById(property._id)
            .populate("realtor", "name mail")
            .populate("owner", "name mail");

        res.json({
            status: "success",
            message: "Mülk bilgileri başarıyla güncellendi.",
            property: updatedProperty,
        });
    } catch (err) {
        console.error("Property update error:", err);
        res
            .status(500)
            .json({ status: "error", message: "Sunucu hatası (güncelleme)" });
    }
};

exports.assignProperty = async (req, res) => {
    try {
        const { ownerMail, realtorMail } = req.body;
        let updateData = {};

        if (ownerMail === null) {
            updateData.owner = null;
        }
        if (realtorMail === null) {
            updateData.realtor = null;
        }

        if (Object.keys(updateData).length > 0) {
            const property = await Property.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true }
            )
                .populate("realtor", "name mail")
                .populate("owner", "name mail");

            return res.json({
                status: "success",
                property,
                message: "Atama kaldırıldı ✅",
            });
        }

        const mail = ownerMail || realtorMail;
        if (!mail)
            return res
                .status(400)
                .json({ status: "fail", message: "Mail adresi gerekli" });

        const user = await collection.findOne({ mail });
        if (!user)
            return res
                .status(404)
                .json({ status: "fail", message: "Kullanıcı bulunamadı" });

        if (ownerMail) {
            if (user.role !== "owner") {
                return res.status(400).json({
                    status: "fail",
                    message: "Lütfen bir ev sahibi maili girin.",
                });
            }
            updateData.owner = user._id;
        }

        if (realtorMail) {
            if (user.role !== "realtor") {
                return res.status(400).json({
                    status: "fail",
                    message: "Lütfen bir emlakçı maili girin.",
                });
            }
            updateData.realtor = user._id;
        }

        const property = await Property.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        )
            .populate("realtor", "name mail")
            .populate("owner", "name mail");

        res.json({
            status: "success",
            property,
            message: "Atama işlemi başarılı ✅",
        });
    } catch (err) {
        console.error("Assign error:", err);
        res.status(500).json({ status: "error", message: "Sunucu hatası oluştu" });
    }
};

exports.deleteProperty = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const property = await Property.findById(propertyId);
        if (!property) {
            return res
                .status(404)
                .json({ status: "fail", message: "Mülk bulunamadı" });
        }

        const isAuthorized =
            (userRole === "realtor" &&
                property.realtor?.toString() === userId.toString()) ||
            (userRole === "owner" &&
                property.owner?.toString() === userId.toString());

        if (!isAuthorized) {
            return res.status(403).json({
                status: "fail",
                message:
                    "Bu mülkü silme yetkiniz yok. Sadece kendi mülklerinizi silebilirsiniz.",
            });
        }

        await Property.findByIdAndDelete(propertyId);

        res.json({
            status: "success",
            message: "Mülk başarıyla silindi 🏠",
        });
    } catch (err) {
        console.error("Property delete error:", err);
        res
            .status(500)
            .json({ status: "error", message: "Sunucu hatası (silme işlemi)" });
    }
};

exports.uploadContract = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property)
            return res
                .status(404)
                .json({ status: "fail", message: "Mülk bulunamadı" });

        if (!property.realtor) {
            return res.status(400).json({
                status: "fail",
                message: "Bu işlem için önce bir emlakçı atayın",
            });
        }

        const { allowed } = canEditProperty(property, req.user);
        if (!allowed) {
            return res.status(403).json({
                status: "fail",
                message: "Bu mülke sözleşme yükleme yetkiniz yok.",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                status: "fail",
                message: "Lütfen bir sözleşme dosyası seçin.",
            });
        }

        property.contractFile = req.file.path;
        await property.save({ validateBeforeSave: false });

        const updated = await Property.findById(req.params.id)
            .populate("realtor", "name mail")
            .populate("owner", "name mail");

        res.json({
            status: "success",
            message: "Sözleşme başarıyla yüklendi",
            property: updated,
        });
    } catch (err) {
        console.error("Contract upload error:", err);
        res.status(500).json({
            status: "error",
            message: "Sunucu hatası (sözleşme yükleme)",
        });
    }
};

exports.deleteContract = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const property = await Property.findById(propertyId);
        if (!property) {
            return res
                .status(404)
                .json({ status: "fail", message: "Mülk bulunamadı" });
        }

        const isAuthorized =
            (userRole === "realtor" &&
                property.realtor?.toString() === userId.toString()) ||
            (userRole === "owner" &&
                property.owner?.toString() === userId.toString());

        if (!isAuthorized) {
            return res.status(403).json({
                status: "fail",
                message:
                    "Bu mülkteki sözleşmeyi silme yetkiniz yok. Sadece kendi mülklerinizin sözleşmesini silebilirsiniz.",
            });
        }

        if (property.contractFile) {
            const safePath = property.contractFile.replace(/^[/\\]+/, "");
            // Use .. to go up from controllers directory to server root
            const filePath = path.join(__dirname, "..", safePath);

            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (fileErr) {
                console.error("Dosya silme hatası:", fileErr);
            }

            property.contractFile = "";
            await property.save();
        }

        const updatedProperty = await Property.findById(propertyId)
            .populate("realtor", "name mail")
            .populate("owner", "name mail");

        res.json({
            status: "success",
            message: "Sözleşme silindi 🗑️",
            property: updatedProperty,
        });
    } catch (err) {
        console.error("Delete contract error:", err);
        res.status(500).json({
            status: "error",
            message: "Sunucu hatası (sözleşme silme)",
        });
    }
};

exports.addNote = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property)
            return res
                .status(404)
                .json({ status: "fail", message: "Mülk bulunamadı" });

        if (!property.realtor) {
            return res.status(400).json({
                status: "fail",
                message: "Bu işlem için önce bir emlakçı atayın",
            });
        }

        const { allowed } = canEditProperty(property, req.user);
        if (!allowed) {
            return res.status(403).json({
                status: "fail",
                message: "Bu mülke not ekleme yetkiniz yok",
            });
        }

        if (typeof req.body?.notes !== "undefined") {
            property.notes = req.body.notes;
        }

        if (req.file) {
            property.notes = property.notes || "";
            property.notes += `<img src="/${req.file.path}" alt="note image" />`;
        }

        await property.save({ validateBeforeSave: false });

        res.json({
            status: "success",
            message: "Not başarıyla kaydedildi",
            property,
        });
    } catch (err) {
        console.error("Note upload error:", err);
        res.status(500).json({
            status: "error",
            message: "Sunucu hatası (not yükleme)",
        });
    }
};

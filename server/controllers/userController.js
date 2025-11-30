const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const collection = require("../config"); // User model

const ACCESS_SECRET = process.env.ACCESS_SECRET || "tutalim-secret";
const ACCESS_EXPIRES_MIN = Number(process.env.ACCESS_EXPIRES_MIN || 15);

exports.getUser = async (req, res) => {
    try {
        const { mail } = req.query;
        if (!mail)
            return res.status(400).json({ status: "fail", message: "Mail gerekli" });

        const user = await collection.findOne({ mail });
        if (!user)
            return res
                .status(404)
                .json({ status: "fail", message: "Kullanıcı bulunamadı" });

        res.json({ status: "success", user });
    } catch (err) {
        console.error("Kullanıcı bulma hatası:", err);
        res.status(500).json({ status: "error", message: "Sunucu hatası" });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { name, surname } = req.body;

        const updatedUser = await collection.findByIdAndUpdate(
            req.params.id,
            { name, surname },
            { new: true }
        );

        if (!updatedUser) {
            return res
                .status(404)
                .json({ status: "fail", message: "Kullanıcı bulunamadı" });
        }

        const newToken = jwt.sign(
            {
                id: updatedUser._id,
                role: updatedUser.role,
                name: updatedUser.name,
                surname: updatedUser.surname,
                mail: updatedUser.mail,
            },
            ACCESS_SECRET,
            { expiresIn: `${ACCESS_EXPIRES_MIN}m` }
        );

        res.json({
            status: "success",
            message: "Kullanıcı bilgileri güncellendi",
            user: updatedUser,
            token: newToken,
        });
    } catch (err) {
        console.error("Profil güncelleme hatası:", err);
        res.status(500).json({
            status: "error",
            message: "Sunucu hatası, güncelleme başarısız",
        });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await collection.findById(req.params.id);

        if (!user)
            return res
                .status(404)
                .json({ status: "fail", message: "Kullanıcı bulunamadı" });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch)
            return res
                .status(400)
                .json({ status: "fail", message: "Mevcut şifre yanlış" });

        const hashedNew = await bcrypt.hash(newPassword, 10);
        user.password = hashedNew;
        await user.save();

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                name: user.name,
                surname: user.surname,
            },
            ACCESS_SECRET,
            { expiresIn: `${ACCESS_EXPIRES_MIN}m` }
        );

        res.json({
            status: "success",
            message: "Şifre başarıyla değiştirildi",
            token,
        });
    } catch (err) {
        console.error("Şifre değişim hatası:", err);
        res.status(500).json({
            status: "error",
            message: "Sunucu hatası, şifre değişimi başarısız",
        });
    }
};

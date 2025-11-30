const Joi = require("joi");

const createReminder = {
    body: Joi.object()
        .keys({
            propertyId: Joi.string().allow(null, ""),
            message: Joi.string().required(),
            remindAt: Joi.date().required(),
            type: Joi.string()
                .valid("monthlyPayment", "contractEnd")
                .allow(null, "")
                .optional(),
            dayOfMonth: Joi.number().min(1).max(31).allow(null).optional(),
            monthsBeforeEnd: Joi.number().min(1).max(24).allow(null).optional(),
        })
        .custom((value, helpers) => {
            if (value.type && !value.propertyId) {
                return helpers.message("Bu hatırlatıcı bir mülke bağlı olmalıdır.");
            }
            if (value.type === "monthlyPayment" && !value.dayOfMonth) {
                return helpers.message("Aylık ödeme için gün değeri gereklidir.");
            }
            if (value.type === "contractEnd" && !value.monthsBeforeEnd) {
                return helpers.message(
                    "Sözleşme bitişi için kaç ay önce hatırlatılacağı gereklidir."
                );
            }
            if (!value.type && new Date(value.remindAt) <= new Date()) {
                return helpers.message("Geçmiş bir zamana hatırlatıcı oluşturamazsınız.");
            }
            return value;
        }),
};

const reminderIdParam = {
    params: Joi.object().keys({
        id: Joi.string().required(),
    }),
    userIdParam: Joi.object().keys({
        userId: Joi.string().required(),
    }),
};

const createPropertyReminder = {
    params: Joi.object().keys({
        propertyId: Joi.string().required(),
    }),
    body: Joi.object().keys({
        message: Joi.string().optional(),
        type: Joi.string().valid("monthlyPayment", "contractEnd").required(),
        dayOfMonth: Joi.number().min(1).max(31).optional(),
        monthsBeforeEnd: Joi.number().min(1).max(24).optional(),
    }),
};

module.exports = {
    createReminder,
    reminderIdParam,
    createPropertyReminder,
};

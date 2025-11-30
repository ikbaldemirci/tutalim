const Joi = require("joi");

const sendMail = {
    body: Joi.object().keys({
        to: Joi.string().email().required(),
        subject: Joi.string().required(),
        html: Joi.string().required(),
        text: Joi.string().optional(),
    }),
};

const sendContactMail = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        subject: Joi.string().optional().allow(""),
        message: Joi.string().required(),
    }),
};

module.exports = {
    sendMail,
    sendContactMail,
};

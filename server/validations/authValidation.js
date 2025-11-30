const Joi = require("joi");

const signup = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        surname: Joi.string().required(),
        mail: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid("owner", "realtor").required(),
    }),
};

const login = {
    body: Joi.object().keys({
        mail: Joi.string().email().required(),
        password: Joi.string().required(),
    }),
};

const forgotPassword = {
    body: Joi.object().keys({
        mail: Joi.string().email().required(),
    }),
};

const resetPassword = {
    params: Joi.object().keys({
        token: Joi.string().required(),
    }),
    body: Joi.object().keys({
        password: Joi.string().min(6).required(),
    }),
};

const verifyEmail = {
    params: Joi.object().keys({
        token: Joi.string().required(),
    }),
};

module.exports = {
    signup,
    login,
    forgotPassword,
    resetPassword,
    verifyEmail,
};

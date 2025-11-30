const Joi = require("joi");

const createAssignment = {
    body: Joi.object().keys({
        propertyId: Joi.string().required(),
        targetMail: Joi.string().email().required(),
        role: Joi.string().valid("owner", "realtor").required(),
    }),
};

const assignmentIdParam = {
    params: Joi.object().keys({
        id: Joi.string().required(),
    }),
};

module.exports = {
    createAssignment,
    assignmentIdParam,
};

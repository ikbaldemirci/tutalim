const Joi = require("joi");

const createProperty = {
    body: Joi.object().keys({
        rentPrice: Joi.number().required(),
        rentDate: Joi.date().required(),
        endDate: Joi.date().greater(Joi.ref("rentDate")).required(),
        location: Joi.string().required(),
        tenantName: Joi.string().allow("").optional(),
    }),
};

const updateProperty = {
    params: Joi.object().keys({
        id: Joi.string().required(), // MongoDB ObjectId validation could be added here
    }),
    body: Joi.object().keys({
        rentPrice: Joi.number(),
        rentDate: Joi.date(),
        endDate: Joi.date().greater(Joi.ref("rentDate")),
        location: Joi.string(),
        tenantName: Joi.string().allow("").optional(),
        notes: Joi.string().allow("").optional(),
    }),
};

const assignProperty = {
    params: Joi.object().keys({
        id: Joi.string().required(),
    }),
    body: Joi.object().keys({
        ownerMail: Joi.string().email().allow(null),
        realtorMail: Joi.string().email().allow(null),
    }),
};

const propertyIdParam = {
    params: Joi.object().keys({
        id: Joi.string().required(),
    }),
};

module.exports = {
    createProperty,
    updateProperty,
    assignProperty,
    propertyIdParam,
};

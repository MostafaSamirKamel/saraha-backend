const Joi = require('joi');

const signupSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    username: Joi.string().min(3).max(30).alphanum().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    phone: Joi.string().allow('', null)
});

const loginSchema = Joi.object({
    loginIdentifier: Joi.string().required(),
    password: Joi.string().required()
});

module.exports = {
    signupSchema,
    loginSchema
};

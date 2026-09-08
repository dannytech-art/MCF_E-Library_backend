const Joi = require("joi");

exports.validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            return res.status(400).json({
                message: "Validation error",
                errors: error.details.map((detail) => detail.message),
            });
        }

        req.body = value;
        next();
    };
};



exports.signupSchema = Joi.object({
    fullName: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.empty": "Full name is required",
            "string.min": "Full name must be at least 2 characters",
            "string.max": "Full name cannot exceed 100 characters",
            "any.required": "Full name is required",
        }),

    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.empty": "Email is required",
            "string.email": "Please provide a valid email address",
            "any.required": "Email is required",
        }),

    password: Joi.string()
        .min(6)
        .required()
        .messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 6 characters",
            "any.required": "Password is required",
        }),

    faculty: Joi.string()
        .valid(
            "Faculty Of Art",
            "Faculty Of Science",
            "Faculty Of Engineering",
            "Faculty Of Social Sciences",
            "Faculty Of Education"
        )
        .required()
        .messages({
            "any.only": "Please select a valid faculty",
            "string.empty": "Faculty is required",
            "any.required": "Faculty is required",
        }),
});



exports.loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.empty": "Email is required",
            "string.email": "Please provide a valid email address",
            "any.required": "Email is required",
        }),

    password: Joi.string()
        .required()
        .messages({
            "string.empty": "Password is required",
            "any.required": "Password is required",
        }),
});



exports.changePasswordSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .messages({
            "string.empty": "Current password is required",
            "any.required": "Current password is required",
        }),

    newPassword: Joi.string()
        .min(6)
        .required()
        .messages({
            "string.empty": "New password is required",
            "string.min": "New password must be at least 6 characters",
            "any.required": "New password is required",
        }),
});

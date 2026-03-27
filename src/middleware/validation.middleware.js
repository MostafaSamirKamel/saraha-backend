const validationMiddleware = (schema) => (req, res, next) => {
    console.log('Validating Request Body:', req.body);
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        console.error('Validation Error Details:', error.details.map(err => err.message));
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: error.details.map(err => err.message)
        });
    }
    next();
};

module.exports = validationMiddleware;

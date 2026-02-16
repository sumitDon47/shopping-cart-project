const { body, validationResult } = require('express-validator');

/**
 * Validation middleware
 * Checks for validation errors and returns them
 */
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

/**
 * User Registration Validation Rules
 */
exports.registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2-50 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

/**
 * Login Validation Rules
 */
exports.loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
];

/**
 * Product Validation Rules
 */
exports.productValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Product name is required')
        .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required'),
    body('price')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category')
        .notEmpty().withMessage('Category is required'),
    body('brand')
        .trim()
        .notEmpty().withMessage('Brand is required'),
    body('stock')
        .isInt({ min: 0 }).withMessage('Stock must be a positive number')
];
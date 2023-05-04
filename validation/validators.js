const User = require('../models/user')
const { param,body } = require('express-validator')
//===============================================
exports.validateCreateAccount = [
    body('email')
        .isEmail()
        .trim()
        .withMessage('enter a valid email')
        .custom(async (value, { req }) => { 
            const findUser = await User.findOne({ where: { email: value } })
            if (findUser) {
                throw new Error('a user with this email already exists')
            }
        return true
    }),
    //password validation
    body('password')
        .isLength({ min: 8})
        .withMessage('password is too short'),
    //confirm password validation
    body('confirmPassword',
        'password and confirm password are not match')
        .custom((value, { req }) => { 
            if (value !== req.body.password) {
                throw new Error()
            }
            return true
        })
]
    
exports.validateIdInParam = [
    // Validate the id parameter
    param('id')
        .isInt()
        .withMessage('Invalid user id'),
]

exports.validateLogin = [
    body('email')
        .isEmail()
        .trim()
        .withMessage('enter a valid email'),
]
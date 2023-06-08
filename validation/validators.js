const User = require('../models/users.model')
const Product = require('../models/products.model')

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

exports.validateIdInParam = (paramName) => {
    [
        // Validate the id parameter
        param(`${paramName}`)
            .isInt()
            .withMessage('Invalid user id'),
    ]
}
exports.validateUPC_ID = () => {
    [
        // Validate the id parameter
        param('UPC_ID')
            .isLength(12)
            .withMessage('Invalid user id'),
    ]
}

exports.validateLogin = [
    body('email')
        .isEmail()
        .trim()
        .withMessage('enter a valid email'),
]
exports.validateUPCinParams = [
    param('UPC_ID')
        .custom(async (value, { req }) => { 
                if (value.length !== 12) {
                    throw new Error('invalid upc')
                }
                if (isNaN(+value) ) {
                    throw new Error('invalid upc')
                }
                if (+value < 100000000000) {
                    throw new Error('invalid upc')
                }

                return true
        })]

exports.validateProduct = [
    body('UPC_ID')
        .custom(async (value, { req }) => { 
                if (value.length !== 12) {
                    throw new Error('invalid upc')
                }
                if (isNaN(+value) ) {
                    throw new Error('invalid upc')
                }
                if (+value < 100000000000) {
                    throw new Error('invalid upc')
                }

                const product = await Product.findByPk(value)

                if (product) {
                    throw new Error('a product with this upc already exists')
                }
                return true
    }),
    body('name')
        .isLength({ min: 8 })
        .withMessage("name cant be less than 8 characters"),
    body('description')
        .isLength({ min: 12 })
        .withMessage("description cant be less than 12 characters"),
        
]
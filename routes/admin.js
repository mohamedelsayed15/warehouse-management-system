const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin')
const { adminAuth } = require('../middleware/auth')
const upload = require('../multer/multer')
const { validateLogin,
    validateIdInParam,
    validateCreateAccount,
    validateProduct,
} = require('../validation/validators')

//login admin
router.post('/login-admin',
    validateLogin,
    adminController.loginAdmin)

//creating a supervisor
router.put(
    '/create-supervisor/:warehouseId',
    validateIdInParam,
    validateCreateAccount,
    adminAuth,
    adminController.createSupervisorForWarehouse)

//creating another admin

router.put(
    '/create-admin',
    validateCreateAccount,
    adminAuth,
    adminController.createAdmin)

//deactivate supervisor or admin Top admin may only activate other admins
router.get(
    '/deactivate-user/:id',
    validateIdInParam,
    adminAuth,
    adminController.deactivateUser)

//activate supervisor or admin Top admin may only activate other admins
router.get(
    '/activate-user/:id',
    validateIdInParam,
    adminAuth,
    adminController.activateUser)

//create warehouse
router.post('/create-warehouse',
    adminAuth,
    adminController.createWarehouse)

// admin add product
router.post('/add-Product',
    //validateProduct,
    adminAuth,
    upload,//multer
    adminController.addProduct)

//serving image
router.get(
    '/image/:productId',
    adminAuth,
    adminController.serveProductImage)
module.exports = router
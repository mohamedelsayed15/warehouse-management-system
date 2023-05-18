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
router.post(
    '/login-admin',
    validateLogin,
    adminController.loginAdmin)

//logout admin
router.get(
    '/logout-admin',
    adminAuth,
    adminController.logoutAdmin)

//creating a supervisor
router.put(
    '/create-supervisor/:warehouseId',
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
router.patch(
    '/deactivate-user/:id',
    validateIdInParam,
    adminAuth,
    adminController.deactivateUser)

//activate supervisor or admin Top admin may only activate other admins
router.patch(
    '/activate-user/:id',
    validateIdInParam,
    adminAuth,
    adminController.activateUser)

//create warehouse
router.post('/create-warehouse',
    adminAuth,
    adminController.createWarehouse)

//add a product to warehouse
router.post('/assign-product-to-warehouse',
adminAuth,
adminController.assignProductToWarehouse)

// admin add product
router.post('/add-Product',
    //validateProduct,
    adminAuth,
    upload,//multer
    adminController.addProduct)

//change product
router.patch(
    '/edit-product/:productId',
    adminAuth,
    upload,// optional
    adminController.editProduct)

//serving image
router.get(
    '/image/:productId',
    adminAuth,
    adminController.serveProductImage)


module.exports = router
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
router.post( // 1
    '/login-admin',
    validateLogin,
    adminController.loginAdmin)

//logout admin
router.get( // 2
    '/logout-admin',
    adminAuth,
    adminController.logoutAdmin)

//creating a supervisor
router.put(// 3
    '/create-supervisor/:warehouseId',
    validateCreateAccount,
    adminAuth,
    adminController.createSupervisorForWarehouse)

//creating another admin
router.put( // 4
    '/create-admin',
    validateCreateAccount,
    adminAuth,
    adminController.createAdmin)

//deactivate supervisor or admin Top admin may only activate other admins
router.patch( // 5
    '/deactivate-user/:id',
    validateIdInParam,
    adminAuth,
    adminController.deactivateUser)

//activate supervisor or admin Top admin may only activate other admins
router.patch( // 6
    '/activate-user/:id',
    validateIdInParam,
    adminAuth,
    adminController.activateUser)

//create warehouse
router.post( // 7
    '/create-warehouse',
    adminAuth,
    adminController.createWarehouse)

//add a product to warehouse
router.post( // 8
    '/assign-product-to-warehouse',
    adminAuth,
    adminController.assignProductToWarehouse)

// admin add product
router.post(// 9
    '/add-Product',
    //validateProduct,
    adminAuth,
    upload,//multer
    adminController.addProduct)

//change product
router.patch( // 10
    '/edit-product/:productId',
    adminAuth,
    upload,// optional
    adminController.editProduct)

//serving image
router.get( // 11
    '/image/:productId',
    adminAuth,
    adminController.serveProductImage)

// change order status to accepted (accepted)
router.patch( // 12
    '/accept-order/:orderId',
    adminAuth,
    adminController.acceptOrder)

// view order
router.get( // 13
    '/view-order/:orderId',
    adminAuth,
    adminController.viewOrder)

// get warehouse products (pagination)
router.get( // 14
    '/warehouse-products',
    adminAuth,
    adminController.getWarehouseProducts)

// search in all products { id , name } (pagination)
router.get( // 15
    '/search-product',
    adminAuth,
    adminController.searchProducts)

// view overall pending orders (pagination)
router.get( // 16
    '/view-orders-pending-accept',
    adminAuth,
    adminController.ViewPendingOrders)


module.exports = router
const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin')
const { adminAuth } = require('../middleware/auth')
const { validateLogin,
    validateIdInParam,
    validateCreateAccount,
} = require('../validation/validators')

//creating a supervisor
router.put('/create-supervisor' ,validateCreateAccount,adminAuth, adminController.createSupervisor)

//creating another admin

router.put('/create-admin',validateCreateAccount, adminAuth, adminController.createAdmin)

//deactivate supervisor or admin Top admin may only activate other admins
router.get('/deactivate-user/:id',validateIdInParam,adminAuth,adminController.deactivateUser)

//activate supervisor or admin Top admin may only activate other admins
router.get('/activate-user/:id',validateIdInParam,adminAuth,adminController.activateUser)

//login admin
router.post('/login-admin', validateLogin, adminController.loginAdmin)

module.exports = router
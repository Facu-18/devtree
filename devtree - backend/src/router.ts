import { Router } from 'express'
import { body } from 'express-validator'
import { createAccount, getUser, login, updateProfile, uploadImage } from './handlers'
import { handleInpuntErrors } from './middleware/validation'
import { authenticate } from './middleware/auth'

const router = Router()

/** Autenticacion y Registro */
router.post('/auth/register', 
    body('handle')
    .notEmpty()
    .withMessage('El Handle no puede ir vacio'),
    
    body('name')
    .notEmpty()
    .withMessage('El Nombre no puede ir vacio'),

    body('email')
    .notEmpty()
    .isEmail()
    .withMessage('El Email no es valido'),

    body('password')
    .isLength({min: 8})
    .withMessage('El Password no puede ir vacio'),
    handleInpuntErrors,
    createAccount)

router.post('/auth/login', 
    body('email')
    .notEmpty()
    .isEmail()
    .withMessage('El Email no es valido'),

    body('password')
    .isLength({min: 8})
    .withMessage('El Password es obligatorio'),
    handleInpuntErrors,
    login)    

router.get('/user', authenticate, getUser)  

router.patch('/user', 
    body('handle')
    .notEmpty()
    .withMessage('El Handle no puede ir vacio'),

    body('description')
    .notEmpty()
    .withMessage('La Descripcion no puede ir vacia'),
    
    handleInpuntErrors,
    authenticate, 
    updateProfile)  

router.post('/user/image', authenticate, uploadImage)
    
export default router;
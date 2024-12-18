import type { Request, Response } from "express"
import { validationResult } from 'express-validator'
import User from "../models/User"
import { comparePassword, hashPassword } from "../utils/auth"
import { generateJWT } from "../utils/jwt"

export const createAccount = async (req: Request, res: Response) => {

    const { default: slug } = await import("slug");

    const { email, password } = req.body

    const userExists = await User.findOne({ email })

    if (userExists) {
        const error = new Error("Ya existe un usuario con ese email")
        res.status(409).json({ error: error.message })
        return;
    }

    const handle = slug(req.body.handle, '')
    const handleExists = await User.findOne({ handle })

    if (handleExists) {
        const error = new Error("Nombre de usuario no disponible")
        res.status(409).json({ error: error.message })
        return;
    }

    const user = new User(req.body)
    user.password = await hashPassword(password)
    user.handle = handle

    await user.save()
    res.send('Registro Exitoso')
}

export const login = async (req: Request, res: Response) => {

    // Manejar errores
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return;
    }

    const {email, password} = req.body

    // Revisar si el usuario esta registrado
    const user = await User.findOne({ email })
    
    if (!user) {
        const error = new Error("No existe un usuario con ese email")
        res.status(401).json({ error: error.message })
        return;
    }

    // Comprobar el password
    const isPasswordCorrect = await comparePassword(password, user.password)

    if (!isPasswordCorrect) {
        const error = new Error("La contraseña es incorrecta")
        res.status(401).json({ error: error.message })
        return;
    }

    const token = generateJWT({id: user._id})
    
    res.send(token)
}

export const getUser = async (req: Request, res: Response) => {
   res.json(req.user)
}
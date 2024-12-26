import type { Request, Response } from "express"
import { validationResult } from 'express-validator'
import User from "../models/User"
import formidable from 'formidable'
import { v4 as uuid } from 'uuid'
import cloudinary from "../config/cloudinary"
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

export const updateProfile = async (req: Request, res: Response) => {
    try{
        const { description, links } = req.body

        const { default: slug } = await import("slug");

        const handle = slug(req.body.handle, '')
        const handleExists = await User.findOne({ handle })
    
        if (handleExists && handleExists.email !== req.user.email) {
            const error = new Error("Nombre de usuario no disponible")
            res.status(409).json({ error: error.message })
            return;
        }

        // Actualizar el usuario
        req.user.description = description
        req.user.handle = handle
        req.user.links = links
        await req.user.save()
        res.send('Perfil Actualizado Correctamente')

    } catch (e){
        const error = new Error('Hubo un error')
        res.status(500).json({ error: error.message })
    }
}

export const uploadImage = async (req: Request, res: Response) => {
    const form = formidable({multiples: false})
    
    
    try{
        form.parse(req, (error, fields, files)=>{
            

            cloudinary.uploader.upload(files.file[0].filepath, { public_id: uuid()}, async function (error, result) {
                if(error){
                    const error = new Error('Hubo un error al subir la imagen')
                    res.status(500).json({ error: error.message })
                }
                
                if(result){
                    req.user.image = result.secure_url
                    await req.user.save()
                    res.json({image: result.secure_url})
                }
            })
        })
    } catch (e){
        const error = new Error('Hubo un error')
        res.status(500).json({ error: error.message })
    }
}

export const getUserByHandle = async (req: Request, res: Response) => {
   try{
        const { handle } = req.params
        const user = await User.findOne({handle}).select('-_id -__v -email -password')
        if(!user){
            const error = new Error('El usuario no existe')
            res.status(404).json(error.message)
            return;
        }else{
            res.json(user)
        }
    }catch (e){
        const error = new Error('Hubo un error')
        res.status(500).json({ error: error.message })
    }
}

export const searchByHandle = async (req: Request, res: Response) => {
    try{
        const { handle } = req.body
        const userExists = await User.findOne({handle})
        if(userExists){
            const error = new Error(`${handle} ya esta registrado`)
            res.status(409).json({error: error.message})
            return;
        }
        res.send(`${handle} esta disponible`)
    }catch (e){
        const error = new Error('Hubo un error')
        res.status(500).json({ error: error.message })
    }
}
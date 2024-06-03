import { Router } from 'express';
// import { SessionsManagerMONGO as SessionsManager } from '../dao/sessionsManagerMONGO.js';
// import { hashPassword,validatePassword } from '../utils.js';
// import { CartManagerMONGO as CartManager } from '../dao/cartManagerMONGO.js';
// import { authUserIsLogged } from '../middleware/auth.js';
import passport from "passport";

export const router=Router();

router.post('/registro',passport.authenticate("registro",{failureMessage:true,failureRedirect:"/api/sessions/error"}),async(req,res)=>{
    const newUser = {...req.user}
    delete newUser.password

    const acceptHeader = req.headers['accept']
    if(acceptHeader.includes('text/html')){
        return res.status(301).redirect('/login')
    }

    res.setHeader('Content-type', 'application/json');
    return res.status(201).json({
        status:"success",
        message:"Signup process was completed successfully",
        payload:{
            nombre:newUser.nombre,
            email: newUser.email,
            rol: newUser.rol,
            carrito: newUser.cart
        }
    })
})

router.post('/login',passport.authenticate("login",{failureMessage:true,failureRedirect:"/api/sessions/error"}),async(req,res)=>{
    const authenticatedUser ={...req.user}
    delete authenticatedUser.password
    req.session.user = authenticatedUser    
    
    const acceptHeader = req.headers['accept']
    if(acceptHeader.includes('text/html')){
        return res.status(301).redirect('/products')
    }

    res.setHeader('Content-type', 'application/json');
    return res.status(200).json({
        status: 'success',
        message: 'User login was completed successfully',
        payload: {
            nombre: authenticatedUser.first_name,
            apellido: authenticatedUser.last_name,
            edad: authenticatedUser.age,
            email: authenticatedUser.email,
            rol:authenticatedUser.rol,
            carrito:authenticatedUser.cart
        }
    })      
})

router.get('/current', async(req,res)=>{
    const currentUser={...req.user}
    req.session.user=currentUser

    const acceptHeader = req.headers['accept']
    if(acceptHeader.includes('text/html')){
        return res.status(301).redirect('/perfil')
    }

    res.setHeader('Content-type', 'application/json');
    return res.status(200).json({
        status:'success',
        message: 'current user was obtained successfully',
        payload:{
            nombre: currentUser.first_name,
            apellido: currentUser.last_name,
            edad: currentUser.age,
            email: currentUser.email,
            rol:currentUser.rol,
            carrito:currentUser.cart
        }    
    })
})

router.get('/logout', async(req,res)=>{
    req.session.destroy(error=>{
        if(error){
            res.setHeader('Content-type', 'application/json');
            return res.status(500).json({
                error:`Error 500 Server failed unexpectedly, please try again later`,
                message: `${error.message}`
            })
        }
    })

    const acceptHeader = req.headers['accept']
    if(acceptHeader.includes('text/html')){
        return res.status(301).redirect('/logout')
    }

    res.setHeader('Content-type', 'application/json');
    return res.status(200).json({payload:'Logout Exitoso'})
})

router.get('/error',(req,res)=>{
    res.setHeader('Content-type', 'application/json');
    return res.status(500).json({
        error:`Error 500 Server failed unexpectedly, please try again later`,
        message: `Fallo al autenticar`
    })
})

router.get('/github',passport.authenticate("github",{}),(req,res)=>{})

router.get('/callbackGithub',passport.authenticate("github",{failureMessage:true,failureRedirect:"/api/sessions/error"}),(req,res)=>{
    const githubAuthenticatedUser = {...req.user}
    delete githubAuthenticatedUser.profile
    req.session.user = req.user

    const acceptHeader = req.headers['accept']
    if(acceptHeader.includes('text/html')){
        return res.status(301).redirect('/products')
    }

    res.setHeader('Content-type', 'application/json');
    return res.status(200).json({
        status:'success',
        message:'Github Authentication was completed successfully',
        payload:{
            nombre: githubAuthenticatedUser.nombre,
            email: githubAuthenticatedUser.email,
            rol: githubAuthenticatedUser.rol,
            carrito: githubAuthenticatedUser.cart,
        }
    })
})

import passport from "passport";
import local from "passport-local";
import github from "passport-github2";
import dotenv from "dotenv";
import { SessionsManagerMONGO as SessionsManager} from "../dao/sessionsManagerMONGO.js";
import { CartManagerMONGO as CartManager } from "../dao/cartManagerMONGO.js";
import { usersManagerMongo as UsersManager } from "../dao/usersManagerMONGO.js";
import { hashPassword, validatePassword } from "../utils.js";

const sessionsManager = new SessionsManager()
const cartManager = new CartManager()
const usersManager = new UsersManager()


export const initPassport=()=>{
    // --------- estrategia de registro -------------------//
    passport.use(
        "registro",
        new local.Strategy(
            {
                usernameField: "email",
                passReqToCallback: true,
            },
            async(req,username,password,done)=>{
                try {
                    //const {nombre} = req.body
                    const {first_name, last_name, age} = req.body
                    if(!first_name){  
                        console.log(`Failed to complete signup due to missing name.Please make sure all mandatory fields(*)are completed to proceed with signup`)
                        return done(null,false)
                    }

                    if(!last_name){  
                        console.log(`Failed to complete signup due to missing lastname.Please make sure all mandatory fields(*)are completed to proceed with signup`)
                        return done(null,false)
                    }

                    if(!age){  
                        console.log(`Failed to complete signup due to missing age.Please make sure all mandatory fields(*)are completed to proceed with signup`)
                        return done(null,false)
                    }
                
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if(!emailRegex.test(username)){
                        console.log(`The email ${username} does not match a valid email format. Other types of data structures are not accepted as an email address. Please verify and try again`)
                        return done(null,false)
                    }
                
                    const emailAlreadyExists = await usersManager.getUserByFilter({email:username})
                    if(emailAlreadyExists){
                        console.log(`The email you are trying to register (email: ${username}) already exists in our database and cannot be duplicated. Please try again using a diferent email.`)
                        return done(null,false)
                    }
                   
                    password = hashPassword(password)                  
                    const newCart = await cartManager.createCart()
                    const newUser = await usersManager.createUser({first_name, last_name, age,email:username,password,cart:newCart._id})
                    
                    return done(null, newUser)

                } catch (error) {
                    return done(error) 
                }
            }
        )
    )

    // --------- estrategia de login ----------------------//
    passport.use(
        "login",
        new local.Strategy(
            {
                usernameField: "email",
            },
            async(username,password,done)=>{
                try {                 
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if(!emailRegex.test(username)){
                        console.log(`The email ${username} does not match a valid email format. Other types of data structures are not accepted as an email address. Please verify and try again`)
                        done(null,false)
                    }

                    if(username=="adminCoder@coder.com" && password=="adminCod3r123"){
                        const userIsManager={
                            _id:'adminId',
                            nombre:'Manager Session',
                            email:username,
                            rol:'admin',
                            cart: 'No Aplica'
                        }
                        return done(null, userIsManager)
                    }
                    
                    const userIsValid = await usersManager.getUserByFilter({email:username})
                    if(!userIsValid){
                        console.log(`Failed to complete login. The email provided (email:${username} was not found in our database. Please verify and try again`)
                        return done(null,false)
                    }
                        
                    if(!validatePassword(password,userIsValid.password)){
                            console.log( `The password you provided does not match our records. Please verify and try again.`)
                            return done(null,false)
                    }                
                
                    return done(null,userIsValid)
                } catch (error) {
                    return done(error)
                }
            }
        )
    )

    // --------- estrategia de github ----------------------//
    passport.use(
        "github",
        new github.Strategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: process.env.GITHUB_CALLBACK_URL
            },
            async(accessToken,refreshToken,profile,done)=>{
                try {
                    // console.log(profile)
                    const email=profile._json.email
                    const first_name= profile._json.name
                    // const last_name= 'NotApplicable: githubConnection'
                    // const age= 'NotApplicable: githubConnection'
                    // const password= 'NotApplicable: githubConnection'
                    let authenticatedUser = await usersManager.getUserByFilter({email})
                    if(!authenticatedUser){
                        const newCart= await cartManager.createCart()
                        authenticatedUser=await usersManager.createUser({
                            first_name, email, cart:newCart._id, profile
                           // first_name, last_name, age, email, cart:newCart._id, password, profile
                            //nombre,email,cart:newCart._id,profile
                        })        
                    }
                    return done(null,authenticatedUser)
                } catch (error) {
                    return done(error)
                }
            }
        )
    )

   // usersManager.createUser({first_name, last_name, age,email:username,password,cart:newCart._id})


    // ------------- serializer + deserializer for apps w sessions ---------//
    passport.serializeUser((user, done)=>{
        return done(null,user._id)
    })

    passport.deserializeUser(async(id,done)=>{
        let user;
        if(id==='adminId'){
            user={            
                _id:'adminId',
                nombre:'Manager Session',
                email:"adminCoder@coder.com",
                rol:'admin',
                cart: 'No Aplica'                
            }
        }else{
            user=await usersManager.getUserByFilter({_id:id})
        }       
        return done(null,user)
    })

}
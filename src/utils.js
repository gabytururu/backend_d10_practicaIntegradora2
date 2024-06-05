import {fileURLToPath} from 'url';
import {dirname} from 'path';
import bcrypt from 'bcrypt';
import passport from 'passport';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

export default __dirname

export const hashPassword = (password) => bcrypt.hashSync(password,bcrypt.genSaltSync(10))
export const validatePassword = (password, hashPassword) =>bcrypt.compareSync(password, hashPassword)


export const passportCallError = (estrategia) =>{
    return function (req,res,next){
        passport.authenticate(estrategia,function(err,user,info,status){
            if(err) {return next(err)} //desde passport.config devuelve (done(err))
            if(!user) { 
                res.setHeader('Content-type', 'application/json');
                return res.status(401).json({
                    error: info.message?info.message:info.toString()
                })
            } 
            req.user=user; 
            return next()
        })(req,res,next);
    }
}
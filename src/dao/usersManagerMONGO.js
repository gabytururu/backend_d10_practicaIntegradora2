import { usersModel } from './models/usersModel.js'

export class usersManagerMongo{

    async getUserByFilter(filter={}){
        return await usersModel.findOne(filter).lean()
    }
   
    async createUser(newUser){
        let newUserCreated= await usersModel.create(newUser)
        return newUserCreated.toJSON()
    }    
}
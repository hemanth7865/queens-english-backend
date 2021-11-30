import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../entity/User";
import { Teacher } from "../entity/Teacher";
import { LeadView } from "../model/LeadView";
import { TeacherAvailability } from "../entity/TeacherAvailability";
import { getManager } from "typeorm";
import { USERS } from "../data/users";
import { JWSTokenHandler } from "../helpers/JWSTokenHandler";
import { Admin } from "../entity/Admin";

export class LoginController {

    private usersRepository = getRepository(User);
    private leadAvailabilityRepository = getRepository(TeacherAvailability);
    private leadRepository = getRepository(Teacher);
    private userRepository = getRepository(User);
    private adminRepository = getRepository(Admin);

    async login(request: Request, response: Response, next: NextFunction) {
        const req = request.body;
        let userToRemove = await this.adminRepository.find({select:["firstname","lastname","email","phone"] ,where: { email: req.email, password: req.password} }); 
        if (userToRemove.length>0) {
   
           return {"success":true,"data": userToRemove, "total":1, "current":1, pageSize:1};
        }   else {
           return {"success":false,"data": userToRemove, "total":1, "current":1, pageSize:1};
        }   
  
    }

    async currentUser(request: Request, response: Response, next: NextFunction) {
        console.log('currentUser', request.signedCookies);
        
        const cookies = request.signedCookies;
        const token = cookies['qe-admin-token'];
        if (!token) {
            // return 401
            return response.status(401).send({
                message: 'Invalid user session. Please login.'
            }).end()
        }

        console.log('token', token);
        const decodedToken = new JWSTokenHandler().decode(token);
        console.log('decodedToken', decodedToken);
        const tokenPayload = JSON.parse(decodedToken.payload || '{}'); 
        const foundUser = USERS.find((_u) => _u.phone === tokenPayload.phone && _u.code === tokenPayload.code);
        if (!foundUser) {
            // return 401
            return response.status(401).send({
                message: 'Invalid user session. Please login.'
            }).end()
        }

        return response.status(200).send({
            success: true,
            ...foundUser,
            token
        }).end()

    }

}
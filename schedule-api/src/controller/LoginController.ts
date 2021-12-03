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
        
        const cookies = request.signedCookies;
        const token = cookies['qe-admin-token'];
        let foundUser = await this.adminRepository.findOne({select:["firstname","lastname","email","phone"] ,where: { email: req.email, password: req.password} }); 
        if (token) {
            console.log('token', token);
            const decodedToken = new JWSTokenHandler().decode(token);
            console.log('decodedToken', req.email);
            
            const tokenPayload = JSON.parse(decodedToken.payload || '{}'); 
            
            if (foundUser) {
                return response.status(200).send({
                    status: "ok",
                    type: "mobile",
                    currentAuthority: 'Admin'
                }).end();
            } else {
                return response.status(401).send({
                    status: "Ko",
                    type: "mobile",
                    currentAuthority: 'Admin'
                }).end(); 
            }
        }

      
        const tokenPayload = {
            email: foundUser.email,
            expiry: (new Date().getTime() + (24 * 60 * 60))
        };
        const sessionToken = new JWSTokenHandler().signToken(JSON.stringify(tokenPayload));

        let options = {
            maxAge: 1000 * 60 * 60 * 24, // would expire after 1 day
            httpOnly: true,
            signed: true
        }
    
        response.cookie('qe-admin-token', sessionToken, options)

        return response.status(200).send({
            status: "ok",
            type: "email",
            currentAuthority: 'Admin',
            token: sessionToken
        }).end();
  
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
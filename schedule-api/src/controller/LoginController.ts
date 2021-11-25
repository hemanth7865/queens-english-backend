import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../entity/User";
import { Teacher } from "../entity/Teacher";
import { LeadView } from "../model/LeadView";
import { TeacherAvailability } from "../entity/TeacherAvailability";
import { getManager } from "typeorm";
import { USERS } from "../data/users";
import { JWSTokenHandler } from "../helpers/JWSTokenHandler";

export class LoginController {

    private usersRepository = getRepository(User);
    private leadAvailabilityRepository = getRepository(TeacherAvailability);
    private leadRepository = getRepository(Teacher);
    private userRepository = getRepository(User);

    async login(request: Request, response: Response, next: NextFunction) {
        const req = request.body;

        const cookies = request.signedCookies;
        const token = cookies['qe-admin-token'];
        if (token) {
            console.log('token', token);
            const decodedToken = new JWSTokenHandler().decode(token);
            console.log('decodedToken', decodedToken);
            const tokenPayload = JSON.parse(decodedToken.payload || '{}'); 
            const foundUser = USERS.find((_u) => _u.phone === tokenPayload.phone && _u.code === tokenPayload.code);
            if (foundUser) {
                return response.status(200).send({
                    status: "ok",
                    type: "mobile",
                    currentAuthority: foundUser.currentAuthority
                }).end();
            }
        }

        if (req.type !== 'mobile') {
            //return 400
            return response.status(400).end()
        }
        if (!req.mobile || !req.captcha) {
            // return 400
            return response.status(400).end()
        }

        const foundUser = USERS.find((_u) => _u.phone === req.mobile && _u.code === req.captcha);
        if (!foundUser) {
            // return 401
            return response.status(401).send({
                message: 'Invalid phone/code provided'
            }).end()
        }

        const tokenPayload = {
            phone: foundUser.phone,
            code: foundUser.code,
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
            type: "mobile",
            currentAuthority: foundUser.currentAuthority,
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
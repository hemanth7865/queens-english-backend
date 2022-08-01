import { getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { USERS } from "../data/users";
import { JWSTokenHandler } from "../helpers/JWSTokenHandler";
import { Admin } from "../entity/Admin";

export class LoginController {
  private adminRepository = getRepository(Admin);

  async login(request: Request, response: Response, next: NextFunction) {
    const req = request.body;

    if (req.email) {
      try {
        const foundGoogleUser = await this.adminRepository.findOne({
          select: ["firstname", "lastname", "email", "phone", "role"],
          where: { email: req.email },
        });
        console.log("foundGoogleUser", foundGoogleUser);
                if (foundGoogleUser) {
          const tokenPayload = {
            email: foundGoogleUser.email,
            imageUrl: req.imageUrl,
            expiry: new Date().getTime() + 24 * 60 * 60,
          };
          const sessionToken = new JWSTokenHandler().signToken(
            JSON.stringify(tokenPayload)
          );

          const options = {
            maxAge: 1000 * 60 * 60 * 24, // would expire after 1 day
            httpOnly: true,
            signed: true,
          };

          response.cookie("qe-admin-token", sessionToken, options);

          response
            .status(200)
            .send({
              status: "ok",
              type: "account",
              currentAuthority: "Admin",
              token: sessionToken,
              imageUrl: req.imageUrl,
            })
            .end();
        }
      } catch (e) {
        console.log("error", e);
        response
          .status(500)
          .send({
            status: "failed",
            type: "account",
          })
          .end();
      }
    } else {
      try {
        const foundUser = await this.adminRepository.findOne({
          select: ["firstname", "lastname", "email", "phone", "role"],
          where: { email: req.username, password: req.password },
        });
      
        console.log("found user", foundUser, req);

        if (foundUser) {
          const tokenPayload = {
            email: foundUser.email,
            expiry: new Date().getTime() + 24 * 60 * 60,
          };
          const sessionToken = new JWSTokenHandler().signToken(
            JSON.stringify(tokenPayload)
          );

          const options = {
            maxAge: 1000 * 60 * 60 * 24, // would expire after 1 day
            httpOnly: true,
            signed: true,
          };

          response.cookie("qe-admin-token", sessionToken, options);

          response
            .status(200)
            .send({
              status: "ok",
              type: "account",
              currentAuthority: "Admin",
              token: sessionToken,
            })
            .end();
        } else {
          response
            .status(401)
            .send({
              status: "failed",
              type: "account",
            })
            .end();
        }
      } catch (e) {
        console.log("error", e);
        response
          .status(500)
          .send({
            status: "failed",
            type: "account",
          })
          .end();
      }
    }
  }

  async logout(request: Request, response: Response, next: NextFunction) {
    const options = {
      maxAge: 0, // would expire after 1 day
      httpOnly: true,
      signed: true,
    };

    response.cookie("qe-admin-token", "", options);
    response.status(200).send({ status: "ok" }).end();
  }

  async currentUser(request: Request, response: Response, next: NextFunction) {
    console.log("currentUser", request.signedCookies);

    const cookies = request.signedCookies;
    const token = cookies["qe-admin-token"];
    if (!token) {
      // return 401
      response
        .status(401)
        .send({
          message: "Invalid user session. Please login.",
        })
        .end();
    }

    console.log("token", token);
    const decodedToken = new JWSTokenHandler().decode(token);
    console.log("decodedToken", decodedToken);
    const tokenPayload = JSON.parse(decodedToken?.payload || "{}");
    const foundUser = await this.adminRepository.findOne({
      select: ["firstname", "lastname", "email", "phone", "role"],
      where: { email: tokenPayload.email },
    });
    if (!foundUser) {
      // return 401
      response
        .status(401)
        .send({
          message: "Invalid user session. Please login.",
        })
        .end();
    } 

    response
      .status(200)
      .send({
        success: true,
        ...foundUser,
        token,
        avatar: tokenPayload.imageUrl,
        googleId: tokenPayload.googleId,
      })
      .end();
  }
}

import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { Routes } from "./routes";
import { User } from "./entity/User";
import * as CookieParser from "cookie-parser";
var cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const fileUpload = require('express-fileupload');
import * as utils from './utils/payment/RazorPayUtils';
import { MONGOOSE_OPTIONS } from "./helpers/Constants";
const mongoose = require("mongoose");

export default {
  utils
}

// create express app
const app = express();

// get config vars
dotenv.config();
createConnection()
  .then(async (connection) => {
    app.use(fileUpload());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(CookieParser(process.env.JWT_TOKEN_SECRET));
    app.options("*", cors());
    app.use(cors());

    // register express routes from defined application routes
    Routes.forEach((route) => {
      (app as any)[route.method](
        route.route,
        route.authenticate ? authenticateToken : bypassAuth,
        route.apiKey ? authenticateAPIKey : bypassAuth,
        (req: Request, res: Response, next: Function) => {
          const result = new (route.controller as any)()[route.action](
            req,
            res,
            next
          );
          if (result instanceof Promise) {
            result.then((result) => {
              if (result !== null && result !== undefined) {
                //console.log("response" + JSON.stringify(result));
                res.send(result);
              }
            });
          }
        }
      );
    });

    // start express server
    app.listen(3000);
    app.Timeout = 0;

    console.log(
      "Express server has started on port 3000. Open http://localhost:3000/users to see results"
    );

    if (process.env.NODE_ENV === "production") {
      console.log = function () {};
    }
  })
  .catch((error) => console.log(error));

function bypassAuth(req, res, next) {
    const authHeader = req.headers["authorization"];
    let token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      const cookies = req.signedCookies;
      token = cookies["qe-admin-token"];
    }

    if (token == null) return next();
    jwt.verify(
      token,
      process.env.JWT_TOKEN_SECRET,
      (err: any, username: any) => {
        // console.log(err);
        if (err) return next();
        req.user = username;
        next();
      }
    );
  
}
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  if(!token){
    const cookies = req.signedCookies;
    token = cookies["qe-admin-token"];
  }

  console.log(token);

  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_TOKEN_SECRET, (err: any, username: any) => {
    // console.log(err);
    if (err) return res.sendStatus(403);
    req.user = username;
    next();
  });
}

/**
 * Middleware to authenticate API key 
 */
function authenticateAPIKey(req, res, next) {
  const apiKey = req.query.apiKey;

  if (apiKey != process.env.API_KEY) {
    return res.sendStatus(401)
  }

  next();
}

/**
 * Connection to MongoDB
 */
// (async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URL, MONGOOSE_OPTIONS);
//   } catch (error) {
//     console.log(error);
//   }
// })();
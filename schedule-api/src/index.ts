import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { Routes } from "./routes";
import * as CookieParser from "cookie-parser";
var cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const fileUpload = require('express-fileupload');
import * as utils from './utils/payment/RazorPayUtils';

export default { utils }

const app = express();
dotenv.config();

// Middleware setup (run immediately)
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(CookieParser(process.env.JWT_TOKEN_SECRET));
app.options("*", cors());
app.use(cors());

// Start server immediately
app.listen(3000, () => {
  console.log("Express server started on port 3000");
});

// Try to connect to database (optional - won't crash if fails)
createConnection().then(async (connection) => {
  console.log("Database connected");
  registerRoutes();
}).catch((error) => {
  console.log("⚠️ DB connection failed (app continues):", error.message);
  registerRoutes();
});

function registerRoutes() {
  Routes.forEach((route) => {
    (app as any)[route.method](
      route.route,
      route.authenticate ? authenticateToken : bypassAuth,
      route.apiKey ? authenticateAPIKey : bypassAuth,
      (req: Request, res: Response, next: Function) => {
        const result = new (route.controller as any)()[route.action](req, res, next);
        if (result instanceof Promise) {
          result.then((r) => {
            if (r != null) {
              try { res.json(typeof r === "object" ? JSON.parse(JSON.stringify(r)) : `${r}`); }
              catch (_) { if (!res.headersSent) res.send("Internal server error"); }
            }
          }).catch((_) => { if (!res.headersSent) res.status(500).send("Internal server error"); });
        }
      }
    );
  });
}

function bypassAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];
  if (!token) { const cookies = req.signedCookies; token = cookies["qe-admin-token"]; }
  if (token == null) return next();
  jwt.verify(token, process.env.JWT_TOKEN_SECRET, (err: any, username: any) => {
    if (err) return next();
    req.user = username;
    next();
  });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];
  if(!token){ const cookies = req.signedCookies; token = cookies["qe-admin-token"]; }
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_TOKEN_SECRET, (err: any, username: any) => {
    if (err) return res.sendStatus(403);
    req.user = username;
    next();
  });
}

function authenticateAPIKey(req, res, next) {
  if (req.query.apiKey != process.env.API_KEY) return res.sendStatus(401);
  next();
}

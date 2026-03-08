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
const fileUpload = require("express-fileupload");

const app = express();
dotenv.config();

app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(CookieParser(process.env.JWT_TOKEN_SECRET));
app.options("*", cors());
app.use(cors());

/**
 * Health endpoint for Render / uptime monitors
 */
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("API Running");
});

/**
 * Use Render dynamic port
 */
const PORT = process.env.PORT || 3000;

/**
 * Start server immediately (don't wait for DB)
 */
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

/**
 * Try connecting DB but don't crash if unavailable
 */
createConnection()
  .then(() => {
    console.log("DB connected");
    registerRoutes();
  })
  .catch((err) => {
    console.log("DB not available (continuing):", err.message);
    registerRoutes();
  });

/**
 * Register all routes
 */
function registerRoutes() {
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
          result
            .then((r) => {
              if (r != null) {
                try {
                  res.json(
                    typeof r === "object"
                      ? JSON.parse(JSON.stringify(r))
                      : `${r}`
                  );
                } catch (_) {
                  if (!res.headersSent) res.send("Internal server error");
                }
              }
            })
            .catch((_) => {
              if (!res.headersSent)
                res.status(500).send("Internal server error");
            });
        }
      }
    );
  });
}

/**
 * Allow requests even without auth
 */
function bypassAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    const cookies = req.signedCookies;
    token = cookies["qe-admin-token"];
  }

  if (token == null) return next();

  jwt.verify(token, process.env.JWT_TOKEN_SECRET, (err: any, username: any) => {
    if (err) return next();
    req.user = username;
    next();
  });
}

/**
 * Required authentication
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    const cookies = req.signedCookies;
    token = cookies["qe-admin-token"];
  }

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_TOKEN_SECRET, (err: any, username: any) => {
    if (err) return res.sendStatus(403);
    req.user = username;
    next();
  });
}

/**
 * API key validation
 */
function authenticateAPIKey(req, res, next) {
  if (req.query.apiKey != process.env.API_KEY) return res.sendStatus(401);
  next();
}

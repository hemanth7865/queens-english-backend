import { Any, getRepository } from "typeorm";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { Teacher as Teacher } from "../entity/Teacher";
import { LeadView } from "../model/LeadView";
import { TeacherAvailability as TeacherAvailability } from "../entity/TeacherAvailability";
import { getManager } from "typeorm";
import { BatchAvailability } from "../entity/BatchAvailability";
import { BatchStudent } from "../entity/BatchStudent";
import { Classes } from "../entity/Classes";

const db = require("../models/db");
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const CronJob = require('cron').CronJob;

const job = new CronJob('*/1 * * * * *', async function () {
  console.log("job started");
  var quer = `SELECT * FROM users;`;
  console.log('quer', quer);
  let totalResult = await getManager().query(quer);
  //EXPIRING USER
  db.query("SELECT * FROM users", async (err, data) => {
    if (data.length > 0) {
      await data.map(async classes => {
        console.log("Records");
      })
    }
  })

}, null, false);

job.start();
import { notification } from 'antd';
import {LESSONS, Lesson} from "../../../config/lessons";
import { parseISO, format } from "date-fns";
import moment from "moment";

export const openNotificationWithIcon = (type: string, message: string , reload = true) => {
    notification[type]({
      message,
      description: '',
    });
    if(reload){
        setTimeout(() => {
            window.location.reload()
          }, 2000);
    }
};

export const handleAPIResponse = (msg: any, success: string, failed: string) => {
    if (msg.status === 400 || msg.status === 500) {
        if(Array.isArray(msg.errors)){
            for(let m of msg.errors){
                openNotificationWithIcon('error', m, false);
            }
        }else if(typeof msg.error === "string"){
            openNotificationWithIcon('error', msg.error, false);
        }else{
            openNotificationWithIcon('error', failed, false);
        }
    } else {
        openNotificationWithIcon('success', success);
    }
}

/**
 * Get Lesson From A Giving String
 * @param lesson string aka "Lesson NUMBER"
 * @returns Lesson | undefined
 */
export const getLessonByNumber = (lesson?: string): Lesson | undefined => {
    const result: Lesson | undefined = LESSONS.filter(l => {
        if(lesson && lesson.length > 0){
            let lessonNumber = lesson.split(" ")[1];
            if(parseInt(lessonNumber) < 10){
                lessonNumber = "0" + lessonNumber;
            }
            return l.number === lessonNumber
        }

        return false;
    })[0];

    return result;
}

/**
 * Convert A given UTC time into local timezone
 * @param time string aka "HH:mm"
 * @returns 
 */
export const timeToLocalTimezone = (time?: string): string => {
    let result = "2022-03-24T00:00:00.000Z";
    if(time){
        // only time given in format: HH:mm
        if(time.length === "HH:mm".length){
            result = result.replace("00:00", time);
        }else{
            // complete date-time string
            result = time;
        }
    }
    return format(parseISO(result), "HH:mm");
}

/**
 * Convert A given IST time into local timezone
 * @param time string aka "HH:mm"
 * @returns 
 */
 export const timeISTToLocalTimezone = (time?: string): string | undefined => {
    let result = "2022-03-24T00:00:00.330Z";
    if(time){
        // only time given in format: HH:mm
        if(time.length === "HH:mm".length){
            result = result.replace("00:00", time);
        }else{
            // complete date-time string
            result = time;
        }
    }
    return moment(result).subtract({"hours": 5, "minutes": 30}).format("HH:mm")
}

/**
 * Convert A given IST Time-zone time into UTC timezone
 * @param time string aka "HH:mm"
 * @returns 
 */
 export const timeISTToTimezone = (time?: string): string | undefined=> {
    let result = "2022-03-24T00:00:00";
    if(time){
        // only time given in format: HH:mm
        if(time.length === "HH:mm".length){
            result = result.replace("00:00", time);
        }else{
            // complete date-time string
            result = time;
        }
    }
    return moment(result).subtract({"hours": 5, "minutes": 30}).format("HH:mm")
}

/**
 * Convert A given Local Time-zone time into UTC timezone
 * @param time string aka "HH:mm"
 * @returns 
 */
 export const timeToUTCTimezone = (time?: string): string => {
    let result = "2022-03-24T00:00:00";
    if(time){
        // only time given in format: HH:mm
        if(time.length === "HH:mm".length){
            result = result.replace("00:00", time);
        }else{
            // complete date-time string
            result = time;
        }
    }
    return moment(result).utc().format("HH:mm")
}
import { notification } from "antd";
import { format, parseISO } from "date-fns";
import moment from "moment";
import { Lesson, LESSONS } from "../../../config/lessons";
import type ZoomTypes from "./types/zoom";

export const openNotificationWithIcon = (
  type: string,
  message: string,
  reload = true
) => {
  notification[type]({
    message,
    description: "",
  });
  if (reload) {
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }
};

export const handleAPIResponse = (
  msg: any,
  success: string,
  failed: string,
  reload: boolean = true
) => {
  if (
    msg.status === 400 ||
    msg.status === 500 ||
    msg.status === 501 ||
    msg.status == "error"
  ) {
    if (Array.isArray(msg.errors)) {
      for (let m of msg.errors) {
        openNotificationWithIcon("error", m, false);
      }
    } else if (typeof msg.error === "string") {
      openNotificationWithIcon("error", msg.error, false);
    } else if (typeof msg.message === "string") {
      openNotificationWithIcon("error", msg.message, false);
    } else {
      openNotificationWithIcon("error", failed, false);
    }
  } else {
    openNotificationWithIcon("success", success, reload);
  }
};

/**
 * Get Lesson From A Giving String
 * @param lesson string aka "Lesson NUMBER"
 * @returns Lesson | undefined
 */
export const getLessonByNumber = (lesson?: string): Lesson | undefined => {
  const result: Lesson | undefined = LESSONS.filter((l) => {
    if (lesson && lesson.length > 0) {
      let lessonNumber = lesson.split(" ")[1];
      if (parseInt(lessonNumber) < 10) {
        lessonNumber = "0" + parseInt(lessonNumber);
      }
      return l.number === lessonNumber;
    }

    return false;
  })[0];

  return result;
};

/**
 * Get Lesson From A Giving String
 * @param lesson ID string aka "UUID"
 * @returns Lesson | undefined
 */
export const getLessonByID = (lesson?: string): Lesson | undefined => {
  const result: Lesson | undefined = LESSONS.filter((l) => {
    if (lesson && lesson.length > 0) {
      return l.id === lesson;
    }

    return false;
  })[0];

  return result;
};

/**
 * Convert A given UTC time into local timezone
 * @param time string aka "HH:mm"
 * @returns
 */
export const timeToLocalTimezone = (time?: string): string => {
  let result = "2022-03-24T00:00:00.000Z";
  if (time) {
    // only time given in format: HH:mm
    if (time.length === "HH:mm".length) {
      result = result.replace("00:00", time);
    } else {
      // complete date-time string
      result = time;
    }
  }
  return format(parseISO(result), "HH:mm");
};

/**
 * Convert A given IST time into local timezone
 * @param time string aka "HH:mm"
 * @returns
 */
export const timeISTToLocalTimezone = (time?: string): string | undefined => {
  let result = "2022-03-24T00:00:00.330Z";
  if (time) {
    // only time given in format: HH:mm
    if (time.length === "HH:mm".length) {
      result = result.replace("00:00", time);
    } else {
      // complete date-time string
      result = time;
    }
  }
  return moment(result).subtract({ hours: 5, minutes: 30 }).format("HH:mm");
};

/**
 * Convert A given IST Time-zone time into UTC timezone
 * @param time string aka "HH:mm"
 * @returns
 */
export const timeISTToTimezone = (time?: string): string | undefined => {
  let result = "2022-03-24T00:00:00";
  if (time) {
    // only time given in format: HH:mm
    if (time.length === "HH:mm".length) {
      result = result.replace("00:00", time);
    } else {
      // complete date-time string
      result = time;
    }
  }
  return moment(result).subtract({ hours: 5, minutes: 30 }).format("HH:mm");
};

/**
 * Convert A given Local Time-zone time into UTC timezone
 * @param time string aka "HH:mm"
 * @returns
 */
export const timeToUTCTimezone = (time?: string): string => {
  let result = "2022-03-24T00:00:00";
  if (time) {
    // only time given in format: HH:mm
    if (time.length === "HH:mm".length) {
      result = result.replace("00:00", time);
    } else {
      // complete date-time string
      result = time;
    }
  }
  return moment(result).utc().format("HH:mm");
};

/**
 * Convert A given IST Time-zone time into UTC timezone
 * @param time string aka "HH:mm"
 * @returns
 */
export const timeUTCToISTTimezone = (time?: string): string | undefined => {
  let result = "2022-03-24T00:00:00";
  if (time) {
    // only time given in format: HH:mm
    if (time.length === "HH:mm".length) {
      result = result.replace("00:00", time);
    } else {
      // complete date-time string
      result = time;
    }
  }
  return moment(result).add(5, "hours").add(30, "minutes").format("HH:mm");
};

export const getZoomURL = (
  type: ZoomTypes.LinkType,
  zoomMeeting?: ZoomTypes.ZoomMeeting,
  zoomUser?: ZoomTypes.ZoomUser,
  batch?: any,
  dynamicBasedOnZoomFalg?: boolean,
  user?: any
) => {
  // if (
  //   dynamicBasedOnZoomFalg &&
  //   (!batch.useNewZoomLink || !parseInt(batch.useNewZoomLink))
  // ) {
  //   return batch.zoomLink;
  // }

  // @ts-expect-error
  const GENERIC_ZOOM = ZOOM_GENERIC_LINK || window.location.origin + "/be/";

  // if (batch?.useAutoAttendance != 1 && type === "GENERIC_UNIQUE_STUDENT") {
  //   type = "GENERIC_STUDENT";
  // }

  if (type === "GENERIC_TEACHER") {
    return `${GENERIC_ZOOM}c/t/${batch?.teacherCode}`;
  }

  if (type === "GENERIC_STUDENT") {
    return `${GENERIC_ZOOM}c/s/${batch?.classCode}`;
  }

  if (type === "GENERIC_UNIQUE_STUDENT") {
    return `${GENERIC_ZOOM}c/us/${user?.userCode}`;
  }

  if (!zoomMeeting || !zoomUser) {
    return "NA";
  }

  if (type === "PUBLIC_TEACHER") {
    return zoomMeeting.start_url.split("?")[0] + "?zak=" + zoomUser.zak_token;
  }

  if (type === "PUBLIC_STUDENT") {
    return zoomMeeting.join_url;
  }

  return "NA";
};

export function csvToArray(str: string, delimiter: string = ",") {
  const headers = str
    .slice(0, str.indexOf("\n"))
    .split(delimiter)
    .map((h) => h.replace("\r", ""));

  const rows = str
    .slice(str.indexOf("\n") + 1)
    .split("\n")
    .map((h) => h.replace("\r", ""));

  const arr = rows.map(function (row) {
    const values = row.split(delimiter);
    const el = headers.reduce(function (object, header, index) {
      object[header] = values[index];
      return object;
    }, {});
    return el;
  });

  return arr;
}

export const getStorageFileURL = (image: string | undefined) => {
  if (!image) return;
  if (image.startsWith("http")) return image;
  // @ts-expect-error
  return joinAssets(BLOB_URL, BLOB_SAS, image);
};

export const joinAssets = (
  blobUrl: string,
  blobSas: string,
  assetPath: string
) => {
  if (blobUrl.endsWith("/")) {
    blobUrl = blobUrl.slice(0, -1);
  }
  if (assetPath.startsWith("/")) {
    assetPath = assetPath.slice(1);
  }
  return `${blobUrl}/${assetPath}${blobSas}`;
};

export const updateImageSasBlob = (html: string): string => {
  const regex =
    /(?<hostGroup>\<img src=.http.:\/?\/.+?\/)(?<contentGroup>.+?)(?<sasGroup>\?.+?"|')/g;
  const results: any = [...html.matchAll(regex)];

  if (!results) {
    return html;
  }
  for (let result of results) {
    if (!result) {
      continue;
    }
    const { hostGroup, contentGroup, sasGroup } = result.groups;
    if (!hostGroup || !contentGroup || !sasGroup) {
      continue;
    }
    // @ts-expect-error
    html = html.replaceAll(hostGroup, `<img src="${BLOB_URL}`);
    // @ts-expect-error
    html = html.replaceAll(sasGroup, `${BLOB_SAS}"`);
  }
  return html;
};

export const getRandomNumber = (digits: number = 6) => {
  var text = "";
  var possible = "123456789";
  for (var i = 0; i < digits; i++) {
    var sup = Math.floor(Math.random() * possible.length);
    text += i > 0 && sup === i ? "0" : possible.charAt(sup);
  }
  return text;
};

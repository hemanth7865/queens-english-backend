import { createQueryBuilder } from "typeorm";
import { ZoomMeeting } from "../../entity/ZoomMeeting";
import zoomClient from "./zoomClient";
import { jsonToString } from "./../helpers";
const { logger } = require("../../Logger.js");

export async function resetZoomMeetingsSettings(
  customWhere = ""
): Promise<any> {
  let result = {
    total: 0,
    success: 0,
    failed: 0,
  };

  try {
    const meetings = await createQueryBuilder(ZoomMeeting, "meeting")
      .leftJoinAndSelect("meeting.batch", "batch")
      .leftJoinAndSelect("meeting.zoom_user", "zoom_user")
      .where(customWhere)
      .getMany();

    result.total = meetings.length;
    let counter = 0;

    for (const meeting of meetings) {
      counter += 1;
      try {
        let meetingSettings = this.getCreateMeetingDetails(
          meeting.batch,
          meeting.zoom_user
        );

        const response = await zoomClient.updateMeeting(
          meeting.id,
          meetingSettings
        );

        await this.classesRepository.update(
          { id: meeting.batch.id },
          { meetingSettingsTracked: 1 }
        );

        await new Promise((resolve, reject) => setTimeout(resolve, 100));

        if (response.length < 1) {
          result.success += 1;
          await (
            await this.logger.customZoom(
              meeting.batch.batchNumber,
              `Success reset zoom meeting settings for user: 
              ${meeting.zoom_user.first_name} ${meeting.zoom_user.last_name}, 
              Batch: ${meeting.batch.batchNumber}, Meeting: ${meeting.id}, Record No: ${counter} out of: ${result.total}`,
              "SUCCESS_RESET_ZOOM_MEETING_SETTINGS",
              { meeting, meetingSettings },
              this.request.user || {}
            )
          ).save();
        } else {
          result.failed += 1;
          throw new Error(jsonToString(response));
        }
      } catch (e) {
        await (
          await this.logger.customZoom(
            meeting.id,
            `Failed to reset zoom meeting settings for user: 
              ${meeting.zoom_user.first_name} ${meeting.zoom_user.last_name}, 
              Batch: ${meeting.batch.batchNumber}, error: ${e.message}`,
            "FAILED_TO_RESET_ZOOM_MEETING_SETTINGS",
            { error: e, message: e.message, meeting },
            this.request.user || {}
          )
        ).save();
      }
    }
  } catch (e) {
    console.log(e);
    logger.error("Failed to reset zoom meetings: " + e.message);

    await (
      await this.logger.customZoom(
        "FAILED_TO_RESET_ZOOM_MEETING_SETTINGS",
        "Failed to reset zoom meeting settings: " + e.message,
        "FAILED_TO_RESET_ZOOM_MEETING_SETTINGS",
        { error: e, message: e.message },
        this.request.user || {}
      )
    ).save();
    result.failed += 1;
  }

  /**
   * Send sync result to logs
   */
  await (
    await this.logger.customZoom(
      "ZOOM_MEETINGS_SETTINGS_RESET_RESULT",
      `Zoom Meetings Settings Resest Result`,
      "ZOOM_MEETINGS_SETTINGS_RESET_RESULT",
      { result },
      this.request.user || {}
    )
  ).save();

  return result;
}

import { createQueryBuilder, Not } from "typeorm";
import { getZoomStartURL } from "../helpers";
import axios from "../../helpers/axios";
import { COSMOS_API } from "../../helpers/Constants";
import { ZoomMeeting } from "../../entity/ZoomMeeting";
const { logger } = require("../../Logger.js");

export async function syncZoomLinksWithCosmos(): Promise<any> {
  let result = {
    synced: 0,
    total: 0,
    failed: 0,
  };

  try {
    const batches = await this.classesRepository.find({
      sync_zoom_status: Not(1),
    });

    for (let batch of batches) {
      let success = 0;
      /**
       * Sync Zoom Meetings For New Link
       */
      if (batch.useNewZoomLink) {
        const meetings = await createQueryBuilder(ZoomMeeting, "meeting")
          .leftJoinAndSelect("meeting.batch", "batch")
          .leftJoinAndSelect("meeting.zoom_user", "zoom_user")
          .where("batch.id = :id", { id: batch.id })
          .getMany();

        for (const meeting of meetings) {
          const types = ["t", "s"];
          for (const type of types) {
            try {
              const code =
                type === "t"
                  ? meeting.batch.teacherCode
                  : meeting.batch.classCode;

              const link =
                type === "t"
                  ? getZoomStartURL(
                      meeting.start_url,
                      meeting.zoom_user.zak_token
                    )
                  : meeting.join_url;

              await axios.post(COSMOS_API.STORE_SHORT_LINK, {
                id: type + "-" + code,
                link,
              });

              await (
                await this.logger.customZoom(
                  batch.batchNumber,
                  `Success Sync zoom meeting for ${meeting.id} type: ${type}, code: ${code}, teacher: ${meeting.zoom_user.first_name} ${meeting.zoom_user.first_name} Batch: ${meeting.batch.batchNumber}`,
                  "SUCCESS_REDIRECT_TO_ZOOM_MEETING_" + type.toUpperCase(),
                  { meeting },
                  this.request.user || {}
                )
              ).save();

              success += 1;
            } catch (e) {
              console.log(e);
              logger.error(
                "Failed to Sync zoom meeting for " +
                  batch.batchNumber +
                  " type: " +
                  type +
                  " error: " +
                  e.message
              );
              await (
                await this.logger.customZoom(
                  batch.batchNumber,
                  "Failed to Sync zoom meeting for " +
                    meeting.id +
                    " type: " +
                    type +
                    " error: " +
                    e.message,
                  "FAILED_TO_REDIRECT_TO_ZOOM_MEETING_" + type.toUpperCase(),
                  { error: e, message: e.message, meeting },
                  this.request.user || {}
                )
              ).save();
              result.failed++;
            }
          }

          await setTimeout(() => {}, 100);
        }
      } else if (batch.zoomLink) {
        /**
         * Sync zoom meeting for old zoom link
         */
        const types = ["t", "s"];
        for (const type of types) {
          try {
            const code = type === "t" ? batch.teacherCode : batch.classCode;

            const link = batch.zoomLink;

            await axios.post(COSMOS_API.STORE_SHORT_LINK, {
              id: type + "-" + code,
              link,
            });

            await (
              await this.logger.customZoom(
                batch.batchNumber,
                `Success Sync zoom meeting for ${batch.zoomLink} type: ${type}, code: ${code}, Batch: ${batch.batchNumber}`,
                "SUCCESS_REDIRECT_TO_ZOOM_MEETING_" + type.toUpperCase(),
                { batch },
                this.request.user || {}
              )
            ).save();

            success += 1;
          } catch (e) {
            console.log(e);
            logger.error(
              "Failed to Sync zoom meeting for " +
                batch.batchNumber +
                " type: " +
                type +
                " error: " +
                e.message
            );
            await (
              await this.logger.customZoom(
                batch.batchNumber,
                "Failed to Sync zoom meeting for " +
                  batch.batchNumber +
                  " type: " +
                  type +
                  " error: " +
                  e.message,
                "FAILED_TO_REDIRECT_TO_ZOOM_MEETING_" + type.toUpperCase(),
                { error: e, message: e.message, batch },
                this.request.user || {}
              )
            ).save();
            result.failed++;
          }
        }
      }

      /**
       * Update batch sync status
       */
      if (success >= 2) {
        batch.sync_zoom_status = 1;
        await batch.save();
        result.synced++;
      }
    }
  } catch (e) {
    console.log(e);
    logger.error("Failed to Sync zoom meeting: " + e.message);

    await (
      await this.logger.customZoom(
        "FAILED_TO_SYNC_ZOOM_MEETING",
        "Failed to sync zoom meeting: " + e.message,
        "FAILED_TO_SYNC_ZOOM_MEETING",
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
      "ZOOM_MEETINGS_SYNC_RESULT",
      `Zoom Meetings Sync to Cosmos Result`,
      "ZOOM_MEETINGS_SYNC_RESULT",
      { result },
      this.request.user || {}
    )
  ).save();

  return result;
}

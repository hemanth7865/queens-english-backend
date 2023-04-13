import { Col, Row, Table, Spin, Tabs, notification, Button, Switch } from "antd";
import { useState, useEffect } from "react";
import { LESSONS } from "../../../../config/lessons";
import { parseISO, format } from "date-fns";
import {
  getZoomURL
} from "@/services/ant-design-pro/helpers";

import {
  generateMissingAssessmentsForBatch, updateCosmosBatch
} from "@/services/ant-design-pro/api";

import { CheckCircleTwoTone, CloseCircleTwoTone, HourglassTwoTone, } from '@ant-design/icons';

interface Props {
  batchData: any;
  isLoading: boolean;
  USE_JSON_LESSONSCRIPT: boolean;
}

const { TabPane } = Tabs;

const View = ({ batchData, isLoading, USE_JSON_LESSONSCRIPT }: Props) => {
  const [loading, setLoading] = useState<boolean>(isLoading);
  const [notificationCall, contextHolder] = notification.useNotification();
  const [jsonLessonScriptStatus, setJsonLessonScriptStatus] = useState(false);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading])
    ;
  const timeSlotHandler = (entity: any): string => {
    try {
      return format(parseISO(entity.lessonStartTime!), "hh:mm a") + " - " + format(parseISO(entity.lessonEndTime!), "hh:mm a")
    } catch (e) {
      console.log("timeSlotHandler", e);
    }
    return " - ";
  }

  const classes = batchData?.classes;
  const zoomMeeting = batchData?.zoomMeeting;
  const zoomUser = batchData?.zoomUser;

  useEffect(() => {
    if (batchData?.cosmosBatchData) {
      const isGlobalJsonEnabled = USE_JSON_LESSONSCRIPT;
      const isBatchLevelJsonEnabled = batchData?.cosmosBatchData?.useJsonLessonScript === true;
      const isBatchLevelJsonUndefined = batchData?.cosmosBatchData?.useJsonLessonScript === undefined;
      setJsonLessonScriptStatus(((isGlobalJsonEnabled && isBatchLevelJsonUndefined) || isBatchLevelJsonEnabled) ? true : false);
    }
  }, [batchData, USE_JSON_LESSONSCRIPT])

  const GENERIC_TEACHER_LINK = getZoomURL("GENERIC_TEACHER", zoomMeeting, zoomUser, classes);
  const GENERIC_STUDENT_LINK = getZoomURL("GENERIC_STUDENT", zoomMeeting, zoomUser, classes);
  const PUBLIC_TEACHER_LINK = getZoomURL("PUBLIC_TEACHER", zoomMeeting, zoomUser, classes);
  const PUBLIC_STUDENT_LINK = getZoomURL("PUBLIC_STUDENT", zoomMeeting, zoomUser, classes);

  const onCreateMissingAssessments = async () => {
    setLoading(true);
    try {
      const res = await generateMissingAssessmentsForBatch({
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([classes.batchNumber]),
      });

      const message: any = res.createdAssessments ? res.createdAssessments[classes.batchNumber]?.message : "Something went wrong, unknown status.";

      notificationCall.open({
        message: "Missing assessments",
        description: message,
        icon: <CheckCircleTwoTone color='green' />
      });

    } catch (error: any) {
      console.log(error);

      notificationCall.open({
        message: "Missing assessments not created",
        description: typeof error.message === 'string' ? error.message : "Something went wrong",
        icon: <CheckCircleTwoTone color='red' />,
      });
    }
    setLoading(false);
  };

  const handleJsonChange = async () => {
    if (confirm("Are you sure you want to switch?")) {
      setLoading(true)
      const tempData = { ...batchData?.cosmosBatchData, useJsonLessonScript: !jsonLessonScriptStatus }
      notificationCall.open({
        message: `Updating Json LessonScript Switch of ${batchData?.cosmosBatchData?.batchNumber} batch.`,
        icon: <HourglassTwoTone />
      });

      await updateCosmosBatch(tempData).then((e) => {
        setJsonLessonScriptStatus((e) => !e)
        notificationCall.open({
          message: `Json LessonScript Switch of ${batchData?.cosmosBatchData?.batchNumber} batch Updated successfully.`,
          icon: <CheckCircleTwoTone />
        });
      }).catch((error) => {
        notificationCall.open({
          message: `Updating of Json LessonScript switch for ${batchData?.cosmosBatchData?.batchNumber} batch failed.`,
          description: typeof error.message === 'string' ? error.message : "Something went wrong",
          icon: <CloseCircleTwoTone />,
        });
      })

      setLoading(false)
    }
  }


  return (
    <>
      {contextHolder}

      <Spin spinning={loading}>
        <Tabs defaultActiveKey="1">
          <TabPane tab={classes?.batchNumber} key="1">
            <Row gutter={[16, 15]}>
              <Col span={8}>
                <div>Creation Date</div>
              </Col>
              <Col span={16}>
                <div>
                  {classes?.created_at ? classes.created_at.split("T")[0] : "NA"}
                </div>
              </Col>

              <Col span={8}>
                <div>Class Date</div>
              </Col>
              <Col span={16}>
                <div>
                  {classes?.classStartDate && classes?.classEndDate ? classes.classStartDate.split("T")[0] + " To " + classes.classEndDate.split("T")[0] : "NA"}
                  {batchData?.classes?.dateSlot}
                </div>
              </Col>

              <Col span={8}>
                <div>Created By</div>
              </Col>
              <Col span={16}>
                <div>
                  {"Admin"}
                </div>
              </Col>

              <Col span={8}>
                <div>Assigned Teacher</div>
              </Col>
              <Col span={16}>
                <div>
                  {classes?.teacher?.firstName ? classes?.teacher.firstName + " " + classes?.teacher.lastName : "NA"}
                </div>
              </Col>

              <Col span={8}>
                <div>Start Lesson</div>
              </Col>
              <Col span={16}>
                <div>
                  {classes?.startingLessonId ? "Lesson " + LESSONS.filter(i => classes?.startingLessonId === i.id)[0]?.number : "NA"}
                </div>
              </Col>

              <Col span={8}>
                <div>End Lesson</div>
              </Col>
              <Col span={16}>
                <div>
                  {classes?.endingLessonId ? "Lesson " + LESSONS.filter(i => classes?.endingLessonId === i.id)[0]?.number : "NA"}
                </div>
              </Col>

              <Col span={8}>
                <div>Active Lesson</div>
              </Col>
              <Col span={16}>
                <div>
                  {classes?.activeLessonId ? "Lesson " + LESSONS.filter(i => classes?.activeLessonId === i.id)[0]?.number : "NA"}
                </div>
              </Col>

              <Col span={8}>
                <div>Student</div>
              </Col>
              <Col span={16}>
                <div>
                  {batchData?.students ? batchData?.students.length : "NA"}
                </div>
              </Col>

              <Col span={8}>
                <div>TimeSlot</div>
              </Col>
              <Col span={16}>
                <div>
                  {timeSlotHandler(classes)}
                </div>
              </Col>

              <Col span={8}>
                <div>Status</div>
              </Col>
              <Col span={16}>
                <div> {classes?.status == 0 ? "In Active" : "Active"}</div>
              </Col>

              <Col span={8}>
                <div>Whatsapp Link</div>
              </Col>
              <Col span={16}>
                <div><a href={classes?.whatsappLink} target="_blank">{classes?.whatsappLink || "NA"}</a></div>
              </Col>
              <Col span={8}>
                <div>Generate Missing Assessments</div>
              </Col>
              <Col span={16}>
                <div><Button onClick={onCreateMissingAssessments}>Generate Missing Assessments</Button></div>
              </Col>
              <Col span={8}>
                <div>Use JSON LessonScripts</div>
              </Col>
              <Col span={16}>
                <div><Switch checkedChildren="True" unCheckedChildren="False" checked={jsonLessonScriptStatus} onChange={handleJsonChange} /></div>
              </Col>


            </Row>
          </TabPane>
          {
            !classes?.offlineBatch && (
              <TabPane tab="Zoom" key="2">
                <Row gutter={[16, 15]}>
                  <Col span={8}>
                    <div>Use Auto Attendance?</div>
                  </Col>
                  <Col span={16}>
                    <div>{classes?.useAutoAttendance ? "Yes" : "No"}</div>
                  </Col>

                  <Col span={8}>
                    <div>Generic Teacher Link</div>
                  </Col>
                  <Col span={16}>

                    <div><a href={GENERIC_TEACHER_LINK} target="_blank">{GENERIC_TEACHER_LINK}</a></div>
                  </Col>

                  <Col span={8}>
                    <div>Generic Student Link</div>
                  </Col>
                  <Col span={16}>
                    <div><a href={GENERIC_STUDENT_LINK} target="_blank">{GENERIC_STUDENT_LINK}</a></div>
                  </Col>

                  <Col span={8}>
                    <div>Direct Teacher Link</div>
                  </Col>
                  <Col span={16}>
                    <div><a href={PUBLIC_TEACHER_LINK} target="_blank">{PUBLIC_TEACHER_LINK}</a></div>
                  </Col>

                  <Col span={8}>
                    <div>Direct Student Link</div>
                  </Col>
                  <Col span={16}>

                    <div><a href={PUBLIC_STUDENT_LINK} target="_blank">{PUBLIC_STUDENT_LINK}</a></div>
                  </Col>

                  <Col span={8}>
                    <div>Old Meeting Link</div>
                  </Col>
                  <Col span={16}>

                    <div><a href={classes?.zoomLink} target="_blank">{classes?.zoomLink}</a></div>
                  </Col>

                  <Col span={8}>
                    <div>Old Meeting Info</div>
                  </Col>
                  <Col span={16}>
                    <div>{classes?.zoomInfo}</div>
                  </Col>
                </Row>
              </TabPane>
            )
          }
          <TabPane tab="Students" key="3">
            <div className="title">Students</div>
            <Table style={{ width: "100%" }} dataSource={batchData?.students?.map((i: any) => i.student)} columns={[
              {
                title: "First Name",
                dataIndex: "firstName",
                key: "firstName"
              },
              {
                title: "Last Name",
                dataIndex: "lastName",
                key: "lastName"
              },
              {
                title: "Phone Number",
                dataIndex: "phoneNumber",
                key: "phoneNumber"
              },
              {
                title: "Join URL",
                dataIndex: "join_url",
                key: "join_url",
                render: (_: any, record: any) => {
                  if (classes?.offlineBatch) {
                    return "NA";
                  }
                  const join_url = getZoomURL("GENERIC_UNIQUE_STUDENT", undefined, undefined, classes, false, record);
                  return <a href={join_url} target={"_blank"}>{join_url}</a>
                }
              }
            ]} />
          </TabPane>
        </Tabs>
      </Spin>
    </>
  );
};

export default View;

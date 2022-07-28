import React from "react";
import { Col, Row, Table, Space, Spin } from "antd";
import { LESSONS } from "../../../../config/lessons";
import { parseISO, format } from "date-fns";

interface Props {
  batchData: any;
  isLoading: boolean
}

const View = ({ batchData, isLoading }: Props) => {
  const timeSlotHandler = (entity: any): string => {
    try {
      return format(parseISO(entity.lessonStartTime!), "hh:mm a") + " - " + format(parseISO(entity.lessonEndTime!), "hh:mm a")
    } catch (e) {
      console.log("timeSlotHandler", e);
    }
    return " - ";
  }

  const classes = batchData?.classes;

  return (
    <Spin spinning={isLoading}>
      <div className="title" style={{ marginBottom: 20 }}>{classes?.batchNumber}</div>
      <Space>
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
            <div> {classes?.status == 4 ? "In Active" : "Active"}</div>
          </Col>

          <Col span={8}>
            <div>Zoom Link</div>
          </Col>
          <Col span={16}>
            <div><a href={classes?.zoomLink} target="_blank">{classes?.zoomLink || "NA"}</a></div>
          </Col>

          <Col span={8}>
            <div>Zoom Info</div>
          </Col>
          <Col span={16}>
            <div> {classes?.zoomInfo || "NA"}</div>
          </Col>

          <Col span={8}>
            <div>Whatsapp Link</div>
          </Col>
          <Col span={16}>
            <div><a href={classes?.whatsappLink} target="_blank">{classes?.whatsappLink || "NA"}</a></div>
          </Col>

          <Col span={24}>
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
              }
            ]} />
          </Col>
        </Row>
      </Space>
    </Spin>
  );
};

export default View;

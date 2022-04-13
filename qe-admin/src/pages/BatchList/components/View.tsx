import React from "react";
import { Col, Row, Table, Space } from "antd";
import {LESSONS} from "../../../../config/lessons";
import { parseISO, format } from "date-fns";

interface Props {
  batchData: API.batchItem;
}

const View = ({ batchData }: Props) => {
    const timeSlotHandler = (entity: any): string => {
        try{
          return format(parseISO(entity.lessonStartTime!), "hh:mm a") + " - " + format(parseISO(entity.lessonEndTime!), "hh:mm a")
        }catch(e){
          console.log("timeSlotHandler", e);
        }
        return " - ";
    }

  return (
    <div>
      <div className="title" style={{marginBottom: 20}}>{batchData?.batchId}</div>
      <Space>
      <Row gutter={[16, 15]}>
        <Col span={8}>
          <div>Creation Date</div>
        </Col>
        <Col span={16}>
          <div>
            {batchData?.date ? batchData.date.split("T")[0] : "NA"}
          </div>
        </Col>

        <Col span={8}>
          <div>Class Date</div>
        </Col>
        <Col span={16}>
          <div>
            {batchData?.dateSlot}
          </div>
        </Col>

        <Col span={8}>
            <div>Created By</div>
        </Col>
        <Col span={16}>
          <div>
            {batchData?.createdBy ? batchData.createdBy : "NA"}
          </div>
        </Col>

        <Col span={8}>
            <div>Assigned Teacher</div>
        </Col>
        <Col span={16}>
          <div>
            {batchData?.teacher ? batchData?.teacher : "NA"}
          </div>
        </Col>

        <Col span={8}>
            <div>Start Lesson</div>
        </Col>
        <Col span={16}>
          <div>
            {batchData?.startingLessonId ? "Lesson " + LESSONS.filter(i => batchData?.startingLessonId === i.id)[0]?.number : "NA"}
          </div>
        </Col>

        <Col span={8}>
            <div>End Lesson</div>
        </Col>
        <Col span={16}>
          <div>
            {batchData?.endingLessonId ? "Lesson " + LESSONS.filter(i => batchData?.endingLessonId === i.id)[0]?.number : "NA"}
          </div>
        </Col>

        <Col span={8}>
            <div>Active Lesson</div>
        </Col>
        <Col span={16}>
            <div>
                {batchData?.activeLessonId ? "Lesson " + LESSONS.filter(i => batchData?.activeLessonId === i.id)[0]?.number : "NA"}
            </div>
        </Col>

        <Col span={8}>
            <div>Student</div>
        </Col>
        <Col span={16}>
            <div>
                {batchData?.students ? batchData?.students : "NA"}
            </div>
        </Col>

        <Col span={8}>
            <div>TimeSlot</div>
        </Col>
        <Col span={16}>
            <div>
                {timeSlotHandler(batchData)}
            </div>
        </Col>

        <Col span={8}>
            <div>Status</div>
        </Col>
        <Col span={16}>
            <div> {batchData?.status}</div>
        </Col>

        <Col span={8}>
            <div>Zoom Link</div>
        </Col>
        <Col span={16}>
            <div><a href={batchData?.zoomLink} target="_blank">{batchData?.zoomLink}</a></div>
        </Col>

        <Col span={8}>
            <div>Zoom Info</div>
        </Col>
        <Col span={16}>
            <div> {batchData?.zoomInfo}</div>
        </Col>

        <Col span={8}>
            <div>Whatsapp Link</div>
        </Col>
        <Col span={16}>
            <div><a href={batchData?.whatsappLink} target="_blank">{batchData?.whatsappLink}</a></div>
        </Col>

        <Col span={24}>
            <div className="title">Students</div>
            <Table style={{width: "100%"}} dataSource={batchData?.studentsList} columns={[
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
 
    </div>
  );
};

export default View;

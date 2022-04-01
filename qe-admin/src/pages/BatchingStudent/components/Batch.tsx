import React, {useState, useEffect, useRef} from 'react';
import { Col, Row, Form, Button, notification, Tabs, TimePicker, message, Spin } from 'antd';
import {
    listBatch,
    addeditbatch,
    getIndividualBatch,
    updateUserStatus
} from "@/services/ant-design-pro/api";
import {
  getLessonByNumber
} from "@/services/ant-design-pro/helpers";
import ProTable from "@ant-design/pro-table";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import { FormattedMessage } from "umi";
import Teachers from "./Teachers";
import {LESSONS} from "../../../../config/lessons";
import moment from "moment";
import {timeISTToTimezone, timeToLocalTimezone} from "@/services/ant-design-pro/helpers"

const { TabPane } = Tabs;

export type BatchProps = {
    data: any;
    visible: boolean;
    setVisible: (value: boolean) =>void;
    onUpdate?: () => void;
};

const Batch: React.FC<BatchProps> = (props) => {
    const {id, timings, startLesson, dob, courseFrequency, startDate, course} = props.data?props.data:''
    const [selectedBatch, setSelectedBatch] = useState<boolean|string>(false);
    const [isLoading, setIsLoading] = useState(false);

    const lesson = getLessonByNumber(startLesson);

    async function fetchBatchList(params: {}) {
        let fixedFilter: {
          startingLessonId?: string,
          dob?: Date,
          age?: number,
          frequency?: string,
          lessonStartTime?: string, 
          lessonEndTime?: string,
          classStartDate?: string,
          maxStudentsCount?: number,
      } = {
        maxStudentsCount: 6
      }
        if(lesson?.id){
          fixedFilter.startingLessonId = lesson.id;
        }

        if(dob && dob.length > 0){
          fixedFilter.dob = dob;
          fixedFilter.age = moment(new Date()).diff(moment(dob,"YYYY-MM-DD"),'years',true);
        }

        if(courseFrequency && courseFrequency.length > 0){
          fixedFilter.frequency = courseFrequency.split(" ")[0]; // make sure to get the frequency only in case there's a space
        }

        if(startDate && startDate.length > 0){
          fixedFilter.classStartDate = startDate.split("T")[0];
        }

        if(timings && timings.length > 0){
          fixedFilter.lessonStartTime = timeISTToTimezone(timings);
        }

        return listBatch({
            ...params,
            // pass th rest of filter params here
            ...fixedFilter
        });
    }

    const actionRef = useRef<ActionType>();

    useEffect(() => {
        setSelectedBatch(false);
        actionRef?.current?.reload();
        console.log("id", id);
    } , [id]);

    const openNotificationWithIcon = (type: string, msg = { status: 200, data: 'Error received during adding batch' }) => {
        notification[type]({
          message: `Status ${type}` ,
          description:
          msg.data,
        });
      };

   
    const submitUpdateStudent = async (value: any)=>{
        const msg = await updateUserStatus({
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(value),
        });
        if (msg.status === 400) {
            openNotificationWithIcon('error', { status: 400, data: 'Failed To Mark Student Status As Onboarding' })
        } else {
            openNotificationWithIcon('success', { status: 400, data: 'Student Status Is Onboarding' });
        }

        return msg;
    }

    const onFinish = async () => {
        let dataForm = {}
        let success = true;
        setIsLoading(true);

        if (id && typeof selectedBatch === 'string') {
            try {
                const batchDetails = await (await getIndividualBatch(selectedBatch)).data;

                // @ts-ignore-next-line
                dataForm = {...batchDetails.classes, edit: true, students: [{value: id}], batchAvailability: [{}]};
                // @ts-ignore-next-line
                if(dataForm.teacher){
                    // @ts-ignore-next-line
                    delete dataForm.teacher;
                }

                    // @ts-ignore-next-line
                for(let student of batchDetails.students){
                    // @ts-ignore-next-line
                    if(!dataForm.students.filter(s => s.value === student.id).length > 0){
                        // @ts-ignore-next-line
                        dataForm.students.push({value: student.studentId})
                    }
                }

                const msg = await addeditbatch({
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify(dataForm),
                });

                if (msg.success) {
                    if(msg.data[0]?.message){
                        success = false;
                        setIsLoading(false);
                        message.error(msg.data[0].message);
                    }else{
                        openNotificationWithIcon('success', {data: "Completed Adding Student To Batch, Marking Student As Onboard...", status: 200});

                        const result = await submitUpdateStudent({...props.data, status: "onboarding"});

                        if(result.status !== 200){
                            success = false;
                        }
                    }
                }else{
                    openNotificationWithIcon('error', {data: "Failed To Complete Adding Student To Batch", status: 400});
                    success = false;
                }
            } catch (error) {
                success = false;
                message.error("Something went wrong while adding student to batch.");
                console.log("add student to batch error", error);
            }
        }
        setIsLoading(false);
        if(success){
            // @ts-ignore-next-line
            props.setVisible(false)
            setTimeout(() => {
                window.location.reload()
            }, 1000);
        }
    }
    
    const columns: ProColumns<API.RuleListItem>[] = [
        {
          title: (
            <FormattedMessage
              id="pages.searchTable.batchId"
              defaultMessage="Batch ID"
            />
          ),
          dataIndex: "batchId",
        },
        {
          title: (
            <FormattedMessage
              id="pages.searchTable.titleTeacher"
              defaultMessage="Teacher"
            />
          ),
          dataIndex: "teacher",
          valueType: "textarea",
        },
        {
          title: (
            <FormattedMessage
              id="pages.searchTable.titleStudents"
              defaultMessage="Students"
            />
          ),
          dataIndex: "students",
          valueType: "textarea",
        },
        {
          title: "Lessons",
          dataIndex: "lessons",
          render(dom, entity: any) {
            const startLesson = LESSONS.filter(l => entity.startingLessonId ? l.id === entity.startingLessonId: false)[0]?.number;
            const endLesson = LESSONS.filter(l => entity.endingLessonId ? l.id === entity.endingLessonId: false)[0]?.number;
            return `${startLesson || "NA"} To ${endLesson || "NA"}`;
          }
        },
        {
          title: (
            <FormattedMessage
              id="pages.searchTable.titleFrequency"
              defaultMessage="Frequency"
            />
          ),
          dataIndex: "frequency",
          valueType: "textarea",
        },
        {
          title: (
            <FormattedMessage
              id="pages.searchTable.titleTimeSlot"
              defaultMessage="Time Slot"
            />
          ),
          dataIndex: "timeSlot",
          // valueType: "textarea",
          render: (data: any) => {
            if(data.length > 0 && data.split("-").length > 1){
              const [start, end] = data.split("-");
              return `${timeToLocalTimezone(start)} - ${timeToLocalTimezone(end)}`;
            }
            return "... - ...";
          },
        },
        {
          title: "Select",
          tip: "Select Batch",
          hideInSearch: true,
          render: (dom, entity) => {
            return (
              <a
                onClick={() => {
                    // @ts-ignore-next-line
                    setSelectedBatch(dom.id);
                }}
              >
                {
                    // @ts-ignore-next-line
                    selectedBatch === dom?.id ? "Selected" : "Select"
                } 
              </a>
            );
          },
        },
      ];
    

    return(
        <Spin spinning={isLoading}>
        <Form onFinish={onFinish}>
            <Tabs defaultActiveKey={["IELTS - 1:1", "DISE - 1:1"].includes(course) ? "2" : "1"} key={course}>
                <TabPane tab="Batch" key="1"> 
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="batchId">
                                <ProTable<API.RuleListItem, API.PageParams>
                                    headerTitle={"Batches"}
                                    actionRef={actionRef}
                                    rowKey="key"
                                    search={{
                                        labelWidth: 120,
                                    }}
                                    toolBarRender={() => []}
                                    request={fetchBatchList}
                                    columns={columns}
                                    pagination={{ defaultPageSize: 5, showSizeChanger: true, pageSizeOptions: ['5', '10', '20', '30']}}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </TabPane>
                <TabPane tab="Teacher" key="2"> 
                    <Teachers data={props.data} selectedBatch={selectedBatch} setSelectedBatch={setSelectedBatch} />
                </TabPane>
            </Tabs>
            
            <Row gutter={16}>
                <Col span={24}>
                    <Button type="primary" htmlType="submit" disabled={!selectedBatch}>
                        Add Student To Batch
                    </Button>
                </Col>
            </Row>
        </Form>
        </Spin>
    )
}
    
export default Batch;


import React, {useState, useEffect, useRef} from 'react';
import { Col, Row, Form, Button, notification, Tabs, TimePicker, message, Spin } from 'antd';
import {
    listBatch,
    addeditbatch,
    getIndividualBatch,
    updateUserStatus
} from "@/services/ant-design-pro/api";
import ProTable from "@ant-design/pro-table";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import { FormattedMessage } from "umi";
import Teachers from "./Teachers";
import {LESSONS} from "../../../../config/lessons";

const { TabPane } = Tabs;

export type BatchProps = {
    data: any;
    visible: boolean;
    setVisible: () =>void;
    onUpdate: () => void;
};

const Batch: React.FC<BatchProps> = (props) => {
    const {id, timings, startLesson, age, courseFrequency} = props.data?props.data:''
    const [selectedBatch, setSelectedBatch] = useState<boolean|string>(false);
    const [isLoading, setIsLoading] = useState(false);

    const lesson = LESSONS.filter(l => startLesson.length > 0 ? l.number === startLesson.split(" ")[1]: false)[0];

    console.log("lesson", lesson);

    async function fetchBatchList(params: {}) {
        const fixedFilter: {
          startingLessonId?: string,
          age?: string,
          frequency?: string,
          lessonStartTime?: string, 
          lessonEndTime?: string,
      } = {}
        if(lesson?.id){
          fixedFilter.startingLessonId = lesson.id;
        }

        if(age && age.length > 0){
            fixedFilter.age = age;
        }

        if(courseFrequency && courseFrequency.length > 0){
          fixedFilter.frequency = courseFrequency;
        }

        if(timings && timings.length > 0 && timings.split("-").length > 1){
          const [lessonStartTime, lessonEndTime] = timings.split("-");
          fixedFilter.lessonStartTime = lessonStartTime;
          fixedFilter.lessonEndTime = lessonEndTime;
        }

        return listBatch({
            ...params,
            // pass the rest of filter params here
        });
    }

    useEffect(() => {
        setSelectedBatch(false);
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

    const actionRef = useRef<ActionType>();
    
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
              defaultMessage="Student"
            />
          ),
          dataIndex: "students",
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
          renderFormItem: (value) => {
            return <TimePicker.RangePicker format="HH:mm" />;
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
            <Tabs defaultActiveKey="1">
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


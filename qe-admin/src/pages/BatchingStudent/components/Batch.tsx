// @ts-nocheck
import React, {useState, useEffect, useRef} from 'react';
import { Col, Descriptions, Row, Form, Input, Button, Select, DatePicker, notification, Tabs, TimePicker, message } from 'antd';
import moment from "moment";
import {studentBatches, addUserSchedule} from "@/services/ant-design-pro/api";
import {
    isPossiblePhoneNumber,
    isValidPhoneNumber,
    validatePhoneNumberLength,
    parsePhoneNumber,
    getCountries,
    getCountryCallingCode
} from 'libphonenumber-js'
import * as CountryList from 'country-list';
import {
    listTeacherAndStudent,
    listBatch,
    addeditbatch,
    getIndividualBatch
} from "@/services/ant-design-pro/api";
import DebounceSelect from "@/components/DebounceSelect";
import ProTable from "@ant-design/pro-table";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import { FormattedMessage } from "umi";

const { TabPane } = Tabs;

export type BatchProps = {
    data: {};
    visible: boolean;
    setVisible: () =>void;
    onUpdate: () => void;
};

const {Option} = Select

const Batch: React.FC<EditUserProps> = (props) => {
    const {id} = props.data?props.data:''
    const [formData, setFormData] = useState({});
    const [teacherName, setTeacherName] = useState([]);
    const [batch, setBatch] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(false);
    const [defaultTeacherOptions, setDefaultTeacherOptions] = useState([]);
    const [defaultBatchesOptions, setDefaultBatchesOptions] = useState([]);

    async function fetchTeachersList(username: string) {
        return listTeacherAndStudent({
          type: 'teacher',
          current: 1,
          pageSize: 5,
          keyword: username,
          // pass the rest of filter params here
        }).then((body) =>
            body.data.map((user) => ({
              label: `${user.name}`,
              value: user.id,
            }))
        );
    }

    async function fetchBatchList(params: {}) {
        return listBatch({
            ...params,
            // pass the rest of filter params here
        });
    }

    async function fetchAllBatchList(b: string) {
        return listBatch({
            current: 1,
            pageSize: 5,
            batchId: b,
            // pass the rest of filter params here
        }).then((body) =>
            body.data.map((b) => ({
                label: b.batchId,
                value: b.id,
            })
        ));
    }

    useEffect(() => {
        setTeacherName([]);
        setBatch([]);
        setSelectedBatch(false);

        fetchTeachersList().then(data => {
            setDefaultTeacherOptions(data);
        });

        fetchBatchList().then(data => {
            setDefaultBatchesOptions(data);
        });
    } , [id]);

    const openNotificationWithIcon = (type, msg = { status: 200, data: 'Error received during adding batch' }, userType = 'Student') => {
        notification[type]({
          message: type === 'error' ? msg.data : 'Successfully Updated  ' + userType + ' !!!! ',
          description:
            '',
        });
        setTimeout(() => {
          window.location.reload()
        }, 2000);
      };

   

    const handleInputChange = (event: { target: { name: any; value: any; }; })=>{
        console.log('val', event.target.value, event)
        // event.defaultPrevented
        setFormData((value)=>({
            ...value,
            [event.target.name]: event.target.value
        }))
    }

    const onFinish = async ()=>{
        let dataForm = {}
        if (id) {
            // try {
            // 登录
            const batchDetails = await (await getIndividualBatch(selectedBatch)).data;

            dataForm = {...batchDetails.classes, edit: true, students: [{value: id}], batchAvailability: [{}]};

            if(dataForm.teacher){
                delete dataForm.teacher;
            }

            for(let student of batchDetails.students){
                if(!dataForm.students.filter(s => s.value === student.id).length > 0){
                    dataForm.students.push({value: student.id})
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
                    message.error(msg.data[0].message);
                }
            }

            // const msg = await addUserSchedule({
            //     headers: {
            //     "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify(dataForm),
            // });
            // if (msg.status === "ok") {
            //     console.log("API call sucessfull", msg);
            // }
            // if (msg.status === 400) {
            //     openNotificationWithIcon('error', msg);
        
            //     } else {
            //     console.log(msg);
            //     openNotificationWithIcon('success', '', 'User');
            //     }
            // } catch (error) {
            // console.log("addRule error", error);
            
            // }
        }
        // props.setVisible(false)
        // setTimeout(() => {
        //     window.location.reload()
        // }, 1000);
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
                    setSelectedBatch(dom.id);
                    console.log(dom, dom.id);
                }}
              >
                {selectedBatch === dom.id ? "Selected" : "Select"} 
              </a>
            );
          },
        },
      ];
    

    return(
        <div>
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
                                    perpage={5}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </TabPane>
                <TabPane tab="Teacher" key="2"> 
                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item name="teacherId">
                                <DebounceSelect
                                    key={defaultTeacherOptions.length}
                                    showSearch
                                    value={teacherName}
                                    placeholder="Select teacher"
                                    fetchOptions={fetchTeachersList}
                                    options = {defaultTeacherOptions}
                                    onChange={(newValue) => {
                                        setTeacherName(newValue);
                                        console.log("teacherDeb", newValue);
                                    }}
                                    style={{
                                        width: "100%",
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col offset={1} span={7}>
                            <Button
                                size="default"
                                onClick={() => {
                                    window.open(window.location.origin + `/manage/batch?teacherId=${teacherName.value}&teacherName=${teacherName.label}&add=1`, '_blank').focus();
                                }}
                                disabled={!teacherName || teacherName.length < 1}
                                type="primary"
                            >
                                Add New Batch
                            </Button>
                        </Col>
                        <Col span={24} key={teacherName.length}>
                            <p>Please Select Student Batch From Here After Completing Batch Creation.</p>
                            <Form.Item name="batchId">
                                <DebounceSelect
                                    key={defaultBatchesOptions.length}
                                    showSearch
                                    value={batch}
                                    placeholder="Select Batch"
                                    fetchOptions={fetchAllBatchList}
                                    options = {[]}
                                    onChange={(newValue) => {
                                        setSelectedBatch(newValue.value)
                                        setBatch(newValue);
                                    }}
                                    style={{
                                        width: "100%",
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
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
        </div>
    )
}
    
export default Batch;


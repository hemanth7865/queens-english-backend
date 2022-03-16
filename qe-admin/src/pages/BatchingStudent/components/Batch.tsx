// @ts-nocheck
import React, {useState, useEffect} from 'react';
import { Col, Descriptions, Row, Form, Input, Button, Select, DatePicker,notification } from 'antd';
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
import { Tabs } from 'antd';
import {
    listTeacherAndStudent,
    listBatch,
    addeditbatch,
} from "@/services/ant-design-pro/api";
import DebounceSelect from "@/components/DebounceSelect";

const { TabPane } = Tabs;

export type BatchProps = {
    data: {};
    visible: boolean;
    setVisible: () =>void;
    onUpdate: () => void;
};

const {Option} = Select

const Batch: React.FC<EditUserProps> = (props) => {
    //console.log('data', props.data, props.visible, props.setVisible)
    const {firstName, lastName, email, phoneNumber, type, key, id} = props.data?props.data:''
    // console.log('first', firstName, lastName, email, type, key)
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
          keyword: username
          // pass the rest of filter params here
        }).then((body) =>
            body.data.map((user) => ({
              label: `${user.name}`,
              value: user.id,
            }))
        );
    }

    async function fetchBatchList(b: string) {
        return listBatch({
            current: 1,
            pageSize: 5,
            keyword: b,
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
        if (props.data) {
            dataForm.id = props.data.id;
            }
            try {
            // 登录
            console.log("data", dataForm);
            const msg = await addUserSchedule({
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify(dataForm),
            });
            if (msg.status === "ok") {
                console.log("API call sucessfull", msg);
            }
            if (msg.status === 400) {
                openNotificationWithIcon('error', msg);
        
                } else {
                console.log(msg);
                openNotificationWithIcon('success', '', 'User');
                }
            } catch (error) {
            console.log("addRule error", error);
            
            }
        props.setVisible(false)
        window.location.reload()
    }
    
    return(
        <div>
        <Form onFinish={onFinish}>
            <Tabs defaultActiveKey="1">
                <TabPane tab="Batch" key="1"> 
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="batchId">
                                <DebounceSelect
                                    key={defaultBatchesOptions.length}
                                    showSearch
                                    value={batch}
                                    placeholder="Select Batch"
                                    fetchOptions={fetchBatchList}
                                    options = {defaultBatchesOptions}
                                    onChange={(newValue) => {
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
                                onClick={() => {}}
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
                                    fetchOptions={fetchBatchList}
                                    options = {defaultBatchesOptions}
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


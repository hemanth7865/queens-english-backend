// @ts-nocheck
import React, {useState, useEffect} from 'react';
import { Col, Descriptions, Row, Form, Input, Button, Select, DatePicker } from 'antd';
import moment from "moment";
import {studentBatches, addUserSchedule} from "@/services/ant-design-pro/api";

export type EditUserProps = {
    data: {};
    visible: '';
    setVisible: ()=>void;
    onUpdate: () => void;
};

const {Option} = Select

const EditUser: React.FC<EditUserProps> = (props) => {
    //console.log('data', props.data, props.visible, props.setVisible)
    const {firstName, lastName, email, phoneNumber, type, key} = props.data
    // console.log('first', firstName, lastName, email, type, key)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        mobile: '',
        email: '',
    })

    const [selectUserType, setSelectUserType] = useState('')

    //validation messages for name, email and type fields
    const validateMessages = {
        required: '${label} is required!',
        types: {
          email: '${label} is not a valid email!',
          string: '${label} is not a valid name!',
        },
        string: {
            min: '${label} should be altleast two characters'
        },
        pattern: {
            mismatch: '${label} should be a String'
        }
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
        console.log('form submitted')
        let dataForm = {
            firstName: formData.firstName?formData.firstName:props.data.firstName,
            lastName: formData.lastName?formData.lastName:lastName,
            phoneNumber: formData.mobile?formData.mobile:phoneNumber,
            email: formData.email?formData.email:email,
            type: selectUserType?selectUserType:type,
        }
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
            console.log(msg);
            // 如果失败去设置用户错误信息
            // setUserLoginState(msg);
          } catch (error) {
            console.log("addRule error", error);
            const defaultLoginFailureMessage = intl.formatMessage({
              id: "pages.login.failure",
              defaultMessage: "登录失败，请重试！",
            });
            message.error(defaultLoginFailureMessage);
          }
            props.setVisible(false)
            
        console.log('formData', formData)
        console.log('dataForm', dataForm)
        //window.location.reload()
    }

    const [form] = Form.useForm()
    const defaultValues = ()=>{
        form.setFieldsValue({
                            FirstName: props.data.firstName,
                            lastName: props.data.lastName,
                            mobile: props.data.phoneNumber,
                            email: props.data.email,
                            userType: type == 'teacher'?'Teacher':'Student'
                            })
    }
    useEffect(() => {
        defaultValues();
    }, [firstName, lastName, phoneNumber, email, type])
    
    return(
        <div>
        <Form
        form = {form}
        onFinish={onFinish}
        validateMessages={validateMessages}
        >
            <Row gutter = {16}>
                <Col span = {12}>
                    <Form.Item
                        name="FirstName"
                        rules = {[{
                            required: true,
                            min: 2,
                            type: 'string',
                            pattern:  /^[a-zA-Z]*$/,
                        }]}
                    >
                        <Input
                            defaultValue = {firstName}
                            name = "firstName"
                            onChange = {handleInputChange}
                        />
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item
                        name="lastName"
                        rules = {[{
                            required: true,
                            min: 2,
                            type: 'string',
                            pattern:  /^[a-zA-Z]*$/,
                        }]}
                    >
                        <Input
                            name = "lastName"
                            onChange = {handleInputChange}
                        />
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item
                        name="mobile"
                    >
                        <Input
                            name = "mobile"
                            onChange = {handleInputChange}
                        />
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item
                        name="email"
                        rules = {[
                            {
                                required: true,
                                type: 'email'
                            }
                        ]}
                    >
                        <Input
                            name = "email"
                            onChange = {handleInputChange}
                        />
                    </Form.Item>
                </Col>
                <Col span = {12}>
                    <Form.Item name="userType">
                        <Select
                            onChange = {(value)=>{setSelectUserType(value)}}
                            >
                            <Option value="teacher">Teacher</Option>
                            <Option value="student">Student</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span = {24}>
                <Button type="primary" htmlType="submit">
                    Save Changes
                </Button>
                </Col>
            </Row>
        </Form>
        </div>
    )
}
    
export default EditUser;


import React, { useState, useEffect } from 'react';
import { Col, Descriptions, Row, Form, Input, Button, Select, DatePicker, notification, Spin } from 'antd';

export type WhatsappProps = {
    data: {};
    visible: {};
    setVisible: () => void;
    onUpdate: () => void;
};

const { Option } = Select;
const { TextArea } = Input;

const teacherMessageTemplate = `Dear Parent of ______,

Your next instalment of INR ___ is due on or before ______. Kindly make the payment at the link below.

Payment link - _____

In case of any issues or queries, please feel free to contact QE Support Whatsapp Number - 8143513850.

Thanks & regards,

Team Queen’s English`;

const Whatsapp: React.FC<WhatsappProps> = (props) => {
    const { id } = props.data ? props.data : ''
    console.log('props', props.data)

    const onFinish = async (values: any) => {
        console.log('values', values)
    }


    const [form] = Form.useForm()
    const defaultValues = () => {
        form.setFieldsValue({
            studentID: id
        });
    }
    useEffect(() => {
        defaultValues();
    }, [id])

    return (
        <div>
            <Form
                name="basic"
                form={form}
                labelCol={{ span: 7 }}
                wrapperCol={{ span: 16 }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                autoComplete="off"
            >
                <Form.Item
                    label="Student ID"
                    name="studentID"
                >
                    <Input disabled />
                </Form.Item>

                <Form.Item
                    label="WA Message Sent"
                    name="waMessage"
                >
                    <Select style={{ width: 120 }} >
                        <Option value="Yes">Yes</Option>
                        <Option value="No">No</Option>
                    </Select>
                </Form.Item>

                {/* <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item> */}
            </Form>

            <pre>{teacherMessageTemplate}</pre>
        </div>
    )
}

export default Whatsapp;


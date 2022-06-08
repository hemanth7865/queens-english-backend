import React, { useState, useEffect } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Col, Descriptions, Row, Form, Input, Button, Select, DatePicker, notification, Spin, Upload } from 'antd';

export type FormUserProps = {
    data: {};
    visible: {};
    setVisible: () => void;
    onUpdate: () => void;
    isAmountDisplay: {};
    netbankingVisible: {};
    autodebitVisible: {};
};

const { Option } = Select;
const { TextArea } = Input;

const FormUser: React.FC<FormUserProps> = (props) => {
    const { studentId, emiAmount } = props.data ? props.data : ''
    console.log('props', props.data)

    const onFinish = async (values: any) => {
        console.log('values', values)
    }


    const [form] = Form.useForm()
    const defaultValues = () => {
        form.setFieldsValue({
            studentID: studentId,
            installments: emiAmount
        });
    }
    useEffect(() => {
        defaultValues();
    }, [studentId, emiAmount])

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

                {props.isAmountDisplay ?

                    <Form.Item
                        label="Installment Rs"
                        name="installments"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input />
                    </Form.Item> :

                    props.autodebitVisible ?

                        <div>
                            <Form.Item
                                label="Subscription ID"
                                name="subscriptionID"
                                rules={[{ required: true, message: 'Please Enter Subscription ID!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label=" First Instalment Payment ID"
                                name="paymentId"
                                rules={[{ required: true, message: 'Please Enter  First Instalment Payment ID!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </div> :

                        props.netbankingVisible ?

                            <div>
                                <Form.Item
                                    label="Transaction ID"
                                    name="transactionID"
                                    rules={[{ required: true, message: 'Please Enter Transaction ID!' }]}
                                >
                                    <Input />
                                </Form.Item>

                                <Form.Item
                                    label="Upload Screenshot"
                                    name="upload"
                                    rules={[{ required: true, message: 'Please Upload the screenshot!' }]}
                                >
                                    <Upload {...props}>
                                        <Button icon={<UploadOutlined />}>Click to Upload</Button>
                                    </Upload>
                                </Form.Item>
                            </div> :

                            <div>
                                <Form.Item
                                    label="Call Disposition"
                                    name="callDisposition"
                                    rules={[{ required: true, message: 'Please input your password!' }]}
                                >
                                    <Select >
                                        <Option value="No response">No response</Option>
                                        <Option value="Call back later">Call back later</Option>
                                        <Option value="This Week">This Week</Option>
                                        <Option value="This Month">This Month</Option>
                                        <Option value="Want to Discontinue">Want to Discontinue</Option>
                                        <Option value="Dormant">Dormant</Option>
                                        <Option value="Payment after issue resolution">Payment after issue resolution</Option>
                                        <Option value="Demands Leaves">Demands Leaves</Option>
                                        <Option value="Exams in school">Exams in school</Option>
                                        <Option value="Paid">Paid</Option>
                                        <Option value="Subscription Lost">Subscription Lost</Option>
                                        <Option value="DNP">DNP</Option>
                                        <Option value="On Leave">On Leave</Option>
                                        <Option value="other">other</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    label="Notes"
                                    name="notes"
                                >
                                    <TextArea rows={3} />
                                </Form.Item>
                            </div>

                }

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>

        </div>
    )
}

export default FormUser;


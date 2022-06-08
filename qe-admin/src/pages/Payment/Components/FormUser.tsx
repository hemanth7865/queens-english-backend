import React, { useState, useEffect } from 'react';
import { Col, Descriptions, Row, Form, Input, Button, Select, DatePicker, notification, Spin } from 'antd';

export type FormUserProps = {
    data: {};
    visible: '';
    setVisible: () => void;
    onUpdate: () => void;
};

const { Option } = Select;
const { TextArea } = Input;

const FormUser: React.FC<FormUserProps> = (props) => {
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
                    label="Call Disposition"
                    name="callDisposition"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Notes"
                    name="notes"
                >
                    <TextArea rows={3} />
                </Form.Item>

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


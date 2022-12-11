import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Select,
    Spin,
    notification,
} from 'antd';
import { createSRA } from '@/services/ant-design-pro/api';
import { CheckCircleTwoTone } from '@ant-design/icons';

const { Option } = Select;

const SRAForm: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [api, contextHolder] = notification.useNotification();

    const openNotification = (value: any) => {
        api.open({
            message: value.create ? value.success ? 'Created SRA Successfully' : 'Failed to create SRA' : value.success ? 'Updated SRA Successfully' : 'Failed to update SRA',
            description:
                value.create ? value.success ? 'Created SRA' + value.name : 'Failed to create SRA' + value.name : value.success ? 'Updated SRA' + value.name : 'Failed to update SRA' + value.name,
            icon: value.success ? <CheckCircleTwoTone color='green' /> : <CheckCircleTwoTone color='red' />,
        });
    };

    const onFinish = async (value: any) => {
        setIsLoading(true);
        const dataForm = {
            name: value?.name,
            email: value?.email,
            mobile: value?.mobile,
        };
        await createSRA({
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataForm),
        });
        setIsLoading(false);
        openNotification({ success: true, create: true, name: value?.name });
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    };

    const [form] = Form.useForm()

    return (
        <>
            {contextHolder}
            <Spin spinning={isLoading} >
                <Form
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    form={form}
                    onFinish={onFinish}
                    autoComplete="off"
                    scrollToFirstError
                >
                    <Form.Item label="Name" name='name'
                        rules={[{
                            required: true
                        }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Email" name='email'
                        rules={[{
                            required: true,
                            type: 'email'
                        }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Mobile" name='mobile' rules={[{ required: true, pattern: /^\+[0-9]{12}$/, message: "Enter valid number" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Status" name='status' hidden>
                        <Select
                            placeholder="Select Status"
                            allowClear
                        >
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                        </Select>
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                        shape="round"
                        block
                        style={{ color: "white", backgroundColor: "DodgerBlue" }}
                    >Save</Button>
                </Form>
            </Spin >
        </>
    );
};

export default SRAForm;
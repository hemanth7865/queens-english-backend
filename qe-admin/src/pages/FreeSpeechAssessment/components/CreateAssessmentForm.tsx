import React, { useEffect } from "react";
import { Form, Input, Button, Select, notification } from "antd";
import {
    createOrUpdateFreeSpeechAssessment
} from "@/services/ant-design-pro/api";
import { DatePicker } from 'antd';
import moment from 'moment';
export type CreateAssessmentFormProps = {
    onSuccess?: () => void;
    assessmentData?: API.AssessmentItem;
};

const statusOptions = [
    { value: true, label: "Active" },
    { value: false, label: "Inactive" },
];


const CreateAssessmentForm: React.FC<CreateAssessmentFormProps> = ({
    onSuccess,
    assessmentData,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);
    const onFinish = async (values: any) => {
        const date = moment(values.date).format('DD-MM-YYYY');
        const isUpdate = assessmentData?.id ? true : false;
        values.date = date;
        setLoading(true);
        try {
            const data = { ...values, id: assessmentData?.id };
            const res = await createOrUpdateFreeSpeechAssessment(data, isUpdate);
            if (res?.error) {
                throw new Error(isUpdate ? "Failed to update assessment" : "Failed to create assessment");
            }
            setLoading(false);
            onSuccess?.();
        } catch (error: any) {
            notification.error({
                message: isUpdate ? "Failed to update assessment" : "Failed to create assessment",
                description: error.message,
            });
            setLoading(false);
        }
    };


    useEffect(() => {
        if (assessmentData) {
            form.setFieldsValue({
                name: assessmentData.name,
                date: moment(assessmentData.date, 'DD-MM-YYYY'),
                displayName: assessmentData.displayName,
                active: assessmentData.active
            });
        } else {
            form.setFieldsValue({
                name: "",
                date: "",
                displayName: "",
                active: true
            });
        }
    }, [assessmentData]);

    return (
        <Form
            name="assessmentContentForm"
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 18 }}
            initialValues={{ remember: true }}
            autoComplete="off"
            id="assessmentQuestionsForm"
            onFinish={onFinish}
            form={form}


        >
            <Form.Item
                label="Assessment Internal Name"
                name="name"
                rules={[{ required: true, message: "Please Enter Assessment Name" }]}
                help="Assessment Name cannot be changed once created"
            >
                <Input placeholder="Enter Assessment Name" defaultValue={assessmentData?.name} disabled={assessmentData?.name ? true : false} />
            </Form.Item>

            <Form.Item label="Date" name="date" rules={[{ required: true }]}>
                <DatePicker format="DD-MM-YYYY" defaultValue={assessmentData?.date ? moment(assessmentData.date, 'DD-MM-YYYY') : undefined} />
            </Form.Item>

            <Form.Item name="displayName" label="Display Name" rules={[{ required: true }]}
                help="This name will be displayed to students"
            >
                <Input placeholder="Enter Display Name, students will see this name" defaultValue={assessmentData?.displayName} />
            </Form.Item>

            <Form.Item
                label="Status"
                name="active"
                rules={[
                    {
                        required: true,
                        message: "Status cannot be empty!",
                    },
                ]}
                tooltip="This will only save the status in the backend, the frontend implementation for app is not done yet so the set will be visible to the students in the mobile app even if set to inactive or not set."
            >
                <Select
                    placeholder="Select Status of Set"
                    options={statusOptions}
                    defaultValue={assessmentData?.active ?? true}
                />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 7, span: 18 }}>
                <Button type="primary" htmlType="submit"
                    loading={loading}
                    disabled={loading}
                >
                    Submit
                </Button>
            </Form.Item>
        </Form>
    );
};

export default CreateAssessmentForm;

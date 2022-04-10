import React, {useEffect} from 'react';
import { Col, Row, Form, Input, Button } from 'antd';

import {
  timeISTToLocalTimezone, timeToUTCTimezone, timeUTCToISTTimezone,
} from "@/services/ant-design-pro/helpers";

export type Props = {
    data: any;
    setData: (data: any) => any;
    reload: () => any;
};
const FilterOptions: React.FC<Props> = ({data, setData, reload}) => {
    const {timings, startLesson, dob, courseFrequency, startDate, course, id} = data
    const [form] = Form.useForm();

    const handleFinish = () => {
        setData({...data, ...form.getFieldsValue(), timings: timeUTCToISTTimezone(timeToUTCTimezone(form.getFieldValue('timings')))})
    }

    useEffect(() => {
        form.setFieldsValue({timings: timeISTToLocalTimezone(timings), startLesson, dob, courseFrequency, startDate, course});
        reload();
    }, [id]);

    return (
        <Form form={form} onFinish={handleFinish}>
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item name="course">
                        <Input
                            name="course"
                            placeholder="Course"
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="timings">
                        <Input
                            name="timings"
                            placeholder="Timing Availability"
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="courseFrequency">
                        <Input
                            name="courseFrequency"
                            placeholder="Course Frequency"
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="startLesson">
                        <Input
                            name="startLesson"
                            placeholder="Start Lesson"
                        />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name="startDate">
                        <Input
                            name="startDate"
                            type="date"
                            placeholder="Start Date"
                        />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name="dob">
                        <Input
                            name="dob"
                            type="date"
                            placeholder="Date Of Birth"
                        />
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Button type="primary" htmlType="submit" block>
                       Filter
                    </Button>
                </Col>
            </Row>
        </Form>
    )
}

export default FilterOptions;
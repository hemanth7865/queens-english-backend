import React, {useEffect} from 'react';
import { Col, Row, Form, Input, Button } from 'antd';

import {
  timeISTToLocalTimezone, timeToUTCTimezone, timeUTCToISTTimezone,
} from "@/services/ant-design-pro/helpers";
import {LESSONS} from "../../../../config/lessons";
import frequencyList from "./../../../../data/frequency.json";

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
                <Col span={6}>
                    <Form.Item name="course">
                        <Input
                            name="course"
                            placeholder="Course"
                        />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name="timings">
                        <Input
                            name="timings"
                            placeholder="Timing Availability"
                        />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Button type="primary" htmlType="submit">
                       Confim
                    </Button>
                </Col>
            </Row>
        </Form>
    )
}

export default FilterOptions;
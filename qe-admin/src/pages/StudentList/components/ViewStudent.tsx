// @ts-nocheck
import React, { useState } from 'react';
import { Col, Descriptions, Row, Input } from 'antd';

export type ViewStudentProps = {
    weekday: Number;
    details: {};
    onUpdate: () => void;
};


const ViewStudent: React.FC<ViewStudentProps> = (props) => {

    const { firstName, mobile } = props.details ? props.details : ''

    return (
        <div>
            {console.log('details', props.details)}
            <h2 style={{ textAlign: 'center', color: 'blue' }}>View Student</h2>
            <Row>
                <Col span={10}></Col>
                <Col span={14}>
                    <Descriptions >
                        <Descriptions.Item label="UserName" span={3}>{firstName}</Descriptions.Item>
                        <Descriptions.Item label="mobile" span={3}>{mobile}</Descriptions.Item>



                    </Descriptions>
                    <Input
                        defaultValue={firstName}
                    />
                </Col>
            </Row>
        </div>
    )
}

export default ViewStudent;
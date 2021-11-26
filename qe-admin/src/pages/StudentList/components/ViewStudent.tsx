// @ts-nocheck
import React, {useState} from 'react';
import { Col, Descriptions, Row } from 'antd';

export type ViewStudentProps = {
    weekday: Number;
    details: {};
    onUpdate: () => void;
};


const ViewStudent: React.FC<ViewStudentProps> = (props) => {

    const {name, batchCode, classAttended, classType, mobile, startDate, endDate, id, status} = props.details? props.details: ''

    return(
        <div>
            {console.log('details', props.details)}
            <h2 style = {{textAlign: 'center', color: 'blue'}}>View Student</h2>
            <Row>
            <Col span = {10}></Col>
            <Col span = {14}>
            <Descriptions >
                <Descriptions.Item label="UserName" span = {3}>{name}</Descriptions.Item>
                <Descriptions.Item label="batchCode" span = {3}>{batchCode}</Descriptions.Item>
                <Descriptions.Item label="id" span = {3}>{id}</Descriptions.Item>
                <Descriptions.Item label="classAttended" span = {3}>{classAttended}</Descriptions.Item>
                <Descriptions.Item label="classType" span = {3}>{classType}</Descriptions.Item>
                <Descriptions.Item label="mobile" span = {3}>{mobile}</Descriptions.Item>
                <Descriptions.Item label="startDate" span = {3}>{startDate}</Descriptions.Item>
                <Descriptions.Item label="endDate" span = {3}>{endDate}</Descriptions.Item>
                <Descriptions.Item label="status" span = {3}>{status}</Descriptions.Item>
                   
                
            </Descriptions>
            </Col>
            </Row>
        </div>
    )
}
    
export default ViewStudent;
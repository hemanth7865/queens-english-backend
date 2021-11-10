import React, {useState} from 'react';
import { Row, Col, Checkbox, TimePicker } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
export type WeekdayScheduleProps = {
    weekday: Number;
    onUpdate: () => void;
  };

const WeekdaySchedule: React.FC<WeekdayScheduleProps> = (props) => {
    const [value, handleValue] = useState({})

    const handleChange = ()=>{
        console.log(value)
    }

    const handleTimer = (time, timeString)=>{
        console.log('timerpick', time, timeString)
    }
    return(
    <Row>
    <Col span={24}><Checkbox onChange = {handleChange}>{props.weekday} <TimePicker.RangePicker  format = 'HH:mm' onChange = {(time, timeString)=>{handleTimer(time, timeString)}}/><PlusOutlined /><DeleteOutlined /> </Checkbox></Col>
  </Row>
    )
}

export default WeekdaySchedule;
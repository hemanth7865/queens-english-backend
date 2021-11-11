import React, {useState} from 'react';
import { Row, Col, Checkbox, TimePicker } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
export type WeekdayScheduleProps = {
    weekday: Number;
    onUpdate: () => void;
  };

const WeekdaySchedule: React.FC<WeekdayScheduleProps> = (props) => {
    const [value, handleValue] = useState({})

    const handleChange = (props)=>{
        console.log(value, props.weekday)
    }

    const handleTimer = (time, timeString)=>{
        console.log('timerpick', timeString)
    }
    return(
    <Row>
    <Col span={24} style = {{margin: "5px"}}>
      <Checkbox onChange = {(props)=>{handleChange(props)}} style = {{marginRight: "4px", marginLeft: "4px"}} >{props.weekday}</Checkbox>
      <TimePicker.RangePicker  format = 'HH:mm' style = {{width: "200px"}} onChange = {(time, timeString)=>{handleTimer(time, timeString)}}/>
      <a><PlusOutlined style = {{marginRight: "4px", marginLeft: "4px"}}/></a>
      <a><DeleteOutlined /></a></Col>
  </Row>
    )
}

export default WeekdaySchedule;
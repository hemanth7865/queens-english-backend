import React, {useState} from 'react';
import { Row, Col, Checkbox, TimePicker } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
export type WeekdayScheduleProps = {
    weekday: Number;
    onUpdate: () => void;
  };

const WeekdaySchedule: React.FC<WeekdayScheduleProps> = (props) => {
    const [value, setValue] = useState(
          {
            starttime: '',
            endtime: ''
          }
    )

    const [value1, setValue1] = useState(
      {
       weekday: ''
      }
)
    

    const leadWeekAvailability = {
      starttime: value[0],
      endtime: value[1],
      weekday: props.weekday
    }

    let leadAvailability
    if(leadWeekAvailability.starttime && leadWeekAvailability.endtime && leadWeekAvailability.weekday){
      console.log('form', leadWeekAvailability)
      leadAvailability = leadWeekAvailability
    }
    

    return(
    <Row>
    <Col span={24} style = {{margin: "5px"}}>
      
      <Checkbox name = "weekday"  onChange = {e=>setValue1(props.weekday)} style = {{marginRight: "4px", marginLeft: "4px"}} >{props.weekday}</Checkbox>
      <TimePicker.RangePicker  format = 'HH:mm' style = {{width: "200px"}} onChange = {(time, timeString)=> {setValue(timeString)}}/>
      <a><PlusOutlined style = {{marginRight: "4px", marginLeft: "4px"}}/></a>
      <a><DeleteOutlined /></a>        
       </Col>
  </Row>
    )
}

export default WeekdaySchedule;





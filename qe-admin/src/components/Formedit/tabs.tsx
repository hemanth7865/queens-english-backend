import React, { useState, useEffect } from "react";
import { Tabs, notification, Spin } from 'antd';
import Studentdetailsedit from './studentdetails';
import { addTeacherSchedule } from "@/services/ant-design-pro/api";

const { TabPane } = Tabs;

function callback(key: any) {
  console.log(key);
}

export type TabseditProps = {
  tmpData: {}
};

const Tabsedit: React.FC<TabseditProps> = (props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tmpData, setTmpData] = useState<any>(props.tmpData);
  const openNotificationWithIcon = (type: any, userType = 'Student', messageError: any) => {
    notification[type]({
      message: type === 'error' ? messageError : 'Successfully Updated  ' + userType + ' !!!! ',
      description: '',
    });
    setTimeout(() => {
      window.location.reload()
    }, 100);
  };

  useEffect(() => {
    setTmpData(props.tmpData);
  }, [props.tmpData])

  const submit = async (data: any) => {
    setIsLoading(true);
    try {
      const msg = await addTeacherSchedule({
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (msg.status === 500) {
        openNotificationWithIcon('error', 'Student', msg.error);
      } else if (msg.status === 400) {
        openNotificationWithIcon('error', 'Student', msg.errors[0]);
      } else {
        setIsLoading(false);
        openNotificationWithIcon('success', 'Student', '');
      }
    } catch (error) {
      openNotificationWithIcon('error', 'Student', 'Unable to process request !!!')
    }
    setIsLoading(false);
  }

  const updateTempData = (data: any) => {
    setTmpData(data);
  };

  return (
    <div>
      <Spin spinning={isLoading}>
        <Tabs defaultActiveKey="1" onChange={callback}>
          <TabPane tab="Student Details" key="1">
            <Studentdetailsedit tempData={tmpData} submit={submit} updateTempData={updateTempData} />
          </TabPane>
        </Tabs>
      </Spin>
    </div>
  );
}
export default Tabsedit;

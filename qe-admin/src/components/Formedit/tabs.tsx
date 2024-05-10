import React, { useState, useEffect } from "react";
import { notification, Spin } from 'antd';
import Studentdetailsedit from './studentdetails';
import { addTeacherSchedule, } from "@/services/ant-design-pro/api";
import { handleAPIResponse } from "@/services/ant-design-pro/helpers";


export type TabseditProps = {
  tmpData: any;
  salesAlert?: '';
  studentManageredit?: boolean;
  studentManageradd?: boolean;
  welcomepage?: '';
  onboardpage?: '',
  startclasslaterpage?: '',
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
    }, 2000);
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

      if (!data.id) {
        handleAPIResponse(msg, `Student ${data.firstName} ${data.lastName} Added Successfully`, `Failed To Add Student ${data.firstName} ${data.lastName}`);
      }
      if (data.id) {
        handleAPIResponse(msg, `Data for student ${data.firstName} ${data.lastName} updated Successfully`, `Failed To update data of student ${data.firstName} ${data.lastName}`);
      }
      setIsLoading(false);
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
        <Studentdetailsedit tempData={tmpData} submit={submit} updateTempData={updateTempData} salesAlert={props?.salesAlert || ''} studentManageredit={props?.studentManageredit || false} studentManageradd={props?.studentManageradd || false} welcomepage={props?.welcomepage || ''} onboardpage={props?.onboardpage || ''} startclasslaterpage={props?.startclasslaterpage || ''} />
      </Spin>
    </div>
  );
}
export default Tabsedit;
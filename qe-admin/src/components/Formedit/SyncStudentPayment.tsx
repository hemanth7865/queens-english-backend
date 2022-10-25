import { Col, Button, notification } from 'antd';
import { useState } from 'react';
import {
  syncStudentPaymentInfo
} from "@/services/ant-design-pro/api";

const openNotificationWithIcon = (type: string, message: string, description: string) => {
  notification[type]({
    message,
    description,
  });
};


const SyncStudentPayment = ({ props }: { props: any }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const syncPaymentData = async () => {
    if (!props?.tempData?.id) {
      openNotificationWithIcon("error", "Student ID", "Student ID Not Found");
      return;
    }
    setLoading(true);
    try {
      const data: any = await syncStudentPaymentInfo(props.tempData.id);
      openNotificationWithIcon(data?.logs[0]?.success ? "success" : "error", "Sync Student Payment Info", data?.logs[0]?.message);

      if (data?.success >= 1) {
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (e: any) {
      openNotificationWithIcon("error", "Unexpected Error", e.message);
    }
    setLoading(false);
  }

  return props?.tempData?.status === "Error" && (
    <Col span={24} style={{ textAlign: "center" }}>
      <p><Button type="primary" loading={loading} onClick={syncPaymentData}>Sync Payment Info From TCM</Button></p>
    </Col>
  )

}

export default SyncStudentPayment;
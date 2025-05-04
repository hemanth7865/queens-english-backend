import React, { useEffect, useState } from 'react';
import { Table, TableColumnsType, Button, notification, Tooltip, Spin, Tag } from 'antd';
import ExportStudentList from '@/pages/StudentsBatchList/components/ExportStudentList';
import { generateSchoolOtp, fetchSchoolById } from '@/services/ant-design-pro/api';
import { CheckCircleTwoTone, CopyOutlined } from '@ant-design/icons';

export type ViewSchoolProps = {
  tempData: any;
};

interface DataType {
  key: React.Key;
  batchNumber: string;
  batchId: string;
  students: any[];
}

interface ExpandedDataType {
  key: React.Key;
  name: string;
  id: string;
  email: string;
  mobile: string;
  status: string;
}

const ViewDrawer: React.FC<ViewSchoolProps> = (props) => {
  const [otp, setOtp] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOtpExpired, setIsOtpExpired] = useState(false);

  useEffect(() => {
    const fetchSchoolData = async () => {
      if (!props.tempData?.id) return;
      try {
        setIsLoading(true);
        const res = await fetchSchoolById(props.tempData?.id);
        setSchoolData(res);

        if (res?.schoolOtp?.otp && res?.schoolOtp?.creationTime) {
          // Check if OTP is expired
          const creationTime = new Date(res?.schoolOtp?.creationTime);
          const currentTime = new Date();
          const diffInMillis = currentTime.getTime() - creationTime.getTime();
          const diffInYears = diffInMillis / (1000 * 3600 * 24 * 365); // Convert to years

          if (diffInYears >= 1) {
            setIsOtpExpired(true); // OTP is expired if diff is greater than or equal to 1 year
          }
        }
      } catch (error) {
        console.error('Error fetching school data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchoolData();
  }, [props.tempData?.id]);

  const onGenerateOtp = async () => {
    setOtpLoading(true);
    try {
      const res = await generateSchoolOtp(props.tempData?.id);
      setOtp(res.otp);
      setIsOtpExpired(false); // Reset expired state when a new OTP is generated
      notification.open({
        message: 'OTP Generated',
        description: `The OTP is ${res.otp}`,
        icon: <CheckCircleTwoTone twoToneColor="green" />,
      });
    } catch (error: any) {
      notification.open({
        message: 'Failed to generate OTP',
        description: error?.message || 'Something went wrong',
        icon: <CheckCircleTwoTone twoToneColor="red" />,
      });
    }
    setOtpLoading(false);
  };

  const onCopyOtp = () => {
    if (otp) {
      navigator.clipboard.writeText(otp);
      notification.success({
        message: 'OTP Copied',
        description: 'The OTP has been copied to your clipboard.',
      });
    }
  };

  const classes = props.tempData?.classesData?.map((item: any) => {
    return {
      ...item,
      studentsLength: item.students.length
    };
  });

  const data: DataType[] = [];
  for (let i = 0; i < classes?.length; ++i) {
    data.push({
      key: i.toString(),
      ...classes[i],
    });
  }

  const columns: TableColumnsType<DataType> = [
    { title: 'Batch Code', dataIndex: 'batchNumber', key: 'batchNumber' },
    { title: 'Batch Id', dataIndex: 'batchId', key: 'batchId' },
    { title: 'Students', dataIndex: 'studentsLength', key: 'studentsLength' },
  ];

  const expandedRowRender = (record: any) => {
    const expandedColumns: TableColumnsType<ExpandedDataType> = [
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'ID', dataIndex: 'id', key: 'id' },
      { title: 'Email', dataIndex: 'email', key: 'email' },
      { title: 'Mobile', dataIndex: 'mobile', key: 'mobile' },
      { title: 'Status', dataIndex: 'status', key: 'status' }
    ];

    return <Table columns={expandedColumns} dataSource={record.students} pagination={false} size="middle" />;
  };

  // Show loading spinner when data is still loading
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <ExportStudentList
          title="Export all students to CSV"
          batchCode={props.tempData?.classesData?.map((item: any) => item.batchNumber)}
          total={1000}
        />

        {/* OTP Section */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {otp ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginRight: '16px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                }}
              >
                {otp}
              </div>
              <Tooltip title="Copy OTP">
                <Button
                  icon={<CopyOutlined />}
                  onClick={onCopyOtp}
                  style={{ marginLeft: 8 }}
                />
              </Tooltip>
            </div>
          ) : !schoolData?.schoolOtp?.otp ? (
            <Button
              type="primary"
              onClick={onGenerateOtp}
              loading={otpLoading}
              style={{ marginBottom: 16 }}
            >
              Generate OTP
            </Button>
          ) : null}

          {/* If OTP exists and expired, show expired warning */}
          {isOtpExpired && (
            <Tag color="red" style={{ marginLeft: 16 }}>
              OTP Expired
            </Tag>
          )}

          {/* If OTP exists and expired, provide a regenerate OTP button */}
          {isOtpExpired && (
            <Button
              type="dashed"
              style={{ marginLeft: 16 }}
              onClick={onGenerateOtp}
            >
              Regenerate OTP
            </Button>
          )}

          {/* If OTP exists, show View OTP button */}
          {schoolData?.schoolOtp?.otp && !otp && !isOtpExpired && (
            <Button
              type="dashed"
              style={{ marginLeft: 16 }}
              onClick={() => setOtp(schoolData?.schoolOtp?.otp)}
            >
              View OTP
            </Button>
          )}
        </div>

      </div>

      <Table
        columns={columns}
        expandable={{
          expandedRowRender: (record) => expandedRowRender(record),
          rowExpandable: (record) => record.students.length !== 0,
        }}
        dataSource={data}
        size="middle"
      />
    </>
  );
};

export default ViewDrawer;

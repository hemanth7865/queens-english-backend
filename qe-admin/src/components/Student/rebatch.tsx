import React, { useState, useEffect } from 'react';
import { Table, Form, Select, Col, Row, Spin, Button, message, Divider } from 'antd';

import {
  listBatch, listSchool, bulkReBatchStudents,
} from "@/services/ant-design-pro/api";

export type Props = {
  selectedStudentData: any;
};

const ReBatch: React.FC<Props> = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [batchList, setBatchList] = useState<any>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>([]);

  const [form] = Form.useForm()

  useEffect(() => {
    listSchool()
      .then((data: any) => {
        setSchools(data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [])

  const updateSchool = async (val: any) => {
    setSelectedSchool(val);
    fetchBatchList(val);
  }

  async function fetchBatchList(selectedSchoolId: any) {
    let fixedFilter: {
      offlineBatch?: number,
      schoolId?: string
    } = {
      offlineBatch: 1,
      schoolId: selectedSchoolId
    }

    const params = {};
    const availableBatchList = await listBatch({
      ...params,
      // pass th rest of filter params here
      ...fixedFilter,
    });

    setBatchList(availableBatchList.data);
  }

  const updateBatchDetails = async (val: any) => {
    const batchDetails = [];
    batchDetails.push(batchList[val])
    setSelectedBatch(batchDetails);
  }

  const handleReAssign = async () => {
    setIsLoading(true);
    const studentIds: any = [];
    props.selectedStudentData.map((studentsDetail: any) => {
      studentIds.push(studentsDetail.id)
    })

    const dataToSend = {
      bulkRebatch: true,
      studentIds: studentIds,
      batchId: selectedBatch[0].id
    }

    const batchCall: any = await bulkReBatchStudents({
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend)
    })

    console.log("batchCall", batchCall);
    if (batchCall.success) {
      message.success("Batch Created/Update Successfully.");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
    setIsLoading(false);
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Student ID',
      dataIndex: 'studentID',
      key: 'studentID',
    },
    {
      title: 'Current Batch',
      dataIndex: 'batchCode',
      key: 'batchCode',
    },
  ];

  const batchColumns = [
    {
      title: "Batch Name",
      dataIndex: 'batchId',
      key: 'batchId'
    },
    {
      title: "Teacher Name",
      dataIndex: 'teacher',
      key: 'teacher'
    },
    {
      title: "No of Students",
      dataIndex: 'students',
      key: 'students'
    },
    {
      title: "Active Lesson",
      dataIndex: 'lessonNumber',
      key: 'lessonNumber'
    }
  ]
  return (
    <>
      <Spin spinning={isLoading}>
        <Table dataSource={props.selectedStudentData} columns={columns} />
        <Divider style={{ margin: '8px 0' }} />
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="schoolId"
              label="School Name">
              <Select
                placeholder="Select School"
                onChange={(value) => updateSchool(value)}
                value={selectedSchool}
                showSearch
                style={{ margin: "3px", display: "block" }}
                allowClear
                options={schools.map((s) => ({ value: s.id, label: `${s.schoolName} ~ ${s.schoolCode}` }))}
                optionLabelProp="label"
                optionFilterProp='label'
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="batchId"
              label="Batch Name">
              <Select
                placeholder="Select Batch"
                onChange={(value) => updateBatchDetails(value)}
                value={selectedBatch}
                showSearch
                allowClear
                options={batchList.map((b: any, index: number) => ({ value: index, label: b.batchId }))}
                optionLabelProp="label"
                optionFilterProp='label'
              >
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {selectedBatch.length > 0 &&
          <>
            <Table className="batchDetailsTable" dataSource={selectedBatch} columns={batchColumns} pagination={false} />

            <Row gutter={16} style={{ marginTop: '2em' }}>
              <Col span={4}></Col>
              <Col span={16}>
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={handleReAssign}
                  value="Save Changes"
                  shape="round"
                  block
                  style={{ color: "white", backgroundColor: "DodgerBlue" }}
                >Assign for {selectedBatch[0].batchId}</Button>
              </Col>
            </Row>
          </>
        }
      </Spin>
    </>
  )
}

export default ReBatch;


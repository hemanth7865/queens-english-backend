import React, { useState, useEffect, useMemo } from 'react';
import { Table, Form, Select, Col, Row, Spin, Button, message, Divider, Alert } from 'antd';

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
  const [removeFromBatch, setRemoveFromBatch] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>([]);
  const [selectedStudents, setSelectedStudents] = useState<any>();
  const [key, setKey] = useState(0);

  const [form] = Form.useForm()

  useEffect(() => {
    listSchool({ onlySchools: true })
      .then((data: any) => {
        setSchools(data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [])

  useEffect(() => {
    setSelectedStudents(props.selectedStudentData.map((student: any) => ({ ...student, rebatchStatus: 'ℹ️ Not Started Yet.' })));
  }, [props.selectedStudentData])

  useEffect(() => {
    if (errors.length === 0) return;
    const tempStudents = selectedStudents?.map((student: any) => {
      const error = errors.find((e: any) => e?.studentId === student.id);
      student.rebatchStatus = error ? `❌ ${error?.message}` : "✅ Rebatched Successfully.";
      return student;
    });
    setSelectedStudents(tempStudents);
  }, [errors])

  useEffect(() => {
    setKey((e) => e + 1);
  }, [selectedStudents])

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
    setErrors([]);
    const studentIds: any = [];
    selectedStudents.map((studentsDetail: any) => {
      studentIds.push(studentsDetail.id)
    })

    const dataToSend = {
      bulkRebatch: true,
      studentIds: studentIds,
      batchId: selectedBatch.length > 0 ? selectedBatch[0].id : '',
      removeFromBatch: removeFromBatch
    }

    const batchCall: any = await bulkReBatchStudents({
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend)
    })

    if (batchCall.success) {
      const errors = [];
      const responses = batchCall.data || [];
      for (const resp of responses) {
        if (resp.status === false) {
          errors.push({ message: resp.message, studentId: resp.studentId });
        }
      }

      if (errors.length > 0) {
        setErrors(errors);
        message.error("Some students are not rebatched. Please check the status column.");
      } else {
        message.success("Batch Created/Update Successfully.");
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
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
    {
      title: 'Status',
      dataIndex: 'rebatchStatus',
      key: 'rebatchStatus',
    }
  ]

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
        <Table dataSource={selectedStudents} columns={columns} key={key} />
        <Divider style={{ margin: '8px 0' }} />
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="batchId"
              label="Remove from batch">
              <Select
                defaultValue={false}
                onChange={(value) => {
                  setRemoveFromBatch(value);
                  if (value) {
                    setSelectedSchool([]);
                    setSelectedBatch([]);
                  }
                }}
                value={removeFromBatch}
                options={[
                  { value: true, label: 'Yes' },
                  { value: false, label: 'No' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="schoolId"
              label="School Name">
              <Select
                placeholder="Select School"
                disabled={removeFromBatch}
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
          <Col span={8}>
            <Form.Item
              name="batchId"
              label="Batch Name">
              <Select
                placeholder="Select Batch"
                disabled={removeFromBatch}
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

        {(selectedBatch.length > 0 || removeFromBatch) &&
          <>
            {selectedBatch.length > 0 &&
              <Table className="batchDetailsTable" dataSource={selectedBatch} columns={batchColumns} pagination={false} />
            }
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
                >{removeFromBatch ? `Remove Students from Batch` : `Assign for ${selectedBatch[0].batchId}`}</Button>
              </Col>
            </Row>
          </>
        }
        <Alert style={{ marginTop: 20, width: 600 }} message="Please check students in each batch on rebatch operation completion." type="info" showIcon />

      </Spin>
    </>
  )
}

export default ReBatch;


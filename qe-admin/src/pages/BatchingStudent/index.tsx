import { Button, Input, Table, Drawer, Form, Typography, Row, Col, Spin} from "antd";
import React, { useState, useEffect } from "react";
import {studentsDashboard, studentsDashboardFilter} from "@/services/ant-design-pro/api";
import {timeISTToLocalTimezone} from "@/services/ant-design-pro/helpers";
import moment from "moment";
import Batch from './components/Batch';

interface Item {
  id: string;
  name: string;
  mobile: string;
  email: string;
  dob: number;
  status: number;
}

const DEFAULT_FORM_DATA = {studentName: '',  studentPhoneNumber: '', studentEmail: ''};

const StudentOnboard: React.FC = () => {
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA)
  const [isLoading, setIsLoading] = useState(true);
  const [form] = Form.useForm();
  const [data, setData] = useState<any>();
  const [tmpDate, setTmpData] = useState<any>();
  const [visibleEdit, setVisibleEdit] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  const edit = (record: Partial<Item> & { id: React.Key }) => {
    form.setFieldsValue(record);
    setTmpData(record);
    setVisibleEdit(true);
  };

  const cancel = () => {
    setVisibleEdit(false);
  };

  const studentGetApi = async (current: number = 1, pageSize: number = 10)=>{
    setIsLoading(true);
    try {
      let msg = await studentsDashboard('batching', {
          current,
          pageSize}
      );
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      setData(msg.data);
      setTotalRecords(msg.total);
    } catch (error) {
      console.log("error", error);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    studentGetApi()
  }, []);


  const columns = [
    {
      title: 'Student Name',
      dataIndex: 'firstName',
      width: 150,
      render: (_: any, record: any) => (
        `${record.firstName} ${record.lastName}`
      )
    },
    {
      title: 'Email',
      dataIndex: 'customerEmail',
      width: 200,
      
    },
    {
      title: 'Parent First Name',
      dataIndex: 'pfirstName',
      width: 150,
    },
    {
      title: 'Parent Last Name',
      dataIndex: 'plastName',
      width: 150,
    },
    {
      title: 'Mobile No',
      dataIndex: 'phoneNumber',
      width: 150,
      
    },
    {
      title: 'Course',
      dataIndex: 'course',
      width: 150,
      
    },
    {
      title: 'Starting lesson',
      dataIndex: 'startLesson',
      width: 150,
    },
    {
      title: 'Time',
      dataIndex: 'timings',
      width: 150,
      render: (value: string) => {
        if(value){
          return timeISTToLocalTimezone(value)
        }
        return "NA";
      }
    },
    {
      title: 'Frequency',
      dataIndex: 'courseFrequency',
      width: 150,
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      width: 150,
      render: (value: string) => {
        if(value){
          return moment(value,"YYYY-MM-DD").format("DD-MM-YYYY");
        }
        return "NA";
      }
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      width: 150,
      render: (_: any, record: Item) => (
        <Typography.Link onClick={() => edit(record)}>
          Process Batching
        </Typography.Link>
      )
      ,
    },
  ];


  //Search Inputs
  const handleInputChange = (e: any) => {
    setFormData((value) => ({
      ...value,
      [e.target.name]: e.target.value,
    }));
  }
  
  const handleFormSubmit = async () => {
    setIsLoading(true);
    try {
      let msg = await studentsDashboardFilter('batching', formData.studentName,  formData.studentPhoneNumber, formData.studentEmail, "",{
          current: 1,
          pageSize: 20}
      );
      setData(msg.data);
      console.log('search details',msg);
    } catch (error) {
      console.log("error", error);
    }
    setIsLoading(false);
  }

 const handleReset = ()=>{
  form.resetFields()
  setFormData(DEFAULT_FORM_DATA)
  studentGetApi()
 }

  return (
    <>
      <h3 style = {{textAlign: "center"}}>Pending Batching</h3>
        <Spin spinning={isLoading}>
        <div style = {{padding: 20, background: "white", marginBottom: 10, alignContent: 'center'}}>
          {/* Form for search */}
          <Form name="basic" form = {form}>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item name="studentName" label = "Student Name" >
                  <Input name = "studentName" onChange={handleInputChange}/>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item name="studentEmail" label = "Email" >
                  <Input name = "studentEmail" onChange={handleInputChange}/>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item name="studentPhoneNumber" label = "Mobile No" >
                  <Input name = "studentPhoneNumber" onChange={handleInputChange}/>
                </Form.Item>
              </Col>
              
              <Col span = {1}>
              <Form.Item>
                <Button type="primary" htmlType="submit" onClick={handleFormSubmit} >
                  Query
                </Button>
              </Form.Item>
              </Col>
              <Col span = {1} style = {{marginLeft: 10}}>
              <Form.Item >
              <Button
                onClick={handleReset}
              >
                Reset
            </Button>
            </Form.Item>
            </Col>
            </Row>
          </Form>
        </div>

        <Form form={form} component={false}>
          <Table
            bordered
            dataSource={data}
            columns={columns}
            rowClassName="editable-row"
            pagination={{ 
              pageSize: 10, total: totalRecords ,
              onChange: studentGetApi
            }}
            scroll={{ x: 1500 }}
          />
        </Form>

        <Drawer 
          title="Proccess Batching"
          placement="right"
          onClose={()=>{
            setVisibleEdit(false)
          }}
          visible={visibleEdit}
          width={960}>
            <Batch data={tmpDate} visible= {visibleEdit} setVisible={setVisibleEdit} />
        </Drawer>
      </Spin>
    </>
  );
};

export default StudentOnboard;

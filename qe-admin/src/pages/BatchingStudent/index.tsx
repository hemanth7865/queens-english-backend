import { Button, Input, Table, Drawer, Form, Typography, Row, Col, notification} from "antd";
import React, { useState, useEffect } from "react";
import {addTeacherSchedule, studentsDashboard, studentsDashboardFilter} from "@/services/ant-design-pro/api";
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

  const [form] = Form.useForm();
  const [data, setData] = useState<any>();
  const [tmpDate, setTmpData] = useState<any>();
  const [visibleEdit, setVisibleEdit] = useState<boolean>(false);

  const edit = (record: Partial<Item> & { id: React.Key }) => {
    form.setFieldsValue(record);
    setTmpData(record);
    setVisibleEdit(true);
  };

  const cancel = () => {
    setVisibleEdit(false);
  };

  const openNotificationWithIcon = (type: string, message: string) => {
    notification[type]({
      message,
      description:
        '',
    });
    setTimeout(() => {
      window.location.reload()
    }, 1000);
  };

//edit submit 
const formSubmit = async (value: any)=>{
  //console.log('value', value)
  const dataForm = {
  }

  try {
    // 登录
    //console.log("data", dataForm);
    const msg = await addTeacherSchedule({
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataForm),
    });
    if (msg.status === 400) {
      //openNotificationWithIcon('error', msg);
      console.log("API call sucessfull", msg);
    } else {
      //openNotificationWithIcon('success', 'Student');
    }
    if (msg) {
      //console.log("API call sucessfull", msg);
    }
    //console.log(msg);
  } catch (error) {
    //openNotificationWithIcon('error', { status: 400, data: 'Unable to process request !!!' })
  }

}

  const studentGetApi = async ()=>{
    try {
      let msg = await studentsDashboard('batching', {
          current: 1,
          pageSize: 20}
      );
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      setData(msg.data);
      //console.log('view one',msg);
    } catch (error) {
      //console.log("error", error);
    }
  }

  useEffect(() => {
    studentGetApi()
  }, []);

  const save = async (id: React.Key) => {
    try {
      const row = (await form.validateFields()) as Item;

      const newData = [...data];
      const index = newData.findIndex(item => id === item.id);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setData(newData);
        setVisibleEdit(false);
        //console.log('data save', newData, index, newData[index])
        formSubmit(newData[index])
      } else {
        newData.push(row);
        setData(newData);
        setVisibleEdit(false);
        //console.log('data save else part', newData, index)
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const columns = [
    {
      title: 'Student First Name',
      dataIndex: 'firstName',
      width: 150,
      editable: true,
      fixed: 'left',
    },
    {
      title: 'Student Last Name',
      dataIndex: 'lastName',
      width: 150,
      editable: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: 200,
      editable: true,
      
    },
    {
      title: 'Parent First Name',
      dataIndex: 'pfirstName',
      width: 150,
      editable: true,
    },
    {
      title: 'Parent Last Name',
      dataIndex: 'plastName',
      width: 150,
      editable: true,
    },
    {
      title: 'Mobile No',
      dataIndex: 'phoneNumber',
      width: 150,
      editable: true,
      
    },
    {
      title: 'Class Type',
      dataIndex: 'classType',
      width: 150,
      editable: true,
    },
    {
      title: 'Starting lesson',
      dataIndex: 'startLesson',
      width: 150,
      editable: true,
      
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      width: 150,
      editable: true,
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
      fixed: 'right',
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
    //console.log('status', formData, value)
    try {
      let msg = await studentsDashboardFilter('batching', formData.studentName,  formData.studentPhoneNumber, formData.studentEmail,{
          current: 1,
          pageSize: 20}
      );
      setData(msg.data);
      console.log('search details',msg);
    } catch (error) {
      console.log("error", error);
    }
    
  }

 const handleReset = ()=>{
  form.resetFields()
  setFormData(DEFAULT_FORM_DATA)
  studentGetApi()
 }

  return (
    <>
      <h2 style = {{textAlign: "center"}}>Pending Batching</h2>

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
            onChange: cancel,
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
        width={800}>
          <Batch data={tmpDate} visible= {visibleEdit} setVisible={setVisibleEdit} />
      </Drawer>
    </>
  );
};

export default StudentOnboard;

import { Button, Input, Table, Popconfirm, Form, Typography, Row, Col, Select, notification, DatePicker} from "antd";
import React, { useState, useEffect } from "react";
import {EyeOutlined} from "@ant-design/icons";
import { useIntl } from "umi";
import {addTeacherSchedule, studentsDashboard, studentsDashboardFilter} from "@/services/ant-design-pro/api";
import moment from "moment";

const { Option } = Select;

interface Item {
  id: string;
  name: string;
  mobile: string;
  email: string;
  comments: number;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text' | 'select' | 'date' | 'selectPlan' | 'selectLesson' | 'selectStatus' | 'selectCallStatus';
  record: Item;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = () => {
    if(inputType === 'number'){
        return (<Select style={{ width: 120 }} >
                  <Option value="onboarding">Onboarding</Option>
                  <Option value="batching">Batching</Option>
                </Select>)
    }else if(inputType === 'select'){
      return(
            <Select style={{ width: 120 }} >
              <Option value="DISE - Group Class">DISE - Group Class</Option>
              <Option value="DISE - 1:1">DISE - 1:1</Option>
              <Option value="IELTS - Group Class">IELTS - Group Class</Option>
              <Option value="IELTS - 1:1">IELTS - 1:1</Option>
              <Option value="DEMO249">DEMO249</Option>
            </Select>
      )
    }else if(inputType === 'date'){
      return <Input placeholder="YYYY-MM-DD"/>
    }else if(inputType === 'selectLesson'){
      return(
            <Select style={{ width: 120 }} >
              <Option value="Lesson 1">Lesson 1</Option>
              <Option value="Lesson 31">Lesson 31</Option>
              <Option value="Lesson 61">Lesson 61</Option>
              <Option value="Lesson 121">Lesson 121</Option>
              <Option value="Lesson 201">Lesson 201</Option>
              <Option value="Lesson 221">Lesson 221</Option>
              <Option value="Lesson 240">Lesson 240</Option>
              <Option value="Lesson 301">Lesson 301</Option>
            </Select>
      )
    }else if(inputType === 'selectPlan'){
      return(
            <Select style={{ width: 120 }} >
              <Option value="Razorpay">Razorpay</Option>
              <Option value="Bank Transfer">Bank Transfer</Option>
              <Option value="Cashfree">Cashfree</Option>
              <Option value="Other">Other</Option>
            </Select>
      )
    }else if(inputType === 'selectStatus'){
      return(
            <Select style={{ width: 150 }} >
              <Option value="onboarding">Onboarding</Option>
              <Option value="active">Active</Option>
            </Select>
      )
    }else if(inputType === 'selectCallStatus'){
      return(
            <Select style={{ width: 120 }} >
              <Option value="Answered">Answered</Option>
              <Option value="DNP">DNP</Option>
              <Option value="Call Back Later">Call Back Later</Option>
              <Option value="Placement test pending">Placement test pending</Option>
            </Select>
      )
    }
    else{
      return <Input />
    }
  }
  //console.log('inputnode', inputType)
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
        >
          {inputNode()}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};




const StudentOnboard: React.FC = () => {
  const intl = useIntl();

  const [formData, setFormData] = useState({studentName: '',  studentPhoneNumber: '', studentEmail: ''})

  const [form] = Form.useForm();
  const [data, setData] = useState();
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record: Item) => record.id === editingKey;

  const edit = (record: Partial<Item> & { id: React.Key }) => {
    form.setFieldsValue({ name: '', age: '', address: '', ...record });
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey('');
  };


  const openNotificationWithIcon = (type: any, userType = 'Student', messageError: any) => {
    console.log('TYPE', type, messageError)
    notification[type]({
      message: type === 'error' ? messageError : 'Successfully Updated  ' + userType + ' !!!! ',
      description: type === 'error' ? 'Add a valid start Date or Class start Date': '',
    });
    setTimeout(() => {
      window.location.reload()
    }, 1000);
  };


  const openNotification = (type: string,  message: string) => {
    const waMessage = (
      <div>
        <p>Hello <br/>
        I am your Academic Counsellor _______ from The Queen’s English and I am thrilled to inform you that your live classes will be starting on XX/XX/XXXX, you can use the below details to join your classes:<br/>
        Zoom Link: <br/>
        Topic: QEXXX<br/>
        Time: 06:00 PM India<br/>
        Join Zoom Meeting<br/>
        <a>https://zoom.us/j/92927339189</a><br/>
        Meeting ID: 929 2733 9189<br/>
        Passcode: QE<br/>
        Days: Monday,Wednesday,Friday<br/>
        (The details above are recurring and hence you can use the same details to join the class everyday)<br/>
        Please send “OK” or a “:+1:” to activate the link above.<br/>
        For any support please feel free to reach out to us on our customer support number: +91 81435 13850<br/>
        Queen's English मे अगर आपको किसी तरह की सहायता या कोर्स को लेकर कोई समयस्या हो तो आप हमारे हेल्प्लायन नम्बर 8143513850 पर कॉल कर सकते हैं।
        We are really excited to see you soon in class! Happy Learning!_<br/></p>
      </div>
    )
  
    notification[type]({
      message: 'Whatsapp message',
      description: waMessage,
      style: {
        width: 720,
      },
      duration: 0,
      onClick: () => {
        console.log('Notification Clicked!');
      },
    });
  };


  //edit submit 
  const formSubmit = async (value: any)=>{
    const dataForm = {
      leadId: value.studentID,
      firstName: value.firstName,
      lastName: value.lastName,
      phoneNumber: value.phoneNumber,
      studentID: value.studentID,
      address: value.address,
      dob: moment(value.dob, "YYYY-MM-DD").format("YYYY-MM-DD"),
      whatsapp:value.whatsapp,
      comments:value.comments,
      email:value.email,
      id: value.studentID,
      type: 'student',
      status: value.status,
      startLesson: value.startLesson,
      startDate: moment(value.startDate, "YYYY-MM-DD").format("YYYY-MM-DD"),
      classesStartDate: moment(value.classesStartDate, "YYYY-MM-DD").format("YYYY-MM-DD"),
      pfirstName: value.pfirstName,
      plastName: value.plastName,
      batchCode: value.batchCode,
      callStatus: value.callStatus,
      callBackon: value.callBackon,
      courseFrequency: value.courseFrequency,
      timings: value.timings,
    }
    console.log("dataForm", dataForm);
    try {
      const msg = await addTeacherSchedule({
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataForm),
      });
      console.log('message', msg)
      if (msg.status === 500) {
        openNotificationWithIcon('error', 'Student', msg.error);
      } else {
        openNotificationWithIcon('success', 'Student', '');
      }
    } catch (error) {
      openNotificationWithIcon('error', 'Student', 'Unable to process request !!!')
    }
    
  }

  const studentGetApi = async ()=>{
    try {
      let msg = await studentsDashboard('onboarding', {
          current: 1,
          pageSize: 200}
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



  useEffect(async (params: any) => {
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
      setEditingKey('');
      formSubmit(newData[index])
    } else {
      newData.push(row);
      setData(newData);
      setEditingKey('');
    }
  } catch (errInfo) {
    console.log('Validate Failed:', errInfo);
  }
  };

  const columns = [
    {
      title: 'Student First Name',
      dataIndex: 'firstName',
      width: 160,
      editable: true,
      fixed: 'left',
    },
    {
      title: 'Student Last Name',
      dataIndex: 'lastName',
      width: 160,
      editable: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: 200,
      editable: true,
      
    },
    {
      title: 'Student Id',
      dataIndex: 'studentID',
      width: 300,
      editable: true,
    },
    {
      title: 'Batch Code',
      dataIndex: 'batchCode',
      width: 200,
      editable: true,
    },
    {
      title: 'Course Frequency',
      dataIndex: 'courseFrequency',
      width: 150,
      editable: true,
    },
    {
      title: 'Timings',
      dataIndex: 'timings',
      width: 150,
      editable: true,
    },
    {
      title: 'Date of Birth',
      dataIndex: 'dob',
      width: 150,
      editable: true,
      render: (value: any)=>{
        if(value){
          return moment(value,"YYYY-MM-DD").format("YYYY-MM-DD")
        }
      }
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
      title: 'Whatsapp No',
      dataIndex: 'whatsapp',
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
      render: (value: any)=>{
        if(value){
          return moment(value,"YYYY-MM-DD").format("YYYY-MM-DD");
        }
      }
    },
    {
      title: 'Class Start Date',
      dataIndex: 'classesStartDate',
      width: 150,
      editable: true,
      render: (value: any)=>{
        if(value){
          return moment(value,"YYYY-MM-DD").format("YYYY-MM-DD");
        }
      }
    },
    {
      title: 'Call Status',
      dataIndex: 'callStatus',
      width: 150,
      editable: true,
    },
    {
      title: 'PRM Comments',
      dataIndex: 'callBackon',
      width: 150,
      editable: true,
    },
    {
      title: 'Comments',
      dataIndex: 'comments',
      width: 200,
      editable: true,
    },
    {
      title: 'Message',
      width: 100,
      render: (value)=>{
        return(        
        <a
          onClick={() => {
            openNotification('info', value.phoneNumber)
          }}
        >
          <EyeOutlined/>
        </a>)
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 200,
      editable: true,
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      fixed: 'right',
      width: 150,
      render: (_: any, record: Item) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link onClick={() => save(record.id)} style={{ marginRight: 8 }}>
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
            Edit
          </Typography.Link>
        );
      },
    },
  ];

  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Item) => ({
        record,
        inputType: col.dataIndex === 'startLesson' ? 'selectLesson' :  col.dataIndex === 'course' ? 'select' : col.dataIndex === 'dob' ? 'date' : col.dataIndex === 'plantype' ? 'selectPlan': col.dataIndex === 'status' ? 'selectStatus' : col.dataIndex === 'startDate' ? 'date': col.dataIndex === 'classesStartDate' ? 'date': col.dataIndex === 'callStatus' ? 'selectCallStatus':'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });


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
      let msg = await studentsDashboardFilter('onboarding', formData.studentName,  formData.studentPhoneNumber, formData.studentEmail,{
          current: 1,
          pageSize: 200}
      );
      setData(msg.data);
      console.log('search details',msg);
    } catch (error) {
      console.log("error", error);
    }
    
  }

 const handleReset = ()=>{
  form.resetFields()
  setFormData('')
  studentGetApi()
 }

  return (
    <>
      <h3 style = {{textAlign: "center"}}>Onboarding Students</h3>
      <div style = {{paddingTop: 20, paddingLeft: 10, background: "white", marginBottom: 10, alignContent: 'center'}}>
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
                  
                  <Col span = {2}>
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
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={data}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={{
          onChange: cancel,
        }}
        scroll={{ x: 1500 }}
    />

    </Form>
    </>
  );
};

export default StudentOnboard;

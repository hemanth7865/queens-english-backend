import { Button, Input, Table, Popconfirm, Form, Typography, Row, Col, Select, notification} from "antd";
import React, { useState, useEffect } from "react";
import { useIntl } from "umi";
import {addTeacherSchedule, studentsDashboard, studentsDashboardFilter} from "@/services/ant-design-pro/api";
import moment from "moment";

const { Option } = Select;
interface Item {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  status: number;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text' | 'select' | 'date' | 'selectPlan' | 'selectLesson' | 'selectStatus' ;
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
            <Select style={{ width: 120 }} >
              <Option value="enrolled">Enrolled</Option>
              <Option value="startclasslater">Start Class Later</Option>
              <Option value="batching">Ready to batch</Option>
            </Select>
      )
    }
    else{
      return <Input />
    }
  }
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
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
  const [salesData, setSalesData] = useState();
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
      description: '',
    });
    setTimeout(() => {
      window.location.reload()
    }, 1000);
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
      dob: value.dob?moment(value.dob, "YYYY-MM-DD").format("YYYY-MM-DD"):'',
      whatsapp:value.whatsapp,
      comments:value.comments,
      email:value.email,
      id: value.studentID,
      type: 'student',
      status: value.status,
      alternativeMobile: value.alternativeMobile,
      classType: value.classType,
      course: value.course,
      startLesson: value.startLesson,
      pfirstName: value.pfirstName,
      plastName: value.plastName,
      payment: [{
        paymentid: value.paymentid,
        studentId: value.studentID,
        classessold: value.classessold,
        saleamount: value.saleamount,
        downpayment: value.downpayment,
        plantype: value.plantype,
        classtype:'',
        leadId: value.studentID,
        id: value.studentID
      }]

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

  function checkProperties(obj) {
    for (const key in obj) {
        if (obj[key] == "" || obj[key] == null ){
            return obj;
        }else{
            continue;
        }
    }
}

  const studentGetApi = async ()=>{
    try {
      let msg = await studentsDashboard('enrolled', {
          current: 1,
          pageSize: 20}
      );
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      //setData(msg.data);

      //Logic to get only objects containing null values
      const newArray = msg.data.map(({slots, batchCode, classesTaken, payments, studentId,  ...items}) => items)
      let nullObj = newArray.map(item=> {
        return checkProperties(item)
      }).filter(item => item != undefined)
      setData(nullObj)
    } catch (error) {
      //console.log("error", error);
    }
  }

console.log('null obj', salesData)

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
      title: 'Student First Name',
      dataIndex: 'lastName',
      width: 160,
      editable: true,
    },
    {
      title: 'BDA Name',
      dataIndex: 'bda',
      width: 150,
      editable: true,
    },
    {
      title: 'BDM Name',
      dataIndex: 'bdm',
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
      title: 'Student Id',
      dataIndex: 'studentID',
      width: 300,
      editable: true,
      
    },
    {
      title: 'Date of Birth',
      dataIndex: 'dob',
      width: 150,
      editable: true,
      render: (value: any)=>{
        if(value){
          return moment(value,"YYYY-MM-DD").format("YYYY-MM-DD");
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
      title: 'Alternate No',
      dataIndex: 'alternativeMobile',
      width: 150,
      editable: true,
      
    },
    {
      title: 'Address',
      dataIndex: 'address',
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
      title: 'Course',
      dataIndex: 'course',
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
      title: 'classess sold',
      dataIndex: 'classessold',
      width: 150,
      editable: true,
    },
    {
      title: 'Total Sale amount',
      dataIndex: 'saleamount',
      width: 150,
      editable: true,
    },
    {
      title: 'Down payment',
      dataIndex: 'downpayment',
      width: 150,
      editable: true,
    },
    {
      title: 'Plan Type',
      dataIndex: 'plantype',
      width: 150,
      editable: true,
    },
    {
      title: 'Payment Id',
      dataIndex: 'paymentid',
      width: 150,
      editable: true,
    },
    {
      title: 'BDA Comments',
      dataIndex: 'comments',
      width: 150,
      editable: true,
      
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 150,
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
        inputType: col.dataIndex === 'startLesson' ? 'selectLesson' :  col.dataIndex === 'course' ? 'select' : col.dataIndex === 'dob' ? 'date' : col.dataIndex === 'plantype' ? 'selectPlan': col.dataIndex === 'status' ? 'selectStatus' :'text',
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
      let msg = await studentsDashboardFilter('enrolled', formData.studentName,  formData.studentPhoneNumber, formData.studentEmail,{
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
  setFormData('')
  studentGetApi()
 }

  return (
    <>
      <h3 style = {{textAlign: "center"}}>Enrolled students / Welcome Call</h3>
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
        bordered
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        dataSource={data}
        columns={mergedColumns}
        rowClassName="editable-row"
        scroll={{ x: 1500 }}
    />

    </Form>
    </>
  );
};

export default StudentOnboard;

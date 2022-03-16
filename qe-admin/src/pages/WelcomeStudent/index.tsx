import { Button, Input, Table, Popconfirm, Form, Typography, Row, Col, Select, notification, Checkbox, DatePicker} from "antd";
import React, { useState, useEffect } from "react";
import { FormattedMessage, useIntl } from "umi";
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
  inputType: 'number' | 'text' | 'select' | 'date' | 'selectPlan' | 'selectLesson' | 'selectStatus';
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
      return <DatePicker/>
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
              <Option value="batching">Ready to batch</Option>
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
          // rules={[
          //   {
          //     required: true,
          //     message: `Please Input ${title}!`,
          //   },
          // ]}
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

  const [showDrawer, setShowDrawer] = useState(false);
  const [formData, setFormData] = useState({studentName: '',  studentPhoneNumber: '', studentEmail: ''})

  const [form] = Form.useForm();
  const [data, setData] = useState();
  const [editingKey, setEditingKey] = useState('');
  const [statusCheck, setStatusCheck] = useState('');

  const isEditing = (record: Item) => record.id === editingKey;

  const edit = (record: Partial<Item> & { id: React.Key }) => {
    form.setFieldsValue({ name: '', age: '', address: '', ...record });
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey('');
  };


const openNotificationWithIcon = (type, userType = 'Student') => {
  notification[type]({
    message: type === 'error' ? msg.data : 'Successfully Updated  ' + userType + ' ! ',
    description:
      '',
  });
  setTimeout(() => {
    window.location.reload()
  }, 1000);
};






//edit submit 
const formSubmit = async (value)=>{
  //console.log('value', value)
  
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
    alternativeMobile: value.alternativeMobile,
    classType: value.classType,
    course: value.course,
    startLesson: value.startLesson,
    //startDate: value.startDate,
    pfirstName: value.pfirstName,
    plastName: value.plastName,
    payment: [{
      paymentid: value.paymentid,
      classessold: value.classessold,
      saleamount: value.saleamount,
      downpayment: value.downpayment,
      plantype: value.plantype,
      studentId: value.studentID,
      classtype:'',
      leadId: value.studentID,
      id: value.studentID
    }]

  }
  console.log("dataForm", dataForm);
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
      console.log("API call sucessfull", msg);
    }
    //console.log(msg);
  } catch (error) {
    //openNotificationWithIcon('error', { status: 400, data: 'Unable to process request !!!' })
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
    setData(msg.data);
    //console.log('view one',msg);
  } catch (error) {
    //console.log("error", error);
  }
}



  useEffect(async (params: any) => {
  //console.log("first reload")
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
      //console.log('data save', newData, index, newData[index])
      formSubmit(newData[index])
    } else {
      newData.push(row);
      setData(newData);
      setEditingKey('');
      //console.log('data save else part', newData, index)
    }
  } catch (errInfo) {
    console.log('Validate Failed:', errInfo);
  }
  //console.log('data at save', data)
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
      title: 'Student Id',
      dataIndex: 'studentID',
      width: 200,
      editable: true,
      
    },
    {
      title: 'Date of Birth of Student',
      dataIndex: 'dob',
      width: 150,
      editable: true,
      render: (value)=>{
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
      title: 'Whatsapp Number',
      dataIndex: 'whatsapp',
      width: 150,
      editable: true,
      
    },
    {
      title: 'Alternate Number',
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
    // {
    //   title: 'Start Date',
    //   dataIndex: 'startDate',
    //   width: 150,
    //   editable: true,
    //   render: (value)=>{
    //     if(value){
    //       return moment(value,"YYYY-MM-DD").format("DD-MM-YYYY");
    //     }
    //   }
    // },
    {
      title: 'No of classess sold',
      dataIndex: 'classessold',
      width: 150,
      editable: true,
      render: (value)=>{
        return value[0]
      }
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
        inputType: col.dataIndex === 'startLesson' ? 'selectLesson' :  col.dataIndex === 'course' ? 'select' : col.dataIndex === 'dob1' ? 'date' : col.dataIndex === 'plantype' ? 'selectPlan': col.dataIndex === 'status' ? 'selectStatus' :'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });


  //Search Inputs
  const handleInputChange = (e) => {
    setFormData((value) => ({
      ...value,
      [e.target.name]: e.target.value,
    }));
  }
  
  const handleFormSubmit = async (value) => {
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

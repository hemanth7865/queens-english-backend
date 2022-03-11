import { Button, DatePicker, Drawer, Input, Table, InputNumber, Popconfirm, Form, Typography, Switch, Row, Col, Select, notification} from "antd";
import React, { useState, useRef, useEffect } from "react";
import { EditTwoTone } from "@ant-design/icons";
import { FormattedMessage, useIntl } from "umi";
import {addTeacherSchedule, studentsOnboarding, studentsOnboardingFilter} from "@/services/ant-design-pro/api";
import moment from "moment";

const { Option } = Select;

interface Item {
  id: string;
  name: string;
  mobile: string;
  email: string;
  dob: number;
  status: number;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text' ;
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
  const inputNode = inputType === 'number' ? <Select style={{ width: 120 }} >
                                              <Option value="onboarding">Onboarding</Option>
                                              <Option value="batching">Batching</Option>
                                            </Select> : 
                                            <Input />;
  //console.log('inputnode', inputType)
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
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};




const StudentOnboard: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *
   *  */
  const intl = useIntl();

  const [showDrawer, setShowDrawer] = useState(false);
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


const openNotificationWithIcon = (type, userType = 'Student') => {
  notification[type]({
    message: type === 'error' ? msg.data : 'Successfully Registered or Updated  ' + userType + ' !!!! ',
    description:
      '',
  });
  setTimeout(() => {
    window.location.reload()
  }, 1000);
};

const formSubmit = async (value)=>{
  console.log('value', value)
  const dataForm = {
    studentName: value.name,
    phoneNumber: value.phoneNumber,
    studentID: value.studentID,
    address: value.address,
    dob: value.dob,
    whatsapp:value.whatsapp,
    comments:value.comments,
    email:value.email,
    id: value.studentID,
    type: 'student',
  }
  try {
    // 登录
    console.log("data", dataForm);
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
    console.log(msg);
  } catch (error) {
    //openNotificationWithIcon('error', { status: 400, data: 'Unable to process request !!!' })
  }
  console.log("dataForm", dataForm);
}

const studentGetApi = async ()=>{
  try {
    let msg = await studentsOnboarding({
        current: 1,
        pageSize: 20}
    );
    if (msg.status === "ok") {
      console.log("API call sucessfull", msg);
    }
    setData(msg.data);
    console.log('view one',msg);
  } catch (error) {
    console.log("error", error);
  }
}



  useEffect(async (params: any) => {
  console.log("first reload")
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
      console.log('data save', newData, index, newData[index])
      formSubmit(newData[index])
    } else {
      newData.push(row);
      setData(newData);
      setEditingKey('');
      console.log('data save else part', newData, index)
    }
  } catch (errInfo) {
    console.log('Validate Failed:', errInfo);
  }
  console.log('data at save', data)
  };

  const columns = [
    {
      title: 'Student Name',
      dataIndex: 'name',
      width: 150,
      editable: true,
      fixed: 'left',
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
          return moment(value,"YYYY-MM-DD").format("DD-MM-YYYY");
        }
      }
    },
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
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
      dataIndex: 'phoneNumber',
      width: 150,
      editable: true,
      
    },
    {
      title: 'Customer EmailId',
      dataIndex: 'email',
      width: 200,
      editable: true,
      
    },
    {
      title: 'Customer Address',
      dataIndex: 'address',
      width: 150,
      editable: true,
      
    },
    {
      title: 'Customer State',
      dataIndex: 'customerState',
      width: 150,
      editable: true,
      
    },
    {
      title: 'Type of Sale',
      dataIndex: 'tos',
      width: 150,
      editable: true,
    },
    {
      title: 'Subscription',
      dataIndex: 'subscription',
      width: 150,
      editable: true,
      
    },
    {
      title: 'Subscription Number',
      dataIndex: 'subNo',
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
      title: 'Course Frequency',
      dataIndex: 'courseFrq',
      width: 150,
      editable: true,
      
    },
    {
      title: 'Preferred Timings',
      dataIndex: 'ptimings',
      width: 150,
      editable: true,
      
    },
    {
      title: 'Starting level of student',
      dataIndex: 'level',
      width: 150,
      editable: true,
      
    },
    {
      title: 'Tentative Start Date',
      dataIndex: 'startDate',
      width: 150,
      editable: true,
      
    },
    {
      title: 'No of classess sold',
      dataIndex: 'classSold',
      width: 150,
      editable: true,
      
    },
    {
      title: 'Total Sale amount',
      dataIndex: 'saleAmt',
      width: 150,
      editable: true,
      
    },
    {
      title: 'Down payment',
      dataIndex: 'payment',
      width: 150,
      editable: true,
      
    },
    {
      title: 'EMI amount',
      dataIndex: 'emi',
      width: 150,
      editable: true,
      
    },
    {
      title: 'No of months of EMI',
      dataIndex: 'nemi',
      width: 150,
      editable: true,
      
    },
    {
      title: 'Payment Mode',
      dataIndex: 'paymentMode',
      width: 150,
      editable: true,
      
    },
    {
      title: 'Transaction Id',
      dataIndex: 'transactionId',
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
        inputType: col.dataIndex === 'status' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const handleInputChange = (e) => {
    setFormData((value) => ({
      ...value,
      [e.target.name]: e.target.value,
    }));
  }
  
  const handleFormSubmit = async (value) => {
    console.log('status', formData, value)
    try {
      let msg = await studentsOnboardingFilter(formData.studentName,  formData.studentPhoneNumber, formData.studentEmail,{
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
      {/* <h2 style = {{textAlign: "center"}}>Onboarding Student view</h2> */}
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
                  
                  <Col span = {2}>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" onClick={handleFormSubmit} >
                      Query
                    </Button>
                  </Form.Item>
                  </Col>
                  <Col span = {1}>
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

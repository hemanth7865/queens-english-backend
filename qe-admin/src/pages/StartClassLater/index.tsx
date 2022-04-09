import { Button, Input, Table, Popconfirm, Form, Typography, Row, Col, Select, notification, Divider, Space, Spin} from "antd";
import {EyeOutlined} from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { useIntl } from "umi";
import {addTeacherSchedule, studentsDashboard, studentsDashboardFilter} from "@/services/ant-design-pro/api";
import moment from "moment";
import { PlusOutlined } from '@ant-design/icons';
import {PRMS} from "../../../config/prms";
import {LSQ_USERS} from "../../../config/lsq_users";

const { Option } = Select;
interface Item {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text' | 'select' | 'date' | 'selectPlan' | 'selectLesson' | 'selectStatus' | 'selectCallStatus' | 'selectDownPayment' | 'selectCourseFrequency' | 'selectSubscriptionAmount' | 'selectSubscriptionMonth' | 'selectTimings' | 'selectSubscriptionAmount' | 'selectSubscriptionType' | 'selectWhatsappSent' | 'selectPRM' | 'selectLSQUsers';
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
        return (<Select style={{ width: 100 + "%" }} >
                  <Option value="Kids">Kids</Option>
                  <Option value="adult">Adult</Option>
                </Select>)
    }else if(inputType === 'select'){
      return(
            <Select style={{ width: 100 + "%" }} >
              <Option value="DISE - Group Class">DISE - Group Class</Option>
              <Option value="DISE - 1:1">DISE - 1:1</Option>
              <Option value="IELTS - Group Class">IELTS - Group Class</Option>
              <Option value="IELTS - 1:1">IELTS - 1:1</Option>
            </Select>
      )
    }else if(inputType === 'date'){
      return <input type="date" style = {{width: 150}}/>
    }else if(inputType === 'selectLesson'){
      return(
            <Select style={{ width: 100 + "%" }} >
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
      const [items, setItems] = useState(['Razorpay', 'Bank Transfer', 'Cashfree']);
      const [name, setName] = useState('');
      const onNameChange = event => {
        console.log(event.target.value)
      setName(event.target.value);
      };

      const addItem = e => {
        console.log(e.target.value)
        e.preventDefault();
        setItems([...items, name || `New item ${index++}`]);
        setName('');
      };
      return(
        <Select
        style={{ width: 100 + "%" }}
        dropdownRender={menu => (
          <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <Space align="center" style={{ padding: '0 8px 4px' }}>
              <Input placeholder="Add" value={name} onChange={onNameChange} />
              <Typography.Link onClick={addItem} style={{ whiteSpace: 'nowrap' }}>
                <PlusOutlined /> add
              </Typography.Link>
            </Space>
          </>
        )}
      >
        {items.map(item => (
          <Option key={item} value = {item}>{item}</Option>
        ))}
      </Select>
      )
    }else if(inputType === 'selectDownPayment'){
      const [items, setItems] = useState(['599', '1099', '1999', '3499', '4999', '7500']);
      const [name, setName] = useState('');
      const onNameChange = event => {
        console.log(event.target.value)
      setName(event.target.value);
      };

      const addItem = e => {
        console.log(e.target.value)
        e.preventDefault();
        setItems([...items, name || `New item ${index++}`]);
        setName('');
      };
      return(
        <Select
        style={{ width: 100 + "%" }}
        dropdownRender={menu => (
          <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <Space align="center" style={{ padding: '0 8px 4px' }}>
              <Input placeholder="add" value={name} onChange={onNameChange} />
              <Typography.Link onClick={addItem} style={{ whiteSpace: 'nowrap' }}>
                <PlusOutlined /> add
              </Typography.Link>
            </Space>
          </>
        )}
      >
        {items.map(item => (
          <Option key={item} value = {item}>{item}</Option>
        ))}
      </Select>
      )
    }else if(inputType === 'selectSubscriptionAmount'){
      const [items, setItems] = useState(['599', '1099', '1999', '3499', '4999']);
      const [name, setName] = useState('');
      const onNameChange = event => {
        console.log(event.target.value)
      setName(event.target.value);
      };

      const addItem = e => {
        console.log(e.target.value)
        e.preventDefault();
        setItems([...items, name || `New item ${index++}`]);
        setName('');
      };
      return(
        <Select
        style={{ width: 100 + "%" }}
        placeholder="custom dropdown render"
        dropdownRender={menu => (
          <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <Space align="center" style={{ padding: '0 8px 4px' }}>
              <Input placeholder="add" value={name} onChange={onNameChange} />
              <Typography.Link onClick={addItem} style={{ whiteSpace: 'nowrap' }}>
                <PlusOutlined /> Add
              </Typography.Link>
            </Space>
          </>
        )}
      >
        {items.map(item => (
          <Option key={item} value = {item}>{item}</Option>
        ))}
      </Select>
      )
    }else if(inputType === 'selectSubscriptionMonth'){
      const [items, setItems] = useState(['0', '3', '4', '7', '13', '15', '23']);
      const [name, setName] = useState('');
      const onNameChange = event => {
        console.log(event.target.value)
      setName(event.target.value);
      };

      const addItem = e => {
        console.log(e.target.value)
        e.preventDefault();
        setItems([...items, name || `New item ${index++}`]);
        setName('');
      };
      return(
        <Select
        style={{ width: 100 + "%" }}
        dropdownRender={menu => (
          <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <Space align="center" style={{ padding: '0 8px 4px' }}>
              <Input placeholder="add" value={name} onChange={onNameChange} />
              <Typography.Link onClick={addItem} style={{ whiteSpace: 'nowrap' }}>
                <PlusOutlined /> Add
              </Typography.Link>
            </Space>
          </>
        )}
      >
        {items.map(item => (
          <Option key={item} value = {item}>{item}</Option>
        ))}
      </Select>
      )
    }else if(inputType === 'selectCourseFrequency'){
      const [items, setItems] = useState(['MWF', 'TTS', 'SS', 'MTWTF']);
      const [name, setName] = useState('');
      const onNameChange = event => {
        console.log(event.target.value)
      setName(event.target.value);
      };

      const addItem = e => {
        console.log(e.target.value)
        e.preventDefault();
        setItems([...items, name || `New item ${index++}`]);
        setName('');
      };
      return(
        <Select
        style={{ width: 100 + "%" }}
        dropdownRender={menu => (
          <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <Space align="center" style={{ padding: '0 8px 4px' }}>
              <Input placeholder="add" value={name} onChange={onNameChange} />
              <Typography.Link onClick={addItem} style={{ whiteSpace: 'nowrap' }}>
                <PlusOutlined /> Add
              </Typography.Link>
            </Space>
          </>
        )}
      >
        {items.map(item => (
          <Option key={item} value = {item}>{item}</Option>
        ))}
      </Select>
      )
    }else if(inputType === 'selectTimings'){
      const [items, setItems] = useState(['15:00', '16:30', '18:00', '19:30']);
      const [name, setName] = useState('');
      const onNameChange = event => {
        console.log(event.target.value)
      setName(event.target.value);
      };

      const addItem = e => {
        console.log(e.target.value)
        e.preventDefault();
        setItems([...items, name || `New item ${index++}`]);
        setName('');
      };
      return(
        <Select
        style={{ width: 100 + "%" }}
        dropdownRender={menu => (
          <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <Space align="center" style={{ padding: '0 8px 4px' }}>
              <Input placeholder="add" value={name} onChange={onNameChange} />
              <Typography.Link onClick={addItem} style={{ whiteSpace: 'nowrap' }}>
                <PlusOutlined /> Add
              </Typography.Link>
            </Space>
          </>
        )}
      >
        {items.map(item => (
          <Option key={item} value = {item}>{item}</Option>
        ))}
      </Select>
      )
    }else if(inputType === 'selectStatus'){
      return(
            <Select style={{ width: 100 + "%" }} >
              <Option value="startclasslater">Start Class Later</Option>
              <Option value="batching">Ready to batch</Option>
            </Select>
      )
    }else if(inputType === 'selectCallStatus'){
      return(
            <Select style={{ width: 100 + "%" }} >
              <Option value="Answered">Answered</Option>
              <Option value="DNP">DNP</Option>
              <Option value="Call Back Later">Call Back Later</Option>
              <Option value="Placement test pending">Placement test pending</Option>
            </Select>
      )
    }else if(inputType === 'selectSubscriptionType'){
      return(
            <Select style={{ width: 100 + "%" }} >
              <Option value="Manual">Manual</Option>
              <Option value="Auto-Debit">Auto-Debit</Option>
            </Select>
      )
    }else if(inputType === 'selectWhatsappSent'){
      return(
            <Select style={{ width: 100 + "%" }} >
              <Option value="Yes">Yes</Option>
              <Option value="No">No</Option>
            </Select>
      )
    }else if(inputType === 'selectPRM'){
      return(
        <Select style={{ width: 100 + "%" }} >
          {PRMS.map(prm => <Option value = {prm.id} key = {prm.id}>{prm.firstName} {prm.lastName}</Option>)}
        </Select>
      )
    }else if(inputType === 'selectLSQUsers'){
      return(
        <Select style={{ width: 100 + "%" }} >
          {LSQ_USERS.map(user => <Option value = {user.ID} key = {user.ID}>{user.FirstName} {user.LastName}</Option>)}
        </Select>
      )
    }else{
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
            inputType !== "comments"?
            { required: true, 
              message: `${title} is required`
            }: {},  
            inputType === "phoneNumber" ? { required: true, pattern: /^\+[0-9]{10,15}$/, message: "Enter valid number"}: {},
            inputType === "email" ? {required: true, type: "email"}: {},
            inputType === "name" ? {required: true, pattern: /^[a-zA-Z\s]*$/}: {},
            inputType === "selectCourseFrequency" ? {required: true, pattern: /^[MTWFS]*$/, message: "Enter only any of MTWTFSS days"}:{},
            inputType === "numberOnly"  ? {required: true, pattern: /^[0-9]*$/, message: "Enter number only"}:{},
            inputType ===  "selectDownPayment"? {required: true, pattern: /^[0-9]*$/, message: "Enter number only"}:{},
            inputType ===  "selectSubscriptionAmount"? {required: true, pattern: /^[0-9]*$/, message: "Enter number only"}:{},
            inputType ===  "selectSubscriptionMonth" ? {required: true, pattern: /^[0-9]*$/, message: "Enter number only"}:{},
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

  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [formData, setFormData] = useState({studentName: '',  studentPhoneNumber: '', studentEmail: '', prm_name: ''})

  const [form] = Form.useForm();
  const [data, setData] = useState();
  const [editingKey, setEditingKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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



const openNotification = (type: string,  message: string, prm_firstName: string, prm_lastName: string) => {
  const waMessage = (
    <div>
      <p>Hello <br/>
      We're delighted to welcome you aboard The Queen's English.<br/>
      I'll be your academic counsellor, and my name is {prm_firstName} {prm_lastName}<br/>
      We are ecstatic to have you join us in learning excellent English. Please find your login information for the app below, which allows you to practice spoken English with real-time feedback.<br/>
      Step 1: Go to the Google Play Store and download the app using the following link:     
      <a>https://queensenglish.co/app</a><br/>
      User information:<br/>
      Phone: {message}<br/>
      Please use your registered phone number to log in (once your classes have started).<br/>
      We're also very excited to share our support phone number with you. If you have a question or a problem, you can call us at 81435 13850<br/>
      Queen's English मे अगर आपको किसी तरह की सहायता या कोर्स को लेकर कोई समयस्या हो तो आप हमारे हेल्प्लायन नम्बर 8143513850 पर कॉल कर सकते हैं।_</p>
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

  function stringContainsNumber(_string) {
    return /\d/.test(_string);
  }

  //edit submit 
  const formSubmit = async (value: any)=>{
      setIsLoading(true);
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
        customerEmail:value.customerEmail,
        id: value.studentID,
        type: 'student',
        status: value.status,
        alternativeMobile: value.alternativeMobile,
        classType: value.classType,
        course: value.course,
        startLesson: value.startLesson,
        startDate: moment(value.startDate, "YYYY-MM-DD").format("YYYY-MM-DD"),
        pfirstName: value.pfirstName,
        plastName: value.plastName,
        callStatus: value.callStatus,
        callBackon: value.callBackon,
        courseFrequency: value.courseFrequency,
        timings: value.timings,
        waMessageSent: value.waMessageSent,
        prm_id: String(value.prm).length < 3 && parseInt(value.prm) > 0 ? value.prm : value.prm_id,
        lsq_users_ID: stringContainsNumber(value.lsq_user_name)? value.lsq_user_name : value.lsq_user_id,
        payment: [{
          paymentid: value.paymentid,
          studentId: value.studentID,
          classessold: value.classessold,
          saleamount: value.saleamount,
          downpayment: value.downpayment,
          classtype:'',
          leadId: value.studentID,
          id: value.studentID,
          subscription: value.subscription,
          subscriptionNo: value.subscriptionNo,
          emi: value.emi,
          emiMonths: value.emiMonths,
          paymentMode: value.paymentMode,
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
        if (msg.status === 500) {
          openNotificationWithIcon('error', 'Student', msg.error);
        } 
        else if (msg.status === 400){
          openNotificationWithIcon('error', 'Student', msg.errors[0]);
        }else {
          setIsLoading(false);
          openNotificationWithIcon('success', 'Student', '');
        }
        
      } catch (error) {
        openNotificationWithIcon('error', 'Student', 'Unable to process request !!!')
      }
      setIsLoading(false);
  }

  const studentGetApi = async (current: number = 1, pageSize: number = 10)=>{
    setIsLoading(true);
    try {
      let msg = await studentsDashboard('startclasslater', {
          current,
          pageSize
        }
      );
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      setData(msg.data);
      setTotalRecords(msg.total);
    } catch (error) {
      //console.log("error", error);
    }
    setIsLoading(false);
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
      dataIndex: 'customerEmail',
      width: 200,
      editable: true,
      
    },
    {
      title: 'Student Id',
      dataIndex: 'studentID',
      width: 300,
      editable: false,
      
    },
    {
      title: 'Date of Birth of Student',
      dataIndex: 'dob',
      width: 200,
      editable: true,
      render: (value: any)=>{
        if(value){
          return moment(value,"YYYY-MM-DD").format("DD-MM-YYYY");
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
      title: 'RMN',
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
      width: 200,
      editable: true,
    },
    {
      title: 'Starting lesson',
      dataIndex: 'startLesson',
      width: 150,
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
      title: 'Start Date',
      dataIndex: 'startDate',
      width: 200,
      editable: true,
      render: (value: any)=>{
        if(value){
          return moment(value,"YYYY-MM-DD").format("DD-MM-YYYY");
        }
      }
    },
    {
      title: 'classes sold',
      dataIndex: 'classessold',
      width: 150,
      editable: true
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
      title: 'Plan Mode',
      dataIndex: 'paymentMode',
      width: 200,
      editable: true,
    },
    {
      title: 'Subscription Type',
      dataIndex: 'subscription',
      width: 200,
      editable: true,
    },
    {
      title: 'Subscription No',
      dataIndex: 'subscriptionNo',
      width: 200,
      editable: true,
    },
    {
      title: 'Subscription Amount',
      dataIndex: 'emi',
      width: 200,
      editable: true,
    },
    {
      title: 'months of subscription',
      dataIndex: 'emiMonths',
      width: 200,
      editable: true,
    },
    {
      title: 'Transaction Id',
      dataIndex: 'paymentid',
      width: 150,
      editable: true,
    },
    {
      title: 'Call Status',
      dataIndex: 'callStatus',
      width: 150,
      editable: true,
    },
    {
      title: 'PRM Name',
      dataIndex: 'prm',
      width: 200,
      editable: true,
    },
    {
      title: 'PRM Comments',
      dataIndex: 'callBackon',
      width: 150,
      editable: true,
    },
    {
      title: 'Sales Owner',
      dataIndex: 'lsq_user_name',
      width: 200,
      editable: true,
    },
    {
      title: 'BDA Comments',
      dataIndex: 'comments',
      width: 150,
      editable: true,
    },
    {
      title: 'Message',
      width: 100,
      render: (value)=>{
        return(        
        <a
          onClick={() => {
            openNotification('info', value.phoneNumber, value.prm_firstName, value.prm_lastName)
          }}
        >
          <EyeOutlined/>
        </a>)
      }
    },
    {
      title: 'WhatsApp Message Sent',
      dataIndex: 'waMessageSent',
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
        inputType: col.dataIndex === 'startLesson' ? 'selectLesson' :  col.dataIndex === 'course' ? 'select' : col.dataIndex === 'dob' ? 'date' : col.dataIndex === 'paymentMode' ? 'selectPlan': col.dataIndex === 'status' ? 'selectStatus' : col.dataIndex === 'classType' ? 'number': col.dataIndex === 'callStatus' ? 'selectCallStatus': col.dataIndex === 'startDate' ? 'date' : col.dataIndex === 'downpayment' ?'selectDownPayment' : col.dataIndex === 'courseFrequency' ?'selectCourseFrequency': col.dataIndex === 'emi' ?'selectSubscriptionAmount' : col.dataIndex === 'emiMonths' ? 'selectSubscriptionMonth': col.dataIndex === 'timings' ? 'selectTimings' : col.dataIndex === 'subscription' ?'selectSubscriptionType': col.dataIndex === 'phoneNumber' ? 'phoneNumber': col.dataIndex === "alternativeMobile" ? "phoneNumber":col.dataIndex === "whatsapp" ? "phoneNumber":col.dataIndex === "waMessageSent" ? 'selectWhatsappSent' :col.dataIndex === 'prm'? 'selectPRM': col.dataIndex === 'customerEmail' ? 'email': col.dataIndex === 'comments' ? 'comments': col.dataIndex === 'firstName' ? 'name': col.dataIndex === 'lastName' ? 'name': col.dataIndex === 'pfirstName' ? 'name': col.dataIndex === 'plastName' ? 'name': col.dataIndex === 'salesowner' ? 'name': col.dataIndex === 'classessold' ? 'numberOnly': col.dataIndex === 'saleamount' ? 'numberOnly':col.dataIndex === 'lsq_user_name'? 'selectLSQUsers': 'text' ,
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
  
  const handleFormSubmit = async () => {
    setIsLoading(true);
    try {
      let msg = await studentsDashboardFilter('enrolled', formData.studentName,  formData.studentPhoneNumber, formData.studentEmail, formData.prm_name, {
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
  setFormData('')
  studentGetApi()
 }

  return (
    <>
      <h3 style = {{textAlign: "center"}}>Batching Waitlist</h3>
      <Spin spinning={isLoading}>
      <div style = {{paddingTop: 20, paddingLeft: 10, paddingRight: 10, background: "white", marginBottom: 10, alignContent: 'center'}}>
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
                  
                  <Col span={6}>
                    <Form.Item name="prm_name" label = "PRM Name" >
                      <Input name = "prm_name" onChange={handleInputChange}/>
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
            pageSize: 10, total: totalRecords ,
            onChange: studentGetApi
          }}
          scroll={{ x: 100 }}
      />

      </Form>
    </Spin>
    </>
  );
};

export default StudentOnboard;

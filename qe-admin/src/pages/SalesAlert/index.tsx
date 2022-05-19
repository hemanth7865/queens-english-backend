import { Button, Input, Table, Popconfirm, Form, Typography, Row, Col, Select, notification, Divider, Space, Spin, Drawer } from "antd";
import React, { useState, useEffect } from "react";
import { useIntl } from "umi";
import { addTeacherSchedule, studentsDashboard, studentsDashboardFilter } from "@/services/ant-design-pro/api";
import moment from "moment";
import { EditTwoTone, PlusOutlined } from '@ant-design/icons';
import lsqUsersData from "../../../data/lsq_users.json";
import statesData from "../../../data/stateCustomer.json";
import Tabsedit from "@/components/Formedit/tabs";

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
  inputType: 'number' | 'text' | 'select' | 'date' | 'selectPlan' | 'selectLesson' | 'selectStatus' | 'selectCallStatus' | 'selectDownPayment' | 'selectCourseFrequency' | 'selectSubscriptionAmount' | 'selectSubscriptionMonth' | 'selectTimings' | 'selectSubscriptionAmount' | 'selectSubscriptionType' | 'selectDate' | 'selectSaleWon' | 'selectConfirmDetails' | 'selectLSQUsers' | 'selectState' | 'selectIsSibling' | 'selectClassesSold';
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
    if (inputType === 'number') {
      return (<Select style={{ width: 100 + "%" }} >
        <Option value="Kids">Kids</Option>
        <Option value="adult">Adult</Option>
      </Select>)
    } else if (inputType === 'date') {
      return <input type="date" style={{ width: 160 }} />
    } else if (inputType === 'select') {
      return (
        <Select style={{ width: 100 + "%" }} >
          <Option value="DISE - Group Class">DISE - Group Class</Option>
          <Option value="DISE - 1:1">DISE - 1:1</Option>
          <Option value="IELTS - Group Class">IELTS - Group Class</Option>
          <Option value="IELTS - 1:1">IELTS - 1:1</Option>
        </Select>
      )
    } else if (inputType === 'selectSaleWon') {
      return (
        <Select style={{ width: 100 + "%" }} >
          <Option value="Won">Won</Option>
          <Option value="Lost">Lost</Option>
        </Select>
      )
    } else if (inputType === 'selectLesson') {
      return (
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
    } else if (inputType === 'selectPlan') {
      const [items, setItems] = useState(['Razorpay', 'Bank Transfer', 'Cashfree']);
      const [name, setName] = useState('');
      const onNameChange = event => {
        setName(event.target.value);
      };

      const addItem = e => {
        e.preventDefault();
        setItems([...items, name || `New item ${index++}`]);
        setName('');
      };
      return (
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
            <Option key={item} value={item}>{item}</Option>
          ))}
        </Select>
      )
    } else if (inputType === 'selectDownPayment') {
      const [items, setItems] = useState(['0', '599', '799', '849', '1099', '1149', '1599', '1649', '1999', '2399', '2930', '3499', '4799', '4999', '7500']);
      const [name, setName] = useState('');
      const onNameChange = event => {
        setName(event.target.value);
      };

      const addItem = e => {
        e.preventDefault();
        setItems([...items, name || `New item ${index++}`]);
        setName('');
      };
      return (
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
            <Option key={item} value={item}>{item}</Option>
          ))}
        </Select>
      )
    } else if (inputType === 'selectSubscriptionAmount') {
      const [items, setItems] = useState(['0', '599', '799', '849', '1099', '1149', '1599', '1649', '1999', '2399', '2930', '3199', '3499', '4799', '4999']);
      const [name, setName] = useState('');
      const onNameChange = event => {
        setName(event.target.value);
      };

      const addItem = e => {
        e.preventDefault();
        setItems([...items, name || `New item ${index++}`]);
        setName('');
      };
      return (
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
            <Option key={item} value={item}>{item}</Option>
          ))}
        </Select>
      )
    } else if (inputType === 'selectSubscriptionMonth') {
      const [items, setItems] = useState(['0', '3', '4', '7', '13', '15', '23', '31']);
      const [name, setName] = useState('');
      const onNameChange = event => {
        setName(event.target.value);
      };

      const addItem = e => {
        e.preventDefault();
        setItems([...items, name || `New item ${index++}`]);
        setName('');
      };
      return (
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
            <Option key={item} value={item}>{item}</Option>
          ))}
        </Select>
      )
    } else if (inputType === 'selectCourseFrequency') {
      const [items, setItems] = useState(['MWF', 'TTS', 'SS', 'MTWTF']);
      const [name, setName] = useState('');
      const onNameChange = event => {
        setName(event.target.value);
      };

      const addItem = e => {
        e.preventDefault();
        setItems([...items, name || `New item ${index++}`]);
        setName('');
      };
      return (
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
            <Option key={item} value={item}>{item}</Option>
          ))}
        </Select>
      )
    } else if (inputType === 'selectTimings') {
      const [items, setItems] = useState(['15:00', '16:30', '18:00', '19:30']);
      const [name, setName] = useState('');
      const onNameChange = event => {
        setName(event.target.value);
      };

      const addItem = e => {
        e.preventDefault();
        setItems([...items, name || `New item ${index++}`]);
        setName('');
      };
      return (
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
            <Option key={item} value={item}>{item}</Option>
          ))}
        </Select>
      )
    } else if (inputType === 'selectStatus') {
      return (
        <Select style={{ width: 100 + "%" }} >
          <Option value="enrolled">Enrolled</Option>
          <Option value="startclasslater">Start Class Later</Option>
          <Option value="batching">Ready to batch</Option>
        </Select>
      )
    } else if (inputType === 'selectCallStatus') {
      return (
        <Select style={{ width: 100 + "%" }} >
          <Option value="Answered">Answered</Option>
          <Option value="DNP">DNP</Option>
          <Option value="Call Back Later">Call Back Later</Option>
          <Option value="Placement test pending">Placement test pending</Option>
        </Select>
      )
    } else if (inputType === 'selectSubscriptionType') {
      return (
        <Select style={{ width: 100 + "%" }} >
          <Option value="Manual (Monthly)">Manual (Monthly)</Option>
          <Option value="Manual (Quarterly)">Manual (Quarterly)</Option>
          <Option value="Auto-Debit">Auto-Debit</Option>
          <Option value="One Time Payment">One Time Payment</Option>
        </Select>
      )
    } else if (inputType === 'selectLSQUsers') {
      return (
        <Select style={{ width: 100 + "%" }} >
          {lsqUsersData.map(user => <Option value={user.ID} key={user.ID}>{user.FirstName} {user.LastName}</Option>)}
        </Select>
      )
    } else if (inputType === 'selectConfirmDetails') {
      return (
        <Select style={{ width: 100 + "%" }} >
          <Option value="Yes">Yes</Option>
          <Option value="No">No</Option>
        </Select>
      )
    } else if (inputType === 'selectClassesSold') {
      return (
        <Select style={{ width: 100 + "%" }} >
          <Option value="60">60</Option>
          <Option value="100">100</Option>
          <Option value="200">200</Option>
          <Option value="300">300</Option>
          <Option value="400">400</Option>
        </Select>
      )
    } else if (inputType === 'selectState') {
      return (
        <Select style={{ width: 100 + "%" }} >
          {statesData.map(state => <Option value={state.label} key={state.label}>{state.value}</Option>)}
        </Select>
      )
    } else if (inputType === 'selectIsSibling') {
      return (
        <Select style={{ width: 100 + "%" }}>
          <Option value="1">Yes</Option>
          <Option value="0">No</Option>
        </Select>
      )
    } else {
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
            inputType !== "comments" ? { required: true, message: `${title} number is required` } : {},
            inputType === "phoneNumber" ? { required: true, pattern: /^\+[0-9]{12}$/, message: "Enter valid number" } : {},
            inputType === "email" ? { required: true, type: "email" } : {},
            inputType === "name" ? { required: true, pattern: /^[a-zA-Z\s]*$/ } : {},
            inputType === "selectCourseFrequency" ? { required: true, pattern: /^[MTWFS]*$/, message: "Enter only any of MTWTFSS days" } : {},
            inputType === "numberOnly" ? { required: true, pattern: /^[0-9]*$/, message: "Enter number only" } : {},
            inputType === "selectDownPayment" ? { required: true, pattern: /^[0-9]*$/, message: "Enter number only" } : {},
            inputType === "selectSubscriptionAmount" ? { required: true, pattern: /^[0-9]*$/, message: "Enter number only" } : {},
            inputType === "selectSubscriptionMonth" ? { required: true, pattern: /^[0-9]*$/, message: "Enter number only" } : {},
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
  const [formData, setFormData] = useState({ studentName: '', studentPhoneNumber: '', studentEmail: '', studentID: '' })

  const [form] = Form.useForm();
  const [data, setData] = useState();
  const [salesData, setSalesData] = useState();
  const [editingKey, setEditingKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tmpData, setTmpData] = useState<any>();
  const [visibleEdit, setVisibleEdit] = useState<boolean>(false);
  const [salesAlert, setSalesAlert] = useState(false);

  const isEditing = (record: Item) => record.id === editingKey;

  const edit = (record: Partial<Item> & { id: React.Key }) => {
    form.setFieldsValue({ name: '', age: '', address: '', ...record });
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey('');
  };


  const openNotificationWithIcon = (type: any, userType = 'Student', messageError: any) => {
    notification[type]({
      message: type === 'error' ? messageError : 'Successfully Updated  ' + userType + ' !!!! ',
      description: '',
    });
    setTimeout(() => {
      window.location.reload()
    }, 1000);
  };



  function stringContainsNumber(_string) {
    return /\d/.test(_string);
  }

  //edit submit 
  const formSubmit = async (value: any) => {
    console.log('values', value.saleamount, value.emi, value.emiMonths, value.downpayment)
    setIsLoading(true);
    const dataForm = {
      leadId: value.studentID,
      firstName: value.firstName,
      lastName: value.lastName.length > 0 ? value.lastName : '-',
      phoneNumber: value.phoneNumber,
      studentID: value.studentID,
      address: value.address,
      dob: value.dob ? moment(value.dob, "YYYY-MM-DD").format("YYYY-MM-DD") : '',
      whatsapp: value.whatsapp,
      comments: value.comments,
      customerEmail: value.customerEmail,
      id: value.id,
      type: "student",
      status: 'Enrolled',
      alternativeMobile: value.alternativeMobile,
      course: value.course,
      startLesson: value.startLesson,
      startDate: moment(value.startDate, "YYYY-MM-DD").format("YYYY-MM-DD"),
      pfirstName: value.pfirstName,
      plastName: value.plastName,
      courseFrequency: value.courseFrequency,
      timings: value.timings,
      state: value.state,
      isSibling: Number(value.isSibling),
      lsq_users_ID: stringContainsNumber(value.lsq_user_name) ? value.lsq_user_name : value.lsq_user_id,
      salesowner: stringContainsNumber(value.lsq_user_name) ? value.lsq_user_name : value.lsq_user_id,
      payment: [{
        paymentid: value.paymentid,
        studentId: value.id,
        classessold: value.classessold,
        saleamount: value.saleamount,
        downpayment: value.downpayment,
        classtype: '',
        leadId: value.studentID,
        id: value.id,
        subscription: value.subscription,
        subscriptionNo: value.subscriptionNo,
        emi: value.emi,
        emiMonths: value.emiMonths,
        paymentMode: value.paymentMode,
      }]

    }
    if (value.saleamount == (Number(value.emi * value.emiMonths) + Number(value.downpayment))) {
      try {
        const msg = await addTeacherSchedule({
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataForm),
        });
        if (msg.status === 500) {
          openNotificationWithIcon('error', 'Student', msg.error);
        } else if (msg.status === 400) {
          openNotificationWithIcon('error', 'Student', msg.errors[0]);
        } else {
          setIsLoading(false);
          openNotificationWithIcon('success', 'Student', '');
        }
      } catch (error) {
        openNotificationWithIcon('error', 'Student', 'Unable to process request !!!')
      }
      setIsLoading(false);
    } else {
      // openNotificationWithIcon('error', 'Student', 'Enter valid sale amount, subscription Months, subscription amount and downpayment')
      notification.open({
        message: '',
        description:
          'Enter valid sale amount, subscription Months, subscription amount and downpayment',
      });
      setIsLoading(false);
    }

  }


  const studentGetApi = async (current: number = 1, pageSize: number = 10) => {
    setIsLoading(true);
    try {
      let msg = await studentsDashboard('Enrolled', {
        current: 1,
        pageSize: 100
      }
      );

      //to check empty fields in the data and payment, total sale calculation
      var emptyFieldsArray: any[] = [];
      var paymentValidatedArray: any[] = [];
      var duplicatesLeadID: any[] = [];
      const duplicateIds = msg.data.map((v: any) => (v.studentID)).filter((v: any, i: any, vIds: any) => vIds.indexOf(v) !== i)

      msg.data.map((item: any) => {
        item.isSibling = parseInt(item.isSibling) ? "1" : "0";
        var p = item
        var isEntryStatus = false
        var isTempEntryStatus = true
        var isValidation = false
        var isDuplicates = false
        for (var key in p) {
          if (p.hasOwnProperty(key)) {
            if (key == 'lsq_user_name' || key == 'lsq_user_id' || key == 'prm' || key == 'prm_id' || key == 'customerEmail' || key == 'timings' || key == 'courseFrequency' || key == 'firstName' || key == 'alternativeMobile' || key == 'course' || key == 'startLesson' || key == 'startDate' || key == 'paymentMode' || key == 'emiMonths' || key == 'emi' || key == 'subscription' || key == 'saleamount' || key == 'classessold' || key == 'downpayment' || key == 'paymentid' || key == 'address' || key == 'whatsapp' || key == 'dob' || key == 'status' || key == 'phoneNumber' || key == 'studentID') {
              var tempKeyValue = p[key] + ''
              if (isTempEntryStatus) {
                if (tempKeyValue.length > 0 && tempKeyValue != undefined && tempKeyValue != null) {
                  isEntryStatus = true
                  if (item.saleamount == (Number(item.emi * item.emiMonths) + Number(item.downpayment))) {
                    isValidation = true
                  }
                  if (item.studentID != null && duplicateIds.includes(item.studentID)) {
                    isDuplicates = true
                  }
                }
                else {
                  isEntryStatus = false
                  isTempEntryStatus = false
                }
              }
            }
          }
        }
        if (!isEntryStatus) {
          emptyFieldsArray.push(item)
        }
        if (!isValidation) {
          paymentValidatedArray.push(item)
        }
        if (isDuplicates) {
          duplicatesLeadID.push(item);
        }
      })

      let TotalArray = paymentValidatedArray.concat(emptyFieldsArray, duplicatesLeadID);
      TotalArray = TotalArray.filter((item, index) => {
        return (TotalArray.indexOf(item) == index)
      })
      setData(TotalArray);
      setSalesAlert(true);
      setTotalRecords(TotalArray.length);
    } catch (error) {
      console.log("error", error);
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
      title: 'Student Last Name (optional)',
      dataIndex: 'lastName',
      width: 160,
      editable: true,
    },
    {
      title: 'Customer Email',
      dataIndex: 'customerEmail',
      width: 200,
      editable: true,
    },
    {
      title: 'Student Id',
      dataIndex: 'id',
      width: 300,
      editable: false,
    },
    {
      title: 'Lead Id',
      dataIndex: 'studentID',
      width: 300,
      editable: true,
    },
    {
      title: 'Date of Birth',
      dataIndex: 'dob',
      width: 200,
      editable: true,
      render: (value: any) => {
        if (value) {
          return moment(value, "YYYY-MM-DD").format("DD-MM-YYYY");
        }
      }
    },
    {
      title: 'Parent First Name (optional)',
      dataIndex: 'pfirstName',
      width: 150,
      editable: true,
    },
    {
      title: 'Parent Last Name (optional)',
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
      title: 'Customer State',
      dataIndex: 'state',
      width: 200,
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
      render: (value: any) => {
        if (value) {
          return moment(value, "YYYY-MM-DD").format("DD-MM-YYYY");
        }
      }
    },
    {
      title: 'classes sold',
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
      title: 'Payment Mode',
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
      title: 'Subscription No. (if auto debit - optional)',
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
      title: 'BDA Comments (optional)',
      dataIndex: 'comments',
      width: 150,
      editable: true,
    },
    {
      title: 'Sale Owner',
      dataIndex: 'lsq_user_name',
      width: 200,
      editable: true,
    },
    {
      title: 'Student Is sibling (optional)',
      dataIndex: 'isSibling',
      width: 150,
      editable: true,
      render: (value: any) => {
        if (!parseInt(value)) {
          return 'No'
        } else {
          return 'Yes'
        }
      }
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
    {
      title: 'Form Edit',
      fixed: 'right',
      width: 150,
      render: (dom: any, entity: { id: any; }) => {
        return (
          <a
            onClick={() => {
              setVisibleEdit(true)
              setTmpData(entity)
            }}>
            <EditTwoTone />
          </a>
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
        inputType: col.dataIndex === 'startLesson' ? 'selectLesson' : col.dataIndex === 'course' ? 'select' : col.dataIndex === 'dob' ? 'date' : col.dataIndex === 'paymentMode' ? 'selectPlan' : col.dataIndex === 'status' ? 'selectStatus' : col.dataIndex === 'classType' ? 'number' : col.dataIndex === 'callStatus' ? 'selectCallStatus' : col.dataIndex === 'startDate' ? 'date' : col.dataIndex === 'downpayment' ? 'selectDownPayment' : col.dataIndex === 'courseFrequency' ? 'selectCourseFrequency' : col.dataIndex === 'emi' ? 'selectSubscriptionAmount' : col.dataIndex === 'emiMonths' ? 'selectSubscriptionMonth' : col.dataIndex === 'timings' ? 'selectTimings' : col.dataIndex === 'subscription' ? 'selectSubscriptionType' : col.dataIndex === 'salestatus' ? 'selectSaleWon' : col.dataIndex === 'phoneNumber' ? 'phoneNumber' : col.dataIndex === "alternativeMobile" ? "phoneNumber" : col.dataIndex === "whatsapp" ? "phoneNumber" : col.dataIndex === 'salesDataFilled' ? 'selectConfirmDetails' : col.dataIndex === 'firstName' ? 'name' : col.dataIndex === 'salesowner' ? 'name' : col.dataIndex === 'classessold' ? 'selectClassesSold' : col.dataIndex === 'saleamount' ? 'numberOnly' : col.dataIndex === 'customerEmail' ? 'email' : col.dataIndex === 'lsq_user_name' ? 'selectLSQUsers' : col.dataIndex === 'state' ? 'selectState' : col.dataIndex === 'isSibling' ? 'selectIsSibling' : col.dataIndex === 'comments' ? 'comments' : col.dataIndex === 'subscriptionNo' ? 'comments' : col.dataIndex === 'pfirstName' ? 'comments' : col.dataIndex === 'plastName' ? 'comments' : col.dataIndex === 'lastName' ? 'comments' : 'text',
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
    setIsLoading(true);
    try {
      let msg = await studentsDashboardFilter('Enrolled', formData.studentName, formData.studentPhoneNumber, formData.studentEmail, '', formData.studentID, {
        current: 1,
        pageSize: 20
      }
      );
      setData(msg.data);
      console.log('search details', msg);
    } catch (error) {
      console.log("error", error);
    }
    setIsLoading(false);
  }

  const handleReset = () => {
    form.resetFields()
    setFormData('')
    studentGetApi()
  }

  return (
    <>
      <h3 style={{ textAlign: "center" }}>Sales Alert/ Missing Data</h3>
      <Spin spinning={isLoading}>
        <div style={{ paddingTop: 20, paddingLeft: 10, background: "white", marginBottom: 10, alignContent: 'center' }}>
          {/* Form for search */}
          <Form name="basic" form={form}>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item name="studentName" label="Student Name" >
                  <Input name="studentName" onChange={handleInputChange} />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item name="studentEmail" label="Email" >
                  <Input name="studentEmail" onChange={handleInputChange} />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item name="studentPhoneNumber" label="Mobile No" >
                  <Input name="studentPhoneNumber" onChange={handleInputChange} />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item name="studentID" label="lead Id" >
                  <Input name="studentID" onChange={handleInputChange} />
                </Form.Item>
              </Col>

              <Col span={2}>
                <Form.Item>
                  <Button type="primary" htmlType="submit" onClick={handleFormSubmit} >
                    Query
                  </Button>
                </Form.Item>
              </Col>
              <Col span={1} style={{ marginLeft: 10 }}>
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
            pagination={{
              pageSize: 10, total: totalRecords,
              onChange: studentGetApi
            }}
            scroll={{ x: 1500 }}
          />
        </Form>
        <Drawer
          title="Edit Details"
          placement="right"
          visible={visibleEdit}
          width={1100}
          onClose={() => {
            setVisibleEdit(false)
          }}
        >
          <Tabsedit tmpData={tmpData} salesAlert={salesAlert} />
        </Drawer>
      </Spin>
    </>
  );
};

export default StudentOnboard;
// @ts-nocheck
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UploadOutlined,

  EditOutlined,
} from "@ant-design/icons";
import {
  Button,
  message,
  Input,
  Drawer,
  Form,
  Col,
  Row,
  Select,
  DatePicker,
  Modal,
  Checkbox,
  TimePicker,
  Tooltip,
  Upload,
  RangePicker,
  notification,
  Alert,
  Space,
  Switch
} from "antd";
import * as CountryList from 'country-list'
import React, { useState, useRef } from "react";
import { useIntl, FormattedMessage } from "umi";
import { PageContainer, FooterToolbar } from "@ant-design/pro-layout";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import { ModalForm, ProFormText, ProFormTextArea } from "@ant-design/pro-form";
import type { ProDescriptionsItemProps } from "@ant-design/pro-descriptions";
import ProDescriptions from "@ant-design/pro-descriptions";
import type { FormValueType } from "./components/UpdateForm";
import UpdateForm from "./components/UpdateForm";
import {
  isPossiblePhoneNumber,
  isValidPhoneNumber,
  validatePhoneNumberLength,
  parsePhoneNumber,
  getCountryCallingCode
} from 'libphonenumber-js'
import {
  // rule,
  addRule,
  updateRule,
  removeRule,
  studentsBatches,
  addTeacherSchedule,
  teacherBatchesView,
  studentsBatchesView,
  teacherRemove,
} from "@/services/ant-design-pro/api";

import Icon from "@ant-design/icons";
import "./index.css";
import Availability from "./availability";
import moment from "moment";
import WeekdaySchedule from "./components/WeekdaySchedule";
import { parse, format } from "date-fns";
import { Tabs } from 'antd';

const { TabPane } = Tabs;

const callback =(key) => {
  console.log(key);
}
/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.RuleListItem) => {
  const hide = message.loading("正在添加");
  try {
    await addRule({ ...fields });
    hide();
    message.success("Added successfully");
    return true;
  } catch (error) {
    hide();
    message.error("Adding failed, please try again!");
    return false;
  }
};

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading("Configuring");
  try {
    await updateRule({
      name: fields.name,
      desc: fields.desc,
      key: fields.key,
    });
    hide();

    message.success("Configuration is successful");
    return true;
  } catch (error) {
    hide();
    message.error("Configuration failed, please try again!");
    return false;
  }
};



/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.RuleListItem[]) => {
  const hide = message.loading("正在删除");
  if (!selectedRows) return true;
  try {
    await removeRule({
      key: selectedRows.map((row) => row.key),
    });
    hide();
    message.success("Deleted successfully and will refresh soon");
    return true;
  } catch (error) {
    message.error("Delete failed, please try again");
    return false;
  }
};

const DEFAULT_COUNTRY_CODE_NUMBER = "91";

const openNotificationWithIcon = (type, msg = { status: 200, data: '' }, userType = 'Teacher') => {
  notification[type]({
    message: type === 'error' ? msg.data : 'Successfully Registered or Updated  ' + userType + ' !!!! ',
    description:
      '',
  });
  setTimeout(() => {
    window.location.reload()
  }, 1000);
};




const StudentsBatchList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);

  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalVisible, handleUpdateModalVisible] =
    useState<boolean>(false);
  //teacher side show - add

  //multi drawer - edit
  // const [childrenDrawer, setchildrenDrawer] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [visibleEdit, setVisibleEdit] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [editvisible, seteditvisible] = useState<boolean>(false);
  const [selectCountry, setSelectCountry] = useState('')
  const [selectCountryCode, setSelectCountryCode] = useState('')
  const [bottleSend, setBottleSend] = useState(false)
  const [firstFeedback, setFirstFeedback] = useState(false)
  const [fifthFeedback, setFirthFeedback] = useState(false)
  const [fifteenthFeedback, setFifteenthFeedback] = useState(false)



  //form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: '',
    email: '',
    status: '',
    studentName: '',
    teacherName: '',
    batchCode: '',
    alternativeMobile: '',
    studentID: '',
    age: '',
    address: '',
    classType: '',
    referralCode: '',
    days: null,
    kids: '',
    dob: null,
    poc: '',
    startDate: null,
    endDate: null,
    startLesson: null,
    firstFeedback: false,
    fifthFeedback: false,
    fifteenthFeedback: false,
    classesCompleted: '',
    customersReferred: '',
    paymentid:'',
    plantype :'',
    classtype:'',
    classessold:'',
    saleamount:'',
    dateofsale:'',
    downpayment:'',
    duedate:'',
    no_of_delayed_payments:'',
    delay_date:'',
    delay_status:'',
    notes:'',
    watsappGroup:'',
    comments:'',
    crossedEndDate:'',


  });

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [tempDataView, setTempDataView] = useState({});

  const [selectUserType, setSelectUserType] = useState('')
  const [selectStatus, setSelectStatus] = useState('')
  const [error, setError] = useState('')




  const [endDate, setEndDate] = useState();
  const [startDate, setStartDate] = useState();
  const [startLesson, setStartLesson] = useState();


  //state for select option
  const [selectValue, setSelectValue] = useState("");
  const [selectTeacher, setSelectTeacher] = useState("");


  //state for adding images
  const [uploadResume, setUploadResume] = useState();

  const [selectLead1, setSelectLead1] = useState([]);

  //state for adding datepicker
  const [dateJoining, setDateJoining] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dob, setDob] = useState("");
  const allCountries = CountryList.getData()

  const defaultCountry = allCountries.filter(country => country.name === 'India')

  //add drawer
  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
    seteditvisible(false);
  };

  const showDrawerEdit = () => {
    setVisibleEdit(true);
    seteditvisible(true);
  };
  const onCloseEdit = () => {
    setVisibleEdit(false);
  };



  const handleMobileChange = (event) => {
    const number = event.target.value
    const message = isValidPhoneNumber(number, selectCountry ? selectCountry : 'IN')
    console.log('msg', message, msg)
    const msg = validatePhoneNumberLength(number, selectCountry ? selectCountry : 'IN')
    if (msg === 'TOO_LONG') {
      setError('Phone number is too long')
    } else if (msg === 'TOO_SHORT') {
      setError('Phone number is too short')
    } else if (msg === 'NOT_A_NUMBER') {
      setError('Not a Number')
    } else if (msg === 'INVALID_COUNTRY') {
      setError('Please Select country first')
    } else if (msg === undefined) {
      setError('')
    } else {
      setError('Phone number is Invalid')
    }
    if (message === true && msg === undefined) {
      console.log(`valid mobile number for ${selectCountry}`)
      setFormData((value) => ({
        ...value,
        [event.target.name]: event.target.value
      }))
    }
    if (message === false && msg === undefined) {
      setError('Enter a valid Mobile Number')
    }
    //console.log(validatePhoneNumberLength(number, 'IN'))

  }


  //edit drawer

  // const showChildrenDrawer = () => {
  //   setchildrenDrawer(true);
  // };

  // const onChildrenDrawerClose = () => {
  //   setchildrenDrawer(false);
  // };
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const handleOneView = async (id) => {
    try {
      let msg = await studentsBatchesView(id);
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      setTempDataView(msg.data);
     // setDob(msg.data.dob);
      console.log('view one', msg);
    } catch (error) {
      console.log("error", error);
    }
  };

  // console.log('viewone', viewOne)
  console.log('tempdateview', tempDataView)
  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.firstName.nameLabel"
          defaultMessage="Name"
        />
      ),
      dataIndex: 'name',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titlemobile"
          defaultMessage="PhoneNumber"
        />
      ),
      dataIndex: 'phoneNumber',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleemail"
          defaultMessage="Email"
        />
      ),
      dataIndex: 'email',
      //  hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleStudentID"
          defaultMessage="Student ID"
        />
      ),
      dataIndex: 'studentID',
      // hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titlebatchcode"
          defaultMessage="Batch Code"
        />
      ),
      dataIndex: 'batchCode',
      //hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleType"
          defaultMessage="User Type"
        />
      ),
      dataIndex: "type",
      hideInForm: true,
      valueEnum: {
        'active': {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.active"
              defaultMessage="Active"
            />
          ),
          status: "Active",
        },
        'inactive': {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.inactive"
              defaultMessage="InActive"
            />
          ),
          status: "InActive",
        },
      },
    }, 
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleView"
          defaultMessage="View"
        />
      ),
      dataIndex: "view",
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              console.log('entity', entity);
              handleOneView(entity.id);
              // setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            <EyeOutlined />
          </a>
        );
      },
    },

    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.titleedit"
          defaultMessage="Edit"
        />
      ),
      dataIndex: "edit",
      hideInSearch: true,

      render: (dom, entity) => {
        { console.log(entity) }
        return (
          <a
            onClick={() => {
              console.log('entity', entity);
              setShowDetail(true);
              handleOneView(entity.id);
              // setCurrentRow(entity);
              showDrawerEdit();
            }}
          >
            <EditOutlined />
          </a>
        );
      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.titledelete"
          defaultMessage="Delete"
        />
      ),
      dataIndex: "delete",
      tip: "The rule name is the unique key",
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {

            }}
          >
            <DeleteOutlined />
          </a>
        );
      },
    },
  ];

  const handleFormChange = (e, value) => {
    setFormData((value) => ({
      ...value,
      [e.target.name]: e.target.value,
    }));
    // console.log('input one');
  };

  const handleSwitchChange = (e, value) => {
    setFormData((value) => ({
      ...value,
      [e.target.name]: e.target.value,
    }));
    // console.log('input one');
  };

  const handleCountry = (value) => {
    console.log('selected country', value)
    if (value) {
      const code = CountryList.getCode(value)
      const codeNumber = getCountryCallingCode(code)
      console.log('code', code, codeNumber)
      setSelectCountry(code)
      setSelectCountryCode(codeNumber)
    }
  }
  console.log('country', selectCountry, selectCountryCode)



  const dateFormat = "HH:mm:ss";

  const handleFormSubmit = async () => {
    console.log("form submitted");
    const dataForm = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      countryCode: selectCountryCode ? selectCountryCode : DEFAULT_COUNTRY_CODE_NUMBER,
      email: formData.email,
      type: 'student',
      status: selectStatus,
      studentName: formData.studentName,
      teacherName: formData.teacherName,
      mobile: formData.phoneNumber,
      batchCode: formData.batchCode,
      alternativeMobile: formData.alternativeMobile,
      studentID: formData.studentID,
      age: formData.age,
      address: formData.address,
      classType: formData.classType,
      referralCode: formData.referralCode,
      days: formData.days,
      kids: formData.kids,
      dob: dob,
      poc: formData.poc,
      startDate: formData.startDate,
      endDate: formData.endDate,
      startLesson: formData.startLesson,
      firstFeedback: firstFeedback,
      fifthFeedback: fifthFeedback,
      fifteenthFeedback: fifteenthFeedback,
      bottleSend: bottleSend,
      classesCompleted: formData.classesCompleted,
      customersReferred: formData.customersReferred,
      watsappGroup:formData.watsappGroup,
      comments:formData.comments,
      crossedEndDate:formData.crossedEndDate,
     /* paymentid : formdata.paymentid,
      plantype  : formdata.plantype,
      classtype: formdata.classtype,
     	classessold : formdata.classessold,
      saleamount : formdata.saleamount,
      dateofsale : formdata.dateofsale,
      downpayment: formdata.downpayment,
      duedate: formdata.duedate,
      no_of_delayed_payments: formdata.no_of_delayed_payments,

      
      delay_date : formdata.delay_date,
      delay_status: formdata.delay_status,
      notes: formdata.notes,

      */
    };
    // async (values: API.LoginParams) => {
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
        openNotificationWithIcon('error', msg.data)

      } else {
        console.log(msg);
        openNotificationWithIcon('success', ' Student');
      }
      window.location.reload();
      console.log(msg);
    } catch (error) {
      console.log("addRule error", error);
      const defaultLoginFailureMessage = intl.formatMessage({
        id: "pages.login.failure",
        defaultMessage: "登录失败，请重试！",
      });
    }
    setVisible(false);
    // console.log('formData', formData);
    console.log("dataForm", dataForm);
  };

  const handleFormSubmitEdit = async () => {
    console.log("form submitted");
    const dataForm = {
      firstName: formData.firstName ? formData.firstName : tempDataView.firstName,
      lastName: formData.lastName ? formData.lastName : tempDataView.lastName,
      phoneNumber: formData.phoneNumber ? formData.phoneNumber : tempDataView.phoneNumber,
      countryCode: formData.countryCode ? formData.countryCode : tempDataView.countryCode,
      email: formData.email ? formData.email : tempDataView.email,
      type: formData.type ? formData.type : 'student',
      status: selectStatus ? selectStatus : tempDataView.status,
      studentName: formData.studentName ? formData.studentName : tempDataView.studentName,
      teacherName: formData.teacherName ? formData.teacherName : tempDataView.teacherName,
      mobile: formData.phoneNumber ? formData.phoneNumber : tempDataView.phoneNumber,
      batchCode: formData.batchCode ? formData.batchCode : tempDataView.batchCode,
      alternativeMobile: formData.alternativeMobile ? formData.alternativeMobile : tempDataView.alternativeMobile,
      studentID: formData.studentID ? formData.studentID : tempDataView.studentID,
      age: formData.age ? formData.age : tempDataView.age,
      address: formData.address ? formData.address : tempDataView.address,
      classType: formData.classType ? formData.classType : tempDataView.classType,
      referralCode: formData.referralCode ? formData.referralCode : tempDataView.referralCode,
      days: formData.days ? formData.days : tempDataView.days,
      kids: formData.kids ? formData.kids : tempDataView.kids,  
      dob:dob,
      poc: formData.poc ? formData.poc : tempDataView.poc,
      startDate: startDate,
      endDate: endDate,
      startLesson: startLesson,
      firstFeedback: firstFeedback,
      fifthFeedback: fifthFeedback,
      fifteenthFeedback: fifteenthFeedback,
      bottleSend: bottleSend,
      classesCompleted: formData.classesCompleted ? formData.classesCompleted : tempDataView.classesCompleted,
      customersReferred: formData.customersReferred ? formData.customersReferred : tempDataView.customersReferred,
      watsappGroup:formData.watsappGroup ? formData.watsappGroup : tempDataView.watsappGroup,
      comments:formData.comments? formData.comments : tempDataView.comments,
      crossedEndDate:formData.crossedEndDate? formData.crossedEndDate: tempDataView.crossedEndDate,
    };
    // async (values: API.LoginParams) => {
    if (tempDataView) {
      dataForm.id = tempDataView.id;
      dataForm.teacherId = tempDataView.teacherId;
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
        openNotificationWithIcon('error', msg);
        console.log("API call sucessfull", msg);
      } else {
        openNotificationWithIcon('success', 'Student');
      }
      if (msg) {

      }
      console.log(msg);
      // 如果失败去设置用户错误信息
      // setUserLoginState(msg);
    } catch (error) {
      openNotificationWithIcon('error', { status: 400, data: 'Unable to process request !!!' })
    }
    console.log("formData", formData);
    console.log("dataForm", dataForm);
    onClose();
  };


  //console.log('timeslots', timeSlots)

  //delete teacher
  const openNotification = (id) => {
    const key = id;
    const btn = (
      <Button type="primary" size="small" onClick={() => deleteTeacher(key)}>
        Confirm
      </Button>
    );
    notification.open({
      message: 'Notification Title',
      description:
        `Do you want to delete ?`,
      btn,
      key,
      onClose: close,
    });
  };

  const deleteTeacher = async (id) => {
    console.log("clicked delete student");
    try {
      let msg = await teacherRemove(id, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      console.log('delete', msg);
    } catch (error) {
      console.log("error", error);
    }
  };
  return (
    <PageContainer>
      {/* {console.log('teacherbatches', teacherBatches)} */}
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: "pages.searchTable.titleTeacher",
          defaultMessage: "Student Management",
        })}
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        request={studentsBatches}
        columns={columns}
        // rowSelection={{
        //   onChange: (_, selectedRows) => {
        //     setSelectedRows(selectedRows);
        //   },
        // }}
        toolBarRender={() => [
          <Button type="primary" key="primary" onClick={showDrawer}>
            Add Student
          </Button>,
          <Drawer
            title="Add Student"
            placement="right"
            onClose={onClose}
            visible={visible}
            width={820}
          >
             
            <Tabs defaultActiveKey="1" onChange={callback}>
            <TabPane tab="Student Info" key="1">  
    
            <Form onFinish={handleFormSubmit}>

              <Row gutter={16}>
              <Col span={12}>
                  <Form.Item name="studentID">
                    <Input
                      placeholder="Student ID"
                      name="studentID"
                      value={formData.studentID}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="firstName"
                    rules={[{
                      required: true,
                      min: 2,
                      type: 'string',
                      pattern: /^[a-zA-Z ]*$/,
                    }]}
                  >
                    <Input
                      placeholder="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="lastName"
                    rules={[{
                      required: true,
                      min: 2,
                      type: 'string',
                      pattern: /^[a-zA-Z]*$/,
                    }]}
                  >
                    <Input
                      placeholder="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="dob">
                    {

                  //    tempDataView.dob === null ?
                        <DatePicker


                          format="YYYY/MM/DD"
                          style={{ width: "375px" }}
                          onChange={(date, dateString) => {
                            setDob(dateString);
                          }}
                          placeholder={"Date Of Birth"}
                        />
                       /* :
                        <DatePicker
                          defaultValue={moment(`${tempDataView.dob}`, "YYYY/MM/DD")}
                          format="YYYY/MM/DD"
                          style={{ width: "370px" }}
                          onChange={(date, dateString) => {
                            setDob(dateString);
                          }}
                          placeholder={"Date Of Birth"}
                        /> */
                     }
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="age">
                    <Input
                      placeholder="Age"
                      name="age"
                      value={formData.age}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="countryCode">
                    <Select placeholder="Select a country" onChange={handleCountry} defaultValue={defaultCountry.map(name => name.name)}>
                      {allCountries.map((country) => {
                        return <Option value={country.name} key={country.code}>{country.name}</Option>
                      })}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="phoneNumber">
                    <Input
                      placeholder="Enter Mobile Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleFormChange}
                    //  prefix = {selectCountryCode?selectCountryCode:DEFAULT_COUNTRY_CODE_NUMBER}
                    />

                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="alternativeMobile">
                    <Input
                      placeholder="Alternative Contact No"
                      name="alternativeMobile"
                      value={formData.alternativeMobile}
                      onChange={handleFormChange}
                    //      prefix = {selectCountryCode?selectCountryCode:DEFAULT_COUNTRY_CODE_NUMBER}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    rules={[
                      {
                        required: true,
                        type: 'email'
                      }
                    ]}
                  >
                    <Input
                      placeholder="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="address">
                    <Input
                      placeholder="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="watsappGroup">
                    <Input
                      placeholder="whatsappGroup"
                      name="watsappGroup"
                      value={formData.watsappGroup}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="status	">
                  {console.log('tempDataView.status')}
                    {console.log(tempDataView.status)}
                    <Select
                      defaultValue={tempDataView.status == 'active'
                        ? "Active"
                        : tempDataView.status == 'onhold'
                          ? "OnHold"
                          : tempDataView.status == 'leave'
                            ? "Leave"
                            : "InActive"}
                      onChange={(value) => {
                        setSelectStatus(value);
                      }}
                    >
                      <Option value="active">Active</Option>
                      <Option value="leave">Leave</Option>
                      <Option value="onhold">On Hold</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="poc">
                    <Input
                      placeholder="poc"
                      name="poc"
                      value={formData.poc}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="classType">
                    <Input
                      placeholder="Kids/Adults"
                      name="classType"
                      value={formData.classType}
                      onChange={handleFormChange}
                    />
                  </Form.Item>          
                </Col>  
                <Input
                type="submit"
                value="Add Student Info "
                style={{ color: "white", backgroundColor: "DodgerBlue" }}
              />             
                </Row>
                </Form>
                </TabPane>
                
                <TabPane tab="Learning journey" key="2">    
                  <Form onFinish={handleFormSubmit}>

                  <Row gutter={16}>   
                  <Col span={12}>
                  <Form.Item
                    name="teacherName"

                  >
                    <Input
                      placeholder="Teacher Name"
                      name="teacherName"
                      value={formData.teacherName}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>  
                <Col span={12}>
                  <Form.Item name="batchCode">
                    <Input
                      placeholder="Batch Code"
                      name="batchCode"
                      value={formData.batchCode}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="startDate">
                    {tempDataView.startDate === null ?
                      <DatePicker


                        format="YYYY/MM/DD"
                        style={{ width: "375px" }}
                        onChange={(date, dateString) => {
                          setStartDate(dateString);
                        }}
                        placeholder={"Classes Start Date"}
                      />
                      :
                      <DatePicker
                        defaultValue={moment(`${tempDataView.startDate}`, "YYYY/MM/DD")}
                        format="YYYY/MM/DD"
                        style={{ width: "375px" }}
                        onChange={(date, dateString) => {
                          setStartDate(dateString);
                        }} />
                    }
                  </Form.Item>
                </Col>
                
                
                <Col span={12}>
                  <Form.Item name="endDate">

                    {tempDataView.endDate === null ?
                      <DatePicker


                        format="YYYY/MM/DD"
                        style={{ width: "375px" }}
                        onChange={(date, dateString) => {
                          setEndDate(dateString);
                        }}
                        placeholder={"End Date"}
                      />
                      :
                      <DatePicker
                        defaultValue={moment(`${tempDataView.endDate}`, "YYYY/MM/DD")}
                        format="YYYY/MM/DD"
                        style={{ width: "375px" }}
                        onChange={(date, dateString) => {
                          setEndDate(dateString);
                        }}
                         placeholder={"End Date"}
                      />
                                        }
                  </Form.Item>
                  </Col>

                  <Col span={12}>
                  <Form.Item name="startLesson">

                    {tempDataView.startLesson === null ?
                      <DatePicker


                        format="YYYY/MM/DD"
                        style={{ width: "375px" }}
                        onChange={(date, dateString) => {
                          setStartLesson(dateString);
                        }}
                        placeholder={"Lesson Start Date"}
                      />
                      :
                      <DatePicker
                        defaultValue={moment(`${tempDataView.startLesson}`, "YYYY/MM/DD")}
                        format="YYYY/MM/DD"
                        style={{ width: "375px" }}
                        onChange={(date, dateString) => {
                          setStartLesson(dateString);
                        }}
                        placeholder={"Lesson Start Date"}
                      />
                    }                 
                  </Form.Item>
                </Col>
                 <Col span={12}>
                  <Form.Item name="crossedEndDate">
                    <Input
                      placeholder="crossed End Date"
                      name="crossedEndDate"
                      value={formData.crossedEndDate}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="classesCompleted">
                    <Input
                      placeholder="No of Classes Completed"
                      name="classesCompleted"
                      value={formData.classesCompleted}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="days">
                    <Input
                      placeholder="Days"
                      name="days"
                      value={formData.days}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
               
                
                
                
                
                
                
                <Col span={12}>
                  <Form.Item name="comments">
                    <Input
                      placeholder="comments"
                      name="comments"
                      value={formData.comments}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
               
                <Input
                type="submit"
                value="Add Student Learning journey"
                style={{ color: "white", backgroundColor: "DodgerBlue" }}
              />
             </Row>      
             </Form> 
            
            </TabPane>
            <TabPane tab="Referral"  key="3">
            
            <Form onFinish={handleFormSubmit}>
            <Col span={12}>
                  <Form.Item name="referralCode">
                    <Input
                      placeholder="Referral Code"
                      name="referralCode"
                      value={formData.referralCode}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="customersReferred">
                    <Input
                      placeholder="Number of customers referred"
                      name="customersReferred"
                      value={formData.customersReferred}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Input
                type="submit"
                value="Add Student Referral"
                style={{ color: "white", backgroundColor: "DodgerBlue" }}
              />
                </Form>  
                </TabPane>
                <TabPane tab="QE checklist"  key="4">
                <Form onFinish={handleFormSubmit}>
                <Col span={12}>
                  <Form.Item name="firstFeedback">
                    First FeedBack <Switch valuePropName='firstFeedback' onChange={(value) => {
                      setFirstFeedback(value)
                    }} /> <br />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="bottleSend">
                    Bottle Send  <Switch valuePropName='bottleSend' onChange={(value) => {
                      setBottleSend(value)
                    }} /> <br />

                  </Form.Item>
                </Col>
                <Col span={15}>
                  <Form.Item name="fifthFeedback">
                    Fifth FeedBack <Switch valuePropName='fifthFeedback' onChange={(value) => {
                      setFirthFeedback(value)
                    }} />
                  </Form.Item>
                </Col>
                <Col span={15}>
                  <Form.Item name="fifteenthFeedback">
                    Fifteenth FeedBack <Switch valuePropName='fifteenthFeedback' onChange={(value) => {
                      setFifteenthFeedBack(value)
                    }} />
                  </Form.Item>
                </Col>
                <Input
                type="submit"
                value="Add Student QE checklist "
                style={{ color: "white", backgroundColor: "DodgerBlue" }}
              />
              </Form>
                </TabPane>
                <TabPane tab="Payment Details" disabled key="5">
                <Form onFinish={handleFormSubmit}>
                <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="paymentid">
                    <Input
                      placeholder="payment ID"
                      name="paymentid"
                      value={formData.paymentid}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col> 
                <Col span={12}>
                  <Form.Item name="plantype">
                    <Input
                      placeholder="Plan type"
                      name="plantype"
                      value={formData.plantype}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col> 
                <Col span={12}>
                  <Form.Item name="classtype">
                    <Input
                      placeholder="Class type"
                      name="classtype"
                      value={formData.classtype}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="classessold">
                    <Input
                      placeholder="No. of classes sold"
                      name="classessold"
                      value={formData.classessold}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col> <Col span={12}>
                  <Form.Item name="saleamount">
                    <Input
                      placeholder="Sale amount"
                      name="saleamount"
                      value={formData.saleamount}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col> 
                 <Col span={12}>
                  <Form.Item name="dateofsale">
                    <Input
                      placeholder="Date of Sale"
                      name="dateofsale"
                      value={formData.dateofsale}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col> 
                <Col span={12}>
                  <Form.Item name="downpayment">
                    <Input
                      placeholder="Downpayment"
                      name="downpayment"
                      value={formData.downpayment}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item name="duedate">
                    <Input
                      placeholder="Due date of plan"
                      name="duedate"
                      value={formData.duedate}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="no_of_delayed_payments">
                    <Input
                      placeholder="No. of delayed payments"
                      name="no_of_delayed_payments"
                      value={formData.no_of_delayed_payments}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item name="delay_date ">
                    <Input
                      placeholder="Date of delayed payment"
                      name="delay_date "
                      value={formData.delay_date}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="delay_status">
                    <Input
                      placeholder="Status of delayed payment"
                      name="delay_status "
                      value={formData.delay_status}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="notes">
                    <Input
                      placeholder="Notes"
                      name="notes "
                      value={formData.notes}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                
                <Input
                type="submit"
                value="Add Student Payment Details"
                style={{ color: "white", backgroundColor: "DodgerBlue" }}
              />
              </Row>
              </Form>
            </TabPane>
            </Tabs>
          </Drawer>
        ]}
      />

      <Drawer
        title="Student details"
        width={780}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
          seteditvisible(false);
        }}
        closable={true}
      >
        {!editvisible ? (

          <>
            <Row>
              <Col
                style={{
                  fontWeight: 900,
                  alignContent: "center",
                  alignItems: "center",
                }}
                span={24}
              >
                <center>
                    <h2 style={{ color: "blue" }}>View Student</h2>
                </center>
              </Col>
            </Row>

            <Tabs defaultActiveKey="1" onChange={callback}>
            <TabPane tab="Student Info" key="1"> 

            < Row style={{ fontWeight: 600 }} gutter={(40, 60)}>
            <Col span={7}></Col>
              <Col span={6}>
                <p> Student ID  </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.studentID}</p>
              </Col>
            
            <Col span={7}></Col>
              <Col span={6}>
                <p>Name  </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.firstName + " " + tempDataView.lastName}</p>
              </Col>

            <Col span={7}></Col>
              <Col span={6}>
                <p>Date of Birth </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.dob}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Age  </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.age}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Mobile</p>
              </Col>           
              <Col span={11} >
                <p>:   {tempDataView.countryCode} + {tempDataView.phoneNumber}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Alternative Contact No</p>
              </Col>           
              <Col span={11} >
                <p>:  {tempDataView.countryCode} + {tempDataView.alternativeMobile}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Email </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.email}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Address </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.address}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>whatsappGroup </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.watsappGroup}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Status  </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.status }</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Point of contact</p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.poc}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Kids/Adults </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.classType}</p>
              </Col>
              </Row>
            </TabPane>

            <TabPane tab="Learning Journey" key="2"> 
            < Row style={{ fontWeight: 600 }} gutter={(40, 60)}>
            
            <Col span={7}></Col>
              <Col span={6}>
                <p> Teacher Name </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.teacherName}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p> Batch Code </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.batchCode}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Classes Start Date  </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.startDate }</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Classes End Date </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.endDate}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p> Lesson Start Date </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.startLesson}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p> crossed End Date  </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.crossedEndDate}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>No of Classes Completed  </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.classesCompleted}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Days</p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.days}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p> Comments</p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.comments}</p>
              </Col>
            </Row>
            </TabPane>

            <TabPane tab="Referral" key="3"> 
            < Row style={{ fontWeight: 600 }} gutter={(40, 60)}>
              
              <Col span={7}></Col>
              <Col span={6}>
                <p> Referral Code </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.referralCode}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p> No. of customers referred </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.customersReferred}</p>
              </Col>
            </Row>
            </TabPane>

            
            <TabPane tab="QE checklist" key="4"> 
           < Row style={{ fontWeight: 600 }} gutter={(40, 60)}>
              <Col span={7}></Col>
              <Col span={6}>
                <p> First FeedBack  </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.firstFeedback}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p> Fifth FeedBack   </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.fifthFeedback}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p> Fifteenth FeedBack  </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.fifteenthFeedback}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p> Bottle Send   </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.bottleSend}</p>
              </Col>
            </Row>
            <Row>
              <Col span={10}></Col>
              <Col span={12}>
                <Button type="primary" onClick={showDrawerEdit}>
                  {/* <FormattedMessage id="pages.searchTable.addTeacher" defaultMessage="Add Teacher" /> */}
                  Edit Student
                </Button>
              </Col>
            </Row>
            </TabPane>

            <TabPane tab="Payment Details"  disabled key="5"> 
            < Row style={{ fontWeight: 600 }} gutter={(40, 60)}>
              <Col span={7}></Col>
              <Col span={6}>
                <p> payment ID </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.paymentid}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p> Plan type   </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.plantype}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p> Class type    </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.classtype}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p> No. of classes sold  </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.classessold}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p> Sale amount </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.saleamount}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p> Date of Sale </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.dateofsale}</p>
              </Col>
               <Col span={7}></Col>
              <Col span={6}>
                <p> Downpayment  </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.downpayment}</p>
              </Col>
               <Col span={7}></Col>
              <Col span={6}>
                <p>Due date of plan </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.duedate}</p>
              </Col>
               <Col span={7}></Col>
              <Col span={6}>
                <p>No. of delayed payments     </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.no_of_delayed_payments}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Date of delayed payment </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.delay_date}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Status of delayed payment </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.delay_status}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Notes </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.notes}</p>
              </Col>
            </Row>
            
            </TabPane>


            </Tabs>
          </>
        ) : (
          <>
           <Tabs defaultActiveKey="1" onChange={callback}>
            <TabPane tab="Student Info" key="1"> 
            <Form onFinish={handleFormSubmitEdit}> 
              <Row gutter={16}>
              <Col span={12}>
                  <Form.Item name="studentID">
                    <Input
                      placeholder="Student ID"
                      name="studentID"
                      defaultValue={tempDataView.studentID}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="firstName"
                  >
                    <Input
                      placeholder="First Name"
                      name="firstName"
                      defaultValue={tempDataView.firstName}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="lastName"
                  >
                    <Input
                      placeholder="Last Name"
                      name="lastName"
                      defaultValue={tempDataView.lastName}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="dob">

                  {tempDataView.dob === null ?
                      <DatePicker


                        format="YYYY/MM/DD"
                        style={{ width: "355px" }}
                        onChange={(date, dateString) => {
                          setDob(dateString);
                        }}
                        placeholder={"Date of Birth"}
                      />
                      :
                      <DatePicker
                        defaultValue={moment(`${tempDataView.dob}`, "YYYY/MM/DD")}
                        format="YYYY/MM/DD"
                        style={{ width: "355px" }}
                        onChange={(date, dateString) => {
                          setDob(dateString);
                        }}
                        placeholder={"Date of Birth"}
                      />

                    }
                                 
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="age">
                    <Input
                      placeholder="Age"
                      name="age"
                      defaultValue={tempDataView.age}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>

                
                <Col span={12}>
                  <Form.Item
                    name="countryCode">
                    <Select placeholder="Select a country" onChange={handleCountry} defaultValue={defaultCountry.map(name => name.name)}>
                      {allCountries.map((country) => {
                        return <Option value={country.name} key={country.code}>{country.name}</Option>
                      })}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="phoneNumber">
                    <Input
                      placeholder="Enter Mobile Number"
                      name="phoneNumber"
                      defaultValue={tempDataView.phoneNumber}
                      onChange={handleFormChange}
                    //prefix = {selectCountryCode?selectCountryCode:DEFAULT_COUNTRY_CODE_NUMBER}
                    />

                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="alternativeMobile">
                    <Input
                      placeholder="Alternative Contact No"
                      name="alternativeMobile"
                      defaultValue={tempDataView.alternativeMobile}
                      // onChange={handleFormChange}
                      prefix={selectCountryCode ? selectCountryCode : DEFAULT_COUNTRY_CODE_NUMBER}
                    />
                    {error ? (
                      <p style={{ color: 'red' }}>{error}</p>
                    ) : ''}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                  >
                    <Input
                      placeholder="Email"
                      name="email"
                      defaultValue={tempDataView.email}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item name="address">
                    <Input
                      placeholder="Address"
                      name="address"
                      defaultValue={tempDataView.address}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="watsappGroup">
                    <Input
                      placeholder="whatsappGroup"
                      name="watsappGroup"
                      defaultValue={tempDataView.watsappGroup}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>


                <Col span={12}>
                  <Form.Item name="status	">
                    <Select
                      defaultValue={tempDataView.status == 'active'
                        ? "Active"
                        : tempDataView.status == 'onhold'
                          ? "OnHold"
                          : tempDataView.status == 'leave'
                            ? "Leave"
                            : "InActive"}
                      onChange={(value) => {
                        setSelectStatus(value);
                      }}
                    >
                      <Option value="active">Active</Option>
                      <Option value="leave">Leave</Option>
                      <Option value="onhold">On Hold</Option>
                    </Select>
                  </Form.Item>
                </Col>    
                <Col span={12}>
                  <Form.Item name="poc">
                    <Input
                      placeholder="poc"
                      name="poc"
                      defaultValue={tempDataView.poc}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item name="classType">
                    <Input
                      placeholder="Kids/Adults"
                      name="classType"
                      defaultValue={tempDataView.classType}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>            
                
               
             </Row>
              <Row>
                <Col span={8}>
                  <Input
                    type="submit"
                    value="Save Changes"
                    style={{ color: "white", backgroundColor: "DodgerBlue" }}
                  />
                </Col>
                <Col span={8}></Col>
                <Col span={8}>
                  <Button
                    onClick={() => { openNotification(tempDataView.userId) }}
                    block
                    type="primary"
                  >
                    Delete
                  </Button>
                </Col>
              </Row>
            </Form>
            </TabPane>

            <TabPane tab="Learning journey" key="2"> 
            <Form onFinish={handleFormSubmitEdit}> 
            <Row  gutter={16}>
              <Col span={12}>
                  <Form.Item
                    name="teacherName"

                  >
                    <Input
                      placeholder="Teacher Name"
                      name="teacherName"
                      defaultValue={tempDataView.teacherName}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item name="batchCode">
                    <Input
                      placeholder="Batch Code"
                      name="batchCode"
                      defaultValue={tempDataView.batchCode}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item name="startDate">
                    {console.log('startdate')}
                    {console.log(startDate)}
                    {tempDataView.startDate === null ?
                      <DatePicker


                        format="YYYY/MM/DD"
                        style={{ width: "355px" }}
                        onChange={(date, dateString) => {
                          setStartDate(dateString);
                        }}
                        placeholder={"Classes Start Date"}
                      />
                      :
                      <DatePicker
                        defaultValue={moment(`${tempDataView.startDate}`, "YYYY/MM/DD")}
                        format="YYYY/MM/DD"
                        style={{ width: "355px" }}
                        onChange={(date, dateString) => {
                          setStartDate(dateString);
                        }} />
                    }

                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item name="endDate">
                  {tempDataView.startDate === null ?
                      <DatePicker


                        format="YYYY/MM/DD"
                        style={{ width: "355px" }}
                        onChange={(date, dateString) => {
                          setEndDate(dateString);
                        }}
                        placeholder={"Classes End Date"}
                      />
                      :
                      <DatePicker
                        defaultValue={moment(`${tempDataView.endDate}`, "YYYY/MM/DD")}
                        format="YYYY/MM/DD"
                        style={{ width: "355px" }}
                        onChange={(date, dateString) => {
                          setEndDate(dateString);
                        }}
                        placeholder={"End Date"}
                      />

                    }
                  </Form.Item>
                </Col><Col span={12}>
                  <Form.Item name="startLesson">
                    
                  {tempDataView.startDate === null ?
                      <DatePicker


                        format="YYYY/MM/DD"
                        style={{ width: "355px" }}
                        onChange={(date, dateString) => {
                          setStartLesson(dateString);
                        }}
                        placeholder={"Lesson Start Date"}
                      />
                      :
                      <DatePicker
                        defaultValue={moment(`${tempDataView.startLesson}`, "YYYY/MM/DD")}
                        format="YYYY/MM/DD"
                        style={{ width: "355px" }}
                        onChange={(date, dateString) => {
                          setStartLesson(dateString);
                        }}
                        placeholder={"Lesson Start Date"}
                      />

                    }
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="crossedEndDate">
                    <Input
                      placeholder="crossed End Date"
                      name="crossedEndDate"
                      defaultValue={tempDataView.crossedEndDate}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="classesCompleted">
                    <Input
                      placeholder="No of Classes Completed"
                      name="classesCompleted"
                      defaultValue={tempDataView.classesCompleted}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
               </Col>
               <Col span={12}>
                  <Form.Item name="days">
                    <Input
                      placeholder="Days"
                      name="days"
                      defaultValue={tempDataView.days}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
               <Col span={12}>
                  <Form.Item name="comments">
                    <Input
                      placeholder="comments"
                      name="comments"
                      defaultValue={tempDataView.comments}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>

              </Row>  
            <Row>
                <Col span={8}>
                  <Input
                    type="submit"
                    value="Save Changes"
                    style={{ color: "white", backgroundColor: "DodgerBlue" }}
                  />
                </Col>
                <Col span={8}></Col>
                <Col span={8}>
                  <Button
                    onClick={() => { openNotification(tempDataView.userId) }}
                    block
                    type="primary"
                  >
                    Delete
                  </Button>
                </Col>
              
                </Row>
            </Form>

            </TabPane>
            <TabPane tab="Referral" key="3"> 
            <Form onFinish={handleFormSubmitEdit}> 
            <Row gutter={16}>
            <Col span={12}>
                  <Form.Item name="referralCode">
                    <Input
                      placeholder="Referral Code"
                      name="referralCode"
                      defaultValue={tempDataView.referralCode}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="customersReferred">
                    <Input
                      placeholder="Number of customers referred"
                      name="customersReferred"
                      defaultValue={tempDataView.customersReferred}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
               </Col>
               </Row>
            <Row>
                <Col span={8}>
                  <Input
                    type="submit"
                    value="Save Changes"
                    style={{ color: "white", backgroundColor: "DodgerBlue" }}
                  />
                </Col>
                <Col span={8}></Col>
                <Col span={8}>
                  <Button
                    onClick={() => { openNotification(tempDataView.userId) }}
                    block
                    type="primary"
                  >
                    Delete
                  </Button>
                </Col>
              
                </Row>
                </Form>
            </TabPane>
            <TabPane tab="QE checklist" key="4"> 
            <Form onFinish={handleFormSubmitEdit}> 
            <Row gutter={16}>
              <Col span={12}>
                  <Form.Item name="firstFeedback">
                    First FeedBack <Switch  defaultChecked={tempDataView.firstFeedback} onChange={(value) => {
                      setFirstFeedback(value)
                    }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="bottleSend">
                    Bottle Send <Switch defaultChecked={tempDataView.bottleSend} onChange={(value) => {
                      setBottleSend(value)
                    }} /> <br />
                  </Form.Item>
                </Col>
                <Col span={15}>
                  <Form.Item name="fifthFeedback">
                    Fifth FeedBack <Switch defaultChecked={tempDataView.fifthFeedback} onChange={(value) => {
                      setFirthFeedback(value)
                    }} />
                  </Form.Item>
                </Col>
                <Col span={15}>
                  <Form.Item name="fifteenthFeedback">
                    Fifteenth FeedBack <Switch defaultChecked={tempDataView.fifteenthFeedback} onChange={(value) => {
                      setFifteenthFeedBack(value)
                    }} />
                  </Form.Item>
                </Col>
                </Row>
               <Row>
                <Col span={8}>
                  <Input
                    type="submit"
                    value="Save Changes"
                    style={{ color: "white", backgroundColor: "DodgerBlue" }}
                  />
                </Col>
                <Col span={8}></Col>
                <Col span={8}>
                  <Button
                    onClick={() => { openNotification(tempDataView.userId) }}
                    block
                    type="primary"
                  >
                    Delete
                  </Button>
                </Col>
              
                </Row>
            </Form>
            </TabPane>
            <TabPane tab="Payment Details"  disabled key="5"> 
            <Form onFinish={handleFormSubmitEdit}> 
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="paymentid">
                    <Input
                      placeholder="payment ID"
                      name="paymentid"
                     defaultValue={tempDataView.paymentid}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col> 
                <Col span={12}>
                  <Form.Item name="plantype">
                    <Input
                      placeholder="Plan type"
                      name="plantype"
                     defaultValue={tempDataView.plantype}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col> 
                <Col span={12}>
                  <Form.Item name="classtype">
                    <Input
                      placeholder="Class type"
                      name="classtype"
                      defaultValue={tempDataView.classtype}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="classessold">
                    <Input
                      placeholder="No. of classes sold"
                      name="classessold"
                      defaultValue={tempDataView.classessold}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col> <Col span={12}>
                  <Form.Item name="saleamount">
                    <Input
                      placeholder="Sale amount"
                      name="saleamount"
                     defaultValue={tempDataView.saleamount}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col> 
                 <Col span={12}>
                  <Form.Item name="dateofsale">
                    <Input
                      placeholder="Date of Sale"
                      name="dateofsale"
                      defaultValue={tempDataView.dateofsale}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col> 
                <Col span={12}>
                  <Form.Item name="downpayment">
                    <Input
                      placeholder="Downpayment"
                      name="downpayment"
                      defaultValue={tempDataView.downpayment}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item name="duedate">
                    <Input
                      placeholder="Due date of plan"
                      name="duedate"
                      defaultValue={tempDataView.duedate}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="no_of_delayed_payments">
                    <Input
                      placeholder="No. of delayed payments"
                      name="no_of_delayed_payments"
                      defaultValue={tempDataView.no_of_delayed_payments}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item name="delay_date ">
                    <Input
                      placeholder="Date of delayed payment"
                      name="delay_date "
                     defaultValue={tempDataView.delay_date}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="delay_status">
                    <Input
                      placeholder="Status of delayed payment"
                      name="delay_status "
                     defaultValue={tempDataView.delay_status}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="notes">
                    <Input
                      placeholder="Notes"
                      name="notes "
                      defaultValue={tempDataView.notes}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>
                </Row>
                <Row>
                <Col span={8}>
                  <Input
                    type="submit"
                    value="Save Changes"
                    style={{ color: "white", backgroundColor: "DodgerBlue" }}
                  />
                </Col>
                <Col span={8}></Col>
                <Col span={8}>
                  <Button
                    onClick={() => { openNotification(tempDataView.userId) }}
                    block
                    type="primary"
                  >
                    Delete
                  </Button>
                </Col>
              
                </Row>
            </Form>
            </TabPane>
            </Tabs>


          </>        )}
      </Drawer>
    </PageContainer>
  );
};

export default StudentsBatchList;

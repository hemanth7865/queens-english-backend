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
  Space
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
  teacherRemove,
} from "@/services/ant-design-pro/api";

import Icon from "@ant-design/icons";
import "./index.css";
import Availability from "./availability";
import moment from "moment";
import WeekdaySchedule from "./components/WeekdaySchedule";
import { parse, format } from "date-fns";

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

const openNotificationWithIcon = type => {
  notification[type]({
    message: type == 'error'?'Failed to add teacher': 'Success! Teacher Added',
    description:
      '',
  });
  setTimeout(() => {
    window.location.reload()
  }, 1000);
};




const TeacherBatchList: React.FC = () => {
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

  //form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    joiningDate: "",
    type:"student",
    email: "",
    address: "",
    startDate: "",
    dateOfBirth: "",
    gender: "",
    mobile: "",
    whatsapp: "",
    nationality: "",
    category: "",
    education: "",
    experience: "",
    teacherType: "",
    languages: "",
    resume: "",
    videoProfile: "",
    certificate: "",
    photo: "",
    leadAvailability: null,
    status: "",
  });

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [tempDataView, setTempDataView] = useState({});

  const [selectUserType, setSelectUserType] = useState('')
  const [selectStatus, setSelectStatus] = useState('')
  const [error, setError] = useState('')




  const [endDate, setEndDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startLesson, setStartLesson] = useState("");


  //state for select option
  const [selectValue, setSelectValue] = useState("");
  const [selectTeacher, setSelectTeacher] = useState("");


  //state for adding images
  const [uploadResume, setUploadResume] = useState();

  const [selectLead1, setSelectLead1] = useState([]);

  //state for adding datepicker
  const [dateJoining, setDateJoining] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateBirth, setDateOfBirth] = useState("");
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
      let msg = await teacherBatchesView(id);
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      setTempDataView(msg.data);
      console.log('view one',msg);
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
          defaultMessage="Mobile"
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
      dataIndex: 'batchcode',
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
              defaultMessage="In Active"
            />
          ),
          status: "In Active",
        },
      },
    },   {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleView"
          defaultMessage="view"
        />
      ),
      dataIndex: "view",
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              console.log('entity', entity);
              handleOneView(entity.leadId);
              setCurrentRow(entity);
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
          defaultMessage="edit"
        />
      ),
      dataIndex: "edit",
      hideInSearch: true,
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              console.log('entity',entity);
              setShowDetail(true);
              handleOneView(entity.leadId);
              setCurrentRow(entity);
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
          defaultMessage="delete"
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


  const handleSelectChange = (value) => {
    console.log("status", value);
    setSelectValue(value);
  };

  const dateFormat = "HH:mm:ss";

  const handleFormSubmit = async () => {
    console.log("form submitted");
    const dataForm = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.mobile,
      countryCode: selectCountryCode ? selectCountryCode : DEFAULT_COUNTRY_CODE_NUMBER,
      email: formData.email,
      type: 'student',
      status :selectStatus,
      studentName : formData.studentName,
      teacherName : formData.teacherName,
      mobile : formData.mobile,
      batchCode : formData.batchCode,
      alternativeMobile : formData.alternativeMobile,
      studentID : formData.studentID,
      age :	 formData.age,
      address : formData.address,
      classType : formData.classType,
      referralCode : formData.referralCode,
      days : formData.days,
      kids : formData.kids,
      dateOfBirth : formData.dateofBirth,
      poc : formData.poc,
      startDate : formData.startDate,
      endDate : formData.endDate,
      startLesson : formData.startLesson,
      firstFeedback : formData.firstFeedback,
      fifthFeedback : formData.fifthFeedback,
      fifteenthFeedback : formData.fifteenthFeedback,
      classesCompleted : formData.classesCompleted,
      customersReferred : formData.customersReferred,
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
      if(msg){
        window.location.reload();
        openNotificationWithIcon('success')
      }
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      console.log(msg);
    } catch (error) {
      console.log("addRule error", error);
      const defaultLoginFailureMessage = intl.formatMessage({
        id: "pages.login.failure",
        defaultMessage: "登录失败，请重试！",
      });
      openNotificationWithIcon('error')
      message.error(defaultLoginFailureMessage);
    }
    setVisible(false);
    // console.log('formData', formData);
    console.log("dataForm", dataForm);
  };

  const handleFormSubmitEdit = async () => {
    console.log("form submitted");
    const dataForm = {
      firstName:formData.firstName? formData.firstName: tempDataView.firstName,
      lastName:formData.lastName?formData.lastName:tempDataView.lastName,
      phoneNumber:formData.phoneNumber?formData.phoneNumber:tempDataView.mobile,
      countryCode:formData.countryCode?formData.countryCode:tempDataView.mobile,
      email:formData.email?formData.email:tempDataView.email,
      type:formData.type?formData.type:'student',
      status:formData.status?formData.status:tempDataView.status,
      studentName:formData.studentName?formData.studentName : tempDataView.studentName,
      teacherName:formData.teacherName?formData.teacherName : tempDataView.teacherName,
      mobile:formData.mobile?formData.mobile : tempDataView.mobile,
      batchCode:formData.batchCode?formData.batchCode : tempDataView.batchCode,
      alternativeMobile:formData.alternativeMobile?formData.alternativeMobile : tempDataView.alternativeMobile,
      studentID:formData.studentID?formData.studentID : tempDataView.studentID,
      age:formData.age?formData.age:	 tempDataView.age,
      address:formData.address?formData.address : tempDataView.address,
      classType:formData.classType?formData.classType : tempDataView.classType,
      referralCode:formData.referralCode?formData.referralCode : tempDataView.referralCode,
      days:formData.days?formData.days : tempDataView.days,
      kids:formData.kids?formData.kids : tempDataView.kids,
      dateOfBirth:formData.dateOfBirth?formData.dateOfBirth : tempDataView.dateofBirth,
      poc:formData.poc?formData.poc : tempDataView.poc,
      startDate:formData.startDate?formData.startDate : tempDataView.startDate,
      endDate:formData.endDate?formData.endDate : tempDataView.endDate,
      startLesson:formData.startLesson?formData.startLesson : tempDataView.startLesson,
      firstFeedback:formData.firstFeedback?formData.firstFeedback : tempDataView.firstFeedback,
      fifthFeedback:formData.fifthFeedback?formData.fifthFeedback : tempDataView.fifthFeedback,
      fifteenthFeedback:formData.fifteenthFeedback?formData.fifteenthFeedback : tempDataView.fifteenthFeedback,
      classesCompleted:formData.classesCompleted?formData.classesCompleted : tempDataView.classesCompleted,
      customersReferred:formData.customersReferred?formData.customersReferred  : tempDataView.customersReferred,
    };
    // async (values: API.LoginParams) => {
    if (tempDataView) {
      dataForm.userId = tempDataView.id;
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
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
        openNotificationWithIcon('success')
      }
      if(msg){
        openNotificationWithIcon('success')
      }
      console.log(msg);
      // 如果失败去设置用户错误信息
      // setUserLoginState(msg);
    } catch (error) {
      console.log("addRule error", error);
      const defaultLoginFailureMessage = intl.formatMessage({
        id: "pages.login.failure",
        defaultMessage: "登录失败，请重试！",
      });
      message.error(defaultLoginFailureMessage);
      if(msg){
        openNotificationWithIcon('error')
      }
    }
    console.log("formData", formData);
    console.log("dataForm", dataForm);
    onClose();
  };

  let leadAvailabilities = [];
  //console.log('LA',  leadAvailabilities)
  //lead availability
  const WeekdayAvailability = (props) => {
    const [value, setValue] = useState({
      start_slot: "",
      end_slot: "",
    });
    const [value1, setValue1] = useState({
      weekday: "",
    });

    const leadWeekAvailability = {
      start_slot: value[0],
      end_slot: value[1],
      weekday: props.weekday,
      start_date: dateStart,
    };

    let dataLead = props.tempData;
    let slotStart, slotEnd;
    let leadSlot;
    if (dataLead) {
      //console.log('le', dataLead.toString().split(',')[0].slice(4))
      dataLead = dataLead.toString();
      slotStart = dataLead.split(",")[0].slice(4);
      slotEnd = dataLead.split(",")[1];
      console.log("slotss", slotStart);
      leadSlot = {
        start_slot: slotStart,
        end_slot: slotEnd,
        start_date: dateStart?dateStart:tempDataView.startDate,
        weekday: props.weekday,
      };
    }
    if (
      leadWeekAvailability.start_slot &&
      leadWeekAvailability.end_slot &&
      leadWeekAvailability.weekday
    ) {
      leadAvailabilities.push(leadWeekAvailability);
    }
    if (dataLead) {
      leadAvailabilities.push(leadSlot);
      //console.log('Laa', leadAvailabilities)
    }

    const format = "HH:mm";
    return (
      <Row style = {{margin: 5}}>
        
        <Col span={7}>
          {dataLead ? (
            <Checkbox name="weekday" checked="true" onChange={(e) => setValue1(props.weekday)}>
              {props.week}
            </Checkbox>
          ) : (
            <Checkbox name="weekday" onChange={(e) => setValue1(props.weekday)}>
              {props.week}
            </Checkbox>
          )}
        </Col>
        <Col span={14}>
          {dataLead ? (
            <TimePicker.RangePicker
              format={format}
              defaultValue={[
                moment(`${slotStart}`, format),
                moment(`${slotEnd}`, format),
              ]}
              onChange={(time, timeString) => {
                setValue(timeString);
              }}
            />
          ) : (
            <TimePicker.RangePicker
              format={format}
              onChange={(time, timeString) => {
                setValue(timeString);
              }}
            />
          )}
        </Col>
        <Col span={1}>
          <a>
            <PlusOutlined />
          </a>
        </Col>
        <Col span={2}>
          <a>
            <DeleteOutlined />
          </a>
        </Col>
      </Row>
    );
  };
  let timeSlots = tempDataView ? tempDataView.slots : "";
  let monday, tuesday, wednesday, thursday, friday, saturday, sunday;
  if (timeSlots) {
    timeSlots = timeSlots
      .split("to")
      .toString()
      .split(" , ")
      .toString()
      .split(" ");
    monday = timeSlots.filter((lead) => {
      return lead.startsWith("Mon");
    });
    tuesday = timeSlots.filter((lead) => {
      return lead.startsWith("Tue");
    });
    wednesday = timeSlots.filter((lead) => {
      return lead.startsWith("Wed");
    });
    thursday = timeSlots.filter((lead) => {
      return lead.startsWith("Thu");
    });
    friday = timeSlots.filter((lead) => {
      return lead.startsWith("Fri");
    });
    saturday = timeSlots.filter((lead) => {
      return lead.startsWith("Sat");
    });
    sunday = timeSlots.filter((lead) => {
      return lead.startsWith("Sun");
    });
  }
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
    console.log("clicked delete teacher");
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
            <Form onFinish={handleFormSubmit}>
              
              <Row gutter={16}>
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
                                onChange={handleSelectChange}
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
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="teacherName"
                            rules={[{
                                required: true,
                                min: 2,
                                type: 'string',
                                pattern: /^[a-zA-Z]*$/,
                            }]}
                        >
                            <Input
                                placeholder="Teacher Name"
                                name="teacherName"
                                onChange={handleSelectChange}
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
                        <Form.Item name="mobile">
                            <Input
                                placeholder="Enter Mobile Number"
                                name="mobile"
                                onChange={handleMobileChange}
                             prefix = {selectCountryCode?selectCountryCode:DEFAULT_COUNTRY_CODE_NUMBER}
                            />
                            {error ? (
                                <p style={{ color: 'red' }}>{error}</p>
                            ) : ''}
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="alternativeMobile">
                            <Input
                                placeholder="Alternative Contact No"
                                name="alternativeMobile"
                                onChange={handleMobileChange}
                             prefix = {selectCountryCode?selectCountryCode:DEFAULT_COUNTRY_CODE_NUMBER}
                            />
                            {error ? (
                                <p style={{ color: 'red' }}>{error}</p>
                            ) : ''}
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
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                        <Form.Item name="status	" rules={[{ required: true }]}>
                            <Select
                                placeholder="Status	"
                                onChange={(value) => { setSelectStatus(value) }}
                            >
                                <Option value="active">Active</Option>
                                <Option value="inactive">Inactive</Option>
                                <Option value="onhold">On Hold</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="batchCodes">                    
                            <Input
                                placeholder="Batch Code"
                                name="batchCodes"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="studentID">                    
                            <Input
                                placeholder="Student ID"
                                name="studentID"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                <Col span={12}>
                  <Form.Item name="dateOfBirth">
                    <DatePicker
                      format="YYYY/MM/DD"
                      style={{ width: "210px" }}
                      onChange={(date, dateString) => {
                        setDateOfBirth(dateString);
                      }}
                      placeholder={"Date Of Birth"}
                    />
                  </Form.Item>
                </Col>
                    <Col span={12}>
                        <Form.Item name="age">                    
                            <Input
                                placeholder="Age"
                                name="age"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="address">                    
                            <Input
                                placeholder="Address"
                                name="address"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="classType">                    
                            <Input
                                placeholder="Class type"
                                name="classType"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="poc">                    
                            <Input
                                placeholder="poc"
                                name="poc"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="days">                    
                            <Input
                                placeholder="Days"
                                name="days"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="kids">                    
                            <Input
                                placeholder="Kids/Adults"
                                name="kids"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="referralCode">                    
                            <Input
                                placeholder="Referral Code"
                                name="referralCode"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                   
                <Col span={12}>
                  <Form.Item name="startDate">
                    <DatePicker
                      format="YYYY/MM/DD"
                      style={{ width: "210px" }}
                      onChange={(date, dateString) => {
                        setStartDate(dateString);
                      }}
                      placeholder={"Start Date"}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="endDate">
                    <DatePicker
                      format="YYYY/MM/DD"
                      style={{ width: "210px" }}
                      onChange={(date, dateString) => {
                        setEndDate(dateString);
                      }}
                      placeholder={"Start Lesson"}
                    />
                  </Form.Item>
                </Col><Col span={12}>
                  <Form.Item name="startLesson">
                    <DatePicker
                      format="YYYY/MM/DD"
                      style={{ width: "210px" }}
                      onChange={(date, dateString) => {
                        setStartLesson(dateString);
                      }}
                      placeholder={"End Date"}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                        <Form.Item name="classesCompleted">                    
                            <Input
                                placeholder="No of Classes Completed"
                                name="classesCompleted"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="customersReferred">                    
                            <Input
                                placeholder="Number of customers referred"
                                name="customersReferred"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="comments">                    
                            <Input
                                placeholder="comments"
                                name="comments"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="crossedEndDate">                    
                            <Input
                                placeholder="crossed End Date"
                                name="crossedEndDate"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="watsappGroup">                    
                            <Input
                                placeholder="watsappGroup"
                                name="watsappGroup"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="bottleSend">                    
                            <Input
                                placeholder="Bottle Send"
                                name="bottleSend"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="firstFeedback">                    
                            <Input
                                placeholder="1st Class Feedback Completed"
                                name="firstFeedback"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="fifthFeedback">                    
                            <Input
                                placeholder="5th Class Feedback Completed"
                                name="fifthFeedback"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="fifteenthFeedback">                    
                            <Input
                                placeholder="15th Class Feedback Completed"
                                name="fifteenthFeedback"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
      </Row>

              <Input
                type="submit"
                value="Add Student"
                style={{ color: "white", backgroundColor: "DodgerBlue" }}
              />
            </Form>
          </Drawer>,
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
            <Row style={{ fontWeight: 500 }} gutter={(40, 60)}>
              <Col span={7}>Photo</Col>
              <Col span={6}>
                <p>Name</p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.firstName + " " + tempDataView.lastName}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Mobile </p>
              </Col>
              <Col span={11}>
                <p>
                  {tempDataView.countryCode} + {tempDataView.mobile}
                </p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Email</p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.email}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Type </p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.type}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Status </p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.status}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>StudentName </p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.studentName}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>TeacherName </p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.teacherName}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>BatchCode </p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.batchCode}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>AlternativeMobile </p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.alternativeMobile}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>StudentID </p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.studentID}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Age </p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.age}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Address </p>
              </Col>
              <Col span={11}>
                <p>
                  {tempDataView.address}
                </p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>ClassType </p>
              </Col>
              <Col span={11}>
                <p>
                  {tempDataView.classType}
                </p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>ReferralCode </p>
              </Col>
              <Col span={11}>
                <p>
                  {tempDataView.referralCode}
                </p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Days </p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.days}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Kids </p>
              </Col>
              <Col span={11}>
                <p>
                  {" "}
                  {tempDataView.kids}
                </p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p> DateOfBirth </p>
              </Col>
              <Col span={11}>
                <p>
                  {tempDataView.dateOfBirth}
                </p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>POC </p>
              </Col>
              <Col span={11}>
                <p>
                  {tempDataView.poc}
                </p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>startDate</p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.startDate}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>EndtDate</p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.endtDate}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>StartLesson</p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.startLesson}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>First Feedback</p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.firstFeedback}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Fifth Feedback</p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.fifthFeedback}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>Fifteenth Feedback</p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.fifteenthFeedback}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>ClassesCompleted</p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.classesCompleted}</p>
              </Col>
              <Col span={7}></Col>
              <Col span={6}>
                <p>CustomersReferred</p>
              </Col>
              <Col span={11}>
                <p>{tempDataView.customersReferred}</p>
              </Col>
            </Row>
            <br />
            <Row>
              <Col span={10}></Col>
              <Col span={12}>
                <Button type="primary" onClick={showDrawerEdit}>
                  {/* <FormattedMessage id="pages.searchTable.addTeacher" defaultMessage="Add Teacher" /> */}
                  Edit Student
                </Button>
              </Col>
            </Row>
          </>
        ) : (
          <>
            <Form onFinish={handleFormSubmitEdit}>
            <Row gutter={16}>
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
                                onChange={handleSelectChange}
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
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="teacherName"
                            rules={[{
                                required: true,
                                min: 2,
                                type: 'string',
                                pattern: /^[a-zA-Z]*$/,
                            }]}
                        >
                            <Input
                                placeholder="Teacher Name"
                                name="teacherName"
                                onChange={handleSelectChange}
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
                        <Form.Item name="mobile">
                            <Input
                                placeholder="Enter Mobile Number"
                                name="mobile"
                                onChange={handleMobileChange}
                             prefix = {selectCountryCode?selectCountryCode:DEFAULT_COUNTRY_CODE_NUMBER}
                            />
                            {error ? (
                                <p style={{ color: 'red' }}>{error}</p>
                            ) : ''}
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="alternativeMobile">
                            <Input
                                placeholder="Alternative Contact No"
                                name="alternativeMobile"
                                onChange={handleMobileChange}
                             prefix = {selectCountryCode?selectCountryCode:DEFAULT_COUNTRY_CODE_NUMBER}
                            />
                            {error ? (
                                <p style={{ color: 'red' }}>{error}</p>
                            ) : ''}
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
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                        <Form.Item name="status	" rules={[{ required: true }]}>
                            <Select
                                placeholder="Status	"
                                onChange={(value) => { setSelectStatus(value) }}
                            >
                                <Option value="active">Active</Option>
                                <Option value="inactive">Inactive</Option>
                                <Option value="onhold">On Hold</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="batchCodes">                    
                            <Input
                                placeholder="Batch Code"
                                name="batchCodes"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="studentID">                    
                            <Input
                                placeholder="Student ID"
                                name="studentID"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                <Col span={12}>
                  <Form.Item name="dateOfBirth">
                    <DatePicker
                      format="YYYY/MM/DD"
                      style={{ width: "210px" }}
                      onChange={(date, dateString) => {
                        setDateOfBirth(dateString);
                      }}
                      placeholder={"Date Of Birth"}
                    />
                  </Form.Item>
                </Col>
                    <Col span={12}>
                        <Form.Item name="age">                    
                            <Input
                                placeholder="Age"
                                name="age"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="address">                    
                            <Input
                                placeholder="Address"
                                name="address"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="classType">                    
                            <Input
                                placeholder="Class type"
                                name="classType"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="poc">                    
                            <Input
                                placeholder="poc"
                                name="poc"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="days">                    
                            <Input
                                placeholder="Days"
                                name="days"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="kids">                    
                            <Input
                                placeholder="Kids/Adults"
                                name="kids"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="referralCode">                    
                            <Input
                                placeholder="Referral Code"
                                name="referralCode"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                   
                <Col span={12}>
                  <Form.Item name="startDate">
                    <DatePicker
                      format="YYYY/MM/DD"
                      style={{ width: "210px" }}
                      onChange={(date, dateString) => {
                        setStartDate(dateString);
                      }}
                      placeholder={"Start Date"}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="endDate">
                    <DatePicker
                      format="YYYY/MM/DD"
                      style={{ width: "210px" }}
                      onChange={(date, dateString) => {
                        setEndDate(dateString);
                      }}
                      placeholder={"Start Lesson"}
                    />
                  </Form.Item>
                </Col><Col span={12}>
                  <Form.Item name="startLesson">
                    <DatePicker
                      format="YYYY/MM/DD"
                      style={{ width: "210px" }}
                      onChange={(date, dateString) => {
                        setStartLesson(dateString);
                      }}
                      placeholder={"End Date"}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                        <Form.Item name="classesCompleted">                    
                            <Input
                                placeholder="No of Classes Completed"
                                name="classesCompleted"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="customersReferred">                    
                            <Input
                                placeholder="Number of customers referred"
                                name="customersReferred"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="comments">                    
                            <Input
                                placeholder="comments"
                                name="comments"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="crossedEndDate">                    
                            <Input
                                placeholder="crossed End Date"
                                name="crossedEndDate"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="watsappGroup">                    
                            <Input
                                placeholder="watsappGroup"
                                name="watsappGroup"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="bottleSend">                    
                            <Input
                                placeholder="Bottle Send"
                                name="bottleSend"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="firstFeedback">                    
                            <Input
                                placeholder="1st Class Feedback Completed"
                                name="firstFeedback"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="fifthFeedback">                    
                            <Input
                                placeholder="5th Class Feedback Completed"
                                name="fifthFeedback"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="fifteenthFeedback">                    
                            <Input
                                placeholder="15th Class Feedback Completed"
                                name="fifteenthFeedback"
                                onChange={handleSelectChange}
                            />
                        </Form.Item>
                    </Col>
      

              <Input
                type="submit"
                value="Add Student"
                style={{ color: "white", backgroundColor: "DodgerBlue" }}
              />
              </Row>
            </Form>
         
          </>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TeacherBatchList;

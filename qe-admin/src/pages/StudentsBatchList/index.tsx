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
  Switch,
  Spin
} from "antd";
import * as CountryList from 'country-list';
import React, { useState, useRef } from "react";
import { useIntl, FormattedMessage, useAccess, Access } from "umi";
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

import {
  handleAPIResponse
} from "@/services/ant-design-pro/helpers";

import Icon from "@ant-design/icons";
import "./index.css";
import Availability from "./availability";
import moment from "moment";
import WeekdaySchedule from "./components/WeekdaySchedule";
import { parse, format } from "date-fns";
import { Tabs } from 'antd';
import PhoneNumberCountrySelect from "@/components/PhoneNumberCountrySelect";
import Rebatching from "./components/Rebatching";
import StudentBatchesHistory from "./components/StudentBatchesHistory";
import access from "@/access";
import { AlignType } from 'rc-table/lib/interface';

const { TabPane } = Tabs;

const callback = (key) => {
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
    setTimeout(function () {
      window.location.reload(1);
    }, 1800);
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
    setTimeout(function () {
      window.location.reload(1);
    }, 1800);
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
    setTimeout(function () {
      window.location.reload(1);
    }, 1800);
    return false;
  }
};

const DEFAULT_COUNTRY_CODE_NUMBER = "91";

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectCountry, setSelectCountry] = useState('IN')
  const [selectCountryCode, setSelectCountryCode] = useState(91)
  const [bottleSend, setBottleSend] = useState(false)
  const [firstFeedback, setFirstFeedback] = useState(false)
  const [fifthFeedback, setFifthFeedback] = useState(false)
  const [fifteenthFeedback, setFifteenthFeedback] = useState(false)
  const [selectClasstype, setSelectClasstype] = useState("");
  const [selectPlantype, setSelectPlantype] = useState("");
  const [duedate, setDueDate] = useState("");
  const [delay_date, setDelayDate] = useState("");
  const [dateofsale, setSaleDate] = useState("");
  const [assesmentDate, setAssesmentDate] = useState("");

  //Role Based Access
  const access = useAccess();

  //const [selectClassType, setSelectClassType] = useState('')
  const [status, setStatus] = useState("");
  const [isSibling, setIsSibling] = useState<number>(0);
  const [selectGender, setSelectGender] = useState('');
  const [selectWABatch, setWABatch] = useState("");
  const [selectLogApp, setLogApp] = useState("");
  const [formHook] = Form.useForm()

  //form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: '',
    email: '',
    status: '',
    gebder: '',
    studentName: '',
    teacherName: '',
    batchCode: '',
    alternativeMobile: '',
    age: null,
    address: '',
    referralCode: '',
    days: null,
    // kids: '',
    paymentid: '',
    dob: null,
    poc: '',
    startDate: null,
    classesStartDate: null,
    endDate: null,
    startLesson: null,
    firstFeedback: "",
    fifthFeedback: "",
    fifteenthFeedback: "",
    classesCompleted: '',
    customersReferred: '',
    plantype: '',
    classtype: '',
    classessold: '',
    saleamount: '',
    dateofsale: null,
    downpayment: '',
    duedate: null,
    no_of_delayed_payments: '',
    studentID: '',
    //  assesmentDate=null,
    delay_date: null,
    delay_status: '',
    notes: '',
    whatsapp: '',
    comments: '',
    pfirstName: '',
    plastName: '',
    incentive: '',
    classesPurchase: '',
    classesAttended: '',
    classesMissed: '',
    partner: '',
    course: '',
    lesson: '',
    // batchNo:'',
    //	batchTime
    //	batchSchedule
    startLesson: '',
    batchCode: '',
    assesmentComplete: '',
    assesmentMissed: '',
    averageScore: '',
    assesmentDate: null,
    startLesson: '',
    batchChange: '',
    prm_id: '',
    isSibling: null
    // crossedEndDate:null,

  });

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [tempDataView, setTempDataView] = useState({});
  const [showRebatching, setShowRebatching] = useState<boolean>(false);

  const [error, setError] = useState('')




  const [endDate, setEndDate] = useState();
  const [startDate, setStartDate] = useState();
  const [classesStartDate, setClassesStartDate] = useState("");
  const [crossedEndDate, setCrossedEndDate] = useState();
  const [startLesson, setStartLesson] = useState();

  //state for select option
  //  const [selectValue, setSelectValue] = useState("");
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
  }



  const intl = useIntl();

  const handleOneView = async (id) => {
    try {
      let msg = await studentsBatchesView(id);
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      setTempDataView(msg.data);
      setIsSibling(msg.data.isSibling);
      // handle phone number validation correctly for edit
      formHook.setFieldsValue({ phoneNumber: msg.data.phoneNumber, whatsapp: msg.data.whatsapp });
      // setDob(msg.data.dob);
      console.log('view one', msg);
    } catch (error) {
      console.log("error", error);
      setTimeout(function () {
        window.location.reload(1);
      }, 1800);
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
          defaultMessage="Primary Mobile No"
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
      hideInTable: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleprm"
          defaultMessage="PRM Name"
        />
      ),
      dataIndex: 'prm',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleStudentID"
          defaultMessage="Student ID"
        />
      ),
      dataIndex: 'id',
      // hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleLeadID"
          defaultMessage="Lead ID"
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
          id="pages.searchTable.titleage"
          defaultMessage="Age"
        />
      ),
      dataIndex: 'age',
      //hideInSearch: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titlestatus"
          defaultMessage="Status"
        />
      ),
      dataIndex: "status",
      hideInForm: true,
      valueEnum: {
        'enrolled': {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.enrolled"
              defaultMessage="Enrolled"
            />
          ),
          status: "enrolled",
        },
        'startclasslater': {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.startclasslater"
              defaultMessage="Start Class Later"
            />
          ),
          status: "startclasslater",
        },
        'batching': {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.batching"
              defaultMessage="Batching"
            />
          ),
          status: "batching",
        },
        'onboarding': {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.onboarding"
              defaultMessage="Onboarding"
            />
          ),
          status: "onboarding",
        },
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
        'Error': {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.error"
              defaultMessage="Error"
            />
          ),
          status: "Error",
        },
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

  const handleSelectChange = (value) => {
    console.log("status", value);
    setSelectValue(value);
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

  const handleFormSubmit = async () => {
    console.log("form submitted");
    setIsLoading(true);
    const dataForm = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      pfirstName: formData.pfirstName,
      plastName: formData.plastName,
      phoneNumber: formData.phoneNumber,
      //countryCode: selectCountryCode ? selectCountryCode : DEFAULT_COUNTRY_CODE_NUMBER,
      email: formData.email,
      type: 'student',
      status: status ? status : 'active',
      isSibling,
      studentName: formData.studentName,
      teacherName: formData.teacherName,
      batchCode: formData.batchCode,
      alternativeMobile: formData.alternativeMobile,
      age: dob ? moment(new Date()).diff(moment(dob, "YYYY-MM-DD"), 'years', true).toFixed(0) : null,
      address: formData.address,
      classType: formData.classType,
      referralCode: formData.referralCode,
      // days: formData.days,
      dob: dob,
      poc: formData.poc,
      startDate: formData.startDate,
      classesStartDate: classesStartDate ? classesStartDate : null,
      endDate: formData.endDate,
      startLesson: formData.startLesson,
      studentID: formData.studentID,
      firstFeedback: formData.firstFeedback,
      fifthFeedback: formData.fifthFeedback,
      fifteenthFeedback: formData.fifteenthFeedback,
      wabatch: selectWABatch,
      logApp: selectLogApp,

      bottleSend: bottleSend,
      classesCompleted: formData.classesCompleted,
      customersReferred: formData.customersReferred,
      whatsapp: formData.whatsapp,
      comments: formData.comments,
      crossedEndDate: formData.crossedEndDate,
      incentive: formData.incentive,
      //kids: formData.kids,
      classesPurchase: formData.classesPurchase,
      classesAttended: formData.classesAttended,
      classesMissed: formData.classesMissed,
      partner: formData.partner,
      course: formData.course,
      assesmentComplete: formData.assesmentComplete,
      assesmentMissed: formData.assesmentMissed,
      averageScore: formData.averageScore,
      assesmentDate: formData.assesmentDate,
      startLesson: formData.startLesson,
      batchChange: formData.batchChange,
      prm_id: formData.prm_id,
      payment: [
        {
          paymentid: formData.paymentid,
          plantype: selectPlantype,
          classtype: selectClasstype,
          classessold: formData.classessold,
          saleamount: formData.saleamount,
          dateofsale: dateofsale,
          downpayment: formData.downpayment,
          duedate: duedate,
          no_of_delayed_payments: formData.no_of_delayed_payments,
          delay_date: delay_date,
          delay_status: formData.delay_status,
          notes: formData.notes,

        }
      ],

    }

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

      handleAPIResponse(msg, "Student Added Successfully", "Failed To Add Student", setTimeout(function () {
        window.location.reload(1);
      }, 1800));
    } catch (error) {
      handleAPIResponse({ status: 400 }, "Student Added Successfully", "Failed To Add Student", setTimeout(function () {
        window.location.reload(1);
      }, 1800));
    }
    setVisible(false);
    setIsLoading(false);
  };

  const handleFormSubmitEdit = async () => {
    console.log("form submitted");
    setIsLoading(true);
    const dataForm = {
      firstName: formData.firstName ? formData.firstName : tempDataView.firstName,
      lastName: formData.lastName ? formData.lastName : tempDataView.lastName,
      pfirstName: formData.pfirstName ? formData.pfirstName : tempDataView.pfirstName,
      plastName: formData.plastName ? formData.plastName : tempDataView.plastName,
      phoneNumber: formData.phoneNumber ? formData.phoneNumber : tempDataView.phoneNumber,
      countryCode: formData.countryCode ? formData.countryCode : tempDataView.countryCode,
      email: formData.email ? formData.email : tempDataView.email,
      type: formData.type ? formData.type : 'student',
      status: status ? status : tempDataView.status,
      studentName: formData.studentName ? formData.studentName : tempDataView.studentName,
      teacherName: formData.teacherName ? formData.teacherName : tempDataView.teacherName,
      batchCode: formData.batchCode ? formData.batchCode : tempDataView.batchCode,
      alternativeMobile: formData.alternativeMobile ? formData.alternativeMobile : tempDataView.alternativeMobile,
      age: formData.dob == null ? moment(new Date()).diff(moment(tempDataView.dob, "YYYY-MM-DD"), 'years', true).toFixed(0) : tempDataView.dob == null ? moment(new Date()).diff(moment(formData.dob, "YYYY-MM-DD"), 'years', true).toFixed(0) : tempDataView.age == "NaN" ? null : tempDataView.age,
      address: formData.address ? formData.address : tempDataView.address,
      classType: formData.ClassType ? formData.ClassType : tempDataView.classType,
      referralCode: formData.referralCode ? formData.referralCode : tempDataView.referralCode,
      days: formData.days ? formData.days : tempDataView.days,
      isSibling: formData.isSibling === null ? isSibling : formData.isSibling,
      // kids: formData.kids ? formData.kids : tempDataView.kids,  
      dob: dob,
      poc: formData.poc ? formData.poc : tempDataView.poc,
      startDate: startDate,
      classesStartDate: classesStartDate ? classesStartDate : null,
      endDate: endDate,
      startLesson: startLesson,
      firstFeedback: formData.firstFeedback ? formData.firstFeedback : tempDataView.firstFeedback,
      fifthFeedback: formData.fifthFeedback ? formData.fifthFeedback : tempDataView.fifthFeedback,
      fifteenthFeedback: formData.fifteenthFeedback ? formData.fifteenthFeedback : tempDataView.fifteenthFeedback,
      bottleSend: bottleSend,
      classesCompleted: formData.classesCompleted ? formData.classesCompleted : tempDataView.classesCompleted,
      customersReferred: formData.customersReferred ? formData.customersReferred : tempDataView.customersReferred,
      whatsapp: formData.whatsapp ? formData.whatsapp : tempDataView.whatsapp,
      comments: formData.comments ? formData.comments : tempDataView.comments,
      studentID: formData.studentID ? formData.studentID : tempDataView.studentID,
      crossedEndDate: crossedEndDate,
      incentive: formData.incentive ? formData.incentive : tempDataView.incentive,
      prm_id: formData.prm_id ? formData.prm_id : tempDataView.prm_id,
      classesPurchase: formData.classesPurchase ? formData.classesPurchase : tempDataView.classesPurchase,
      //classesCompleted:formData.incentive?formData.incentive:tempDataView.incentive
      classesAttended: formData.classesAttended ? formData.classesAttended : tempDataView.classesAttended,
      classesMissed: formData.classesMissed ? formData.classesMissed : tempDataView.classesMissed,
      partner: formData.partner ? formData.partner : tempDataView.partner,
      course: formData.course ? formData.course : tempDataView.course,
      assesmentComplete: formData.assesmentComplete ? formData.assesmentComplete : tempDataView.assesmentComplete,
      assesmentMissed: formData.assesmentMissed ? formData.assesmentMissed : tempDataView.assesmentMissed,
      averageScore: formData.averageScore ? formData.averageScore : tempDataView.averageScore,
      assesmentDate: assesmentDate,
      startLesson: formData.startLesson ? formData.startLesson : tempDataView.startLesson,
      batchChange: formData.batchChange ? formData.batchChange : tempDataView.batchChange,

      payment: [
        {
          paymentid: formData.paymentid ? formData.paymentid : tempDataView.paymentid,
          plantype: selectPlantype ? selectPlantype : tempDataView.plantype,
          classtype: selectClasstype ? selectClasstype : tempDataView.classtype,
          classessold: formData.classessold ? formData.classessold : tempDataView.classessold,
          saleamount: formData.saleamount ? formData.saleamount : tempDataView.saleamount,
          dateofsale: dateofsale,
          downpayment: formData.downpayment ? formData.downpayment : tempDataView.downpayment,
          duedate: duedate,
          no_of_delayed_payments: formData.no_of_delayed_payments ? formData.no_of_delayed_payments : tempDataView.no_of_delayed_payments,
          delay_date: delay_date,
          delay_status: formData.delay_status ? formData.delay_status : tempDataView.delay_status,
          notes: formData.notes ? formData.notes : tempDataView.notes,
        }
      ],
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
      handleAPIResponse(msg, "Student Updated Successfully", "Failed To Update Student", setTimeout(function () {
        window.location.reload(1);
      }, 1800));
    } catch (error) {
      handleAPIResponse({ status: 400 }, "Student Updated Successfully", "Failed To Update Student", setTimeout(function () {
        window.location.reload(1);
      }, 1800));
    }
    onClose();
    setIsLoading(false);
  };

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

  if (access.canSuperAdmin) {
    // User is Super Admin
  }

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
          <div>
            <Access
              accessible={access.canSuperAdmin}
              fallback={<div> </div>}
            >
              <Button type="primary" key="primary" onClick={showDrawer}>
                Add Student
              </Button>
            </Access>
          </div>,
          <Drawer
            title="Add Student"
            placement="right"
            onClose={onClose}
            visible={visible}
            width={1100}
          >
            <Spin spinning={isLoading}>
              <Tabs defaultActiveKey="1" onChange={callback}>
                <TabPane tab="Student Info" key="1">
                  <Form onFinish={handleFormSubmit}>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="firstName"
                          label="First Name"
                          rules={[{
                            required: true,
                            min: 2,
                            type: 'string',
                            pattern: /^[a-zA-Z ]*$/,
                          }]}
                        >
                          <Input
                            placeholder="Student First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Last Name"
                          name="lastName"
                          rules={[{
                            required: true,
                            min: 2,
                            type: 'string',
                            pattern: /^[a-zA-Z]*$/,
                          }]}
                        >
                          <Input
                            placeholder="Student Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>

                      {<Col span={12}>
                        <Form.Item name="gender" label="Gender">
                          {console.log('tempDataView.gender')}
                          {console.log(tempDataView.gender)}
                          <Select
                            defaultValue={tempDataView.gender == 'Male'
                              ? "Male"
                              : tempDataView.gender == 'Female'
                                ? "Female"
                                : 'Gender'}
                            onChange={(value) => {
                              setSelectGender(value);
                            }}
                          >
                            <Option value="Male">Male</Option>
                            <Option value="Female">Female</Option>
                          </Select>
                        </Form.Item>
                      </Col>}

                      <Col span={12}>
                        <Form.Item name="dob" label="Date Of Birth">
                          {
                            formData.dob === null ?
                              <DatePicker
                                format="YYYY/MM/DD"
                                style={{ width: "416px" }}
                                onChange={(date, dateString) => {
                                  setDob(dateString);
                                }}
                                placeholder={"Date Of Birth"}
                              />
                              :
                              <DatePicker
                                defaultValue={moment(`${tempDataView.dob}`, "YYYY/MM/DD")}
                                format="YYYY/MM/DD"
                                style={{ width: "416px" }}
                                onChange={(date, dateString) => {
                                  setDob(dateString);
                                }}
                                placeholder={"Date Of Birth"}
                              />
                          }
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="age" label="Age">
                          <Input
                            placeholder="Age"
                            name="age"
                            disabled
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="classType" label="Class Type">
                          <Input
                            placeholder="Kids/Adults"
                            name="classType"
                            value={formData.classType}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="phoneNumber" label="Registered Contact No."
                          rules={[{
                            required: false,
                            pattern: /^\+[0-9]{12}$/,
                            message: "Enter Valid Phone Number"
                          }]}>
                          <Input
                            placeholder="Registered Contact Number"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleFormChange}
                            defaultValue={tempDataView.phoneNumber}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="alternativeMobile" label="Alternate Contact No."
                          rules={[{
                            required: false,
                            pattern: /^\+[0-9]{12}$/,
                            message: "Enter valid Alternate Number"
                          }]}>
                          <Input
                            placeholder="Alternative Contact No"
                            name="alternativeMobile"
                            value={formData.alternativeMobile}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="Whatsapp Number" label="Whatsapp Number"
                          rules={[{
                            required: false,
                            pattern: /^\+[0-9]{12}$/,
                            message: "Enter valid Whatsapp Number"
                          }]}>
                          <Input
                            placeholder="Whatsapp Number"
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          label="Parent First Name"
                          name="pfirstName"
                          rules={[{
                            required: false,
                            min: 2,
                            type: 'string',
                            pattern: /^[a-zA-Z ]*$/,
                          }]}
                        >
                          <Input
                            placeholder="Parent First Name"
                            name="pfirstName"
                            value={formData.firstName}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Parent Last Name"
                          name="plastName"
                        >
                          <Input
                            placeholder="Parent Last Name"
                            name="plastName"
                            value={formData.lastName}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          label="E-Mail"
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
                        <Form.Item name="address" label="Address">
                          <Input
                            placeholder="Address"
                            name="address"
                            value={formData.address}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>


                      <Col span={12}>
                        <Form.Item name="poc" label="POC">
                          <Input
                            placeholder="poc"
                            name="poc"
                            value={formData.poc}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="comments" label="BDA Comments">
                          <Input
                            placeholder="comments"
                            name="comments"
                            value={formData.comments}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="studentID" label="Lead ID">
                          <Input
                            placeholder="Lead ID"
                            name="studentID"
                            value={formData.studentID}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="isSibling" label="Is Sibling :">
                          <Select
                            placeholder="Is Sibling"
                            onChange={(value) => {
                              setIsSibling(value);
                            }}
                            name="isSibling"
                          >
                            <Option value={1}>Yes</Option>
                            <Option value={0}>No</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row align="center"><h2>Batch Details</h2></Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="classesPurchase" label="Classes Purchased">
                          <Input
                            placeholder="No. of Classes purchased"
                            name="classesPurchase"
                            value={formData.classesPurchase}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="course" label="Course">
                          <Input
                            placeholder="Course"
                            name="course"
                            value={formData.course}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="startDate" label="Expcted Start Date">
                          {formData.startDate === null ?
                            <DatePicker
                              format="YYYY/MM/DD"
                              style={{ width: "390px" }}
                              onChange={(date, dateString) => {
                                setStartDate(dateString);
                              }}
                              placeholder={"Expected Start Date"}
                            />
                            :
                            <DatePicker
                              defaultValue={moment(`${tempDataView.startDate}`, "YYYY/MM/DD")}
                              placeholder={"Expected Start Date"}
                              format="YYYY/MM/DD"
                              style={{ width: "390px" }}
                              onChange={(date, dateString) => {
                                setStartDate(dateString);
                              }} />
                          }
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        {tempDataView.classesStartDate === null ?
                          <Form.Item name="classesStartDate" label="Actual Start Date">
                            <DatePicker
                              format="YYYY-MM-DD"
                              style={{ width: "400px" }}
                              onChange={(date, dateString) => {
                                setClassesStartDate(dateString);
                              }}
                              placeholder={"Actual Start Date"}
                            />
                          </Form.Item>
                          :
                          <Form.Item name="classesStartDate" label="Actual Start Date">
                            <DatePicker
                              defaultValue={moment(`${tempDataView.classesStartDate}`, "YYYY-MM-DD")}
                              format="YYYY-MM-DD"
                              style={{ width: "400px" }}
                              onChange={(date, dateString) => {
                                setClassesStartDate(dateString);
                              }}
                              placeholder={"Actual Start Date"}
                            />
                          </Form.Item>
                        }
                      </Col>
                      <Col span={12}>
                        <Form.Item name="startLesson" label="Start Lesson">
                          <Input
                            placeholder="Start Lesson"
                            name="startLesson"
                            value={formData.startLesson}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="batchCode" label="Starting Batch Code">
                          <Input
                            placeholder="Starting Batch Code"
                            name="batchCode"
                            value={formData.batchCode}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="batchChange" label="No. of Batch Changes">
                          <Input
                            placeholder="No. of Batch Changes"
                            name="batchChange"
                            value={formData.batchChange}
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

                <TabPane tab="Payment Details" key="2">
                  <Form onFinish={handleFormSubmit}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="paymentid" label="Payment ID">
                          <Input
                            placeholder="payment ID"
                            name="paymentid"
                            value={formData.paymentid}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="plantype" label="Plan Type">
                          <Select
                            placeholder=" Plan Type"
                            name="plantype"
                            onChange={(value) => {
                              setSelectPlantype(value);
                            }}
                          >
                            <Option value="Subscription"> Subscription </Option>
                            <Option value="One Time"> One Time</Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="classtype" label="Class Type">
                          <Select
                            placeholder="Class Type"
                            name="classtype"
                            onChange={(value) => {
                              setSelectClasstype(value);
                            }}
                          >
                            <Option value="one to one"> One to One </Option>
                            <Option value="Group"> Group</Option>
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="classessold" label="No. of Classes Sold">
                          <Input
                            placeholder="No. of classes sold"
                            name="classessold"
                            value={formData.classessold}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="saleamount" label="Sale Amount">
                          <Input
                            placeholder="Sale amount"
                            name="saleamount"
                            value={formData.saleamount}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="dateofsale" label="Date of Sale">
                          {formData.endDate === null ?
                            <DatePicker
                              format="YYYY/MM/DD"
                              style={{ width: "430px" }}
                              onChange={(date, dateString) => {
                                setSaleDate(dateString);
                              }}
                              placeholder={"Date of Sale"}
                            />
                            :
                            <DatePicker
                              defaultValue={moment(`${tempDataView.dateofsale}`, "YYYY/MM/DD")}
                              format="YYYY/MM/DD"
                              style={{ width: "430px" }}
                              onChange={(date, dateString) => {
                                setSaleDate(dateString);
                              }}
                              placeholder={"Date of Sale"}
                            />
                          }
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="downpayment" label="Downpayment">
                          <Input
                            placeholder="Downpayment"
                            name="downpayment"
                            value={formData.downpayment}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="duedate" label="Due Date">
                          {formData.endDate === null ?
                            <DatePicker
                              format="YYYY/MM/DD"
                              style={{ width: "447px" }}
                              onChange={(date, dateString) => {
                                setDueDate(dateString);
                              }}
                              placeholder={"Due date of plan"}
                            />
                            :
                            <DatePicker
                              defaultValue={moment(`${tempDataView.duedate}`, "YYYY/MM/DD")}
                              format="YYYY/MM/DD"
                              style={{ width: "447px" }}
                              onChange={(date, dateString) => {
                                setDueDate(dateString);
                              }}
                              placeholder={"Due date of plan"}
                            />
                          }
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="notes" label="Notes">
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
            </Spin>
          </Drawer>
        ]}
      />

      <Drawer
        title="Edit Student"
        placement="right"
        onClose={onCloseEdit}
        visible={visibleEdit}
        width={1100}>
        <Spin spinning={isLoading}>
          <Tabs defaultActiveKey="1" onChange={callback} key={tempDataView?.id}>
            <TabPane tab="Student Info" key="1">
              <Form onFinish={handleFormSubmitEdit} form={formHook}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="firstName" label="First Name"
                    >
                      <Input
                        placeholder="Student First Name"
                        name="firstName"
                        defaultValue={tempDataView.firstName}
                        onChange={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="lastName" label="Last Name"
                    >
                      <Input
                        placeholder="Student Last Name"
                        name="lastName"
                        defaultValue={tempDataView.lastName}
                        onChange={handleFormChange}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="dob" label="Date of Birth">
                      {tempDataView.dob === null ?
                        <DatePicker
                          format="YYYY/MM/DD"
                          style={{ width: "418x" }}
                          onChange={(date, dateString) => {
                            setDob(dateString);
                          }}
                          placeholder={"Date of Birth"}
                        />
                        :
                        <DatePicker
                          defaultValue={moment(`${tempDataView.dob}`, "YYYY/MM/DD")}
                          format="YYYY/MM/DD"
                          style={{ width: "418px" }}
                          onChange={(date, dateString) => {
                            setDob(dateString);
                          }}
                          placeholder={"Date of Birth"}
                        />
                      }

                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item label="Age">
                      {
                        (tempDataView.age == null) ? (
                          <Input
                            placeholder="Age"
                            value={moment(new Date()).diff(moment(tempDataView.dob, "YYYY-MM-DD"), 'years', true).toFixed(0)}
                            onChange={handleFormChange}
                            disabled
                          />

                        ) : (tempDataView.age == "NaN") ? (
                          <Input
                            placeholder="Age"
                            disabled
                          />
                        ) : (

                          <Input
                            placeholder="Age"
                            value={tempDataView.age + " Years"}
                            disabled
                          />
                        )
                      }
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="classType" label="Class Type">
                      <Input
                        placeholder="Kids/Adults"
                        name="classType"
                        defaultValue={tempDataView.classType}
                        onChange={handleFormChange}
                      />
                    </Form.Item>
                  </Col>


                  <Col span={12}>
                    <Form.Item
                      name="countryCode" label="Country">
                      <Select placeholder="Select a country" onChange={handleCountry} defaultValue={defaultCountry.map(name => name.name)}>
                        {allCountries.map((country) => {
                          return <Option value={country.name} key={country.code}>{country.name}</Option>
                        })}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="phoneNumber" label="Registered Contact No."
                      rules={[{
                        required: false,
                        pattern: /^\+[0-9]{12}$/,
                        message: "Enter Valid Phone Number"
                      }]}>
                      <Input
                        placeholder="Registered Contact Number"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleMobileChange}
                        defaultValue={tempDataView.phoneNumber}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="alternativeMobile" label="Alternate Contact No."
                      rules={[{
                        required: false,
                        pattern: /^\+[0-9]{12}$/,
                        message: "Enter valid Alternate Number"
                      }]}>
                      <Input
                        placeholder="Alternative Contact No"
                        name="alternativeMobile"
                        defaultValue={tempDataView.alternativeMobile}
                        onChange={handleFormChange}
                      // prefix={selectCountryCode ? selectCountryCode : DEFAULT_COUNTRY_CODE_NUMBER}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="Whatsapp Number" label="Whatsapp Number"
                      rules={[{
                        required: false,
                        pattern: /^\+[0-9]{12}$/,
                        message: "Enter valid Whatsapp Number"
                      }]}>
                      <Input
                        placeholder="Whatsapp Number"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleFormChange}
                        defaultValue={tempDataView.whatsapp}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="pfirstName" label="Parent First Name"
                    >
                      <Input
                        placeholder="Parent First Name"
                        name="pfirstName"
                        defaultValue={tempDataView.pfirstName}
                        onChange={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="plastName" label="Parent Last Name"
                    >
                      <Input
                        placeholder="Parent Last Name"
                        name="plastName"
                        defaultValue={tempDataView.plastName}
                        onChange={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="email" label="E-Mail"
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
                    <Form.Item name="address" label="Address">
                      <Input
                        placeholder="Address"
                        name="address"
                        defaultValue={tempDataView.address}
                        onChange={handleFormChange}
                      />
                    </Form.Item>
                  </Col>

                  {<Col span={12}>
                    <Form.Item name="gender" label="Gender">
                      {console.log('tempDataView.gender')}
                      {console.log(tempDataView.gender)}
                      <Select
                        defaultValue={tempDataView.gender == 'Male'
                          ? "Male"
                          : tempDataView.gender == 'Female'
                            ? "Female"
                            : ''}
                        onChange={(value) => {
                          setSelectGender(value);
                        }}
                      >
                        <Option value="Male">Male</Option>
                        <Option value="Female">Female</Option>
                      </Select>
                    </Form.Item>
                  </Col>}

                  <Col span={12}>
                    <Form.Item name="poc" label="POC">
                      <Input
                        placeholder="poc"
                        name="poc"
                        defaultValue={tempDataView.poc}
                        onChange={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="comments" label="BDA Comments">
                      <Input
                        placeholder="comments"
                        name="comments"
                        defaultValue={tempDataView.comments}
                        onChange={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="studentID" label="Student ID">
                      <Input
                        placeholder="Lead ID"
                        name="studentID"
                        defaultValue={tempDataView.studentID}
                        onChange={handleFormChange}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="isSibling" label="Is Sibling ?">
                      <Select
                        placeholder="Is Sibling"
                        onChange={(value) => {
                          setIsSibling(value);
                        }}
                        defaultValue={tempDataView.isSibling ? 1 : 0}
                        name="isSibling"
                        style={{ width: 100 + "%" }}
                      >
                        <Option value={1}>Yes</Option>
                        <Option value={0}>No</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Access
                    accessible={access.canSuperAdmin}
                    fallback={<div> </div>}
                  >
                    <Col span={12}>
                      <Form.Item name="Status" label="Status">
                        <Select
                          placeholder="Select Status"
                          name="status"
                          defaultValue={tempDataView.status}
                          onChange={(value) => {
                            setStatus(value);
                          }}
                        >
                          <Option value='active'>Active</Option>
                          <Option value='inactive'>InActive</Option>
                          <Option value='batching'>Re-Batch</Option>
                          <Option value='Error'>Error</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Access>
                </Row>

                <Row align="center" gutter={16}><h2>Batch Details</h2></Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="classesPurchase" label="Classes Purchased">
                      <Input
                        placeholder="No. of Classes purchased"
                        name="classesPurchase"
                        defaultValue={tempDataView.classesPurchase}
                        onChange={handleFormChange}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="course" label="Course">
                      <Input
                        placeholder="Course"
                        name="course"
                        defaultValue={tempDataView.course}
                        onChange={handleFormChange}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="startDate" label="Expected Start Date">
                      {tempDataView.startDate === null ?
                        <DatePicker
                          format="YYYY/MM/DD"
                          style={{ width: "385px" }}
                          onChange={(date, dateString) => {
                            setStartDate(dateString);
                          }}
                          placeholder={"Expected Start Date"}
                        />
                        :
                        <DatePicker
                          defaultValue={moment(`${tempDataView.startDate}`, "YYYY/MM/DD")}
                          format="YYYY/MM/DD"
                          style={{ width: "385px" }}
                          onChange={(date, dateString) => {
                            setStartDate(dateString);
                          }} />
                      }
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    {tempDataView.classesStartDate === null ?
                      <Form.Item name="classesStartDate" label="Actual Start Date">
                        <DatePicker
                          format="YYYY-MM-DD"
                          style={{ width: "400px" }}
                          onChange={(date, dateString) => {
                            setClassesStartDate(dateString);
                          }}
                          placeholder={"Actual Start Date"}
                        />
                      </Form.Item>
                      :
                      <Form.Item name="classesStartDate" label="Actual Start Date">
                        <DatePicker
                          defaultValue={moment(`${tempDataView.classesStartDate}`, "YYYY-MM-DD")}
                          format="YYYY-MM-DD"
                          style={{ width: "400px" }}
                          onChange={(date, dateString) => {
                            setClassesStartDate(dateString);
                          }}
                          placeholder={"Actual Start Date"}
                        />
                      </Form.Item>
                    }
                  </Col>

                  <Col span={12}>
                    <Form.Item name="startLesson" label="Start Lesson">
                      <Input
                        placeholder="Start Lesson"
                        name="startLesson"
                        defaultValue={tempDataView.startLesson}
                        onChange={handleFormChange}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="batchCode" label="Starting Batch Code">
                      <Input
                        placeholder="Starting Batch Code"
                        name="batchCode"
                        defaultValue={tempDataView.batchCode}
                        onChange={handleFormChange}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="batchChange" label="No. Of Batch Changes">
                      <Input
                        placeholder="No. of Batch Changes"
                        name="batchChange"
                        defaultValue={tempDataView.batchChange}
                        onChange={handleFormChange}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row>
                  <Col span={12}>
                    <Input
                      type="submit"
                      value="Save Changes"
                      style={{ color: "white", backgroundColor: "DodgerBlue" }}
                    />
                  </Col>
                  <Col span={12} >
                    <Rebatching data={tempDataView} show={showRebatching} setShow={setShowRebatching} />
                  </Col>
                </Row>
              </Form>
            </TabPane>

            <TabPane tab="Payment Details" key="2">
              <Form onFinish={handleFormSubmitEdit}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="paymentid" label="Payment ID">
                      <Input
                        placeholder="payment ID"
                        name="paymentid"
                        defaultValue={tempDataView.paymentid}
                        onChange={handleFormChange}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="plantype" label="Plan Type">
                      <Select
                        placeholder="Plan type"
                        defaultValue={tempDataView.plantype == 'Subscription'
                          ? "Subscription" : "One Time"}
                        onChange={(value) => {
                          setSelectPlantype(value);
                        }}
                      >
                        <Option value="Subscription"> Subscription </Option>
                        <Option value="One Time"> One Time</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="classtype" label="Class Type">
                      <Select
                        placeholder="Class Type"
                        defaultValue={tempDataView.classtype == 'one to one'
                          ? "one to one" : "Group"}
                        onChange={(value) => {
                          setSelectClasstype(value);
                        }}
                      >
                        <Option value="one to one"> One to One </Option>
                        <Option value="Group"> Group</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="classessold" label="No. Of Classes Sold">
                      <Input
                        placeholder="No. of classes sold"
                        name="classessold"
                        defaultValue={tempDataView.classessold}
                        onChange={handleFormChange}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="saleamount" label="Sale Amount">
                      <Input
                        placeholder="Sale amount"
                        name="saleamount"
                        defaultValue={tempDataView.saleamount}
                        onChange={handleFormChange}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="dateofsale" label="Date of Sale">

                      {tempDataView.dateofsale === null ?
                        <DatePicker
                          format="YYYY/MM/DD"
                          style={{ width: "430px" }}
                          onChange={(date, dateString) => {
                            setSaleDate(dateString);
                          }}
                          placeholder={"Date of Sale"}
                        />
                        :
                        <DatePicker
                          defaultValue={moment(`${tempDataView.dateofsale}`, "YYYY/MM/DD")}
                          format="YYYY/MM/DD"
                          style={{ width: "430px" }}
                          onChange={(date, dateString) => {
                            setSaleDate(dateString);
                          }}
                          placeholder={"Date of Sale"}
                        />
                      }

                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="downpayment" label="Down Payment">
                      <Input
                        placeholder="Downpayment"
                        name="downpayment"
                        defaultValue={tempDataView.downpayment}
                        onChange={handleFormChange}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="duedate" label="Due Date">

                      {tempDataView.duedate === null ?
                        <DatePicker

                          format="YYYY/MM/DD"
                          style={{ width: "447px" }}
                          onChange={(date, dateString) => {
                            setDueDate(dateString);
                          }}
                          placeholder={"Due date of plan"}
                        />
                        :
                        <DatePicker
                          defaultValue={moment(`${tempDataView.duedate}`, "YYYY/MM/DD")}
                          format="YYYY/MM/DD"
                          style={{ width: "447px" }}
                          onChange={(date, dateString) => {
                            setDueDate(dateString);
                          }}
                          placeholder={"Due date of plan"}
                        />
                      }

                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item name="notes" label="Notes">
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
                  <Col span={24}>
                    <Input
                      type="submit"
                      value="Save Changes"
                      style={{ color: "white", backgroundColor: "DodgerBlue" }}
                    />
                  </Col>
                  <Col span={8}></Col>
                </Row>
              </Form>
            </TabPane>
          </Tabs>
        </Spin>
      </Drawer>
    </PageContainer >
  );
};

export default StudentsBatchList;

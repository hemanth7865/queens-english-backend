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
      phoneNumber: '+' + selectCountryCode + formData.phoneNumber,
      //countryCode: selectCountryCode ? selectCountryCode : DEFAULT_COUNTRY_CODE_NUMBER,
      email: formData.email,
      type: 'student',
      status: status ? status : 'active',
      isSibling,
      studentName: formData.studentName,
      teacherName: formData.teacherName,
      mobile: formData.phoneNumber,
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
      // status: status ? status : tempDataView.status,
      studentName: formData.studentName ? formData.studentName : tempDataView.studentName,
      teacherName: formData.teacherName ? formData.teacherName : tempDataView.teacherName,
      mobile: formData.phoneNumber ? formData.phoneNumber : tempDataView.phoneNumber,
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
            width={820}
          >
            <Spin spinning={isLoading}>
              <Tabs defaultActiveKey="1" onChange={callback}>
                <TabPane tab="Student Info" key="1">
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
                            placeholder="Student First Name"
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
                            placeholder="StudentLast Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>

                      {<Col span={12}>
                        <Form.Item name="gender	">
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
                        <Form.Item name="dob">
                          {
                            formData.dob === null ?
                              <DatePicker
                                format="YYYY/MM/DD"
                                style={{ width: "365px" }}
                                onChange={(date, dateString) => {
                                  setDob(dateString);
                                }}
                                placeholder={"Date Of Birth"}
                              />
                              :
                              <DatePicker
                                defaultValue={moment(`${tempDataView.dob}`, "YYYY/MM/DD")}
                                format="YYYY/MM/DD"
                                style={{ width: "370px" }}
                                onChange={(date, dateString) => {
                                  setDob(dateString);
                                }}
                                placeholder={"Date Of Birth"}
                              />
                          }
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="age">
                          <Input
                            placeholder="Age"
                            name="age"
                            disabled
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

                      <PhoneNumberCountrySelect handleMobileChange={handleMobileChange} setSelectCountry={setSelectCountry} setSelectCountryCode={setSelectCountryCode} edit={false} />

                      <Col span={12}>
                        <Form.Item name="alternativeMobile">
                          <Input
                            placeholder="Alternative Contact No"
                            name="alternativeMobile"
                            value={formData.alternativeMobile}
                            onChange={handleFormChange}
                          //   prefix = {selectCountryCode?selectCountryCode:DEFAULT_COUNTRY_CODE_NUMBER}
                          />
                        </Form.Item>
                      </Col>

                      <PhoneNumberCountrySelect handleMobileChange={handleFormChange} formData={formData} phoneNumberName={"whatsapp"} placeholder="whatsapp Number" edit={true} defaultValue={formData.whatsapp} />

                      <Col span={12}>
                        <Form.Item
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
                          name="plastName"
                        // rules={[{
                        //   required: true,
                        //   min: 2,
                        //   type: 'string',
                        //   pattern: /^[a-zA-Z]*$/,
                        // }]}
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


                      <Col span={24}>
                        <Form.Item name="poc">
                          <Input
                            placeholder="poc"
                            name="poc"
                            value={formData.poc}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item name="comments">
                          <Input
                            placeholder="comments"
                            name="comments"
                            value={formData.comments}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="studentID">
                          <Input
                            placeholder="Lead ID"
                            name="studentID"
                            value={formData.studentID}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="isSibling">
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
                        <Form.Item name="classesPurchase">
                          <Input
                            placeholder="No. of Classes purchased"
                            name="classesPurchase"
                            value={formData.classesPurchase}
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
                        <Form.Item name="classesAttended">
                          <Input
                            placeholder="No of Classes Attended"
                            name="classesAttended"
                            value={formData.classesAttended}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="classesMissed">
                          <Input
                            placeholder="No of Classes Missed"
                            name="classesMissed"
                            value={formData.classesMissed}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="partner">
                          <Input
                            placeholder="Partner Name"
                            name="partner"
                            value={formData.partner}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="course">
                          <Input
                            placeholder="Course"
                            name="course"
                            value={formData.course}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="assesmentComplete">
                          <Input
                            placeholder="No. of Assessments Completed"
                            name="assesmentComplete"
                            value={formData.assesmentComplete}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="assesmentMissed">
                          <Input
                            placeholder="No. of Assessments Missed"
                            name="assesmentMissed"
                            value={formData.assesmentMissed}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="averageScore">
                          <Input
                            placeholder="Average Score across assessment"
                            name="averageScore"
                            value={formData.averageScore}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="assesmentDate" extra="Assessment Date">
                          {formData.assesmentDate === null ?
                            <DatePicker
                              format="YYYY/MM/DD"
                              style={{ width: "375px" }}
                              onChange={(date, dateString) => {
                                setAssesmentDate(dateString);
                              }}
                              placeholder={"Next Assessment Date"}
                            />
                            :
                            <DatePicker
                              defaultValue={moment(`${tempDataView.assesmentDate}`, "YYYY/MM/DD")}
                              format="YYYY/MM/DD"
                              style={{ width: "375px" }}
                              onChange={(date, dateString) => {
                                setAssesmentDate(dateString);
                              }} />
                          }
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="startDate">
                          {formData.startDate === null ?
                            <DatePicker
                              format="YYYY/MM/DD"
                              style={{ width: "375px" }}
                              onChange={(date, dateString) => {
                                setStartDate(dateString);
                              }}
                              placeholder={"Expected Start Date"}
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
                        {tempDataView.classesStartDate === null ?
                          <Form.Item name="classesStartDate">
                            <DatePicker
                              format="YYYY-MM-DD"
                              style={{ width: "365px" }}
                              onChange={(date, dateString) => {
                                setClassesStartDate(dateString);
                              }}
                              placeholder={"Actual Start Date"}
                            />
                          </Form.Item>
                          :
                          <Form.Item name="classesStartDate">
                            <DatePicker
                              defaultValue={moment(`${tempDataView.classesStartDate}`, "YYYY-MM-DD")}
                              format="YYYY-MM-DD"
                              style={{ width: "370px" }}
                              onChange={(date, dateString) => {
                                setClassesStartDate(dateString);
                              }}
                              placeholder={"Actual Start Date"}
                            />
                          </Form.Item>
                        }
                      </Col>
                      <Col span={12}>
                        <Form.Item name="startLesson">
                          <Input
                            placeholder="Start Lesson"
                            name="startLesson"
                            value={formData.startLesson}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="batchCode">
                          <Input
                            placeholder="Starting Batch Code"
                            name="batchCode"
                            value={formData.batchCode}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="batchChange">
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
                        value="Add Student Learning journey"
                        style={{ color: "white", backgroundColor: "DodgerBlue" }}
                      />
                    </Row>
                  </Form>

                </TabPane>
                <TabPane tab="Referral" key="3">

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
                    <Col span={12}>
                      <Form.Item name="incentive">
                        <Input
                          placeholder="Incentive Details"
                          name="incentive"
                          value={formData.incentive}
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
                <TabPane tab="QE checklist" key="4">
                  <Form onFinish={handleFormSubmit}>

                    <Col span={12}>
                      <Form.Item name="firstFeedback">
                        <Input
                          placeholder=" First FeedBack "
                          name="firstFeedback"
                          value={formData.firstFeedback}
                          onChange={handleFormChange}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item name="fifthFeedback">
                        <Input
                          placeholder="Fifth FeedBack "
                          name="fifthFeedback"
                          value={formData.fifthFeedback}
                          onChange={handleFormChange}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="fifteenthFeedback">
                        <Input
                          placeholder="Fifteenth Feedback "
                          name="fifteenthFeedback"
                          value={formData.fifteenthFeedback}
                          onChange={handleFormChange}
                        />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item name="wabatch">
                        Batch on WA <Switch valuePropName='wabatch' onChange={(value) => {
                          setWABatch(value)
                        }} /> <br />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="logApp">
                        Log into the app <Switch valuePropName='logApp' onChange={(value) => {
                          setLogApp(value)
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

                    <Input
                      type="submit"
                      value="Add Student QE checklist "
                      style={{ color: "white", backgroundColor: "DodgerBlue" }}
                    />
                  </Form>
                </TabPane>
                <TabPane tab="Payment Details" key="5">
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
                        <Form.Item name="classtype">
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

                          {formData.endDate === null ?
                            <DatePicker

                              format="YYYY/MM/DD"
                              style={{ width: "375px" }}
                              onChange={(date, dateString) => {
                                setSaleDate(dateString);
                              }}
                              placeholder={"Date of Sale"}
                            />
                            :
                            <DatePicker
                              defaultValue={moment(`${tempDataView.dateofsale}`, "YYYY/MM/DD")}
                              format="YYYY/MM/DD"
                              style={{ width: "375px" }}
                              onChange={(date, dateString) => {
                                setSaleDate(dateString);
                              }}
                              placeholder={"Date of Sale"}
                            />
                          }
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

                          {formData.endDate === null ?
                            <DatePicker

                              format="YYYY/MM/DD"
                              style={{ width: "375px" }}
                              onChange={(date, dateString) => {
                                setDueDate(dateString);
                              }}
                              placeholder={"Due date of plan"}
                            />
                            :
                            <DatePicker
                              defaultValue={moment(`${tempDataView.duedate}`, "YYYY/MM/DD")}
                              format="YYYY/MM/DD"
                              style={{ width: "375px" }}
                              onChange={(date, dateString) => {
                                setDueDate(dateString);
                              }}
                              placeholder={"Due date of plan"}
                            />
                          }
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
                        <Form.Item name="delay_date">

                          {formData.endDate === null ?
                            <DatePicker

                              format="YYYY/MM/DD"
                              style={{ width: "375px" }}
                              onChange={(date, dateString) => {
                                setDelayDate(dateString);
                              }}
                              placeholder={"Date of delayed payment"}
                            />
                            :
                            <DatePicker
                              defaultValue={moment(`${tempDataView.delay_date}`, "YYYY/MM/DD")}
                              format="YYYY/MM/DD"
                              style={{ width: "375px" }}
                              onChange={(date, dateString) => {
                                setDelayDate(dateString);
                              }}
                              placeholder={"Date of delayed payment"}
                            />
                          }
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
            </Spin>
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
                    <p>Student First Name  </p>
                  </Col>
                  <Col span={11}>
                    <p>:  {tempDataView.firstName}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p>Student Last Name  </p>
                  </Col>
                  <Col span={11}>
                    <p>:  {tempDataView.lastName}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p>Date of Birth </p>
                  </Col>
                  <Col span={11}>
                    <p>:  {dob == '' ? tempDataView.dob : dob}</p>
                  </Col>
                  <Col span={7}></Col>
                  {tempDataView.age === 'NaN' ? (
                    <><Col span={6}>
                      <p>Age  </p>
                    </Col>
                      <Col span={11}>
                        <p>:  {""}</p>
                      </Col> </>
                  ) : (tempDataView.age) ? (
                    <><Col span={6}>
                      <p>Age  </p>
                    </Col>
                      <Col span={11}>
                        <p>:  {tempDataView.age + " Years"}</p>
                      </Col> </>
                  ) : (
                    <><Col span={6}>
                      <p>Age  </p>
                    </Col>
                      <Col span={11}>
                        <p>:  {""}</p>
                      </Col> </>
                  )
                  }
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p>Kids/Adults </p>
                  </Col>
                  <Col span={11}>
                    <p>:  {tempDataView.classType}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p>Primary Mobile Number</p>
                  </Col>
                  <Col span={11} >
                    <p>:  {tempDataView.phoneNumber}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p>Alternative Contact No</p>
                  </Col>
                  <Col span={11} >
                    <p>:  {tempDataView.alternativeMobile}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p>Whatsapp No. </p>
                  </Col>
                  <Col span={11}>
                    <p>:  {tempDataView.whatsapp}</p>
                  </Col>

                  <Col span={7}></Col>
                  <Col span={6}>
                    <p>Parent First Name  </p>
                  </Col>
                  <Col span={11}>
                    <p>:  {tempDataView.pfirstName}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p>Parent Last Name  </p>
                  </Col>
                  <Col span={11}>
                    <p>:  {tempDataView.plastName}</p>
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

                  {/* <Col span={7}></Col>
              <Col span={6}>
                <p>Status  </p>
              </Col>
              <Col span={11}>
                <p>:  {tempDataView.status }</p>
              </Col> */}
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p>Point of contact</p>
                  </Col>

                  <Col span={11}>
                    <p>:  {tempDataView.poc}</p>
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

              <TabPane tab="Learning Journey" key="2">
                < Row style={{ fontWeight: 600 }} gutter={(40, 60)}>

                  <Col span={7}></Col>
                  <Col span={6}>
                    <p> No. of Classes Purchased </p>
                  </Col>
                  <Col span={11}>
                    <p>:  {tempDataView.classesPurchase}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p> No. of Classes Completed</p>
                  </Col>
                  <Col span={11}>
                    <p>:  {tempDataView.classesCompleted}</p>
                  </Col>

                  <Col span={7}></Col>
                  <Col span={6}>
                    <p> No. of Classes Attended</p>
                  </Col>
                  <Col span={11}>
                    <p>:  {tempDataView.classesAttended}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p> No. of Classes Missed</p>
                  </Col>
                  <Col span={11}>
                    <p>:  {tempDataView.classesMissed}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p> Partner Name</p>
                  </Col>
                  <Col span={11}>
                    <p>:  {tempDataView.partner}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p> Course</p>
                  </Col>
                  <Col span={11}>
                    <p>:  {tempDataView.course}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p> No. of Assessments Completed</p>
                  </Col>
                  <Col span={11}>
                    <p>:  {tempDataView.assesmentComplete}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p> No. of Assessments Missed</p>
                  </Col>

                  <Col span={11}>
                    <p>:  {tempDataView.assesmentMissed}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p> Average Score across assessment</p>
                  </Col>
                  <Col span={11}>
                    <p>:  {tempDataView.averageScore}</p>
                  </Col>

                  <Col span={7}></Col>
                  <Col span={6}>
                    <p>Next Assessment Date</p>
                  </Col>

                  <Col span={11}>
                    <p>:  {tempDataView.assesmentDate}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p>Expected Start Date  </p>
                  </Col>
                  <Col span={11}>
                    <p>:  {tempDataView.startDate}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p>Actual Start Date  </p>
                  </Col>
                  <Col span={11}>
                    <p>:  {tempDataView.classesStartDate ? tempDataView.classesStartDate : classesStartDate}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p> Start Lesson  </p>
                  </Col>
                  <Col span={11}>
                    <p>:  {tempDataView.startLesson}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p>Starting Batch Code </p>
                  </Col>
                  <Col span={11}>
                    <p>:  {tempDataView.batchCode}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p> Zoom Info  </p>
                  </Col>
                  <Col span={11}>
                    <p>: {tempDataView.zoomInfo}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p> Zoom Link  </p>
                  </Col>
                  <Col span={11}>
                    <p>: <a href={tempDataView.zoomLink} target="_blank">{tempDataView.zoomLink || "NA"}</a></p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p> Whatsapp Link </p>
                  </Col>
                  <Col span={11}>
                    <p>: <a href={tempDataView.whatsappLink} target="_blank">{tempDataView.whatsappLink || "NA"}</a></p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p>No. of Batch changes </p>
                  </Col>

                  <Col span={11}>
                    <p>:  {tempDataView.batchChange}</p>
                  </Col>

                  <Col span={24}>
                    <StudentBatchesHistory data={tempDataView} />
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
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p> Incentive Details</p>
                  </Col>
                  <Col span={11}>
                    <p>:  {tempDataView.incentive}</p>
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
                    <p>:  {tempDataView.bottleSend ? "True" : "False"}</p>
                  </Col>

                  <Col span={7}></Col>
                  <Col span={6}>
                    <p>Batch on WA   </p>
                  </Col>
                  <Col span={11}>
                    <p>:  {tempDataView.Wabatch ? "True" : "False"}</p>
                  </Col>
                  <Col span={7}></Col>
                  <Col span={6}>
                    <p> Log into the app  </p>
                  </Col>
                  <Col span={11}>
                    <p>:  {tempDataView.logApp ? "True" : "False"}</p>
                  </Col>


                </Row>
              </TabPane>

              <TabPane tab="Payment Details" key="5">
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
                    <p> Class Type    </p>
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
            </Tabs>
          </>
        ) : (
          <>
            <Spin spinning={isLoading}>
              <Tabs defaultActiveKey="1" onChange={callback} key={tempDataView?.id}>
                <TabPane tab="Student Info" key="1">
                  <Form onFinish={handleFormSubmitEdit} form={formHook}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="firstName"
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
                          name="lastName"
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
                        {
                          (tempDataView.age == null) ? (
                            <Form.Item name="age">
                              <Input
                                placeholder="Age"
                                name="age"
                                value={moment(new Date()).diff(moment(tempDataView.dob, "YYYY-MM-DD"), 'years', true).toFixed(0)}
                                onChange={handleFormChange}
                                disabled
                              />
                            </Form.Item>
                          ) : (tempDataView.age === 'NaN') ? (
                            <Input
                              placeholder="Age"
                              name="age"
                              value={"Age"}
                              onChange={handleFormChange}
                              disabled
                            />
                          ) : (
                            <Input
                              placeholder="Age"
                              name="age"
                              value={tempDataView.age + " Years"}
                              onChange={handleFormChange}
                              disabled
                            />
                          )
                        }
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

                      <PhoneNumberCountrySelect handleMobileChange={handleFormChange} edit={true} defaultValue={tempDataView.phoneNumber} />

                      <Col span={12}>
                        <Form.Item name="alternativeMobile">
                          <Input
                            placeholder="Alternative Contact No"
                            name="alternativeMobile"
                            defaultValue={tempDataView.alternativeMobile}
                            onChange={handleFormChange}
                          // prefix={selectCountryCode ? selectCountryCode : DEFAULT_COUNTRY_CODE_NUMBER}
                          />
                          {/* {error ? (
                      <p style={{ color: 'red' }}>{error}</p>
                    ) : ''} */}
                        </Form.Item>
                      </Col>

                      <PhoneNumberCountrySelect handleMobileChange={handleFormChange} phoneNumberName={"whatsapp"} placeholder="whatsapp Number" edit={true} defaultValue={tempDataView.whatsapp} />

                      <Col span={12}>
                        <Form.Item
                          name="pfirstName"
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
                          name="plastName"
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

                      {<Col span={12}>
                        <Form.Item name="gender	">
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

                      <Col span={24}>
                        <Form.Item name="poc">
                          <Input
                            placeholder="poc"
                            name="poc"
                            defaultValue={tempDataView.poc}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item name="comments">
                          <Input
                            placeholder="comments"
                            name="comments"
                            defaultValue={tempDataView.comments}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="studentID">
                          <Input
                            placeholder="Lead ID"
                            name="studentID"
                            defaultValue={tempDataView.studentID}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Row>
                          <Col span={6}>
                            <label htmlFor="isSibling">
                              Is Sibling:
                            </label>
                          </Col>
                          <Col span={18}>
                            <Form.Item name="isSibling">
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
                        </Row>
                      </Col>
                      <Access
                        accessible={access.canSuperAdmin}
                        fallback={<div> </div>}
                      >
                        <Col span={12}>
                          <Form.Item name="Status">
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
                            </Select>
                          </Form.Item>
                        </Col>
                      </Access>
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
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="classesPurchase">
                          <Input
                            placeholder="No. of Classes purchased"
                            name="classesPurchase"
                            defaultValue={tempDataView.classesPurchase}
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
                        <Form.Item name="classesAttended">
                          <Input
                            placeholder="No of Classes Attended"
                            name="classesAttended"
                            defaultValue={tempDataView.classesAttended}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="classesMissed">
                          <Input
                            placeholder="No of Classes Missed"
                            name="classesMissed"
                            defaultValue={tempDataView.classesMissed}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="partner">
                          <Input
                            placeholder="Partner Name"
                            name="partner"
                            defaultValue={tempDataView.partner}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="course">
                          <Input
                            placeholder="Course"
                            name="course"
                            defaultValue={tempDataView.course}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="assesmentComplete">
                          <Input
                            placeholder="No. of Assessments Completed"
                            name="assesmentComplete"
                            defaultValue={tempDataView.assesmentComplete}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="assesmentMissed">
                          <Input
                            placeholder="No. of Assessments Missed"
                            name="assesmentMissed"
                            defaultValue={tempDataView.assesmentMissed}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="averageScore">
                          <Input
                            placeholder="Average Score across assessment"
                            name="averageScore"
                            defaultValue={tempDataView.averageScore}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="assesmentDate" extra="Next Assessment Date">
                          {tempDataView.assesmentDate === null ?
                            <DatePicker
                              format="YYYY/MM/DD"
                              style={{ width: "360px" }}
                              onChange={(date, dateString) => {
                                setAssesmentDate(dateString);
                              }}
                              placeholder={"Next Assessment Date"}
                            />
                            :
                            <DatePicker
                              defaultValue={moment(`${tempDataView.assesmentDate}`, "YYYY/MM/DD")}
                              format="YYYY/MM/DD"
                              style={{ width: "360px" }}
                              onChange={(date, dateString) => {
                                setAssesmentDate(dateString);
                              }} />
                          }
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="startDate" extra="Expected Start Date">
                          {tempDataView.startDate === null ?
                            <DatePicker
                              format="YYYY/MM/DD"
                              style={{ width: "360px" }}
                              onChange={(date, dateString) => {
                                setStartDate(dateString);
                              }}
                              placeholder={"Expected Start Date"}
                            />
                            :
                            <DatePicker
                              defaultValue={moment(`${tempDataView.startDate}`, "YYYY/MM/DD")}
                              format="YYYY/MM/DD"
                              style={{ width: "360px" }}
                              onChange={(date, dateString) => {
                                setStartDate(dateString);
                              }} />
                          }
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        {tempDataView.classesStartDate === null ?
                          <Form.Item name="classesStartDate" extra="Actual Start Date">
                            <DatePicker
                              format="YYYY-MM-DD"
                              style={{ width: "365px" }}
                              onChange={(date, dateString) => {
                                setClassesStartDate(dateString);
                              }}
                              placeholder={"Actual Start Date"}
                            />
                          </Form.Item>
                          :
                          <Form.Item name="classesStartDate" extra="Actual Start Date">
                            <DatePicker
                              defaultValue={moment(`${tempDataView.classesStartDate}`, "YYYY-MM-DD")}
                              format="YYYY-MM-DD"
                              style={{ width: "370px" }}
                              onChange={(date, dateString) => {
                                setClassesStartDate(dateString);
                              }}
                              placeholder={"Actual Start Date"}
                            />
                          </Form.Item>
                        }
                      </Col>
                      <Col span={12}>
                        <Form.Item name="startLesson">
                          <Input
                            placeholder="Start Lesson"
                            name="startLesson"
                            defaultValue={tempDataView.startLesson}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="batchCode">
                          <Input
                            placeholder="Starting Batch Code"
                            name="batchCode"
                            defaultValue={tempDataView.batchCode}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item name="batchChange">
                          <Input
                            placeholder="No. of Batch Changes"
                            name="batchChange"
                            defaultValue={tempDataView.batchChange}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>


                      {/* <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="leadAvailability">
                    <label>Week Availability</label>
                    <WeekdayAvailability weekday={1} week="Monday" />
                    <WeekdayAvailability weekday={2} week="Tuesday" />
                    <WeekdayAvailability weekday={3} week="Wednesday" />
                    <WeekdayAvailability weekday={4} week="Thursday" />
                    <WeekdayAvailability weekday={5} week="Friday" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="leadAvailability">
                    <label>Weekend Availability</label>
                    <WeekdayAvailability weekday={6} week="Saturday" />
                    <WeekdayAvailability weekday={7} week="Sunday" />
                  </Form.Item>
                </Col>
              </Row> */}

                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Input
                          type="submit"
                          value="Save Changes"
                          style={{ color: "white", backgroundColor: "DodgerBlue" }}
                        />
                      </Col>
                      <Col span={8}>
                        <Rebatching data={tempDataView} show={showRebatching} setShow={setShowRebatching} />
                      </Col>
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
                      <Col span={12}>
                        <Form.Item name="incentive">
                          <Input
                            placeholder="Incentive Details"
                            name="incentive"
                            defaultValue={tempDataView.incentive}
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
                          <Input
                            placeholder="First Feedback"
                            name="firstFeedback"
                            defaultValue={tempDataView.firstFeedback}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>


                      <Col span={12}>
                        <Form.Item name="fifthFeedback">
                          <Input
                            placeholder="Fifth Feedback"
                            name="fifthFeedback"
                            defaultValue={tempDataView.fifthFeedback}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="fifteenthFeedback">
                          <Input
                            placeholder="Fifteenth Feedback"
                            name="fifteenthFeedback"
                            defaultValue={tempDataView.fifteenthFeedback}
                            onChange={handleFormChange}
                          />
                        </Form.Item>
                      </Col>


                      <Col span={15}>
                        <Form.Item name="bottleSend">
                          Bottle Send <Switch defaultChecked={tempDataView.bottleSend} onChange={(value) => {
                            setBottleSend(value)
                          }} /> <br />
                        </Form.Item>
                      </Col>
                      <Col span={15}>
                        <Form.Item name="wabatch">
                          Batch on WA <Switch defaultChecked={tempDataView.wabatch} onChange={(value) => {
                            setWABatch(value)
                          }} />
                        </Form.Item>
                      </Col>
                      <Col span={15}>
                        <Form.Item name="logApp">
                          Log into the App<Switch defaultChecked={tempDataView.logApp} onChange={(value) => {
                            setLogApp(value)
                          }} />
                        </Form.Item>
                      </Col>

                      {/* <Col span={15}>
                  <Form.Item name="fifteenthFeedback">
                    Fifteenth FeedBack <Switch  defaultChecked={tempDataView.fifteenthFeedback} 
                    onChange={(value) => { setFifteenthFeedBack(value)  }} />
                  </Form.Item>
                </Col> */}

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
                <TabPane tab="Payment Details" key="5">
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
                        <Form.Item name="classtype">
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
                      {/* <Col span={12}>
                  <Form.Item name="dateofsale">
                    <Input
                      placeholder="Date of Sale"
                      name="dateofsale"
                      defaultValue={tempDataView.dateofsale}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col>  */}

                      <Col span={12}>
                        <Form.Item name="dateofsale">

                          {tempDataView.dob === null ?
                            <DatePicker

                              format="YYYY/MM/DD"
                              style={{ width: "355px" }}
                              onChange={(date, dateString) => {
                                setSaleDate(dateString);
                              }}
                              placeholder={"Date of Sale"}
                            />
                            :
                            <DatePicker
                              defaultValue={moment(`${tempDataView.dateofsale}`, "YYYY/MM/DD")}
                              format="YYYY/MM/DD"
                              style={{ width: "355px" }}
                              onChange={(date, dateString) => {
                                setSaleDate(dateString);
                              }}
                              placeholder={"Date of Sale"}
                            />
                          }

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

                          {tempDataView.dob === null ?
                            <DatePicker

                              format="YYYY/MM/DD"
                              style={{ width: "355px" }}
                              onChange={(date, dateString) => {
                                setDueDate(dateString);
                              }}
                              placeholder={"Due date of plan"}
                            />
                            :
                            <DatePicker
                              defaultValue={moment(`${tempDataView.duedate}`, "YYYY/MM/DD")}
                              format="YYYY/MM/DD"
                              style={{ width: "355px" }}
                              onChange={(date, dateString) => {
                                setDueDate(dateString);
                              }}
                              placeholder={"Due date of plan"}
                            />
                          }

                        </Form.Item>
                      </Col>

                      {/* <Col span={12}>
                  <Form.Item name="duedate">
                    <Input
                      placeholder="Due date of plan"
                      name="duedate"
                      defaultValue={tempDataView.duedate}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col> */}



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

                      {/* <Col span={12}>
                  <Form.Item name="delay_date ">
                    <Input
                      placeholder="Date of delayed payment"
                      name="delay_date "
                     defaultValue={tempDataView.delay_date}
                      onChange={handleFormChange}
                    />
                  </Form.Item>
                </Col> */}
                      <Col span={12}>
                        <Form.Item name="delay_date">

                          {tempDataView.dob === null ?
                            <DatePicker

                              format="YYYY/MM/DD"
                              style={{ width: "355px" }}
                              onChange={(date, dateString) => {
                                setDelayDate(dateString);
                              }}
                              placeholder={"Date of delayed payment"}
                            />
                            :
                            <DatePicker
                              defaultValue={moment(`${tempDataView.delay_date}`, "YYYY/MM/DD")}
                              format="YYYY/MM/DD"
                              style={{ width: "355px" }}
                              onChange={(date, dateString) => {
                                setDelayDate(dateString);
                              }}
                              placeholder={"Date of delayed payment"}
                            />
                          }

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
            </Spin>
          </>)}
      </Drawer>
    </PageContainer>
  );
};

export default StudentsBatchList;

import { Access, useAccess } from "umi";
import { CopyOutlined, EyeOutlined } from '@ant-design/icons';
import { Form, Input, Select, Col, Row, notification, Tabs, Button, message } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import lsqUsersData from "../../../data/lsq_users.json";
import prmData from "../../../data/prms.json";
import statesData from "../../../data/stateCustomer.json";
import Rebatching from '@/pages/StudentsBatchList/components/Rebatching';
import StudentBatchesHistory from "@/pages/StudentsBatchList/components/StudentBatchesHistory";
import { CountryCode } from "../Constants/constants";
import {
  getZoomURL
} from "@/services/ant-design-pro/helpers";

const { TabPane } = Tabs;
const { Option } = Select;
const openNotificationWithIcon = (type: any, userType = 'Student', messageError: any) => {
  notification[type]({
    message: type === 'error' ? messageError : 'Successfully Updated  ' + userType + ' !!!! ',
    description: '',
  });
};

export type StudentdetailseditProps = {
  tempData: {
    id?: any;
    studentId: any;
    batchId?: string;
    studentID?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    pfirstName?: string;
    plastName?: string;
    customerEmail?: string;
    phoneNumber?: any;
    whatsapp?: string;
    state?: string;
    alternativeMobile?: string;
    address?: string;
    dob?: string;
    classType?: string;
    course?: string;
    startLesson?: string;
    courseFrequency?: string;
    timings?: string;
    startDate?: string;
    lsq_user_name?: string;
    classessold?: string;
    saleamount?: number;
    downpayment?: number;
    paymentMode?: string;
    paymentid?: string;
    subscription?: string;
    subscriptionNo?: string;
    emi?: number;
    emiMonths?: number;
    prm?: string;
    callStatus?: string;
    comments?: string;
    callBackon?: string;
    status?: string;
    waMessageSent?: string;
    prmphoneNumber?: string;
    prm_firstName?: string;
    prm_lastName?: string;
    classesStartDate?: string;
    canEditStartDate?: string;
    isSibling?: any;
    batchCode?: string;
    zoomLink?: string;
    zoomInfo?: string;
    whatsappLink?: string;
    age?: string;
    plantype?: string;
    dateofsale?: Date;
    dueDate?: Date;
    classtype?: string;
    gender?: string;
    notes?: string;
    onboardingIssueReason?: string;
    batchesClassesStartDate?: any;
  },
  submit: (data: any) => any;
  updateTempData: (data: any) => any;
  salesAlert: '';
  studentManageredit: '';
  studentManageradd: '';
  welcomepage: '';
  onboardpage: '',
  startclasslaterpage: '',
};

const Studentdetailsedit: React.FC<StudentdetailseditProps> = (props) => {

  function stringContainsNumber(_string: any) {
    return /\d/.test(_string);
  }

  const onFinish = (value: any) => {
    var paymentTally = (Number(value.saleamount) - (Number(value.emi * value.emiMonths) + Number(value.downpayment)));
    const dataForm = {
      id: value.id,
      studentId: value.id,
      batchId: props.tempData.batchId ? props.tempData.batchId : value.batchId,
      studentID: value.studentID,
      firstName: value.firstName,
      lastName: value.lastName ? value.lastName : '-',
      phoneNumber: value.phoneNumber,
      address: value.address,
      dob: !value.dob || value.dob == "Invalid date" ? null : moment(value.dob, "YYYY-MM-DD").format("YYYY-MM-DD"),
      whatsapp: value.whatsapp,
      comments: value.comments,
      email: value.customerEmail,
      customerEmail: value.customerEmail,
      classType: value.classType,
      type: 'student',
      status: props.studentManageradd ? "active" : props.salesAlert ? "Enrolled" : value.status === undefined ? props.tempData.status : value.status,
      onboardingIssueReason: value.onboardingIssueReason,
      alternativeMobile: !props.studentManageradd ? value.alternativeMobile : '',
      course: !props.studentManageradd ? value.course : '',
      startLesson: !props.studentManageradd ? value.startLesson : null,
      startDate: !value.startDate || value.startDate == "Invalid date" ? null : moment(value.startDate, "YYYY-MM-DD").format("YYYY-MM-DD"),
      classesStartDate: !value.classesStartDate || value.classesStartDate == "Invalid date" ? null : moment(value.classesStartDate, "YYYY-MM-DD").format("YYYY-MM-DD"),
      pfirstName: value.pfirstName,
      plastName: value.plastName,
      callStatus: value.callStatus,
      callBackon: value.callBackon,
      courseFrequency: value.courseFrequency,
      timings: value.timings,
      waMessageSent: value.waMessageSent,
      state: value.state,
      batchCode: value.batchCode,
      zoomLink: value.zoomLink,
      zoomInfo: value.zoomInfo,
      whatsappLink: value.whatsappLink,
      isSibling: value.isSibling ? value.isSibling : 0,
      prm_id: String(value.prm).length < 3 && parseInt(value.prm) > 0 ? value.prm : value.prm_id,
      salesowner: stringContainsNumber(value.lsq_user_name) ? value.lsq_user_name : value.lsq_user_id,
      age: value.dob == null || value.age == 'NaN' ? null : moment(new Date()).diff(moment(value.dob, "YYYY-MM-DD"), 'years', true).toFixed(0),
      gender: value.gender,
      batchesClassesStartDate: !value.batchesClassesStartDate || value.batchesClassesStartDate == "Invalid date" ? null : moment(value.batchesClassesStartDate, "YYYY-MM-DD").format("YYYY-MM-DD"),
      payment: !props.studentManageradd ? [{
        id: value.id,
        paymentid: value.paymentid,
        studentId: value.id,
        plantype: value.plantype,
        classessold: value.classessold,
        saleamount: Number(value.saleamount),
        dateofsale: !value.dateofsale || value.dateofsale == "Invalid date" ? null : (moment(value.dateofsale).toISOString(true).split('T')[0]),
        dueDate: !value.duedate || value.duedate == "Invalid date" ? null : (moment(value.duedate).toISOString(true).split('T')[0]),
        downpayment: Number(value.downpayment),
        classtype: value.classtype,
        subscription: value.subscription,
        subscriptionNo: value.subscriptionNo,
        emi: Number(value.emi),
        emiMonths: Number(value.emiMonths),
        paymentMode: value.paymentMode,
        notes: value.notes,
      }] : null
    }
    if (paymentTally == 0) {
      props.submit(dataForm);
      console.log('Data', dataForm);
    } else if (value.id == undefined) {
      props.submit(dataForm);
      console.log('Data', dataForm);
    } else {
      openNotificationWithIcon('error', 'Student', 'Enter Correct Payment Details !')
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  //Role Based Access
  const access = useAccess();

  const unableToJoinMessage = props?.tempData?.useNewZoomLink ? "" : `(If unable to join through the link then use Meeting ID and Passcode : ${props.tempData.zoomInfo})

(यदि लिंक के माध्यम से शामिल होने में असमर्थ हैं तो मीटिंग आईडी का उपयोग करें : ${props.tempData.zoomInfo})`;

  const whatsappOnboard = props.tempData ? `    Hello,
I am your Academic Counsellor ${props.tempData.prm_firstName} ${props.tempData.prm_lastName} from The Queen’s English and I am thrilled to inform you that your live classes will be starting on ${props.tempData.classesStartDate}, you can use the below details to join your classes:

*Batch:* ${props.tempData.batchCode}
*Time:* ${props.tempData.timings} India
*Frequency:* ${props.tempData.courseFrequency}
*Zoom Link:* ${getZoomURL("GENERIC_STUDENT", undefined, undefined, { classCode: props?.tempData?.classCode, useNewZoomLink: props?.tempData?.useNewZoomLink, zoomLink: props?.tempData?.zoomLink }, true)}

(Zoom link is the SAME for all the classes. You can use the same link to join the class every day)
(जूम लिंक सभी कक्षा के लिए समान है। आप हर दिन कक्षा में शामिल होने के लिए उसी लिंक का उपयोग कर सकते हैं)

${unableToJoinMessage}

*Whatsapp Group Link:* ${props.tempData.whatsappLink}

(Join the Whatsapp group from the link so that you won't miss out on the important notifications regarding the class)
(लिंक से व्हाट्सएप ग्रुप में शामिल हों ताकि आप कक्षा से संबंधित महत्वपूर्ण सूचनाओं से न चूकें)

Please send “OK” or a “:+1:” to activate the link above.
कृपया उपरोक्त लिंक को सक्रिय करने के लिए "ओके" या ": 1:" भेजें।

Click here to know how to start a Zoom Meeting:
https://drive.google.com/file/d/17Yx9W4EMT2yZ5VJDh6HfQAj4yBZz4VOo/view

ज़ूम मीटिंग कैसे शुरू करें, यह जानने के लिए यहां क्लिक करें:
https://drive.google.com/file/d/1PVj-GJpzrOJanQ_Cq4zlfjgA_E_JP4B1/view

For any support please feel free to reach out to us on our customer support number: +918143513850
अगर आपको किसी तरह की सहायता या कोर्स को लेकर कोई समयस्या हो तो आप हमारे हेल्प्लायन नम्बर +918143513850 पर कॉल कर सकते हैं।`: "User Not Found";

  const whatsappWelcome = props.tempData ? `    Hello
We're delighted to welcome you aboard The Queen's English.
I'll be your academic counsellor, and my name is ${props.tempData.prm_firstName} ${props.tempData.prm_lastName}.
We are ecstatic to have you join us in learning excellent English. Please find your login information for the app below, which allows you to practice spoken English with real-time feedback.
Step 1: Go to the Google Play Store and download the app using the following link: https://queensenglish.co/app
User information:
Registered Phone Number:  ${props.tempData.phoneNumber}
Please use your registered phone number to log in (once your classes have started).
We're also very excited to share our support phone number with you. If you have a question or a problem, you can call us at 81435 13850
Queen's English मे अगर आपको किसी तरह की सहायता या कोर्स को लेकर कोई समयस्या हो तो आप हमारे हेल्प्लायन नम्बर 8143513850 पर कॉल कर सकते हैं।`: "User Not Found";

  const copy = (text: any) => {
    window.navigator.clipboard.writeText(text);
    message.success('Message copied');
  };

  const openonboardNotification = (type: string, message: string, days: string, timings: string, zoomLink: string, prm_firstName: string, prm_lastName: string, classesStartDate: any, zoomInfo: any, batchCode: any, whatsappLink: string, classCode: string, useNewZoomLink: number) => {
    const waMessage = (
      <div >
        <div onClick={() => copy(whatsappOnboard)} align="center">
          <CopyOutlined
            title='Copy message'
            label='Copy message'
            style={{ fontSize: "25px", color: "#00BFFF" }}
            onClick={() => {
              copy(whatsappOnboard);
            }} />
          <b> Copy Message </b>
        </div>
        <p>Hello,<br />
          I am your Academic Counsellor {prm_firstName} {prm_lastName} from The Queen’s English and I am thrilled to inform you that your live classes will be starting on {classesStartDate}, you can use the below details to join your classes:<br />
          <br></br>
          <b>*Batch:*</b> {batchCode}<br />
          <b>*Time:*</b> {timings} India<br />
          <b>*Frequency:*</b> {days}<br />
          <b>*Zoom Link:*</b> {getZoomURL("GENERIC_STUDENT", undefined, undefined, { classCode, useNewZoomLink, zoomLink }, true)}<br />
          <br></br>
          (Zoom link is the SAME for all the classes. You can use the same link to join the class every day)<br />
          (जूम लिंक सभी कक्षा के लिए समान है। आप हर दिन कक्षा में शामिल होने के लिए उसी लिंक का उपयोग कर सकते हैं)<br />
          <br></br>
          {!useNewZoomLink && (
            <>
              (If unable to join through the link then use Meeting ID and Passcode :<br />
              {zoomInfo})<br />
              <br></br>
              (यदि लिंक के माध्यम से शामिल होने में असमर्थ हैं तो मीटिंग आईडी का उपयोग करें : <br />
              {zoomInfo})<br />
              <br /><br />
            </>
          )}
          <b>Whatsapp Group Link:</b> {whatsappLink}<br />
          <br></br>
          (Join the Whatsapp group from the link so that you won't miss out on the important notifications regarding the class)<br />
          (लिंक से व्हाट्सएप ग्रुप में शामिल हों ताकि आप कक्षा से संबंधित महत्वपूर्ण सूचनाओं से न चूकें)<br />
          <br></br>
          Please send “OK” or a “:+1:” to activate the link above.<br />
          कृपया उपरोक्त लिंक को सक्रिय करने के लिए "ओके" या ": 1:" भेजें।<br />
          <br></br>
          <a >Click here to know how to start a Zoom Meeting:</a><br />
          <a>https://drive.google.com/file/d/17Yx9W4EMT2yZ5VJDh6HfQAj4yBZz4VOo/view</a><br />
          <br></br>
          <a>ज़ूम मीटिंग कैसे शुरू करें, यह जानने के लिए यहां क्लिक करें:</a><br />
          <a >https://drive.google.com/file/d/1PVj-GJpzrOJanQ_Cq4zlfjgA_E_JP4B1/view</a><br />
          <br></br>
          For any support please feel free to reach out to us on our customer support number: +918143513850
          <br></br>
          अगर आपको किसी तरह की सहायता या कोर्स को लेकर कोई समयस्या हो तो आप हमारे हेल्प्लायन नम्बर +918143513850 पर कॉल कर सकते हैं।</p><br />
      </div>
    )

    notification[type]({
      message: 'Onboard Message',
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

  const openNotification = (type: string, phoneNumber: string, prm_firstName: string, prm_lastName: string) => {
    const waMessage = (
      <div>
        <div onClick={() => copy(whatsappWelcome)} align="center">
          <CopyOutlined
            title='Copy message'
            label='Copy message'
            style={{ fontSize: "25px", color: "#00BFFF" }}
            onClick={() => {
              copy(whatsappWelcome);
            }} />
          <b> Copy Message </b>
        </div>
        <p>Hello <br />
          We're delighted to welcome you aboard The Queen's English.<br />
          I'll be your academic counsellor, and my name is {prm_firstName} {prm_lastName}.<br />
          We are ecstatic to have you join us in learning excellent English. Please find your login information for the app below, which allows you to practice spoken English with real-time feedback.<br />
          Step 1: Go to the Google Play Store and download the app using the following link: <a> https://queensenglish.co/app</a><br />
          User information:<br />
          Registered Phone Number: {phoneNumber}<br />
          Please use your registered phone number to log in (once your classes have started).<br />
          We're also very excited to share our support phone number with you. If you have a question or a problem, you can call us at 81435 13850<br />
          Queen's English मे अगर आपको किसी तरह की सहायता या कोर्स को लेकर कोई समयस्या हो तो आप हमारे हेल्प्लायन नम्बर 8143513850 पर कॉल कर सकते हैं।</p>
      </div>
    )

    notification[type]({
      message: 'Welcome message',
      description: waMessage,
      style: {
        width: 720,
      },
      onClick: () => {
        console.log('Notification Clicked!');
      },
    });
  }

  const [form] = Form.useForm()
  const defaultValues = () => {
    {
      !props.studentManageradd ? (form.setFieldsValue({
        id: props.tempData.id,
        batchId: props.tempData.batchId,
        firstName: props.tempData.firstName,
        lastName: props.tempData.lastName,
        pfirstName: props.tempData.pfirstName,
        plastName: props.tempData.plastName,
        customerEmail: props.tempData.customerEmail ? props.tempData.customerEmail : props.tempData.email,
        studentID: props.tempData.studentID,
        phoneNumber: props.tempData.phoneNumber,
        whatsapp: props.tempData.whatsapp,
        alternativeMobile: props.tempData.alternativeMobile,
        address: props.tempData.address,
        state: props.tempData.state,
        dob: moment(props.tempData.dob, "YYYY-MM-DD").format("YYYY-MM-DD"),
        classType: props.tempData.classType,
        classtype: props.tempData.classtype,
        course: props.tempData.course,
        startLesson: props.tempData.startLesson,
        courseFrequency: props.tempData.courseFrequency,
        timings: props.tempData.timings,
        startDate: moment(props.tempData.startDate, "YYYY-MM-DD").format("YYYY-MM-DD"),
        classesStartDate: moment(props.tempData.classesStartDate, "YYYY-MM-DD").format("YYYY-MM-DD"),
        lsq_user_name: props.tempData.lsq_user_name,
        classessold: props.tempData.classessold,
        saleamount: props.tempData.saleamount,
        downpayment: props.tempData.downpayment,
        paymentMode: props.tempData.paymentMode,
        paymentid: props.tempData.paymentid,
        subscription: props.tempData.subscription,
        subscriptionNo: props.tempData.subscriptionNo,
        emi: props.tempData.emi,
        emiMonths: props.tempData.emiMonths,
        prm: props.tempData.prm,
        callStatus: props.tempData.callStatus,
        comments: props.tempData.comments,
        callBackon: props.tempData.callBackon,
        waMessageSent: props.tempData.waMessageSent,
        status: props.tempData.status,
        prmphoneNumber: props.tempData.prmphoneNumber,
        prm_firstname: props.tempData.prm_firstName,
        prm_lastname: props.tempData.prm_lastName,
        isSibling: props.tempData.isSibling == 1 ? 1 : 0,
        batchCode: props.tempData.batchCode,
        zoomLink: props.tempData.zoomLink,
        zoomInfo: props.tempData.zoomInfo,
        whatsappLink: props.tempData.whatsappLink,
        age: props.tempData.age,
        dateofsale: props.tempData.dateofsale ? moment(props.tempData.dateofsale).toISOString(true).split('T')[0] : props.tempData.dateofsale,
        plantype: props.tempData.plantype,
        dueDate: props.tempData.dueDate ? moment(props.tempData.dueDate).toISOString(true).split('T')[0] : props.tempData.dueDate,
        gender: props.tempData.gender,
        notes: props.tempData.notes,
        onboardingIssueReason: props.tempData.onboardingIssueReason,
        batchesClassesStartDate: props.tempData.batchesClassesStartDate ? moment(props.tempData.batchesClassesStartDate).toISOString(true).split('T')[0] : props.tempData.batchesClassesStartDate,
      })) : ('')
    };
  }
  useEffect(() => {
    defaultValues()
  },
    [
      !props.studentManageradd ? props.tempData.firstName : '',
      !props.studentManageradd ? props.tempData.batchId : '',
      !props.studentManageradd ? props.tempData.lastName : '',
      !props.studentManageradd ? props.tempData.pfirstName : '',
      !props.studentManageradd ? props.tempData.plastName : '',
      !props.studentManageradd ? props.tempData.email : '',
      !props.studentManageradd ? props.tempData.customerEmail : '',
      !props.studentManageradd ? props.tempData.studentID : '',
      !props.studentManageradd ? props.tempData.phoneNumber : '',
      !props.studentManageradd ? props.tempData.whatsapp : '',
      !props.studentManageradd ? props.tempData.alternativeMobile : '',
      !props.studentManageradd ? props.tempData.address : '',
      !props.studentManageradd ? props.tempData.state : '',
      !props.studentManageradd ? props.tempData.dob : null,
      !props.studentManageradd ? props.tempData.classType : '',
      !props.studentManageradd ? props.tempData.classtype : '',
      !props.studentManageradd ? props.tempData.course : '',
      !props.studentManageradd ? props.tempData.startLesson : '',
      !props.studentManageradd ? props.tempData.courseFrequency : '',
      !props.studentManageradd ? props.tempData.timings : '',
      !props.studentManageradd ? props.tempData.startDate : null,
      !props.studentManageradd ? props.tempData.classesStartDate : '',
      !props.studentManageradd ? props.tempData.lsq_user_name : '',
      !props.studentManageradd ? props.tempData.classessold : '',
      !props.studentManageradd ? props.tempData.saleamount : '',
      !props.studentManageradd ? props.tempData.downpayment : '',
      !props.studentManageradd ? props.tempData.paymentMode : '',
      !props.studentManageradd ? props.tempData.paymentid : '',
      !props.studentManageradd ? props.tempData.subscription : '',
      !props.studentManageradd ? props.tempData.subscriptionNo : '',
      !props.studentManageradd ? props.tempData.emi : '',
      !props.studentManageradd ? props.tempData.emiMonths : '',
      !props.studentManageradd ? props.tempData.prm : '',
      !props.studentManageradd ? props.tempData.callStatus : '',
      !props.studentManageradd ? props.tempData.comments : '',
      !props.studentManageradd ? props.tempData.callBackon : '',
      !props.studentManageradd ? props.tempData.waMessageSent : '',
      !props.studentManageradd ? props.tempData.status : '',
      !props.studentManageradd ? props.tempData.phoneNumber : '',
      !props.studentManageradd ? props.tempData.prm_firstName : '',
      !props.studentManageradd ? props.tempData.prm_lastName : '',
      !props.studentManageradd ? props.tempData.isSibling : null,
      !props.studentManageradd ? props.tempData.batchCode : '',
      !props.studentManageradd ? props.tempData.zoomLink : '',
      !props.studentManageradd ? props.tempData.zoomInfo : '',
      !props.studentManageradd ? props.tempData.whatsappLink : '',
      !props.studentManageradd ? props.tempData.id : null,
      !props.studentManageradd ? props.tempData.age : null,
      !props.studentManageradd ? props.tempData.dateofsale : null,
      !props.studentManageradd ? props.tempData.plantype : '',
      !props.studentManageradd ? props.tempData.dueDate : null,
      !props.studentManageradd ? props.tempData.comments : '',
      !props.studentManageradd ? props.tempData.gender : '',
      !props.studentManageradd ? props.tempData.notes : '',
      !props.studentManageradd ? props.tempData.onboardingIssueReason : '',
      !props.studentManageradd ? props.tempData.batchesClassesStartDate : null,
    ]
  )

  const [showRebatching, setShowRebatching] = useState<boolean>(false);

  const onChange = (data: any) => {
    const studentDetails = { ...props.tempData, ...form.getFieldsValue() };
    props.updateTempData(studentDetails)
  }

  const callback = (key: any) => {
    console.log(key);
  }

  const countrycode = (props.tempData?.phoneNumber || "NA").substring(0, 3);
  const altcountrycode = (props.tempData?.alternativeMobile || "NA").substring(0, 3);
  const whatsappcountrycode = (props.tempData?.whatsapp || "NA").substring(0, 3);

  if (access.canSuperAdmin) {
    // User is Super Admin
  }

  return (
    <Tabs defaultActiveKey="1" onChange={callback}>
      <TabPane tab="Student Details" key="1">
        <Form
          name="studentdetails"
          form={form}
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          scrollToFirstError
        >
          <Row align="center"><h2>Student Info</h2></Row>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item
                label="Student First Name"
                name="firstName"
                rules={[{
                  required: true,
                  min: 2,
                  type: 'string',
                  pattern: /^[a-zA-Z ]*$/,
                  message: "Name cannot contain numbers and special characters",
                }]}
              >
                <Input onChange={onChange} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Student Last Name"
                name="lastName"
                rules={[{
                  required: true,
                }]}
              >
                <Input onChange={onChange} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Parent First Name"
                name="pfirstName"
              >
                <Input onChange={onChange} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Parent Last Name"
                name="plastName"
              >
                <Input onChange={onChange} />
              </Form.Item>
            </Col>

            {props.studentManageredit || props.studentManageradd ? (
              <Col span={12}>
                <Form.Item name="gender" label="Gender">
                  <Select
                    onChange={onChange}
                  >
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                  </Select>
                </Form.Item>
              </Col>
            ) : ('')
            }

            <Col span={12}>
              <Form.Item
                label="Email"
                name="customerEmail"
                rules={[{
                  required: true,
                  type: 'email'
                }]}
              >
                <Input />
              </Form.Item>
            </Col>

            {props.studentManageradd || props.studentManageredit ? (
              <Col span={12}>
                <Form.Item
                  name="classType"
                  label="Class Type">
                  <Select
                    placeholder="Select Class Type" onChange={onChange}
                  >
                    <Option value="Kids">Kids</Option>
                    <Option value="Adults">Adults</Option>
                  </Select>
                </Form.Item>
              </Col>
            ) : (
              <Col span={12}>
                <Form.Item
                  name="classType"
                  label="Class Type"
                  rules={[{
                    required: true,
                  }]}>
                  <Select
                    placeholder="Select Class Type" onChange={onChange}
                  >
                    <Option value="Kids">Kids</Option>
                    <Option value="Adults">Adults</Option>
                  </Select>
                </Form.Item>
              </Col>
            )}

            <Col span={12}>
              <Form.Item
                label="ID"
                name="id"
              >
                <Input disabled />
              </Form.Item>
            </Col>

            {props.onboardpage ? (
              <Col span={12}>
                <Form.Item
                  label="Student ID"
                  name="studentID"
                  rules={[{
                    required: true,
                  }]}
                >
                  <Input disabled />
                </Form.Item>
              </Col>
            ) : (
              <Col span={12}>
                <Form.Item
                  label="Student ID"
                  name="studentID"
                  rules={[{
                    type: 'string',
                    required: true,
                    pattern: /^\S*$/,
                    message: "Student ID Cannot Have Spaces",
                  }]}
                >
                  <Input onChange={onChange} />
                </Form.Item>
              </Col>
            )}

            {props.studentManageradd || props.studentManageredit ? (
              <Col span={12}>
                <Form.Item name="dob"
                  label="Date of Birth"
                >
                  <Input type="date" onChange={onChange} />
                </Form.Item>
              </Col>
            ) : (
              <Col span={12}>
                <Form.Item name="dob"
                  label="Date of Birth"
                  rules={[{
                    required: true,
                  }]}
                >
                  <Input type="date" onChange={onChange} />
                </Form.Item>
              </Col>
            )}

            <Col span={12}>
              <Form.Item name="age" label="Age">
                <Input
                  placeholder="Age"
                  name="age"
                  disabled
                />
              </Form.Item>
            </Col>

            {countrycode == CountryCode.COUNTRYCODE_INDIA ? (
              <Col span={12}>
                <Form.Item
                  label="Registered Mobile Number"
                  name="phoneNumber"
                  rules={[{ required: true, pattern: /^\+[0-9]{12}$/, message: "Enter valid number" }]}
                >
                  <Input onChange={onChange} />

                </Form.Item>
              </Col>
            ) : (
              <Col span={12}>
                <Form.Item
                  label="Registered Mobile Number"
                  name="phoneNumber"
                  rules={[{ required: true, message: "Please enter Registered Mobile Number" }]}
                >
                  <Input onChange={onChange} />

                </Form.Item>
              </Col>
            )}

            {props.studentManageradd && whatsappcountrycode == CountryCode.COUNTRYCODE_INDIA ? (
              <Col span={12}>
                <Form.Item
                  label="Whatsapp Number"
                  name="whatsapp"
                  rules={[{ pattern: /^\+[0-9]{12}$/, message: "Enter valid number" }]}
                >
                  <Input onChange={onChange} />
                </Form.Item>
              </Col>
            ) : whatsappcountrycode == CountryCode.COUNTRYCODE_INDIA ? (
              <Col span={12}>
                <Form.Item
                  label="Whatsapp Number"
                  name="whatsapp"
                  rules={[{ required: true, pattern: /^\+[0-9]{12}$/, message: "Enter valid number" }]}
                >
                  <Input onChange={onChange} />
                </Form.Item>
              </Col>
            ) : (
              <Col span={12}>
                <Form.Item
                  label="Whatsapp Number"
                  name="whatsapp"
                  rules={[{ required: true, message: "Please Enter Whatsapp Number" }]}
                >
                  <Input onChange={onChange} />
                </Form.Item>
              </Col>
            )}

            {props.studentManageradd && altcountrycode == CountryCode.COUNTRYCODE_INDIA ? (
              <Col span={12}>
                <Form.Item
                  label="Alternate Mobile Number"
                  name="alternativeMobile"
                  rules={[{ pattern: /^\+[0-9]{12}$/, message: "Enter valid number" }]}
                >
                  <Input onChange={onChange} />
                </Form.Item>
              </Col>
            ) : altcountrycode == CountryCode.COUNTRYCODE_INDIA ? (
              <Col span={12}>
                <Form.Item
                  label="Alternate Mobile Number"
                  name="alternativeMobile"
                  rules={[{ required: true, pattern: /^\+[0-9]{12}$/, message: "Enter valid number" }]}
                >
                  <Input onChange={onChange} />
                </Form.Item>
              </Col>
            ) : (
              <Col span={12}>
                <Form.Item
                  label="Alternate Mobile Number"
                  name="alternativeMobile"
                  rules={[{ required: true, message: "Please enter Alternate Mobile number" }]}
                >
                  <Input onChange={onChange} />
                </Form.Item>
              </Col>
            )}

            {props.studentManageradd || props.studentManageredit ? (
              <Col span={12}>
                <Form.Item
                  label="Address"
                  name="address"
                >
                  <Input onChange={onChange} />
                </Form.Item>
              </Col>
            ) : (
              <Col span={12}>
                <Form.Item
                  label="Address"
                  name="address"
                  rules={[{
                    required: true,
                  }]}
                >
                  <Input onChange={onChange} />
                </Form.Item>
              </Col>
            )}

            <Col span={12}>
              <Form.Item name="isSibling"
                label="Is Sibling?">
                <Select
                  placeholder="Is Sibling" onChange={onChange}
                >
                  <Option value={1}>Yes</Option>
                  <Option value={0}>No</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="state"
                label="Customer State">
                <Select onChange={onChange}
                  placeholder="Customer State"
                >
                  {statesData.map(state => <Option value={state.label} key={state.label}>{state.value}</Option>)}
                </Select>
              </Form.Item>
            </Col>

            {props.studentManageradd || props.studentManageredit ? (
              <Col span={12}>
                <Form.Item name="startDate"
                  label="Expected Start Date">
                  <Input type="date" />
                </Form.Item>
              </Col>

            ) : props.tempData.startDate != '' ? (
              <Col span={12}>
                <Form.Item name="startDate"
                  label="Expected Start Date">
                  <Input type="date"
                    disabled />
                </Form.Item>
              </Col>

            ) : (
              <Col span={12}>
                <Form.Item name="startDate"
                  label="Expected Start Date"
                  //extra="*Please Select Expected Start Date or Form won't Save"
                  rules={[{
                    message: "Please Select Expected Start Date",
                    required: true,
                  }]}>
                  <Input type="date" onChange={onChange}
                    placeholder="Select Expected Start Date" />
                </Form.Item>
              </Col>
            )
            }

            {props.studentManageredit || props.studentManageradd ? (
              <Col span={12}>
                <Form.Item name="classesStartDate"
                  label="First Ever Start Date"
                >
                  <Input type="date" onChange={onChange} disabled={access.canSuperAdmin ? false : !props.tempData.canEditStartDate} />
                </Form.Item>
              </Col>
            ) : props.salesAlert ? (
              ''
            ) : (
              <Col span={12}>
                <Form.Item name="classesStartDate"
                  label="First Ever Start Date"
                  rules={[{
                    required: true,
                  }]}
                >
                  <Input type="date" onChange={onChange} disabled={access.canSuperAdmin ? false : !props.tempData.canEditStartDate} />
                </Form.Item>
              </Col>
            )}

            {props.studentManageradd || props.studentManageredit ? (
              <Col span={12}>
                <Form.Item
                  name="prm"
                  label="PRM Name"
                >
                  <Select style={{ width: 100 + "%" }} onChange={onChange}>
                    {prmData.map(prm => <Option value={prm.id} key={prm.id}>{prm.firstName} {prm.lastName}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
            ) : (
              <Col span={12}>
                <Form.Item
                  name="prm"
                  label="PRM Name"
                  rules={[{
                    required: true,
                  }]}>
                  <Select style={{ width: 100 + "%" }} onChange={onChange}>
                    {prmData.map(prm => <Option value={prm.id} key={prm.id}>{prm.firstName} {prm.lastName}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
            )}


            {props.studentManageredit || props.studentManageradd ? (
              <Col span={12}>
                <Form.Item
                  name="callStatus"
                  label="Call Status">
                  <Select
                    placeholder="Select Call Status"
                  >
                    <Option value="Answered">Answered</Option>
                    <Option value="DNP">DNP</Option>
                    <Option value="Call Back Later">Call Back Later</Option>
                    <Option value="Placement test pending">Placement test pending</Option>
                  </Select>
                </Form.Item>
              </Col>
            ) : props.salesAlert ? (
              ''
            ) : (
              <Col span={12}>
                <Form.Item
                  name="callStatus"
                  label="Call Status"
                  rules={[{
                    required: true,
                  }]}>
                  <Select
                    placeholder="Select Call Status"
                  >
                    <Option value="Answered">Answered</Option>
                    <Option value="DNP">DNP</Option>
                    <Option value="Call Back Later">Call Back Later</Option>
                    <Option value="Placement test pending">Placement test pending</Option>
                  </Select>
                </Form.Item>
              </Col>
            )}

            {props.studentManageredit || props.studentManageradd ? (
              <Col span={12}>
                <Form.Item
                  label="PRM Comments"
                  name="callBackon"
                >
                  <Input />
                </Form.Item>
              </Col>
            ) : !props.salesAlert ? (
              <Col span={12}>
                <Form.Item
                  label="PRM Comments"
                  name="callBackon"
                  rules={[{
                    required: true,
                  }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            ) : ('')
            }

            {props.studentManageredit || props.welcomepage ? (
              <Col span={12}>
                <Form.Item
                  label="Welcome Message"
                  name="message"
                >
                  <a
                    onClick={() => {
                      openNotification('info', props.tempData.phoneNumber, props.tempData.prm_firstName, props.tempData.prm_lastName)
                    }}
                  >
                    <EyeOutlined />
                  </a>
                </Form.Item>
              </Col>
            ) : ('')
            }

            {props.studentManageredit || props.onboardpage ? (
              <Col span={12}>
                <Form.Item
                  label="Onboarding Message"
                  name="onboardmessage"
                >
                  <a
                    onClick={() => {
                      openonboardNotification('info', props.tempData.phoneNumber, props.tempData.courseFrequency, props.tempData.timings, props.tempData.zoomLink, props.tempData.prm_firstName, props.tempData.prm_lastName, props.tempData.classesStartDate, props.tempData.zoomInfo, props.tempData.batchCode, props.tempData.whatsappLink, props.tempData.classCode, props.tempData.useNewZoomLink)
                    }}
                  >
                    <EyeOutlined />
                  </a>
                </Form.Item>
              </Col>
            ) : ('')
            }

            {props.studentManageradd || props.studentManageredit ? (
              <Col span={12}>
                <Form.Item
                  name="waMessageSent"
                  label="Whatsapp Message Sent">
                  <Select
                    placeholder="Select Yes/No"
                  >
                    <Option value="Yes">Yes</Option>
                    <Option value="No">No</Option>
                  </Select>
                </Form.Item>
              </Col>
            ) : !props.salesAlert ? (
              <Col span={12}>
                <Form.Item
                  name="waMessageSent"
                  label="Whatsapp Message Sent"
                  rules={[{
                    required: true,
                  }]}>
                  <Select
                    placeholder="Select Yes/No"
                  >
                    <Option value="Yes">Yes</Option>
                    <Option value="No">No</Option>
                  </Select>
                </Form.Item>
              </Col>
            ) : ('')
            }

            {props.onboardpage ? (
              <Col span={12}>
                <Form.Item
                  label="Whatsapp Group Link"
                  name="whatsappLink"
                >
                  <Input disabled />
                </Form.Item>
              </Col>
            ) : ''
            }

            {props.studentManageredit || props.studentManageradd ? (
              <Col span={12}>
                <Form.Item
                  label="Rebatch Class Start Date"
                  name="batchesClassesStartDate"
                >
                  <Input type="date" onChange={onChange} />
                </Form.Item>
              </Col>
            ) : !props.onboardpage ? (
              ''
            ) : (
              <Col span={12}>
                <Form.Item
                  label="Rebatch Class Start Date"
                  name="batchesClassesStartDate"
                >
                  <Input type="date" onChange={onChange} />
                </Form.Item>
              </Col>
            )}

            {props.studentManageredit && !props.studentManageradd && !props.salesAlert ? (
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{
                    required: true,
                  }]}>
                  <Select placeholder="Select Status" onChange={onChange}>
                    <Option value="enrolled">Enrolled</Option>
                    <Option value="startclasslater">Start Class Later</Option>
                    <Option value="batching">Ready to batch</Option>
                    <Option value="onboarding">Onboarding</Option>
                    <Option value="active">Active</Option>
                    <Option value="onboardingIssue">Onboarding Issue</Option>
                    {access.canSuperAdmin ? (
                      <>
                        <Option value="inactive">InActive</Option>
                        <Option value='Error'>Error</Option>
                      </>
                    ) : ('')}
                  </Select >
                </Form.Item >
              </Col >
            ) : ('')}
            {!props.studentManageradd && !props.welcomepage && props.tempData.status === "onboardingIssue" ?
              (<Col span={12}>
                <Form.Item
                  name="onboardingIssueReason"
                  label="Onboarding Issue Reason"
                  rules={[{
                    required: true,
                  }]}>
                  <Input type="text" onChange={onChange} />
                </Form.Item>
              </Col>) : ('')
            }
          </Row>

          {!props.studentManageradd ? (
            <><Row align="center"><h2>Payment Info</h2></Row><Row gutter={16}>
              {props.studentManageredit ? (
                <Col span={12}>
                  <Form.Item
                    label="Transaction ID"
                    name="paymentid"
                  >
                    <Input />
                  </Form.Item>
                </Col>
              ) : (
                <Col span={12}>
                  <Form.Item
                    label="Transaction ID"
                    name="paymentid"
                    rules={[{
                      required: true,
                    }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              )}

              <Col span={12}>
                <Form.Item name="plantype" label="Plan Type">
                  <Select
                    placeholder="Plan type"
                    onChange={onChange}
                  >
                    <Option value="New Sale">New Sale</Option>
                    <Option value="Renewal">Renewal</Option>
                  </Select>
                </Form.Item>
              </Col>

              {props.studentManageredit ? (
                <Col span={12}>
                  <Form.Item
                    name="classtype"
                    label="Class Type">
                    <Select
                      placeholder="Select Class Type"
                      onChange={onChange}
                    >
                      <Option value="Group">Group</Option>
                      <Option value="One to One">One to One</Option>
                    </Select>
                  </Form.Item>
                </Col>
              ) : (
                <Col span={12}>
                  <Form.Item
                    name="classtype"
                    label="Class Type"
                    rules={[{
                      required: true,
                    }]}>
                    <Select
                      placeholder="Select Class Type"
                      onChange={onChange}
                    >
                      <Option value="Group">Group</Option>
                      <Option value="One to One">One to One</Option>
                    </Select>
                  </Form.Item>
                </Col>
              )}

              {props.studentManageredit ? (
                <Col span={12}>
                  <Form.Item
                    label="Classes Sold"
                    name="classessold">
                    <Select placeholder="classessold" onChange={onChange}>
                      <Option value="30">30</Option>
                      <Option value="40">40</Option>
                      <Option value="50">50</Option>
                      <Option value="60">60</Option>
                      <Option value="80">80</Option>
                      <Option value="100">100</Option>
                      <Option value="200">200</Option>
                      <Option value="300">300</Option>
                      <Option value="400">400</Option>
                    </Select>
                  </Form.Item>
                </Col>
              ) : (
                <Col span={12}>
                  <Form.Item
                    label="Classes Sold"
                    name="classessold"
                    rules={[{
                      required: true,
                    }]}>
                    <Select placeholder="classessold" onChange={onChange}>
                      <Option value="30">30</Option>
                      <Option value="40">40</Option>
                      <Option value="50">50</Option>
                      <Option value="60">60</Option>
                      <Option value="80">80</Option>
                      <Option value="100">100</Option>
                      <Option value="200">200</Option>
                      <Option value="300">300</Option>
                      <Option value="400">400</Option>
                    </Select>
                  </Form.Item>
                </Col>
              )}

              {props.studentManageredit ? (
                <Col span={12}>
                  <Form.Item
                    label="Total Sale Amount"
                    name="saleamount"
                    rules={[{ pattern: /^[0-9]*$/, message: "Enter number only" }]}
                  >
                    <Input onChange={onChange} type="number" />
                  </Form.Item>
                </Col>
              ) : (
                <Col span={12}>
                  <Form.Item
                    label="Total Sale Amount"
                    name="saleamount"
                    rules={[{ required: true, pattern: /^[0-9]*$/, message: "Enter number only" }]}
                  >
                    <Input onChange={onChange} type="number" />
                  </Form.Item>
                </Col>
              )}

              <Col span={12}>
                <Form.Item name="dateofsale"
                  label="Date Of Sale"
                >
                  <Input type="date" />
                </Form.Item>
              </Col>

              {props.studentManageredit ? (
                <Col span={12}>
                  <Form.Item
                    label="Down Payment"
                    name="downpayment"
                    rules={[{ pattern: /^[0-9]*$/, message: "Enter number only" }]}
                  >
                    <Input onChange={onChange} type="number" />
                  </Form.Item>
                </Col>
              ) : (
                <Col span={12}>
                  <Form.Item
                    label="Down Payment"
                    name="downpayment"
                    rules={[{ required: true, pattern: /^[0-9]*$/, message: "Enter number only" }]}
                  >
                    <Input onChange={onChange} type="number" />
                  </Form.Item>
                </Col>
              )}

              <Col span={12}>
                <Form.Item name="dueDate"
                  label="Due Date"
                >
                  <Input type="date" onChange={onChange} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="comments" label="BDA Comments">
                  <Input
                    placeholder="BDA Comments" onChange={onChange} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="notes" label="Notes">
                  <Input
                    placeholder="Notes" onChange={onChange} />
                </Form.Item>
              </Col>

              {!props.studentManageredit ? (
                <><Col span={12}>
                  <Form.Item
                    name="lsq_user_name"
                    label="Sales Owner"
                    rules={[{
                      required: true,
                    }]}
                  >
                    <Select style={{ width: 100 + "%" }} onChange={onChange}>
                      {lsqUsersData.map(user => <Option value={user.ID} key={user.ID}>{user.FirstName} {user.LastName}</Option>)}
                    </Select>
                  </Form.Item>
                </Col><Col span={12}>
                    <Form.Item
                      name="paymentMode"
                      label="Plan Mode"
                      rules={[{
                        required: true,
                      }]}
                    >
                      <Select placeholder="Select Plan Mode" onChange={onChange}>
                        <Option value="Razorpay">Razorpay</Option>
                        <Option value="Netbanking">Bank Transfer</Option>
                        <Option value="Cashfree">Cashfree</Option>
                      </Select>
                    </Form.Item>
                  </Col><Col span={12}>
                    <Form.Item
                      name="subscription"
                      label="Subscription Type"
                      rules={[{
                        required: true,
                      }]}>
                      <Select placeholder="Select Subscription Type">
                        <Option value="Manual">Manual</Option>
                        <Option value="Auto-Debit">Auto-Debit</Option>
                        <Option value="One-Time">One-Time</Option>
                      </Select>
                    </Form.Item>
                  </Col><Col span={12}>
                    <Form.Item
                      label="Subscription Number"
                      name="subscriptionNo"
                      rules={[{
                        required: true,
                      }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col><Col span={12}>
                    <Form.Item
                      label="Subscription Amount"
                      name="emi"
                      rules={[{ required: true, pattern: /^[0-9]*$/, message: "Enter number only" }]}
                    >
                      <Input type="number" />
                    </Form.Item>
                  </Col><Col span={12}>
                    <Form.Item
                      label="Months Of Subscription"
                      name="emiMonths"
                      rules={[{ required: true, pattern: /^[0-9]*$/, message: "Enter number only" }]}
                    >
                      <Input type="number" />
                    </Form.Item>
                  </Col></>
              ) : (
                <><Col span={12}>
                  <Form.Item
                    name="lsq_user_name"
                    label="Sales Owner"
                  >
                    <Select style={{ width: 100 + "%" }} onChange={onChange}>
                      {lsqUsersData.map(user => <Option value={user.ID} key={user.ID}>{user.FirstName} {user.LastName}</Option>)}
                    </Select>
                  </Form.Item>
                </Col><Col span={12}>
                    <Form.Item
                      name="paymentMode"
                      label="Plan Mode"
                    >
                      <Select placeholder="Select Plan Mode" onChange={onChange}>
                        <Option value="Razorpay">Razorpay</Option>
                        <Option value="Netbanking">Bank Transfer</Option>
                        <Option value="Cashfree">Cashfree</Option>
                      </Select>
                    </Form.Item>
                  </Col><Col span={12}>
                    <Form.Item
                      name="subscription"
                      label="Subscription Type">
                      <Select placeholder="Select Subscription Type">
                        <Option value="Manual">Manual</Option>
                        <Option value="Auto-Debit">Auto-Debit</Option>
                      </Select>
                    </Form.Item>
                  </Col><Col span={12}>
                    <Form.Item
                      label="Subscription Number"
                      name="subscriptionNo"
                    >
                      <Input />
                    </Form.Item>
                  </Col><Col span={12}>
                    <Form.Item
                      label="Subscription Amount"
                      name="emi"
                      rules={[{ pattern: /^[0-9]*$/, message: "Enter number only" }]}
                    >
                      <Input onChange={onChange} type="number" />
                    </Form.Item>
                  </Col><Col span={12}>
                    <Form.Item
                      label="Months Of Subscription"
                      name="emiMonths"
                      rules={[{ pattern: /^[0-9]*$/, message: "Enter number only" }]}
                    >
                      <Input onChange={onChange} type="number" />
                    </Form.Item>
                  </Col></>
              )}
            </Row></>
          ) : ('')
          }


          <Row>
            <Col span={24}>
              <Button
                type="primary"
                htmlType="submit"
                value="Save Changes"
                onClick={onChange}
                shape="round"
                block
                style={{ color: "white", backgroundColor: "DodgerBlue" }}
              >Save Changes</Button>
            </Col>
          </Row>
        </Form>
      </TabPane>

      {
        props.studentManageradd ? ('') : (
          <TabPane tab="Batch Details" key="2">
            <Form
              name="batchdetails"
              form={form}
              labelCol={{
                span: 8,
              }}
              wrapperCol={{
                span: 16,
              }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Batch Code"
                    name="batchCode"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Zoom Link"
                    name="zoomLink"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Zoom Info"
                    name="zoomInfo"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>

                {props.studentManageradd || props.studentManageredit ? (
                  <Col span={12}>
                    <Form.Item
                      name="course"
                      label="Course">
                      <Select
                        placeholder="Select Course"
                      >
                        <Option value="DISE - Group Class">DISE - Group Class</Option>
                        <Option value="DISE - 1:1">DISE - 1:1</Option>
                        <Option value="IELTS - Group Class">IELTS - Group Class</Option>
                        <Option value="IELTS - 1:1">IELTS - 1:1</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                ) : (
                  <Col span={12}>
                    <Form.Item
                      name="course"
                      label="Course"
                      rules={[{
                        required: true,
                      }]}>
                      <Select
                        placeholder="Select Course"
                      >
                        <Option value="DISE - Group Class">DISE - Group Class</Option>
                        <Option value="DISE - 1:1">DISE - 1:1</Option>
                        <Option value="IELTS - Group Class">IELTS - Group Class</Option>
                        <Option value="IELTS - 1:1">IELTS - 1:1</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                )}

                {props.studentManageradd || props.studentManageredit ? (
                  <Col span={12}>
                    <Form.Item
                      name="startLesson"
                      label="Starting Lesson">
                      <Select
                        placeholder="Select Starting Lesson"
                      >
                        <Option value="Placement Pending">Placement Pending</Option>
                        <Option value="Lesson 1">Lesson 1</Option>
                        <Option value="Lesson 31">Lesson 31</Option>
                        <Option value="Lesson 61">Lesson 61</Option>
                        <Option value="Lesson 107">Lesson 107</Option>
                        <Option value="Lesson 201">Lesson 201</Option>
                        <Option value="Lesson 301">Lesson 301</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                ) : (
                  <Col span={12}>
                    <Form.Item
                      name="startLesson"
                      label="Starting Lesson"
                      rules={[{
                        required: true,
                      }]}>
                      <Select
                        placeholder="Select Starting Lesson"
                      >
                        <Option value="Lesson 1">Lesson 1</Option>
                        <Option value="Lesson 31">Lesson 31</Option>
                        <Option value="Lesson 61">Lesson 61</Option>
                        <Option value="Lesson 107">Lesson 107</Option>
                        <Option value="Lesson 201">Lesson 201</Option>
                        <Option value="Lesson 301">Lesson 301</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                )}


                {props.studentManageradd || props.studentManageredit ? (
                  <Col span={12}>
                    <Form.Item
                      name="courseFrequency"
                      label="Course Frequency">
                      <Select
                        placeholder="Select Course Frequency"
                      >
                        <Option value="MWF">MWF</Option>
                        <Option value="TTS">TTS</Option>
                        <Option value="SS">SS</Option>
                        <Option value="MTWTF">MTWTF</Option>
                        <Option value="TT">TT</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                ) : (
                  <Col span={12}>
                    <Form.Item
                      name="courseFrequency"
                      label="Course Frequency"
                      rules={[{
                        required: true,
                      }]}>
                      <Select
                        placeholder="Select Course Frequency"
                      >
                        <Option value="MWF">MWF</Option>
                        <Option value="TTS">TTS</Option>
                        <Option value="SS">SS</Option>
                        <Option value="MTWTF">MTWTF</Option>
                        <Option value="TT">TT</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                )}


                {props.studentManageradd || props.studentManageredit ? (
                  <Col span={12}>
                    <Form.Item
                      name="timings"
                      label="Timings">
                      <Select
                        placeholder="Select Class Timings"
                      >
                        <Option value="15:00">15:00</Option>
                        <Option value="16:30">16:30</Option>
                        <Option value="18:00">18:00</Option>
                        <Option value="19:30">19:30</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                ) : (
                  <Col span={12}>
                    <Form.Item
                      name="timings"
                      label="Timings"
                      rules={[{
                        required: true,
                      }]}>
                      <Select
                        placeholder="Select Class Timings"
                      >
                        <Option value="15:00">15:00</Option>
                        <Option value="16:30">16:30</Option>
                        <Option value="18:00">18:00</Option>
                        <Option value="19:30">19:30</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                )}
              </Row >

              <Row>
                <Col span={12}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    value="Save Changes"
                    onClick={onChange}
                    shape="round"
                    block
                    style={{ color: "white", backgroundColor: "DodgerBlue" }}
                  >Save Changes</Button>
                </Col>
                <Col span={12}>
                  <Rebatching data={props.tempData} show={showRebatching} setShow={setShowRebatching} />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <StudentBatchesHistory data={props.tempData} />
                </Col>
              </Row>
            </Form>
          </TabPane>
        )
      }
    </Tabs >
  )
};

export default Studentdetailsedit;
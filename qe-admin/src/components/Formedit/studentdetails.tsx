import { EyeOutlined } from '@ant-design/icons';
import { Form, Input, Button, Select, Col, Row, notification } from 'antd';
import moment from 'moment';
import { useEffect } from 'react';
import lsqUsersData from "../../../data/lsq_users.json";
import prmData from "../../../data/prms.json";
import statesData from "../../../data/stateCustomer.json";

const { Option } = Select;

export type StudentdetailseditProps = {
  tempData: {
    leadId?: string;
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    pfirstName?: string;
    plastName?: string;
    customerEmail?: string;
    studentID?: string;
    phoneNumber?: string;
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
    saleamount?: string;
    downpayment?: string;
    paymentMode?: string;
    paymentid?: string;
    subscription?: string;
    subscriptionNo?: string;
    emi?: string;
    emiMonths?: string;
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
    isSibling?: any;
    batchCode?: string;
    zoomLink?: string;
    zoomInfo?: string;
    whatsappLink?: string;
  },
  submit: (data: any) => any;
  updateTempData: (data: any) => any;
  salesAlert: '';
};

const Studentdetailsedit: React.FC<StudentdetailseditProps> = (props) => {

  function stringContainsNumber(_string: any) {
    return /\d/.test(_string);
  }

  const onFinish = (value: any) => {
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
      classType: value.classType,
      id: value.id,
      type: 'student',
      status: value.status,
      alternativeMobile: value.alternativeMobile,
      course: value.course,
      startLesson: value.startLesson,
      startDate: moment(value.startDate, "YYYY-MM-DD").format("YYYY-MM-DD"),
      classesStartDate: value.classesStartDate ? moment(value.classesStartDate, "YYYY-MM-DD").format("YYYY-MM-DD") : null,
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
    if (props.tempData.status == 'Enrolled') {
      if (value.saleamount == (Number(value.emi * value.emiMonths) + Number(value.downpayment))) {
        props.submit(dataForm);
      } else {
        notification.open({
          message: 'Sales Amount Error',
          description:
            'Enter valid sale amount, subscription Months, subscription amount and downpayment',
        });
      }
    } else {
      props.submit(dataForm);
    }
    console.log('Data', dataForm)
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const openonboardNotification = (type: string, message: string, days: string, timings: string, zoomLink: string, prm_firstName: string, prm_lastName: string, classDate: any, zoomInfo: any, batchCode: any, whatsappLink: string) => {
    const waMessage = (
      <div>
        <p>Hello <br />
          I am your Academic Counsellor {prm_firstName} {prm_lastName} from The Queen’s English and I am thrilled to inform you that your live classes will be starting on {moment(classDate, "YYYY-MM-DD").format("YYYY-MM-DD")}, you can use the below details to join your
          classes:<br />
          Zoom Link: {zoomLink} <br />
          Whatsapp Group Link: {whatsappLink} <br />
          Topic: {batchCode}<br />
          Time: {timings} India<br />
          <span dangerouslySetInnerHTML={{ __html: zoomInfo }}></span> <br /> <br />
          (The details above are recurring and hence you can use the same details to join the class everyday)<br />
          Please send “OK” or a “:+1:” to activate the link above.<br />
          For any support please feel free to reach out to us on our customer support number: +91 81435 13850<br />
          Queen's English मे अगर आपको किसी तरह की सहायता या कोर्स को लेकर कोई समयस्या हो तो आप हमारे हेल्प्लायन नम्बर 8143513850 पर कॉल कर सकते हैं।
          We are really excited to see you soon in class! Happy Learning!_<br /></p>
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

  const openNotification = (type: string, message: string, prm_firstName: string, prm_lastName: string) => {
    const waMessage = (
      <div>
        <p>Hello <br />
          We're delighted to welcome you aboard The Queen's English.<br />
          I'll be your academic counsellor, and my name is {prm_firstName} {prm_lastName}.<br />
          We are ecstatic to have you join us in learning excellent English. Please find your login information for the app below, which allows you to practice spoken English with real-time feedback.<br />
          Step 1: Go to the Google Play Store and download the app using the following link:
          <a>https://queensenglish.co/app</a><br />
          User information:<br />
          Phone: {message}<br />
          Please use your registered phone number to log in (once your classes have started).<br />
          We're also very excited to share our support phone number with you. If you have a question or a problem, you can call us at 81435 13850<br />
          Queen's English मे अगर आपको किसी तरह की सहायता या कोर्स को लेकर कोई समयस्या हो तो आप हमारे हेल्प्लायन नम्बर 8143513850 पर कॉल कर सकते हैं।_</p>
      </div>
    )

    notification[type]({
      message: 'Whatsapp message',
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
    form.setFieldsValue({
      firstName: props.tempData.firstName,
      lastName: props.tempData.lastName,
      pfirstName: props.tempData.pfirstName,
      plastName: props.tempData.plastName,
      customerEmail: props.tempData.customerEmail,
      studentID: props.tempData.studentID,
      leadId: props.tempData.leadId,
      id: props.tempData.id,
      phoneNumber: props.tempData.phoneNumber,
      whatsapp: props.tempData.whatsapp,
      alternativeMobile: props.tempData.alternativeMobile,
      address: props.tempData.address,
      state: props.tempData.state,
      dob: moment(props.tempData.dob, "YYYY-MM-DD").format("YYYY-MM-DD"),
      classType: props.tempData.classType,
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
    });
  }
  useEffect(() => {
    defaultValues();
  },
    [
      props.tempData.firstName,
      props.tempData.lastName,
      props.tempData.pfirstName,
      props.tempData.plastName,
      props.tempData.customerEmail,
      props.tempData.studentID,
      props.tempData.phoneNumber,
      props.tempData.whatsapp,
      props.tempData.alternativeMobile,
      props.tempData.address,
      props.tempData.state,
      props.tempData.dob,
      props.tempData.classType,
      props.tempData.course,
      props.tempData.startLesson,
      props.tempData.courseFrequency,
      props.tempData.timings,
      props.tempData.startDate,
      props.tempData.classesStartDate,
      props.tempData.lsq_user_name,
      props.tempData.classessold,
      props.tempData.saleamount,
      props.tempData.downpayment,
      props.tempData.paymentMode,
      props.tempData.paymentid,
      props.tempData.subscription,
      props.tempData.subscriptionNo,
      props.tempData.emi,
      props.tempData.emiMonths,
      props.tempData.prm,
      props.tempData.callStatus,
      props.tempData.comments,
      props.tempData.callBackon,
      props.tempData.waMessageSent,
      props.tempData.status,
      props.tempData.phoneNumber,
      props.tempData.prm_firstName,
      props.tempData.prm_lastName,
      props.tempData.isSibling,
      props.tempData.batchCode,
      props.tempData.zoomLink,
      props.tempData.zoomInfo,
      props.tempData.whatsappLink,
      props.tempData.id,
    ]
  )

  const onChange = (data: any) => {
    const studentDetails = { ...props.tempData, ...form.getFieldsValue() };
    props.updateTempData(studentDetails)
  }


  return (
    <Form
      name="welcomestudentdetails"
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
            label="Student First Name"
            name="firstName"
            rules={[{
              required: true,
              min: 2,
              type: 'string',
              pattern: /^[a-zA-Z ]*$/,
            }]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Student Last Name"
            name="lastName"
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Parent First Name"
            name="pfirstName"
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Parent Last Name"
            name="plastName"
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Customer Email"
            name="customerEmail"
            rules={[{
              required: true,
              type: 'email'
            }]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="ID"
            name="id"
            rules={[{
              required: true,
            }]}
          >
            <Input disabled />
          </Form.Item>
        </Col>

        {props.tempData.status == 'Onboarding' ? (

          <><Col span={12}>
            <Form.Item
              label="Batch Code"
              name="batchCode"
            >
              <Input disabled />
            </Form.Item>
          </Col><Col span={12}>
              <Form.Item
                label="Zoom Link"
                name="zoomlink"
              >
                <Input disabled />
              </Form.Item>
            </Col><Col span={12}>
              <Form.Item
                label="Zoom Info"
                name="zoomInfo"
              >
                <Input disabled />
              </Form.Item>
            </Col></>

        ) : ''

        }

        {props.tempData.status == 'Onboarding' ? (
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
                message: "Lead ID Cannot Have Spaces",
              }]}
            >
              <Input />
            </Form.Item>
          </Col>
        )
        }
        <Col span={12}>
          <Form.Item
            label="Registered Mobile Number"
            name="phoneNumber"
            rules={[{ required: true, pattern: /^\+[0-9]{12}$/, message: "Enter valid number" }]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Whatsapp Number"
            name="whatsapp"
            rules={[{ required: true, pattern: /^\+[0-9]{12}$/, message: "Enter valid number" }]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Alternate Mobile Number"
            name="alternativeMobile"
            rules={[{ required: true, pattern: /^\+[0-9]{12}$/, message: "Enter valid number" }]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="dob"
            label="Date of Birth"
            extra="*Please Select Date Of Birth or Form won't Save"
            rules={[{
              required: true,
            }]}
          >
            <Input type="date"
              value={moment(props.tempData.dob, "YYYY-MM-DD").format("YYYY-MM-DD")} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Address"
            name="address"
            rules={[{
              required: true,
            }]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="state"
            label="Customer State"
            rules={[{
              required: true,
            }]}>
            <Select
              placeholder="Customer State"
            >
              {statesData.map(state => <Option value={state.label} key={state.label}>{state.value}</Option>)}
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="classType"
            label="Class Type"
            rules={[{
              required: true,
            }]}>
            <Select
              placeholder="Select Class Type"
            >
              <Option value="Kids">Kids</Option>
              <Option value="Adults">Adults</Option>
            </Select>
          </Form.Item>
        </Col>

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
              <Option value="Lesson 121">Lesson 121</Option>
              <Option value="Lesson 201">Lesson 201</Option>
              <Option value="Lesson 221">Lesson 221</Option>
              <Option value="Lesson 240">Lesson 240</Option>
              <Option value="Lesson 301">Lesson 301</Option>
            </Select>
          </Form.Item>
        </Col>

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
            </Select>
          </Form.Item>
        </Col>

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

        {props.tempData.startDate != '' ? (
          <Col span={12}>
            <Form.Item name="startDate"
              label="Expected Start Date">
              <Input type="date"
                value={moment(props.tempData.startDate, "YYYY-MM-DD").format("YYYY-MM-DD")} disabled />
            </Form.Item>
          </Col>

        ) :
          <Col span={12}>
            <Form.Item name="startDate"
              label="Expected Start Date"
              extra="*Please Select Expected Start Date or Form won't Save"
              rules={[{
                message: "Please Select Expected Start Date",
                required: true,
              }]}>
              <Input type="date"
                placeholder="Select Expected Start Date" />
            </Form.Item>
          </Col>
        }

        {props.tempData.status == 'Onboarding' ? (
          <Col span={12}>
            <Form.Item name="classesStartDate"
              label="Actual Start Date"
              rules={[{
                required: true,
              }]}
            >
              <Input type="date"
                value={moment(props.tempData.classesStartDate, "YYYY-MM-DD").format("YYYY-MM-DD")} />
            </Form.Item>
          </Col>
        ) : ''
        }

        <Col span={12}>
          <Form.Item
            name="lsq_user_name"
            label="Sales Owner"
            rules={[{
              required: true,
            }]}
          >
            <Select style={{ width: 100 + "%" }} >
              {lsqUsersData.map(user => <Option value={user.ID} key={user.ID}>{user.FirstName} {user.LastName}</Option>)}
            </Select>
          </Form.Item>
        </Col>

        {props.tempData.status != 'Onboarding' ? (

          <><Col span={12}>
            <Form.Item
              label="Classes Sold"
              name="classessold"
              rules={[{
                required: true,
              }]}
            >
              <Select placeholder="classessold">
                <Option value="60">60</Option>
                <Option value="100">100</Option>
                <Option value="200">200</Option>
                <Option value="300">300</Option>
                <Option value="400">400</Option>
              </Select>
            </Form.Item>
          </Col><Col span={12}>
              <Form.Item
                label="Total Sale Amount"
                name="saleamount"
                rules={[{ required: true, pattern: /^[0-9]*$/, message: "Enter number only" }]}
              >
                <Input />
              </Form.Item>
            </Col><Col span={12}>
              <Form.Item
                label="Down Payment"
                name="downpayment"
                rules={[{ required: true, pattern: /^[0-9]*$/, message: "Enter number only" }]}
              >
                <Input />
              </Form.Item>
            </Col><Col span={12}>
              <Form.Item
                name="paymentMode"
                label="Plan Mode"
                rules={[{
                  required: true,
                }]}
              >
                <Select placeholder="Select Plan Mode">
                  <Option value="razorpay">Razorpay</Option>
                  <Option value="banktransfer">Bank Transfer</Option>
                  <Option value="cashfree">Cashfree</Option>
                </Select>
              </Form.Item>
            </Col><Col span={12}>
              <Form.Item
                label="Transaction ID"
                name="paymentid"
                rules={[{
                  required: true,
                }]}
              >
                <Input />
              </Form.Item>
            </Col><Col span={12}>
              <Form.Item
                name="subscription"
                label="Subscription Type"
                rules={[{
                  required: true,
                }]}>
                <Select
                  placeholder="Select Subscription Type"
                >
                  <Option value="Manual">Manual</Option>
                  <Option value="Auto-Debit">Auto-Debit</Option>
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
                <Input />
              </Form.Item>
            </Col><Col span={12}>
              <Form.Item
                label="Months Of Subscription"
                name="emiMonths"
                rules={[{ required: true, pattern: /^[0-9]*$/, message: "Enter number only" }]}
              >
                <Input />
              </Form.Item>
            </Col></>
        ) : ''
        }

        <Col span={12}>
          <Form.Item
            name="prm"
            label="PRM Name"
            rules={[{
              required: true,
            }]}>
            <Select style={{ width: 100 + "%" }} >
              {prmData.map(prm => <Option value={prm.id} key={prm.id}>{prm.firstName} {prm.lastName}</Option>)}
            </Select>
          </Form.Item>
        </Col>

        {!props.salesAlert ? (
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
        ) : ''
        }

        {!props.salesAlert ? (
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
        ) : ''
        }

        <Col span={12}>
          <Form.Item
            label="BDA Comments"
            name="comments"
          >
            <Input />
          </Form.Item>
        </Col>

        {!props.salesAlert ? (
          <Col span={12}>
            <Form.Item
              label="Message"
              name="message"
            >
              <a
                onClick={() => {
                  openNotification('info', props.tempData.message, props.tempData.prm_firstName, props.tempData.prm_lastName)
                }}
              >
                <EyeOutlined />
              </a>
            </Form.Item>
          </Col>
        ) : ''
        }

        {props.tempData.status == 'Onboarding' ? (
          <Col span={12}>
            <Form.Item
              label="Message"
              name="message"
            >
              <a
                onClick={() => {
                  openonboardNotification('info', props.tempData.phoneNumber, props.tempData.courseFrequency, props.tempData.timings, props.tempData.zoomLink, props.tempData.prm_firstName, props.tempData.prm_lastName, props.tempData.classesStartDate, props.tempData.zoomInfo, props.tempData.batchCode, props.tempData.whatsappLink)
                }}
              >
                <EyeOutlined />
              </a>
            </Form.Item>
          </Col>
        ) : ''
        }

        {!props.salesAlert ? (
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
        ) : ''
        }

        {props.tempData.status == 'Onboarding' ? (
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

        <Col span={12}>
          <Form.Item name="isSibling"
            label="Is Sibling?">
            <Select
              placeholder="Is Sibling"
            >
              <Option value={1}>Yes</Option>
              <Option value={0}>No</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="status"
            label="Status"
            rules={[{
              required: true,
            }]}>
            <Select
              placeholder="Select Status"
            >
              <Option value="Enrolled">Enrolled</Option>
              <Option value="startclasslater">Start Class Later</Option>
              <Option value="Ready to batch">Ready to batch</Option>
              <Option value="Onboarding">Onboarding</Option>
              <Option value="Active">Active</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        wrapperCol={{
          offset: 8,
          span: 16,
        }}
      >
        <Button type="primary" htmlType="submit" onChange={onChange}>
          Submit
        </Button>
      </Form.Item>
    </Form>
  )
};

export default Studentdetailsedit;
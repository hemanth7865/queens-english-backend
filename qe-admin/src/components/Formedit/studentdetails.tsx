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
    id?: string;
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
  },
  submit: (data: any) => any;
  updateTempData: (data: any) => any;
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
      id: props.tempData.id,
      type: 'student',
      status: value.status,
      alternativeMobile: value.alternativeMobile,
      course: value.course,
      startLesson: value.startLesson,
      startDate: moment(value.startDate, "YYYY-MM-DD").format("YYYY-MM-DD"),
      classesStartDate: moment(value.classesStartDate, "YYYY-MM-DD").format("YYYY-MM-DD"),
      pfirstName: value.pfirstName,
      plastName: value.plastName,
      callStatus: value.callStatus,
      callBackon: value.callBackon,
      courseFrequency: value.courseFrequency,
      timings: value.timings,
      waMessageSent: value.waMessageSent,
      state: value.state,
      isSibling: value.isSibling ? value.isSibling : 0,
      prm_id: String(value.prm).length < 3 && parseInt(value.prm) > 0 ? value.prm : value.prm_id,
      salesowner: stringContainsNumber(value.lsq_user_name) ? value.lsq_user_name : value.lsq_user_id,
      payment: [{
        paymentid: value.paymentid,
        studentId: props.tempData.id,
        classessold: value.classessold,
        saleamount: value.saleamount,
        downpayment: value.downpayment,
        classtype: '',
        leadId: value.studentID,
        id: props.tempData.id,
        subscription: value.subscription,
        subscriptionNo: value.subscriptionNo,
        emi: value.emi,
        emiMonths: value.emiMonths,
        paymentMode: value.paymentMode,
      }]

    }
    //const studentDetails = { ...props.tempData, ...values };
    if (value.saleamount == (Number(value.emi * value.emiMonths) + Number(value.downpayment))) {
      props.submit(dataForm);
    } else {
      notification.open({
        message: '',
        description:
          'Enter valid sale amount, subscription Months, subscription amount and downpayment',
      });
      setTimeout(() => {
        window.location.reload()
      }, 5000);
    }

  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
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
    ]
  )

  const onChange = (data: any) => {
    const studentDetails = { ...props.tempData, ...form.getFieldsValue() };
    props.updateTempData(studentDetails)
  }

  return (
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
            <Input onChange={onChange} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Student Last Name"
            name="lastName"
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

        <Col span={12}>
          <Form.Item
            label="Customer Email"
            name="customerEmail"
            rules={[{
              required: true,
              type: 'email'
            }]}
          >
            <Input onChange={onChange} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Student ID"
            name="studentID"
          >
            <Input onChange={onChange} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="RMN"
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
            <Input onChange={onChange} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Alternate Mobile Number"
            name="alternativeMobile"
            rules={[{ required: true, pattern: /^\+[0-9]{12}$/, message: "Enter valid number" }]}
          >
            <Input onChange={onChange} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="dob"
            label="Date of Birth"
            rules={[{
              required: true,
            }]}
          >
            <input type="date"
              onChange={onChange}
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
            <Input onChange={onChange} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="state"
            label="Customer State">
            <Select
              placeholder="Customer State"
              onChange={onChange}
            >
              {statesData.map(state => <Option value={state.label} key={state.label}>{state.value}</Option>)}
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="course"
            label="Course">
            <Select
              placeholder="Select Course"
              onChange={onChange}
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
            label="Starting Lesson">
            <Select
              placeholder="Select Starting Lesson"
              onChange={onChange}
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
            label="Course Frequency">
            <Select
              placeholder="Select Course Frequency"
              onChange={onChange}
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
            label="Timings">
            <Select
              placeholder="Select Class Timings"
              onChange={onChange}
            >
              <Option value="15:00">15:00</Option>
              <Option value="16:30">16:30</Option>
              <Option value="18:00">18:00</Option>
              <Option value="19:30">19:30</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="startDate"
            label="Expected Start Date"
          >
            <input type="date"
              onChange={onChange}
              value={moment(props.tempData.startDate, "YYYY-MM-DD").format("YYYY-MM-DD")} />

          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="classesStartDate"
            label="Actual Start Date"
          >
            <input type="date"
              onChange={onChange}
              value={moment(props.tempData.classesStartDate, "YYYY-MM-DD").format("YYYY-MM-DD")} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="lsq_user_name"
            label="Sales Owner"
          >
            <Select style={{ width: 100 + "%" }} >
              {lsqUsersData.map(user => <Option value={user.ID} key={user.ID}>{user.FirstName} {user.LastName}</Option>)}
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Classes Sold"
            name="classessold"
          >
            <Select placeholder="classessold" onChange={onChange}>
              <Option value="60">60</Option>
              <Option value="100">100</Option>
              <Option value="200">200</Option>
              <Option value="300">300</Option>
              <Option value="400">400</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Total Sale Amount"
            name="saleamount"
            rules={[{ required: true, pattern: /^[0-9]*$/, message: "Enter number only" }]}
          >
            <Input onChange={onChange} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Down Payment"
            name="downpayment"
            rules={[{ required: true, pattern: /^[0-9]*$/, message: "Enter number only" }]}
          >
            <Input onChange={onChange} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="paymentMode"
            label="Plan Mode"
          >
            <Select placeholder="Select Plan Mode" onChange={onChange}>
              <Option value="razorpay">Razorpay</Option>
              <Option value="banktransfer">Bank Transfer</Option>
              <Option value="cashfree">Cashfree</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Transaction ID"
            name="paymentid"
          >
            <Input onChange={onChange} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="subscription"
            label="Subscription Type">
            <Select
              placeholder="Select Subscription Type"
              onChange={onChange}
            >
              <Option value="Manual">Manual</Option>
              <Option value="Auto-Debit">Auto-Debit</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Subscription Number"
            name="subscriptionNo"
          >
            <Input onChange={onChange} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Subscription Amount"
            name="emi"
            rules={[{ required: true, pattern: /^[0-9]*$/, message: "Enter number only" }]}
          >
            <Input onChange={onChange} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Months Of Subscription"
            name="emiMonths"
            rules={[{ required: true, pattern: /^[0-9]*$/, message: "Enter number only" }]}
          >
            <Input onChange={onChange} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="prm"
            label="PRM Name">
            <Select style={{ width: 100 + "%" }} >
              {prmData.map(prm => <Option value={prm.id} key={prm.id}>{prm.firstName} {prm.lastName}</Option>)}
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="callStatus"
            label="Call Status">
            <Select
              placeholder="Select Call Status"
              onChange={onChange}
            >
              <Option value="Answered">Answered</Option>
              <Option value="DNP">DNP</Option>
              <Option value="Call Back Later">Call Back Later</Option>
              <Option value="Placement test pending">Placement test pending</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="PRM Comments"
            name="comments"
          >
            <Input onChange={onChange} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="BDA Comments"
            name="comments"
          >
            <Input onChange={onChange} />
          </Form.Item>
        </Col>

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

        <Col span={12}>
          <Form.Item
            name="waMessageSent"
            label="Whatsapp Message Sent">
            <Select
              placeholder="Select Yes/No"
              onChange={onChange}
            >
              <Option value="Yes">Yes</Option>
              <Option value="No">No</Option>
            </Select>
          </Form.Item>
        </Col>

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
            label="Status">
            <Select
              placeholder="Select Status"
              onChange={onChange}
            >
              <Option value="enrolled">Enrolled</Option>
              <Option value="startclasslater">Start Class Later</Option>
              <Option value="batching">Ready to batch</Option>
              <Option value="onboarding">Onboarding</Option>
              <Option value="active">Active</Option>
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
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Studentdetailsedit;
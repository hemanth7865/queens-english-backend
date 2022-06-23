import React, { useState, useEffect } from 'react';
import { WhatsAppOutlined, CopyOutlined } from '@ant-design/icons';
import { Form, Input, Button, Select, DatePicker, Spin, Row, Col, message } from 'antd';
import { editPayment, editNetBanking, listTeacherAndStudent } from '@/services/ant-design-pro/api';
import { handleAPIResponse } from "@/services/ant-design-pro/helpers";
import moment from 'moment';
import callDispositionStatus from "../../../../data/call_disposition.json";
import DebounceSelect from "@/components/DebounceSelect";
import StudentDetails from "../Components/StudentDetails";

export type FormUserProps = {
    data: {};
    visible: {};
    setVisible: () => void;
    onUpdate: () => void;
    isAmountDisplay: {};
    netbankingVisible: {};
    autodebitVisible: {};
    isWhatsappVisible: {};
    isModalVisible: () => void;
    actionRef: any;
    setIsAmountDisplay: any;
    regenerateLink: any;
    visibleAdd?: any;
    setVisibleAdd: any;
};

const { Option } = Select;
const { TextArea } = Input;


const FormUser: React.FC<FormUserProps> = (props) => {
    const { studentId, emiAmount, id, dueDate, paidDate, paidAmount, status, transaction_details_id, transactionId, razorpayLink, whatsAppLinkSent, modeOfPayment, callDisposition, feedBackCall, paymentMode, notes, leadId, reasonAmountChange, whatsapp } = props.data ? props.data : '';

    const INITITALPAIDDATE = null;
    const [isLoading, setIsLoading] = useState(false);
    const [selectPaidDate, setSelectPaidDate] = useState(INITITALPAIDDATE);
    const [selectDueDate, setSelectDueDate] = useState(INITITALPAIDDATE);
    const [studentList, setStudentList] = useState([]);

    const name = `${props.data?.firstName} ${props.data?.lastName}`

    const whatsappTemplate = `    Dear Parent of ${name},

    Your next instalment of INR ${emiAmount} is due on or before ${moment(dueDate).format('YYYY-MM-DD')}. 
    
    Kindly make the payment at the link below. Payment link - ${razorpayLink}

    In case of any issues or queries, please feel free to contact QE Support Whatsapp Number - 8143513850.

    Thanks & regards,

    Team Queen’s English`;

    const copy = (text: any) => {
        window.navigator.clipboard.writeText(text);
        message.success('Message copied');
    };

    async function fetchStudentList(username: string) {
        return listTeacherAndStudent(
            {
                current: 1,
                pageSize: 5,
                type: 'student',
                keyword: username
            }
        )
            .then((body) =>
                body.data.map((user: any) => (
                    {
                        label: `${user.name} -- ${user.phoneNumber} -- ${user.startDate} -- ${user.whatsapp} -- ${user.studentID}`,
                        value: user.id,
                        key: user.id
                    }
                ))
            );
    }

    const editPaymentDetails = async (data: any) => {
        try {
            const msg = await editPayment({
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            handleAPIResponse(msg, "Payment Updated Successfully", "Failed To Update Payment", false);
        } catch (error) {
            handleAPIResponse({ status: 400 }, "Payment Updated Successfully", "Failed To Update Payment", false);
        }
    }

    const editNetBankingDetails = async (data: any) => {
        try {
            const msg = await editNetBanking({
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            handleAPIResponse(msg, "Net Banking details Updated Successfully", "Failed To Update Net Banking details", false);
        } catch (error) {
            handleAPIResponse({ status: 400 }, "Net Banking details Updated Successfully", "Failed To Update Net Banking details", false);
        }
    }

    const onFinish = async (values: any) => {
        setIsLoading(true);
        if (values.transactionId && values.netbankRefLink) {
            const netBankingForm = {
                id: id,
                transactionId: values.transactionId,
                netbankRefLink: values.netbankRefLink
            }
            await editNetBankingDetails(netBankingForm);
        }
        else {
            const dataForm = [{
                id: id,
                studentId: studentList.value ? studentList.value : studentId,
                emiAmount: values.emiAmount ? values.emiAmount : emiAmount,
                paidAmount: paidAmount,
                status: values.status ? values.status : status,
                transaction_details_id: transaction_details_id,
                razorpayLink: razorpayLink,
                whatsAppLinkSent: values.whatsAppLinkSent ? values.whatsAppLinkSent : whatsAppLinkSent,
                modeOfPayment: modeOfPayment,
                callDisposition: values.callDisposition ? values.callDisposition : callDisposition,
                feedBackCall: values.feedBackCall ? values.feedBackCall : feedBackCall,
                notes: values.notes ? values.notes : notes,
                paymentMode: paymentMode,
                paidDate: selectPaidDate ? selectPaidDate : paidDate,
                dueDate: selectDueDate ? selectDueDate : dueDate,
                reasonAmountChange: values.reasonAmountChange ? values.reasonAmountChange : '',
            }]
            if (values.emiAmount) {
                if (status === "Installment Pending") {
                    await editPaymentDetails(dataForm);
                    await props.regenerateLink({ transactionId });
                } else if (status === "Installment Paid") {
                    handleAPIResponse({ status: 400 }, "Razorpay link generated  Successfully", "Failed To regenerate Razorpay link generated", false);
                } else {
                    await editPaymentDetails(dataForm);
                    form.resetFields();
                }
            } else {
                await editPaymentDetails(dataForm);
            }
        }
        props.setVisible(false);
        props.isModalVisible(false);
        props.setVisibleAdd(false);
        props.setIsAmountDisplay(false);
        form.resetFields();
        setSelectPaidDate(INITITALPAIDDATE);
        setSelectDueDate(INITITALPAIDDATE);
        setStudentList([]);
        setIsLoading(false);
        props.actionRef.current.reload();
    }


    const [form] = Form.useForm()
    const defaultValues = () => {
        form.setFieldsValue({
            leadId: leadId,
            emiAmount: emiAmount,
            callDisposition: callDisposition,
            notes: notes,
            whatsAppLinkSent: whatsAppLinkSent,
            status: status,
            reasonAmountChange: reasonAmountChange,
            paidDate: paidDate != null ? moment(paidDate, "YYYY-MM-DD") : '',
        });
    }
    useEffect(() => {
        defaultValues();
    }, [leadId, emiAmount, callDisposition, notes, whatsAppLinkSent, status, reasonAmountChange, paidDate])

    return (
        <div>
            <Spin spinning={isLoading}>
                <Form
                    name="basic"
                    form={form}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 16 }}
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    {
                        !props.visibleAdd ?
                            <Form.Item
                                label="Lead Id"
                                name="leadId"
                            >
                                <Input disabled />
                            </Form.Item> : ''
                    }

                    {props.visibleAdd ?

                        <div>
                            <Form.Item
                                label="Student Name"
                            >
                                <DebounceSelect
                                    showSearch
                                    value={[]}
                                    placeholder="Select students"
                                    fetchOptions={fetchStudentList}
                                    onChange={(newValue: any) => {
                                        setStudentList(newValue)
                                    }}
                                    style={{
                                        width: "100%",
                                    }}
                                />
                            </Form.Item>

                            {
                                studentList.length != 0 ? <StudentDetails
                                    value={studentList}
                                    options={props.data?.id ? studentList : []}
                                    defaultValue={props.data?.id ? studentList : []}
                                    onChange={(newValue: any) => {
                                        setStudentList(newValue);
                                    }}
                                /> : ''

                            } <br />


                            <Form.Item
                                label="Installment Rs"
                                name="emiAmount"
                                rules={[{ required: true, message: 'Please Enter Installment Rs' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Due Date"
                                name="dueDate"
                            >
                                <DatePicker
                                    format='YYYY-MM-DD'
                                    onChange={(date, dateString) => {
                                        setSelectDueDate(dateString);
                                    }}
                                />
                            </Form.Item>

                        </div> :

                        props.isAmountDisplay ?

                            <div>
                                <Form.Item
                                    label="Installment Rs"
                                    name="emiAmount"
                                    rules={[{ required: true, message: 'Please Enter Installment Rs' }]}
                                >
                                    <Input />
                                </Form.Item>

                                <Form.Item
                                    label="Reason for amount change"
                                    name="reasonAmountChange"
                                    rules={[{ required: true, message: 'Please Select the reason for amount change' }]}
                                >
                                    <Select >
                                        <Option value="Discount">Discount</Option>
                                        <Option value="Paying Full Amount">Paying Full Amount</Option>
                                        <Option value="Change in Notes">Change in Notes</Option>
                                        <Option value="Other">Other</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    label="Notes"
                                    name="notes"
                                >
                                    <TextArea rows={3} />
                                </Form.Item>
                            </div> :

                            props.netbankingVisible ?

                                <div>
                                    <Form.Item
                                        label="Subscription ID"
                                        name="subscriptionId"
                                        rules={[{ required: true, message: 'Please Enter Subscription ID!' }]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        label="First Instalment Payment ID"
                                        name="referenceId"
                                        rules={[{ required: true, message: 'Please Enter  First Instalment Payment ID!' }]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        label="Installment status"
                                        name="status"
                                        rules={[{ required: true, message: 'Please Enter Installment Status' }]}
                                    >
                                        <Select>
                                            <Option value="Installment Pending">Installment Pending</Option>
                                            <Option value="Installment Paid">Installment Paid</Option>
                                        </Select>
                                    </Form.Item>
                                </div> :

                                props.autodebitVisible ?

                                    <div>
                                        <Form.Item
                                            label="Transaction ID"
                                            name="transactionId"
                                            rules={[{ required: true, message: 'Please Enter Transaction ID!' }]}
                                        >
                                            <Input />
                                        </Form.Item>

                                        <Form.Item
                                            label="Upload google drive link"
                                            name="netbankRefLink"
                                            rules={[{ required: true, message: 'Please Enter the Link!' }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </div> :

                                    props.isWhatsappVisible ?

                                        <div>
                                            <Row>
                                                <Col span={20}>
                                                    <Form.Item
                                                        label="WA Message Sent"
                                                        name="whatsAppLinkSent"
                                                    >
                                                        <Select >
                                                            <Option value="Yes">Yes</Option>
                                                            <Option value="No">No</Option>
                                                        </Select>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={2}>
                                                    <WhatsAppOutlined
                                                        title="Send Whatsapp Message"
                                                        style={{ fontSize: "25px", color: "green" }}
                                                        onClick={() => {
                                                            window.open(
                                                                `https://api.whatsapp.com/send?phone=${whatsapp.replace(
                                                                    "+",
                                                                    ""
                                                                )}&text=${encodeURIComponent(whatsappTemplate)}`,
                                                                "_blank"
                                                            );
                                                        }} />
                                                </Col>
                                                <Col span={2}>
                                                    <CopyOutlined
                                                        title='Copy message'
                                                        style={{ fontSize: "25px", color: "#00BFFF" }}
                                                        onClick={() => {
                                                            copy(whatsappTemplate);
                                                        }} />
                                                </Col>
                                            </Row>
                                            <pre>{whatsappTemplate}</pre>
                                        </div> :

                                        <div>
                                            <Form.Item
                                                label="Call Disposition"
                                                name="callDisposition"
                                                rules={[{ required: true, message: 'Please Enter Call Disposition' }]}
                                            >
                                                <Select>
                                                    {callDispositionStatus.map((i: any) => (<Option value={i.value} >{i.label}</Option>))}
                                                </Select>
                                            </Form.Item>

                                            <Form.Item
                                                label="Notes"
                                                name="notes"
                                            >
                                                <TextArea rows={3} />
                                            </Form.Item>

                                            <Form.Item
                                                label="Installment status"
                                                name="status"
                                                rules={[{ required: false, message: 'Please Enter Installment Status' }]}
                                            >
                                                <Select>
                                                    <Option value="Installment Pending">Installment Pending</Option>
                                                    <Option value="Installment Paid">Installment Paid</Option>
                                                </Select>
                                            </Form.Item>

                                            <Form.Item
                                                label="Paid Date"
                                                name="paidDate"
                                            >
                                                <DatePicker
                                                    format='YYYY-MM-DD'
                                                    onChange={(date, dateString) => {
                                                        setSelectPaidDate(dateString);
                                                    }} />
                                            </Form.Item>
                                        </div>

                    }

                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Spin>
        </div >
    )
}

export default FormUser;


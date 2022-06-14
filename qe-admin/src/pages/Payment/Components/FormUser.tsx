import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, DatePicker, Spin } from 'antd';
import { editPayment } from '@/services/ant-design-pro/api';
import { handleAPIResponse } from "@/services/ant-design-pro/helpers";
import moment from 'moment';

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
};

const { Option } = Select;
const { TextArea } = Input;


const FormUser: React.FC<FormUserProps> = (props) => {
    const { studentId, emiAmount, id, dueDate, paidDate, paidAmount, status, transaction_details_id, transactionId, razorpayLink, whatsAppLinkSent, modeOfPayment, callDisposition, feedBackCall, paymentMode, notes, leadId, reasonAmountChange } = props.data ? props.data : '';

    const [isLoading, setIsLoading] = useState(false);
    const [selectPaidDate, setSelectPaidDate] = useState('');
    const name = `${props.data.student[0].firstName} ${props.data.student[0].lastName}`

    const teacherMessageTemplate = `    Dear Parent of ${name},

    Your next instalment of INR ${emiAmount} is due on or before ${dueDate}. 
    
    Kindly make the payment at the link below. Payment link - ${razorpayLink}

    In case of any issues or queries, please feel free to contact QE Support Whatsapp Number - 8143513850.

    Thanks & regards,

    Team Queen’s English`;

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

    const onFinish = async (values: any) => {
        setIsLoading(true);
        const dataForm = [{
            id: id,
            studentId: studentId,
            dueDate: dueDate,
            paidDate: selectPaidDate ? selectPaidDate : paidDate,
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
            reasonAmountChange: values.reasonAmountChange ? values.reasonAmountChange : '',
        }]
        if (values.emiAmount) {
            const msg = await props.regenerateLink({ transactionId });
            if (msg.status == "success") {
                await editPaymentDetails(dataForm);
            }
        } else {
            await editPaymentDetails(dataForm);
        }
        props.setVisible(false);
        props.isModalVisible(false);
        setIsLoading(false);
        props.setIsAmountDisplay(false);
        props.actionRef.current.reload();
        console.log('dataForm', dataForm)
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
                    <Form.Item
                        label="Lead Id"
                        name="leadId"
                    >
                        <Input disabled />
                    </Form.Item>

                    {props.isAmountDisplay ?

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
                                        rules={[{ required: true, message: 'Please Enter the Link!', type: 'url' }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </div> :

                                props.isWhatsappVisible ?

                                    <div>
                                        <Form.Item
                                            label="WA Message Sent"
                                            name="whatsAppLinkSent"
                                        >
                                            <Select style={{ width: 120 }} >
                                                <Option value="Yes">Yes</Option>
                                                <Option value="No">No</Option>
                                            </Select>
                                        </Form.Item>
                                        <pre>{teacherMessageTemplate}</pre>
                                    </div> :

                                    <div>
                                        <Form.Item
                                            label="Call Disposition"
                                            name="callDisposition"
                                            rules={[{ required: true, message: 'Please Enter Call Disposition' }]}
                                        >
                                            <Select >
                                                <Option value="No response">No response</Option>
                                                <Option value="Call back later">Call back later</Option>
                                                <Option value="This Week">This Week</Option>
                                                <Option value="This Month">This Month</Option>
                                                <Option value="Want to Discontinue">Want to Discontinue</Option>
                                                <Option value="Dormant">Dormant</Option>
                                                <Option value="Payment after issue resolution">Payment after issue resolution</Option>
                                                <Option value="Demands Leaves">Demands Leaves</Option>
                                                <Option value="Exams in school">Exams in school</Option>
                                                <Option value="Paid">Paid</Option>
                                                <Option value="Fully Paid">Fully Paid</Option>
                                                <Option value="Subscription Lost">Subscription Lost</Option>
                                                <Option value="DNP">DNP</Option>
                                                <Option value="On Leave">On Leave</Option>
                                                <Option value="other">other</Option>
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


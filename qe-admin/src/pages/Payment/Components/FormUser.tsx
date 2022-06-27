import React, { useState, useEffect } from 'react';
import { WhatsAppOutlined, CopyOutlined } from '@ant-design/icons';
import { Form, Input, Button, Select, DatePicker, Spin, Row, Col, message } from 'antd';
import { editPayment, editNetBanking } from '@/services/ant-design-pro/api';
import { handleAPIResponse } from "@/services/ant-design-pro/helpers";
import moment from 'moment';
import callDispositionStatus from "../../../../data/call_disposition.json";

export type FormUserProps = {
    data: any;
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
    refreshStatus: any;
};

const { Option } = Select;
const { TextArea } = Input;


const FormUser: React.FC<FormUserProps> = (props) => {
    const { studentId, emiAmount, id, dueDate, paidDate, paidAmount, status, transaction_details_id, transactionId, razorpayLink, whatsAppLinkSent, modeOfPayment, callDisposition, feedBackCall, paymentMode, notes, leadId, reasonAmountChange, whatsapp, referenceId } = props.data ? props.data : '';

    const [isLoading, setIsLoading] = useState(false);

    const name = `${props.data.firstName} ${props.data.lastName}`

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
                studentId: studentId,
                referenceId: values.referenceId ? values.referenceId : referenceId,
                emiAmount: values.emiAmount ? values.emiAmount : emiAmount,
                paidAmount: paidAmount,
                status: status,
                transaction_details_id: transaction_details_id,
                razorpayLink: razorpayLink,
                whatsAppLinkSent: values.whatsAppLinkSent ? values.whatsAppLinkSent : whatsAppLinkSent,
                modeOfPayment: modeOfPayment,
                callDisposition: values.callDisposition ? values.callDisposition : callDisposition,
                feedBackCall: values.feedBackCall ? values.feedBackCall : feedBackCall,
                notes: values.notes ? values.notes : notes,
                paymentMode: paymentMode,
                paidDate: paidDate,
                reasonAmountChange: values.reasonAmountChange ? values.reasonAmountChange : '',
            }]
            if (values.emiAmount) {
                await editPaymentDetails(dataForm);
                await props.regenerateLink({ transactionId });
            } else if (values.referenceId != referenceId) {
                await editPaymentDetails(dataForm);
                await props.refreshStatus({ transactionId, referenceId: values.referenceId }, true);
            } else {
                await editPaymentDetails(dataForm);
            }
        }
        props.setVisible(false);
        props.isModalVisible(false);
        setIsLoading(false);
        props.setIsAmountDisplay(false);
        props.actionRef.current.reload();
        form.resetFields();
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
            referenceId: referenceId
        });
    }
    useEffect(() => {
        defaultValues();
    }, [leadId, emiAmount, callDisposition, notes, whatsAppLinkSent, status, reasonAmountChange, referenceId])

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
                                            label="Reference ID"
                                            name="referenceId"
                                            rules={[{ required: false, message: 'Please Enter Reference Id!' }]}
                                        >
                                            <Input />
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


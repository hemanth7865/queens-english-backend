import React, { useEffect, useState } from "react";
import { Col, Row, Table, Space, Spin } from "antd";
import moment from 'moment';
import { handleAPIResponse } from "@/services/ant-design-pro/helpers";
import { getAllAutoDebitStatus } from '@/services/ant-design-pro/api';
import { PaymentConstantValues, PaymentModevalues } from "@/components/Constants/constants";

interface Props {
    data: any;
}

const RazorpayDetails = ({ data }: Props) => {

    const [isLoading, setIsLoading] = useState(false);
    const [show, setShow] = useState<any>();

    const handleShow = async () => {
        setIsLoading(true);
        try {
            const msg = await getAllAutoDebitStatus({
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ installmentId: data.transactionId }),
            });
            if (msg.status != PaymentConstantValues.STATUSERROR) {
                setShow(msg.message);
            } else {
                handleAPIResponse(msg, " ", "Failed To Display Details", false);
            }

        } catch (error) {
            handleAPIResponse({ status: 400 }, " ", "Failed To Display Details", false);
        }
        setIsLoading(false);
    }

    console.log(show)

    useEffect(() => {
        if (data.paymentMode === PaymentModevalues.CASHFREE) {
            setShow('');
            handleShow()
        }
    }, [data.subscriptionId])

    return (
        <div>
            {
                data.paymentMode != PaymentModevalues.CASHFREE ?
                    <Space>
                        <Row gutter={[16, 15]}>
                            <Col span={8}>
                                <div style={{ fontSize: 20 }}>Mode of Payment</div>
                            </Col>
                            <Col span={16}>
                                <div style={{ fontSize: 20 }}>
                                    {data.paymentMode ? data.paymentMode : "Razorpay"}
                                </div>
                            </Col>

                            <Col span={8}>
                                <div>Reference Id</div>
                            </Col>
                            <Col span={16}>
                                <div>
                                    {data.referenceId ? data.referenceId : "NA"}
                                </div>
                            </Col>

                            <Col span={8}>
                                <div>Razorpay Link</div>
                            </Col>
                            <Col span={16}>
                                <div>
                                    {data.razorpayLink ? data.razorpayLink : "NA"}
                                </div>
                            </Col>

                            <Col span={8}>
                                <div>Instalment Status</div>
                            </Col>
                            <Col span={16}>
                                <div>
                                    {data.status ? data.status : "NA"}
                                </div>
                            </Col>

                            <Col span={8}>
                                <div>Instalment Collected (Rs)</div>
                            </Col>
                            <Col span={16}>
                                <div>
                                    {data.paidAmount ? data.paidAmount : "NA"}
                                </div>
                            </Col>

                            <Col span={8}>
                                <div>Paid Date</div>
                            </Col>
                            <Col span={16}>
                                <div>
                                    {data.paidDate ? moment(data.paidDate).format("DD-MM-YYYY") : "NA"}
                                </div>
                            </Col>

                            <Col span={8}>
                                <div>Google drive uploaded Link</div>
                            </Col>
                            <Col span={16}>
                                <div>
                                    {data.netbankRefLink ? data.netbankRefLink : "NA"}
                                </div>
                            </Col>

                        </Row>
                    </Space> :
                    <div>
                        <div style={{ fontSize: 20 }}>Mode of Payment: Auto Debit (Cash Free)</div>
                        <Spin spinning={isLoading}>
                            <Table style={{ width: "100%" }} dataSource={show ? show : ''} columns={[
                                {
                                    title: "Subscription Id",
                                    dataIndex: "subReferenceId",
                                    key: "subReferenceId"
                                },
                                {
                                    title: "Payment Id",
                                    dataIndex: "paymentId",
                                    key: "paymentId"
                                },
                                {
                                    title: "Amount",
                                    dataIndex: "amount",
                                    key: "amount"
                                },
                                {
                                    title: "Date",
                                    dataIndex: "addedOn",
                                    key: "addedOn",
                                    render: (value: any) => {
                                        if (value) {
                                            return moment(value, "YYYY-MM-DD").format("DD-MM-YYYY");
                                        }
                                    }
                                },
                                {
                                    title: "Status",
                                    dataIndex: "status",
                                    key: "status"
                                }
                            ]} />
                        </Spin>
                    </div>
            }

        </div >
    );
};

export default RazorpayDetails;

import React, { useEffect, useState } from "react";
import { Col, Row, Table, Space, Spin } from "antd";
import moment from 'moment';
import { handleAPIResponse } from "@/services/ant-design-pro/helpers";

interface Props {
    data: any;
}

const RazorpayDetails = ({ data }: Props) => {

    const [isLoading, setIsLoading] = useState(false);
    const [show, setShow] = useState<any>();

    const handleShow = async (data: any) => {
        setIsLoading(true);
        try {
            const response = await getZoomUser(data.id);
            setShow(response.data);
        } catch (e) {
            handleAPIResponse({ status: 400 }, "", "Failed To Show Zoom License Info", false);
        }
        setIsLoading(false);
    }

    useEffect(() => {
        if (data.subscriptionId != null) {
            console.log('Call the api here')
        }
    }, [data.subscriptionId])

    return (
        <div>
            {
                !data.subscriptionId ?
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
                            <Table style={{ width: "100%" }} dataSource={''} columns={[
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
                                    title: "Date",
                                    dataIndex: "addedOn",
                                    key: "addedOn"
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

import React from "react";
import { Col, Row, Table, Space } from "antd";
import moment from 'moment';

interface Props {
    data: any;
}

const RazorpayDetails = ({ data }: Props) => {

    return (
        <div>
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
            </Space>

        </div >
    );
};

export default RazorpayDetails;

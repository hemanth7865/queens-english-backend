import React from "react";
import { Col, Row, Table, Space } from "antd";

interface Props {
    data: {};
}

const RazorpayDetails = ({ data }: Props) => {

    return (
        <div>
            <div className="title" style={{ marginBottom: 20 }}>Payment ID</div>
            <Space>
                <Row gutter={[16, 15]}>
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
                            {data.paidDate ? data.paidDate : "NA"}
                        </div>
                    </Col>

                </Row>
            </Space>

        </div>
    );
};

export default RazorpayDetails;

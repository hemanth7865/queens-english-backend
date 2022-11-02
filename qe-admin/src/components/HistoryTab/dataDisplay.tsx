import { Col, Row, Space } from "antd";

interface Props {
    data: any;
}

const PaymentDataDetials = ({ data }: Props) => {

    return (
        <div>
            {

                <Space>
                    <Row gutter={[16, 15]}>
                        <Col span={8}>
                            <div>Id</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.id}</div>
                        </Col>

                        <Col span={8}>
                            <div>Payment Id</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.paymentid}</div>
                        </Col>

                        <Col span={8}>
                            <div>Plan Type</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.planType}</div>
                        </Col>

                        <Col span={8}>
                            <div>studentId</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.studentId}</div>
                        </Col>

                        <Col span={8}>
                            <div>classtype</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.classtype}</div>
                        </Col>

                        <Col span={8}>
                            <div>classessold</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.classessold}</div>
                        </Col>

                        <Col span={8}>
                            <div>saleamount</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.saleamount}</div>
                        </Col>

                        <Col span={8}>
                            <div>dateofsale</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.dateofsale}</div>
                        </Col>

                        <Col span={8}>
                            <div>downpayment</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.downpayment}</div>
                        </Col>

                        <Col span={8}>
                            <div>duedate</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.duedate}</div>
                        </Col>

                        <Col span={8}>
                            <div>subscription</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.subscription}</div>
                        </Col>

                        <Col span={8}>
                            <div>subscriptionNo</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.subscriptionNo}</div>
                        </Col>

                        <Col span={8}>
                            <div>emi</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.emi}</div>
                        </Col>

                        <Col span={8}>
                            <div>emiMonths</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.emiMonths}</div>
                        </Col>

                        <Col span={8}>
                            <div>paymentMode</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.paymentMode}</div>
                        </Col>

                        <Col span={8}>
                            <div>no_of_delayed_payments</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.no_of_delayed_payments}</div>
                        </Col>

                        <Col span={8}>
                            <div>notes</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.notes}</div>
                        </Col>

                        <Col span={8}>
                            <div>emiPaymentStatus</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.emiPaymentStatus}</div>
                        </Col>

                        <Col span={8}>
                            <div>delay_date</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.delay_date}</div>
                        </Col>

                        <Col span={8}>
                            <div>delay_status</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.delay_status}</div>
                        </Col>

                        <Col span={8}>
                            <div>is_down_payment_auto_verified</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.is_down_payment_auto_verified}</div>
                        </Col>

                        <Col span={8}>
                            <div>is_down_payment_verified</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.is_down_payment_verified}</div>
                        </Col>

                        <Col span={8}>
                            <div>updated_at</div>
                        </Col>
                        <Col span={16}>
                            <div>{data.updated_at}</div>
                        </Col>
                    </Row>
                </Space>
            }

        </div >
    );
};

export default PaymentDataDetials;

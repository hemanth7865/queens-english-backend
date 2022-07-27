import { useState } from "react";
import { Button, Spin, notification, Col } from "antd";
import { verifyDownPayment } from "@/services/ant-design-pro/api";
import { ALLOWED_AUTO_VERIFY_PAYMENTS } from "./../../../../config/constants";

interface Props {
    downPayment: any;
    setDownPayment: (downPayment: any) => void;
}

const PaymentVerify = ({ downPayment, setDownPayment }: Props) => {
    const [loading, setLoading] = useState<boolean>(false);
    const handleVerifyResponse = (data: any): { message: string, description: string, error?: boolean } => {
        let not = {
            message: "Payment Verified Successfully",
            description: "Selected Pamynet Is Verified Successfully",
            error: false,
        }

        if (data.message.error == 0 && data.message.paid == 0) {
            not = {
                message: 'Payment Verified',
                description: "Selected Payment Is Already Verified Or Not Found",
                error: true,
            };
            return not;
        }

        if (data.message.error == 1 && data.message.paid == 0) {
            not = {
                message: 'Failed To Verify Down Payment',
                description: "Selected Payment Is Not Verified",
                error: true,
            };
            return not;
        }

        return not;
    }
    /**
     * Force mark payment as payment verified
     * @param force 
     */
    const verifyPayment = async (force: boolean = false) => {
        setLoading(true);
        try {
            const data = await verifyDownPayment({ data: { id: downPayment.id, force } });
            let not = handleVerifyResponse(data);
            notification[not.error ? "error" : "success"](not);
            if (!not.error) {
                setTimeout(() => {
                    window.location.reload()
                }, 2000);
            }
        } catch (e: any) {
            notification.open({
                message: 'Failed To Verify Down Payment',
                description: e.message,
            });
        }
        setLoading(false);
    }

    return (
        <Spin spinning={loading}>
            <Col flex="auto" style={{ display: "flex", justifyContent: "center" }}>
                {
                    ALLOWED_AUTO_VERIFY_PAYMENTS.includes(downPayment?.paymentMode) && (
                        <Col>
                            <Button onClick={() => verifyPayment(false)} type="primary">Verify Payment Automatically</Button>
                        </Col>
                    )
                }
                {
                    !ALLOWED_AUTO_VERIFY_PAYMENTS.includes(downPayment?.paymentMode) && (
                        <Col>
                            <Button onClick={() => verifyPayment(true)}>Mark Payment As Verified</Button>
                        </Col>
                    )
                }
            </Col>
        </Spin>

    )
}

export default PaymentVerify
import React, { useState } from "react";
import { Button, Spin, notification } from "antd";
import { verifyDownPayment } from "@/services/ant-design-pro/api";

interface Props {
    downPayment: any;
    setDownPayment: (downPayment: any) => void;
}

const PaymentVerify = ({ downPayment, setDownPayment }: Props) => {
    const [loading, setLoading] = useState<boolean>(false);
    const handleVerifyResponse = (data: any): {message: string, description: string, error?: boolean} => {
        let not = {
            message: "Payment Verified Successfully",
            description: "Selected Pamynet Is Verified Successfully",
            error: false,
        }

        if (data.message.error == 0 && data.message.paid == 0) {
            not = {
                message: 'Paymend Verified',
                description: "Selected Payment Is Verified Or Not Found",
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
    const verifyPayment = async () => {
        setLoading(true);
        try {
            const data = await verifyDownPayment({ data: { id: downPayment.id } });
            let not = handleVerifyResponse(data);
            notification[not.error ? "error": "success"](not);
            setTimeout(() => {
                window.location.reload()
            }, 2000);
        } catch (e: any) {
            notification.open({
                message: 'Failed To Verify Down Payment',
                description: e.message,
            }); 
        }
        setLoading(false);
    }

    const updatePayment = () => {
        setLoading(true);

        setLoading(false);
    }
    return (
        <Spin spinning={loading}>
            <div>
                <Button onClick={verifyPayment}>Verify Payment Automatically</Button>
            </div>
        </Spin>

    )
}

export default PaymentVerify
import { useEffect, useState } from "react";
import { Table, Spin, Button } from "antd";
import failureActionRazorpay from "../../../../data/failureActionRazorpay.json";
import failureActionCashfree from "../../../../data/failureActionCashfree.json";
import { PaymentModevalues } from '@/components/Constants/constants';

interface Props {
    data: any;
}

const DisplayFailureActions = ({ data }: Props) => {

    const [isLoading, setIsLoading] = useState(false);
    const [showFailureAction, setShowFailureAction] = useState<any>();
    const [isExtraInfo, setIsExtraInfo] = useState(false);
    const [count, setCount] = useState(0);
    const [disableButton, setDisableButton] = useState(false);
    const [matchedString, setMatchedString] = useState('');

    const getFailedActions = (searchValue: any, paymentModeJSON: any) => {
        searchValue = searchValue.toLowerCase();
        let result: any = []
        paymentModeJSON.map((reason: any) => {
            var keysOfAction = Object.values(reason);
            var reasonsFailed: any = keysOfAction[0];
            if (reasonsFailed.toLowerCase().includes(searchValue)) {
                result.push(reason);
            }
        });
        return result;
    }

    const compareFailedReason = (valueParam: any) => {
        let reasonFailureValue = valueParam.toLowerCase();
        let paymentModeJSON;
        if (data.paymentMode === PaymentModevalues.CASHFREE) {
            paymentModeJSON = failureActionCashfree;
        } else {
            paymentModeJSON = failureActionRazorpay;
        }
        const callFailedAction = getFailedActions(reasonFailureValue, paymentModeJSON);
        return [callFailedAction];
    }

    const getResultInArray = (failedReasonValue: any) => {
        const callCompareFailedReason = compareFailedReason(failedReasonValue)
        for (let value of callCompareFailedReason) {
            setShowFailureAction(value)
        }
        return callCompareFailedReason;
    }


    const handleSearch = () => {
        setIsLoading(true);
        setCount(count + 1);
        setIsExtraInfo(true);
        let valueSplitCharacters = data.reasonForFailure.split(/[^A-Za-z]/);
        let emptySpace = '';
        valueSplitCharacters = valueSplitCharacters.filter((item: any) => item !== emptySpace && item.length > 2 && item.toLowerCase() !== "the");
        setMatchedString(valueSplitCharacters[count]);
        if (valueSplitCharacters.length > count) {
            getResultInArray(valueSplitCharacters[count]);
        } else {
            setDisableButton(true);
        }

        setIsLoading(false);
    }

    useEffect(() => {
        setIsLoading(true);
        getResultInArray(data.reasonForFailure);
        setIsLoading(false);
    }, [data.reasonForFailure])


    return (
        <div>
            <div style={{ fontSize: 20 }}>Actions for Failed Cases</div>
            {isExtraInfo ?
                <div style={{ fontSize: 15, textAlign: 'center' }}>Possible Reasons Of Failure:  - <span style={{ color: "blue" }}>{data.reasonForFailure}</span>
                    <p>Matched Record: <span style={{ color: "blue" }}>{matchedString}</span></p>
                </div>
                : ''}
            <Spin spinning={isLoading}>
                {showFailureAction && showFailureAction.length > 0 ?
                    <Table style={{ width: "100%" }} dataSource={showFailureAction} columns={[
                        {
                            title: "Reason for Failure",
                            dataIndex: "FAILURE_REASON",
                            key: "FAILURE_REASON"
                        },
                        {
                            title: "Action By System",
                            dataIndex: "ACTION_SYSTEM",
                            key: "ACTION_SYSTEM"
                        },
                        {
                            title: "Action By Collection Executive",
                            dataIndex: "ACTION_CE",
                            key: "ACTION_CE"
                        },
                        {
                            title: "Action By Collection Delight",
                            dataIndex: "ACTION_CE",
                            key: "ACTION_CE"
                        },
                        {
                            title: "Action By Product",
                            dataIndex: "ACTION_PRODUCT",
                            key: "ACTION_PRODUCT"
                        },
                    ]} /> :
                    <p style={{ fontSize: 15, textAlign: 'center' }}>No records matched for this result</p>
                }
            </Spin>
            <Spin spinning={isLoading}>
                <Button type="primary" onClick={handleSearch} disabled={disableButton ? true : false}>Get More Results</Button>
            </Spin>
        </div >
    );
};

export default DisplayFailureActions;

import { Spin, Button, Form, Input, Upload, } from "antd";
import { useState, useEffect } from "react";
import { dynamicAPI } from "@/services/ant-design-pro/api";
import { InstallmentBulkUpload } from "../../../components/Constants/constants";
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';

export type BulkUploadProps = {
    upload?: boolean;
}

const BulkUpload: React.FC<BulkUploadProps> = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState({});
    const [isAddInstallments, setIsAddInstallments] = useState(false);
    const [isDeleteInstallments, setIsDeleteInstallments] = useState(false);


    const setAddDelete = (value: any) => {
        console.log('value', value);
        if (value === InstallmentBulkUpload.DELETEINSTALLMENTS) {
            setIsDeleteInstallments(true);
            setIsAddInstallments(false);
        } else {
            setIsDeleteInstallments(false);
            setIsAddInstallments(true);
        }
    }

    useEffect(() => {
        setIsDeleteInstallments(false);
        setIsAddInstallments(false);
    }, [props.upload === false]);


    console.log('upl', props.upload, 'de', isDeleteInstallments, isAddInstallments);

    return (<>
        <Spin spinning={isLoading}>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", flexDirection: "column" }}>
                <Button type="primary" onClick={() => setAddDelete(InstallmentBulkUpload.ADDINSTALLMENTS)}>{InstallmentBulkUpload.ADDINSTALLMENTS}</Button>
                <Button type="primary" onClick={() => setAddDelete(InstallmentBulkUpload.DELETEINSTALLMENTS)}>{InstallmentBulkUpload.DELETEINSTALLMENTS}</Button>
                {(isAddInstallments || isDeleteInstallments) &&
                    <div>
                        <code>
                            File must be CSV and in this format:
                            <pre>
                                student_id,due_date <br />
                                STUDENT_ID,2022-06
                            </pre>
                        </code>
                        <form
                            id="uploadForm"
                            action={isAddInstallments ? "/be/csv/installments/add-bulk-installments" : isDeleteInstallments ? "/be/csv/installments/delete-bulk-installments" : ""}
                            target="_blank"
                            method="post"
                            encType="multipart/form-data" >
                            <input type="file" name="agents" required id="file" />
                            <button className="ant-btn ant-btn-primary">
                                {isAddInstallments ? 'Upload Add Installment File' : 'Upload Delete Installment File'}
                            </button>
                        </form>
                    </div>
                }
            </div>
        </Spin>
    </>)
}
export default BulkUpload;
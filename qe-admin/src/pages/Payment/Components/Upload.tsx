import { Spin, Button, Row, Col } from "antd";
import { useState, useEffect } from "react";
import { InstallmentBulkUpload } from "../../../components/Constants/constants";

export type BulkUploadProps = {
    upload?: boolean;
    setUpload?: any;
}

const BulkUpload: React.FC<BulkUploadProps> = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isAddInstallments, setIsAddInstallments] = useState(false);
    const [isDeleteInstallments, setIsDeleteInstallments] = useState(false);
    const [success, setSuccess] = useState("");


    const setAddDelete = (value: any) => {
        if (value === InstallmentBulkUpload.DELETEINSTALLMENTS) {
            setIsDeleteInstallments(true);
            setIsAddInstallments(false);
        } else {
            setIsDeleteInstallments(false);
            setIsAddInstallments(true);
        }
    }

    const handleUpload = async (e: any) => {
        setSuccess("Updating records In Progress...")
    }

    const closePopUp = async (e: any) => {
        setSuccess("")
        setIsDeleteInstallments(false);
        setIsAddInstallments(false);
        props.setUpload(false);
    }

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
                        {success && <div className="alert alert-success">{success}</div>}
                        <form
                            id="uploadForm"
                            action={isAddInstallments ? "/be/csv/installments/add-bulk-installments" : isDeleteInstallments ? "/be/csv/installments/delete-bulk-installments" : ""}
                            target="_blank"
                            method="post"
                            encType="multipart/form-data"
                            onSubmit={handleUpload}>
                            <input type="file" name="deleteAddInstallment" required id="file" />
                            <button className="ant-btn ant-btn-primary">
                                {isAddInstallments ? 'Upload Add Installment File' : 'Upload Delete Installment File'}
                            </button>
                        </form>
                    </div>
                }
                <Row >
                    <Col span={20}><Button onClick={closePopUp}>Close</Button></Col>
                </Row>

            </div>
        </Spin>
    </>)
}
export default BulkUpload;
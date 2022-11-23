import { Button, message, Modal, Progress } from 'antd';
import { useState } from 'react'
import { getIndividualBatch, addeditbatch } from "@/services/ant-design-pro/api";
import { csvToArray } from "@/services/ant-design-pro/helpers";

const UploadStudentsBulkWithoutRMN = () => {
    const [openUpload, setOpenUpload] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [currentRecord, setCurrentRecord] = useState<number>(0);

    const handleUpload = async (e: any) => {
        e.preventDefault();
        setIsLoading(true)
        try {
            const file: any = document.getElementById("file");

            const reader = new FileReader();

            reader.onload = async function (e: any) {
                const text = e.target.result;
                const data = csvToArray(text);
                if (!Array.isArray(data)) {
                    throw new Error("Failed to parse CSV File");
                }
                setTotalRecords(data.length);
                setCurrentRecord(0);
                for (const batch of data) {
                    setCurrentRecord((n) => n + 1);
                    await new Promise((resolve, reject) => setTimeout(resolve, 100));
                    if (batch["Batch Number"] && batch["Meeting Link"]) {
                        try {
                            const batchData: any = await getIndividualBatch(batch["Batch Number"]);
                            const batchClass = batchData.data.classes;
                            batchClass.sync_zoom_status = 0;
                            batchClass.useNewZoomLink = 0;
                            batchClass.useAutoAttendance = 0;
                            batchClass.zoomLink = batch["Meeting Link"];
                            if (batch["Meeting Information"]) {
                                batchClass.zoomInfo = batch["Meeting Information"];
                            }
                            const batchStudents = batchData.data.students;
                            batchClass.students = batchStudents.map((i: any) => ({ value: i.studentId }))
                            const addBatchRes = await addeditbatch({
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(batchClass),
                            });

                            if (addBatchRes.success) {
                                if (addBatchRes.data[0]?.message) {
                                    message.error(`Error: ${addBatchRes.data[0].message} For batch: \n ${JSON.stringify(batch)}.`);
                                } else {
                                    message.success(`Batch Record ${batch["Batch Number"]} Meeting Updated Successfully Successfully.`);
                                }
                            } else {
                                message.error(`Failed to update batch: \n ${JSON.stringify(batch)}.`);
                            }
                        } catch (e) {
                            message.error(`Failed to update batch: \n ${JSON.stringify(batch)}.`);
                        }
                    } else {
                        message.error(`Batch Record Doesn't Have \n Batch Number Or Meeting Link: \n ${JSON.stringify(batch)}.`);
                        console.log(batch);
                    }
                }
                setIsLoading(false)
            };

            reader.readAsText(file.files[0]);
        } catch (e: any) {
            message.error(`Something went wrong: ${e.message}`);
            setIsLoading(false)
        }
    }

    return (
        <>
            <Button
                type="primary"
                key="primary"
                onClick={() => setOpenUpload(true)}
            >
                Update Batches Meeting Link
            </Button>

            <Modal visible={openUpload} onCancel={() => setOpenUpload(false)} footer={false}>
                <code>
                    File must be CSV and in this format:
                    <pre>
                        Batch Number,Meeting Link,Meeting Information
                    </pre>
                </code>

                {totalRecords ? <Progress percent={currentRecord ? parseFloat((currentRecord / totalRecords * 100).toFixed(2)) : 0}></Progress> : ""}

                <br />

                <form id="uploadForm" action="/be/csv/collection-agents/bulk-assignment" target="_blank" method="post" encType="multipart/form-data" onSubmit={handleUpload}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <input type="file" name="agents" required id="file" />
                    <Button loading={isLoading} type="primary" htmlType="submit">
                        Upload File
                    </Button>
                </form>

                <div style={{ textAlign: "right" }}>
                    <Button type="default" onClick={() => window.location.reload()}>
                        Cancel
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default UploadStudentsBulkWithoutRMN;
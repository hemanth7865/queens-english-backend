import { Button, message, Modal, Progress } from 'antd';
import { useState } from 'react'
import { deactivateStudentsInBulk } from "@/services/ant-design-pro/api";

function csvToArray(str: string, delimiter: string = ",") {
    const headers = str.slice(0, str.indexOf("\n")).split(delimiter).map(h => h.replace("\r", ""));

    const rows = str.slice(str.indexOf("\n") + 1).split("\n").map(h => h.replace("\r", ""));

    const arr = rows.map(function (row) {
        const values = row.split(delimiter);
        const el = headers.reduce(function (object, header, index) {
            object[header] = values[index];
            return object;
        }, {});
        return el;
    });

    return arr;
}

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
                const students = [];
                if (!Array.isArray(data)) {
                    throw new Error("Failed to parse CSV File");
                }
                setTotalRecords(data.length);
                setCurrentRecord(0);
                for (const student of data) {
                    setCurrentRecord((n) => n + 1);
                    await new Promise((resolve, reject) => setTimeout(resolve, 100));
                    if (student['ID']) {
                        students.push(student['ID']);
                    } else {
                        message.error(`Student Record Doesn't Have \n ID: \n ${JSON.stringify(student)}.`);
                    }
                }
                try {
                    await deactivateStudentsInBulk({
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ students: students }),
                    });

                } catch (e) {
                    message.success(`Feel free to close that page meanwhile the system is deactivating students.`);
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
                Deactivate Students In Bulk
            </Button>

            <Modal visible={openUpload} onCancel={() => setOpenUpload(false)} footer={false}>
                <code>
                    File must be CSV and in this format:
                    <pre>
                        ID
                    </pre>
                </code>

                <div>{currentRecord == totalRecords && totalRecords > 0 ? "Feel free to close that page till deactivating students is done" : ""}</div>

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
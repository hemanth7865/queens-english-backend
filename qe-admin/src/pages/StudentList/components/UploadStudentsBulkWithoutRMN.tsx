import { Button, message, Spin, Modal, Progress } from 'antd';
import { useState } from 'react'
import { addUserSchedule } from "@/services/ant-design-pro/api";

function csvToArray(str: string, delimiter: string = ",") {
    // slice from start of text to the first \n index
    // use split to create an array from string by delimiter
    const headers = str.slice(0, str.indexOf("\n")).split(delimiter).map(h => h.replace("\r", ""));

    // slice from \n index + 1 to the end of the text
    // use split to create an array of each csv value row
    const rows = str.slice(str.indexOf("\n") + 1).split("\n").map(h => h.replace("\r", ""));

    // Map the rows
    // split values from each row into an array
    // use headers.reduce to create an object
    // object properties derived from headers:values
    // the object passed as an element of the array
    const arr = rows.map(function (row) {
        const values = row.split(delimiter);
        const el = headers.reduce(function (object, header, index) {
            object[header] = values[index];
            return object;
        }, {});
        return el;
    });

    // return the array
    return arr;
}

const UploadStudentsBulkWithoutRMN = () => {
    const [openUpload, setOpenUpload] = useState<boolean>(false);
    const [response, setResponse] = useState<object>({});
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
                setTotalRecords(data.length);
                for (const student of data) {
                    setCurrentRecord((n) => n + 1);
                    if (student["First Name"] && student["Student Code"]) {
                        const studentData = {
                            firstName: student["First Name"],
                            lastName: student["Last Name"],
                            email: student["Email"],
                            phoneNumber: student["RMN"] || student["Student Code"],
                            type: "student",
                            status: "active",
                            offlineStudentCode: student["Student Code"],
                            preventAppAccess: true
                        };

                        const res = await addUserSchedule({
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(studentData),
                        });

                        setResponse(res);

                        continue;
                    }
                    message.error(`Student Record Doesn't Have First Name Or Student Code: ${JSON.stringify(student)}.`);
                }
                setIsLoading(false)
            };

            reader.readAsText(file.files[0]);
        } catch (e: any) {
            setResponse({ error: e?.message })
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
                Upload Students Without RMN
            </Button>

            <Modal visible={openUpload} onCancel={() => setOpenUpload(false)} footer={false}>
                <Spin spinning={isLoading}>
                    <code>
                        <pre>
                            {JSON.stringify(response, null, 4)}
                        </pre>
                    </code>

                    <code>
                        File must be CSV and in this format:
                        <pre>
                            First Name,Last Name, RMN, Email, Student Code
                        </pre>
                    </code>

                    {totalRecords ? <Progress percent={currentRecord ? currentRecord / totalRecords * 100 : 0}></Progress> : ""}

                    <br />

                    <form id="uploadForm" action="/be/csv/collection-agents/bulk-assignment" target="_blank" method="post" encType="multipart/form-data" onSubmit={handleUpload}>
                        <input type="file" name="agents" required id="file" />
                        <button className="ant-btn ant-btn-primary">
                            Upload File
                        </button>
                    </form>
                </Spin>
            </Modal>
        </>
    )
}

export default UploadStudentsBulkWithoutRMN;
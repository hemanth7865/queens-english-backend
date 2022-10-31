import { Button, message, Modal, Progress } from 'antd';
import { useState } from 'react'
import { addUserSchedule, getIndividualBatch, addeditbatch } from "@/services/ant-design-pro/api";

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
    const [notStoredUsers, setNotStoredUsers] = useState<object[]>([])

    const handleUpload = async (e: any) => {
        e.preventDefault();
        setIsLoading(true)
        try {
            const file: any = document.getElementById("file");

            const reader = new FileReader();

            reader.onload = async function (e: any) {
                const text = e.target.result;
                const data = csvToArray(text);
                console.log(data);
                if (!Array.isArray(data)) {
                    throw new Error("Failed to parse CSV File");
                }
                setTotalRecords(data.length);
                setCurrentRecord(0);
                for (const student of data) {
                    setCurrentRecord((n) => n + 1);
                    await new Promise((resolve, reject) => setTimeout(resolve, 100));
                    if (student["First Name"] && student["Dummy number"]) {
                        const studentData = {
                            firstName: student["First Name"],
                            lastName: student["Last Name"],
                            teacherName: student["Teacher Name"],
                            startLesson: student["Lesson Start"],
                            email: student["Email"] || student["Dummy number"],
                            phoneNumber: student["RMN"] || student["Dummy number"],
                            type: "student",
                            status: "active",
                            offlineStudentCode: student["Dummy number"],
                            preventAppAccess: 1
                        };

                        const res = await addUserSchedule({
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(studentData),
                        });

                        if (!res.id) {
                            setNotStoredUsers((d) => {
                                d.push({ studentData, res });
                                return d;
                            })
                            message.error(`Student Record Not Saved: \n ${JSON.stringify(student)}.`);
                            continue;
                        }

                        message.success(`Student Record ${student["First Name"]} ${student["Last Name"]} Created Successfully.`);

                        /**
                         * Add student to batch
                         */
                        if (student["Batch code"]) {
                            try {
                                const batchData = await getIndividualBatch(student["Batch code"]);
                                const batch = batchData.data.classes;
                                const batchStudents = batchData.data.students;
                                batch.students = batchStudents.map((i: any) => ({ value: i.studentId }))
                                batch.students.push({ value: res.id })
                                const addBatchRes = await addeditbatch({
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify(batch),
                                });

                                if (addBatchRes.success) {
                                    if (addBatchRes.data[0]?.message) {
                                        message.error(`Error: ${addBatchRes.data[0].message} For Student: \n ${JSON.stringify(student)}.`);
                                    } else {
                                        message.success(`Student Record ${student["First Name"]} ${student["Last Name"]} Add To Batch ${student["Batch code"]} Successfully.`);
                                    }
                                } else {
                                    message.error(`Failed to add student to batch For Student: \n ${JSON.stringify(student)}.`);
                                }
                            } catch (e) {
                                message.error(`Failed to add batch for student: \n ${JSON.stringify(student)}.`);
                            }
                        }

                    } else {
                        message.error(`Student Record Doesn't Have \n First Name Or Dummy Number: \n ${JSON.stringify(student)}.`);
                        console.log(student);
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
                Upload Students Without RMN
            </Button>

            <Modal visible={openUpload} onCancel={() => setOpenUpload(false)} footer={false}>
                <code style={{ maxHeight: "300px", overflow: "auto" }}>
                    <pre>
                        {JSON.stringify(notStoredUsers, null, 4)}
                    </pre>
                </code>

                <code>
                    File must be CSV and in this format:
                    <pre>
                        First Name,Last Name, RMN, Email, Teacher Name, Dummy number
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
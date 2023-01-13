import { Button, message, Modal, Progress, Select } from 'antd';
import { useState, useEffect } from 'react'
import { addUserSchedule, getIndividualBatch, addeditbatch, listSchool, addBatchToSchool } from "@/services/ant-design-pro/api";
import { UploadOutlined } from '@ant-design/icons';

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

const UploadStudentsBulkWithoutRMN = (props: any) => {
    const [openUpload, setOpenUpload] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [currentRecord, setCurrentRecord] = useState<number>(0);
    const [notStoredUsers, setNotStoredUsers] = useState<object[]>([])
    const [schools, setSchools] = useState<any[]>([]);
    const [selectedSchool, setSelectedSchool] = useState<any>(null);

    useEffect(() => {
        listSchool()
            .then((data: any) => {
                setSchools(data.data);
            })
            .catch((error) => {
                console.log(error);
            });
        if (props?.school) {
            setSelectedSchool(props.school)
        }
    }, [props.school]);

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
                let batches: any[] = [];
                for (const student of data) {
                    await new Promise((resolve, reject) => setTimeout(resolve, 100));
                    if (student["First Name"] && student["Dummy number"]) {
                        let phoneNumber = student["Dummy number"];
                        if (student["RMN"]) {
                            if (student["RMN"].split("+")[1]) {
                                phoneNumber = student["RMN"];
                            } else if (student["RMN"].length > 10) {
                                phoneNumber = "+" + student["RMN"]
                            } else {
                                phoneNumber = "+91" + student["RMN"]
                            }
                        }

                        const loginCodeNumber = Math.floor(100000 + Math.random() * 900000);
                        const loginCode = loginCodeNumber.toString();
                        const studentData = {
                            firstName: student["First Name"],
                            lastName: student["Last Name"] || "-",
                            teacherName: student["Teacher Name"],
                            startLesson: student["Lesson Start"],
                            email: student["Email"] || student["Dummy number"],
                            phoneNumber,
                            type: "student",
                            status: "active",
                            offlineStudentCode: student["Dummy number"],
                            preventAppAccess: 0,
                            offlineUser: 1,
                            loginCode
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
                                const batchData: any = await getIndividualBatch(student["Batch code"]);
                                const batch = batchData.data.classes;
                                batches.push(batchData.data.classes.id)
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
                    }
                    setCurrentRecord((n) => n + 1);
                }
                if (!!selectedSchool && !!batches) {
                    const batchesToAdd = [...new Set(batches)]
                    const school = schools.find(obj => obj.id === selectedSchool);
                    const data = {
                        batchesToSave: batchesToAdd,
                        saveSchool: school,
                        csv: true
                    };
                    try {
                        await addBatchToSchool({
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(data),
                        });
                    } catch (e) {
                        console.log("e", e)
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
            {props.uploadButtonStyle ? (
                <Button
                    type="primary"
                    key="primary"
                    onClick={() => setOpenUpload(true)}
                    icon={<UploadOutlined />}
                    style={{ color: "white", backgroundColor: "DodgerBlue", margin: "2px", height: "40px" }}
                    shape="round"
                    block
                >
                    Bulk Upload Students
                </Button>
            ) : (
                <Button
                    type="primary"
                    key="primary"
                    onClick={() => setOpenUpload(true)}
                    icon={<UploadOutlined />}
                >
                    Bulk Upload Students
                </Button>
            )}


            <Modal visible={openUpload} onCancel={() => { setOpenUpload(false), setSelectedSchool(null) }} footer={false}>
                <code style={{ maxHeight: "300px", overflow: "auto" }}>
                    <pre>
                        {JSON.stringify(notStoredUsers, null, 4)}
                    </pre>
                </code>

                <code>
                    File must be CSV and in this format:
                    <pre>
                        First Name,Last Name, RMN, Email, Teacher Name, Dummy number, Batch code
                    </pre>
                </code>

                {totalRecords ? <Progress percent={currentRecord ? parseFloat((currentRecord / totalRecords * 100).toFixed(2)) : 0}></Progress> : ""}

                <br />
                <Select
                    placeholder="Select School"
                    onChange={(value) => setSelectedSchool(value)}
                    value={selectedSchool}
                    showSearch
                    style={{ margin: "3px", display: "block" }}
                    allowClear
                    options={schools.map((s) => ({ value: s.id, label: `${s.schoolName} ~ ${s.schoolCode}` }))}
                    optionLabelProp="label"
                    optionFilterProp='label'
                    disabled={props.disableDropdown}
                >
                </Select>
                <form id="uploadForm" action="/be/csv/collection-agents/bulk-assignment" target="_blank" method="post" encType="multipart/form-data" onSubmit={handleUpload}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <input type="file" name="agents" required id="file" />
                    <Button loading={isLoading} type="primary" htmlType="submit" style={{ margin: "3px" }}>
                        Upload File
                    </Button>
                </form>

                <div style={{ textAlign: "right", margin: "3px" }}>
                    <Button type="default" onClick={() => window.location.reload()}>
                        Cancel
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default UploadStudentsBulkWithoutRMN;
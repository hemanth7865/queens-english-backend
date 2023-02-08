import { Button, message, Modal, Progress, Select } from 'antd';
import { useState, useEffect } from 'react'
import { addUserSchedule, getIndividualBatch, addeditbatch, listSchool, addBatchToSchool, checkStudentInBatch, rebatchStudent, bulkRemoveBatchStudents } from "@/services/ant-design-pro/api";
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

            const studentsAdded: any[] = [];

            const studentsUploaded: any[] = [];

            const studentsFinal: any[] = [];

            const studentsAlreadyInBatch: any[] = [];

            let batches: any[] = [];

            async function handleBatching() {
                const batchesInCsv = [...new Set(batches)];
                setTotalRecords(studentsUploaded.length + batchesInCsv.length);
                let success = false;

                try {
                    for (const batch of batchesInCsv) {
                        const batchData: any = await getIndividualBatch(batch);
                        if (!batchData.data.classes) {
                            batchesInCsv.splice(batchesInCsv.indexOf(batch), 1);
                            message.error(`Batch ${batch} not found. Please create the batch first.`);
                            continue;
                        }
                        const studentsToCheck = studentsFinal.filter(student => student.batchCode == batchData.data.classes.batchNumber)
                        if (studentsToCheck.length > 0) {
                            const checkStudentBatch = await checkStudentInBatch({ students: studentsToCheck, data: { id: batchData.data.classes.id } });
                            if (checkStudentBatch.data.length > 0) {
                                studentsAlreadyInBatch.push(...checkStudentBatch.data);
                            }
                        }
                    }

                    if (studentsAlreadyInBatch.length !== 0) {
                        const batches = [...new Set(studentsAlreadyInBatch.map((student) => student.batch.id))];
                        for (const batch of batches) {
                            const students = studentsAlreadyInBatch.filter((student) => student.batch.id === batch).map((student) => student.student.id);
                            await bulkRemoveBatchStudents({ students, batch });
                        }
                    }

                    for (const batch of batchesInCsv) {
                        const batchData: any = await getIndividualBatch(batch);
                        if (batchData.data.classes) {
                            const batchStudents: any[] = [];
                            if (batchData.data.students.length > 0) {
                                const [{ student: dontNeed, created_at: dontNeed2, ...otherProps }] = batchData.data.students
                                batchStudents.push(otherProps);
                            }
                            const studentsToAdd = studentsFinal.filter((student) => student.batchCode == batch);
                            for (const student of studentsToAdd) {
                                batchStudents.push({
                                    key: student.id,
                                    label: `${student.firstName} ${student.lastName} - ${student.offlineStudentCode}`,
                                    value: student.id,
                                });
                            }
                            const addBatchRes = await addeditbatch({
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    ...batchData.data.classes,
                                    csvUpload: true,
                                    students: batchStudents,
                                }),
                            });
                            if (addBatchRes.success) {
                                if (addBatchRes.data[0]?.message) {
                                    message.error(`Error: ${addBatchRes.data[0].message} For Batch: ${batch}.`);
                                } else {
                                    message.success(`Students added Successfully to Batch: ${batch}.`).then(() => message.destroy("info"));
                                }
                            } else {
                                message.error(`Failed to add students to Batch:${batch}.`);
                            }
                        }
                        setCurrentRecord((n) => n + 1)
                    }
                    success = true;
                    setCurrentRecord((n) => n + 1)
                } catch (error) {
                    console.log(error);
                    success = false;
                }
                return success;
            }

            reader.onload = async function (e: any) {
                const text = e.target.result;
                const data = csvToArray(text);
                data.pop();
                if (!Array.isArray(data)) {
                    throw new Error("Failed to parse CSV File");
                }
                setTotalRecords(data.length + 1);
                setCurrentRecord(0);

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
                            batchCode: student["Batch code"],
                            loginCode
                        };

                        studentsUploaded.push(studentData);
                        batches.push(student["Batch code"]);
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
                        } else {
                            studentsAdded.push(res);
                            message.success(`Student Record ${student["First Name"]} ${student["Last Name"]} Created Successfully.`);
                        }
                    } else {
                        message.error(`Student Record Doesn't Have \n First Name Or Dummy Number: \n ${JSON.stringify(student)}.`);
                    }
                    setCurrentRecord((n) => n + 1);
                }

                for (const studentAdded of studentsAdded) {
                    studentsUploaded.filter((student) => {
                        if (student.offlineStudentCode == studentAdded.offlineStudentCode) {
                            studentsFinal.push({ ...student, id: studentAdded.id });
                        }
                    });
                }

                if (batches.length > 0 && studentsFinal.length > 0) {
                    try {
                        message.loading("Adding Students to their respective batches", 5)
                        const batching = await handleBatching();
                        if (batching) {
                            message.success("All Students added to their respective batches")
                        } else {
                            message.error("Error in adding students to their respective batches")
                        }
                    } catch (e) {
                        message.error("Error in adding students to their respective batches, please check console for more details")
                    }
                }

                if (!!selectedSchool && batches.length > 0 && studentsFinal.length > 0) {
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
                    <p style={{ color: "red" }}>
                        *** Please make sure that the Dummy number/RMN field in CSV does not contain Euler's constant Example "1.00012E+18". Will lead to API fail and add alot of students ***
                    </p>
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
import { Button, message, Modal, Progress, Select, Tooltip } from 'antd';
import { Access, useAccess } from "umi";
import { useState, useEffect } from 'react'
import { addUserSchedule, getIndividualBatch, addeditbatch, listSchool, addBatchToSchool, checkStudentInBatch, rebatchStudent, bulkRemoveBatchStudents, syncStudentsToCosmos } from "@/services/ant-design-pro/api";
import { UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { LESSONS } from '../../../../config/lessons';
import { downloadCSV } from '@/services/ant-design-pro/downloadCSV';
import { SPREADSHEETS } from '../../../../config/constants';

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
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [openUpload, setOpenUpload] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [currentRecord, setCurrentRecord] = useState<number>(0);
    const [notStoredUsers, setNotStoredUsers] = useState<object[]>([])
    const [schools, setSchools] = useState<any[]>([]);
    const [selectedSchool, setSelectedSchool] = useState<any>(null);
    const [schoolsLoading, setSchoolsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<any[]>([]);
    const [reload, setReload] = useState<number>(0);

    //Role Based Access
    const access = useAccess();

    const getLessonIdByNumber = (data: any) => {
        let lessonNumber = parseInt(data).toString()
        if (lessonNumber.length === 1) {
            lessonNumber = "0" + lessonNumber
        }
        const lesson = LESSONS.filter((lesson) => {
            return lesson.number === lessonNumber
        })

        if (lesson.length === 0) {
            return false
        }
        return lesson[0]?.id
    }

    useEffect(() => {
        setSchoolsLoading(true);
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
        setSchoolsLoading(false);
    }, [props.school]);

    const downloadErrorsCSV = () => {
        downloadCSV(errors.map((error) => ({ ...error.student, Error: error["Error Message"] })))
    }

    useEffect(() => {
        downloadErrorsCSV();
    }, [reload])

    const handleUpload = async (e: any) => {
        e.preventDefault();
        setIsLoading(true)
        setStatusMessage("");
        try {
            const file: any = document.getElementById("file");

            const reader = new FileReader();

            const studentsAdded: any[] = [];

            const studentsUploaded: any[] = [];

            const studentsFinal: any[] = [];

            const finalStudentsIds: string[] = [];

            const studentsAlreadyInBatch: any[] = [];

            let batches: any[] = [];

            async function handleBatching() {
                const batchesInCsv = [...new Set(batches)];
                setTotalRecords((studentsUploaded.length * 2) + batchesInCsv.length);
                let success = false;

                try {
                    for (const batch of batchesInCsv) {
                        let batchData: any = await getIndividualBatch(batch);
                        let classes = batchData.data.classes;
                        if (!classes) {
                            message.loading(`Creating Batch : ${batch}`, 5)
                            const batchBody: any = {
                                batchNumber: batch,
                                classStartDate: moment().format('YYYY-MM-DDTHH:mm:ss'),
                                classEndDate: moment().add(1, 'year').format('YYYY-MM-DDTHH:mm:ss'),
                                edit: false,
                                startingLessonId: getLessonIdByNumber(1),
                                endingLessonId: getLessonIdByNumber(100),
                                activeLessonId: getLessonIdByNumber(1),
                                followupVersion: "v2",
                                lessonStartTime: moment("15:30", "HH:mm").utc().format('YYYY-MM-DDTHH:mm:ss'),
                                lessonEndTime: moment("17:00", "HH:mm").utc().format('YYYY-MM-DDTHH:mm:ss'),
                                students: [],
                                useAutoAttendance: 0,
                                useNewZoomLink: 0,
                                whatsappLink: "",
                                zoomInfo: "",
                                zoomLink: "",
                                classCode: "",
                                ageGroup: "",
                                batchAvailability: [{}],
                                offlineBatch: 1,
                                schoolId: selectedSchool
                            }
                            const res = await addeditbatch({
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(batchBody)
                            })
                            classes = res.data[0]
                            message.success(`Batch created successfully: ${batch}.`)
                        }
                        const studentsToCheck = studentsFinal.filter(student => student.batchCode == classes.batchNumber)
                        if (studentsToCheck.length > 0) {
                            const data = { students: studentsToCheck, id: classes.id }
                            const checkStudentBatch = await checkStudentInBatch(data);
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
                                setErrors((prev) => [
                                    ...prev,
                                    ...batchStudents.map((student) => ({ student, "Error Message": `Failed to add students to Batch:${batch}.` }))
                                ])
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
                let data = csvToArray(text);
                if (!Array.isArray(data)) {
                    throw new Error("Failed to parse CSV File");
                }
                setErrors([]);
                setTotalRecords((data.length + 1) * 2);
                setCurrentRecord(0);
                setStatusMessage("Process Started...")

                const isDuplicate = (a: any, b: any, column: string) => {
                    return a[column] && b[column] && a[column].trim() === b[column].trim()
                }

                setStatusMessage("Finding Duplicate Students within CSV...")
                data = data.filter((a, indexA) => {
                    const isSame = data.find((b, indexB) => {
                        if (indexA === indexB) return false;
                        return (
                            isDuplicate(a, b, "First Name") &&
                            isDuplicate(a, b, "Last Name") &&
                            isDuplicate(a, b, "Middle Name") &&
                            isDuplicate(a, b, "Class section")
                        )
                    })
                    if (isSame) {
                        setErrors((prev) => [...prev, { student: a, "Error Message": "Duplicate data in same CSV Upload" }])
                        return false;
                    }
                    return true;
                })

                setStatusMessage("Creating Students in MYSQL .....")
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
                            middleName: student["Middle Name"] || "-",
                            classSection: student["Class section"] || "-",
                            teacherName: student["Teacher Name"],
                            startLesson: student["Lesson Start"],
                            email: student["Email"] || student["Dummy number"],
                            phoneNumber,
                            type: "student",
                            status: "active",
                            offlineStudentCode: student["Dummy number"],
                            preventAppAccess: 0,
                            offlineUser: 1,
                            batchCode: `${(schools.find((school) => school.id = selectedSchool)).schoolCode}${student["Class section"]}`,
                            loginCode,
                            schoolId: selectedSchool
                        };

                        studentsUploaded.push(studentData);
                        if (student["Class section"]) {
                            batches.push(`${(schools.find((school) => school.id = selectedSchool)).schoolCode}${student["Class section"]}`);
                        }
                        const res = await addUserSchedule({
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(studentData),
                            params: { cosmosSync: false }
                        });

                        if (!res.id) {
                            setErrors((prev) => [...prev, { student, "Error Message": res?.errors[0] }])
                            setNotStoredUsers((d) => {
                                d.push({ studentData, res });
                                return d;
                            })
                            message.error(`Student Record Not Saved: \n ${JSON.stringify(student)}.`);
                            continue;
                        } else {
                            studentsAdded.push(res);
                        }
                    } else {
                        message.error(`Student Record Doesn't Have \n First Name Or Dummy Number: \n ${JSON.stringify(student)}.`);
                    }
                    setCurrentRecord((n) => n + 1);
                }

                for (const studentAdded of studentsAdded) {
                    studentsUploaded.filter((student) => {
                        if (student.offlineStudentCode == studentAdded.offlineStudentCode) {
                            finalStudentsIds.push(studentAdded.id);
                            studentsFinal.push({ ...student, id: studentAdded.id });
                        }
                    });
                }

                if (finalStudentsIds.length > 0) {

                    setStatusMessage("Creating Students in CosmosDB .....")
                    // Passing Ids of the new created students
                    try {
                        const res = await syncStudentsToCosmos({
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(finalStudentsIds)
                        })

                        // Setting errors and showing it to the users
                        if (res.errors.length > 0) {
                            res.errors.forEach((error: { student?: any, studentId: string, "Error Message": string }) => {
                                setErrors((prev) => [
                                    ...prev,
                                    {
                                        student: studentsFinal.find((stud) => stud.id === error?.studentId),
                                        "Error Message": error["Error Message"]
                                    }
                                ])

                                setNotStoredUsers((prev) => [
                                    ...prev,
                                    {
                                        studentData: error?.student || studentsFinal.find((stud) => stud.id === error?.studentId),
                                        "Error Message": error["Error Message"]
                                    }
                                ])
                                studentsFinal.filter((stud) => stud.id !== error.studentId)
                            })
                        }
                    } catch (error) {
                        console.log('error', error)
                    }
                }
                setCurrentRecord((n) => n * 2);

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
                setReload(e => e + 1)
            };

            reader.readAsText(file.files[0]);
        } catch (e: any) {
            message.error(`Something went wrong: ${e.message}`);
            setIsLoading(false)
        }
    }

    return (
        <>
            {access.canSuperAdmin && (
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
                </>
            )}

            <Modal visible={openUpload} onCancel={() => { setOpenUpload(false), setSelectedSchool(null) }} footer={false}>

                {errors.length > 0 && (
                    <div style={{ marginLeft: 10 }}>
                        <span>Bulk upload errors : </span><br />
                        <Button onClick={() => { downloadErrorsCSV() }} loading={isLoading} type="primary" style={{ margin: "3px" }} shape="round">
                            Download Bulk Upload Errors CSV
                        </Button>
                    </div>
                )}

                <code style={{ maxHeight: "300px", overflow: "auto" }}>
                    <pre>
                        {JSON.stringify(notStoredUsers, null, 4)}
                    </pre>
                </code>

                <code>
                    File must be CSV and in this format:
                    <pre>
                        First Name, Last Name, Middle name, RMN, Email, Teacher Name, Dummy number, Class section
                    </pre>
                    <p style={{ color: "red" }}>
                        *** Please make sure that the Dummy number/RMN field in CSV does not contain Euler's constant Example "1.00012E+18". Will lead to API fail and add alot of students ***
                    </p>
                </code>

                {totalRecords ? <Progress percent={currentRecord ? parseFloat((currentRecord / totalRecords * 100).toFixed(2)) : 0}></Progress> : ""}
                {statusMessage !== "" && (<><span style={{ paddingLeft: 10 }}>{statusMessage}</span> <br /></>)}
                <br />
                <Button target='_blank' href={SPREADSHEETS.STUDENT_BULK_UPLOAD} type="dashed" htmlType="submit" style={{ fontWeight: 'bold', margin: "3px" }}>
                    Open Student Bulk Upload spreadsheet format.
                </Button>
                <br />
                <Select
                    placeholder="Select School"
                    onChange={(value) => setSelectedSchool(value)}
                    value={selectedSchool}
                    defaultValue={selectedSchool}
                    showSearch
                    style={{ margin: "3px", display: "block" }}
                    allowClear
                    options={schools.map((s) => ({ value: s.id, label: `${s.schoolName} ~ ${s.schoolCode}` }))}
                    optionLabelProp="label"
                    optionFilterProp='label'
                    disabled={props.disableDropdown}
                    loading={schoolsLoading}
                >
                </Select>
                <form id="uploadForm" action="/be/csv/collection-agents/bulk-assignment" target="_blank" method="post" encType="multipart/form-data" onSubmit={handleUpload}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <input type="file" name="agents" required id="file" />
                    <Tooltip title={!!!selectedSchool ? "Please Select School" : null}>
                        <Button loading={isLoading} type="primary" htmlType="submit" style={{ margin: "3px" }} disabled={!!!selectedSchool}>
                            Upload File
                        </Button>
                    </Tooltip>
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
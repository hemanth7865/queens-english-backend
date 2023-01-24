import { Button, message, Modal, Progress, Select } from 'antd';
import { useState, useEffect } from 'react'
import { addeditbatch, listSchool, teacherBatches } from "@/services/ant-design-pro/api";
import { UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { LESSONS } from '../../../../config/lessons';
import { csvToArray } from '@/services/ant-design-pro/helpers';

const dateFromat = 'YYYY-MM-DDTHH:mm:ss.000Z'

const BulkUploadBatchesOfSchool = (props: any) => {
    const [openUpload, setOpenUpload] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [currentRecord, setCurrentRecord] = useState<number>(0);
    const [notStoredBatches, setNotStoredBatches] = useState<object[]>([])
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
    }, []);

    const getDateOrTime = (data: any, format: any) => {
        const isForTime = format === "HH:mm"
        if ((isForTime && data.indexOf(":") === -1) || (!isForTime && data.indexOf("-") === -1)) {
            return false
        }
        const date = isForTime ? moment(data, format).utc().format('YYYY-MM-DDTHH:mm:ss') : moment(data, format).format('YYYY-MM-DDTHH:mm:ss')
        if (date === "Invalid date") {
            return false
        }
        const proposedDate = date + ".000Z"
        if (moment(proposedDate).isValid()) {
            return proposedDate
        }
        return false
    }

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

    const handleUpload = async (e: any) => {
        setNotStoredBatches([])
        e.preventDefault();
        setIsLoading(true)
        try {
            const file: any = document.getElementById("file");

            const reader = new FileReader();

            reader.onload = async function (e: any) {
                const text = e.target.result;
                const data: any = csvToArray(text);
                if (!Array.isArray(data)) {
                    throw new Error("Failed to parse CSV File");
                }
                setTotalRecords(data.length);
                setCurrentRecord(0);
                // let batches: any[] = [];
                for (const batch of data) {
                    await new Promise((resolve, reject) => setTimeout(resolve, 100));
                    if (batch["Batch code"] && batch["Start date"] && batch["End date"] && batch["Starting Lesson"] && batch["Ending Lesson"] && batch["Lesson start time"] && batch["Lesson end time"] && batch["Active"]) {

                        let haveAnyError = false
                        let errors: string[] = []

                        let classStartDate: any = getDateOrTime(batch["Start date"], 'DD-MM-YYYY')
                        let classEndDate: any = getDateOrTime(batch["End date"], 'DD-MM-YYYY')
                        const isEndDateBeforeStartDate = moment(classEndDate, dateFromat).isBefore(moment(classStartDate, dateFromat))
                        if (!classStartDate || !classEndDate || isEndDateBeforeStartDate) {
                            haveAnyError = true
                            if (!classStartDate) {
                                errors.push(`Invalid Class Start date : ${batch["Start date"]}`)
                            }
                            if (!classEndDate) {
                                errors.push(`Invalid Class End date : ${batch["End date"]}`)
                            }
                            if (isEndDateBeforeStartDate) {
                                errors.push('Class end date should not be lesser than the Class start date')
                            }
                        }
                        let startingLessonId = getLessonIdByNumber(batch["Starting Lesson"])
                        let endingLessonId = getLessonIdByNumber(batch["Ending Lesson"])
                        const isEndLessonBeforeStartLesson = parseInt(batch["Starting Lesson"]) > parseInt(batch["Ending Lesson"])
                        if (isEndLessonBeforeStartLesson || !startingLessonId || !endingLessonId) {
                            haveAnyError = true
                            if (!startingLessonId) {
                                errors.push(`Invalid Start Lesson Number : ${batch["Starting Lesson"]}`)
                            }
                            if (!endingLessonId) {
                                errors.push(`Invalid End Lesson Number : ${batch["Ending Lesson"]}`)
                            }
                            if (isEndLessonBeforeStartLesson) {
                                errors.push('Starting Lesson should not be greater than ending lesson')
                            }
                        }

                        let lessonStartTime: any = getDateOrTime(batch["Lesson start time"], "HH:mm")
                        let lessonEndTime: any = getDateOrTime(batch["Lesson end time"], "HH:mm")
                        const isEndTimeBeforeStartTime = moment(lessonEndTime, dateFromat).isBefore(moment(lessonStartTime, dateFromat))
                        if (isEndTimeBeforeStartTime || !lessonStartTime || !lessonEndTime) {
                            haveAnyError = true
                            if (!lessonStartTime) {
                                errors.push(`Invalid Lesson Start Time : ${batch["Lesson start time"]}`)
                            }
                            if (!lessonEndTime) {
                                errors.push(`Invalid Lesson End Time : ${batch["Lesson end time"]}`)
                            }
                            if (isEndTimeBeforeStartTime) {
                                errors.push('Lesson Starting Time should not more than Lesson Ending Time')
                            }
                        }

                        if (batch["Teacher"] && batch["Teacher"] !== "" && batch["Teacher"].length < 8) {
                            haveAnyError = true
                            errors.push(`Invalid Teacher Mobile Number: ${batch["Teacher"]}`);
                        }

                        if (haveAnyError) {
                            setNotStoredBatches((d) => {
                                const obj = {
                                    "Batch code": batch["Batch code"],
                                    "Error Messages": errors
                                }
                                d.push(obj);
                                return d;
                            })
                            setCurrentRecord((n) => n + 1);
                            continue;
                        }

                        const batchData: any = {
                            batchNumber: batch["Batch code"],
                            classStartDate,
                            classEndDate,
                            edit: false,
                            startingLessonId,
                            endingLessonId,
                            activeLessonId: startingLessonId,
                            followupVersion: "v2",
                            lessonStartTime,
                            lessonEndTime,
                            students: [],
                            useAutoAttendance: 0,
                            useNewZoomLink: 0,
                            whatsappLink: "",
                            zoomInfo: "",
                            zoomLink: "",
                            classCode: "",
                            ageGroup: "",
                            batchAvailability: [{}],
                            offlineBatch: 1
                        }

                        if (selectedSchool) {
                            batchData.schoolId = selectedSchool
                        }

                        if (batch["Active"] && batch["Active"] !== "" && batch["Active"].toLowerCase() !== 'true') {
                            // status as 4 indicate that batch is Inactive
                            batchData.status = 4
                        }

                        if (batch["Teacher"] && batch["Teacher"] !== "") {
                            const res = await teacherBatches({ current: 1, pageSize: 1, phoneNumber: batch["Teacher"] })
                            if (res.data && res.data?.length != 0) {
                                batchData.teacherId = res.data[0]?.id
                            }
                        }

                        const res = await addeditbatch({
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(batchData)
                        })

                        if (res.success) {
                            if (res.data[0]?.message) {
                                setNotStoredBatches((d) => {
                                    const obj = {
                                        "Batch code": batchData.batchNumber,
                                        "Error Messages": [res.data[0]?.message]
                                    }
                                    d.push(obj);
                                    return d;
                                })
                            } else {
                                message.success(`Batch ${batchData.batchNumber} Created Successfully.`);
                            }
                        }

                    } else {
                        setNotStoredBatches((d) => {
                            batch["Error Messages"] = [`Batch Record Doesn't Have : Batch code Or Start date Or End date Or Starting Lesson Or Ending Lesson Or Lesson start time Or Lesson end time Or Active`]
                            d.push(batch)
                            return d;
                        })
                    }
                    setCurrentRecord((n) => n + 1);
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
                icon={<UploadOutlined />}
            >
                Bulk Upload Batches
            </Button>

            <Modal width={"70%"} visible={openUpload} onCancel={() => { setOpenUpload(false), setSelectedSchool(null) }} footer={false}>
                {notStoredBatches.length > 0 && (
                    <code style={{ maxHeight: "300px" }}>
                        <p style={{ color: 'red', fontWeight: 'bold' }}>Errors : </p>
                        <div>
                            {notStoredBatches.map((e) => {
                                return <div style={{
                                    wordWrap: "break-word"
                                }}>
                                    <div style={{ display: 'flex' }}>
                                        <p style={{ whiteSpace: 'nowrap' }}>
                                            {e["Batch code"]} :
                                        </p>
                                        <p>
                                            {Array.isArray(e["Error Messages"]) && e["Error Messages"]?.map((error: any, index) => {
                                                return error + (e["Error Messages"]?.length - 1 === index ? "." : ", ")
                                            })}
                                        </p>
                                    </div>
                                </div>
                            })}
                        </div>
                    </code>
                )}

                <code>
                    File must be CSV and in this format:
                    <pre>
                        Batch code, Starting Lesson, Ending Lesson, Start date, End date, Lesson start time, Lesson end time, Teacher <br />
                    </pre>
                </code>

                <code>
                    Example:
                    <pre>
                        <table border="1" cellPadding={"5px"} >
                            <tr>
                                <th>Batch code</th>
                                <th>Starting Lesson</th>
                                <th>Ending Lesson</th>
                                <th>Start date</th>
                                <th>End date</th>
                                <th>Lesson start time</th>
                                <th>Lesson end time</th>
                                <th>Teacher</th>
                                <th>Active</th>
                            </tr>
                            <tr>
                                <td>QE1234</td>
                                <td>5</td>
                                <td>30</td>
                                <td>01-01-2023</td>
                                <td>31-12-2023</td>
                                <td>15:30</td>
                                <td>17:00</td>
                                <td>1234567890</td>
                                <td>true</td>
                            </tr>
                        </table>
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
                />
                <form id="uploadForm" target="_blank" method="post" encType="multipart/form-data" onSubmit={handleUpload} style={{ marginTop: "5px" }}>
                    <input type="file" name="agents" required id="file" />
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "3px" }}>
                        <Button loading={isLoading} type="primary" htmlType="submit">
                            Upload File
                        </Button>
                        <Button type="default" onClick={() => window.location.reload()}>
                            Cancel
                        </Button>
                    </div>
                </form>

                <div style={{ textAlign: "right", margin: "3px" }}>
                </div>
            </Modal>
        </>
    )
}

export default BulkUploadBatchesOfSchool;
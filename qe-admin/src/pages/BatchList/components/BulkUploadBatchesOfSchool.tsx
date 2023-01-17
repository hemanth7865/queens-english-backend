import { Button, message, Modal, Progress, Select } from 'antd';
import { useState, useEffect } from 'react'
import { addeditbatch, listSchool, teacherBatches } from "@/services/ant-design-pro/api";
import { UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { LESSONS } from '../../../../config/lessons';

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

    const getDate = (data: any) => {
        const date = moment(data, 'DD-MM-YYYY').format('YYYY-MM-DDTHH:mm:ss')
        if (date === "Invalid date") {
            return false
        }
        const proposedDate = date + ".000Z"
        if (!(moment(proposedDate).isValid())) {
            return false
        }
        return proposedDate;
    }

    const getTime = (data: any) => {
        const date = moment(data, "HH:mm").utc().format("YYYY-MM-DDTHH:mm:ss")
        const proposedTime = date + ".000Z"
        if (!(moment(proposedTime).isValid())) {
            return false
        }
        return proposedTime
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
                // let batches: any[] = [];
                for (const batch of data) {
                    await new Promise((resolve, reject) => setTimeout(resolve, 100));
                    if (batch["Batch code"] && batch["Start date"] && batch["End date"] && batch["Starting Lesson"] && batch["Ending Lesson"] && batch["Lesson start time"] && batch["Lesson end time"]) {

                        let classStartDate = getDate(batch["Start date"])
                        let classEndDate = getDate(batch["End date"])
                        if (!classStartDate || !classEndDate) {
                            message.error(`Invalid Start or End date format : \n ${JSON.stringify(batch)}.`);
                            continue;
                        }
                        let startingLessonId = getLessonIdByNumber(batch["Starting Lesson"])
                        let endingLessonId = getLessonIdByNumber(batch["Ending Lesson"])
                        if (!startingLessonId || !endingLessonId) {
                            message.error(`Invalid Starting Lesson or Ending Lesson : \n ${JSON.stringify(batch)}.`);
                            continue;
                        }

                        let lessonStartTime = getTime(batch["Lesson start time"])
                        let lessonEndTime = getTime(batch["Lesson end time"])
                        if (!lessonStartTime || !lessonEndTime) {
                            message.error(`Invalid Lesson Starting or Lesson Ending Time : \n ${JSON.stringify(batch)}.`);
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
                                    d.push({ batchData, res });
                                    return d;
                                })
                                message.error(`${batchData.batchNumber} -- ${res.data[0].message}`);
                            } else {
                                message.success(`Batch ${batchData.batchNumber} Created Successfully.`);
                            }
                        }

                    } else {
                        message.error(`Batch Record Doesn't Have \n Batch code Or Start date Or End date Or Starting Lesson Or Ending Lesson Or Lesson start time Or Lesson end time : \n ${JSON.stringify(batch)}.`);
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

            <Modal visible={openUpload} onCancel={() => { setOpenUpload(false), setSelectedSchool(null) }} footer={false}>
                <code style={{ maxHeight: "300px", overflow: "auto" }}>
                    <pre>
                        {JSON.stringify(notStoredBatches, null, 4)}
                    </pre>
                </code>

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
                <form id="uploadForm" target="_blank" method="post" encType="multipart/form-data" onSubmit={handleUpload}
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

export default BulkUploadBatchesOfSchool;
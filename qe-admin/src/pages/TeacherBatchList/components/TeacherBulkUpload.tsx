import { Button, message, Modal, Progress, Select } from 'antd';
import { Access, useAccess } from "umi";
import { useState, useEffect } from 'react'
import { addTeacherSchedule, listSchool } from "@/services/ant-design-pro/api";
import { UploadOutlined } from '@ant-design/icons';
import { csvToArray } from '@/services/ant-design-pro/helpers';
import { SPREADSHEETS } from '../../../../config/constants';

const TeacherBulkUpload = () => {
    const [openUpload, setOpenUpload] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [currentRecord, setCurrentRecord] = useState<number>(0);
    const [notStoredTeachers, setNotStoredTeachers] = useState<object[]>([])
    const [schools, setSchools] = useState<any[]>([]);
    const [selectedSchool, setSelectedSchool] = useState<any>(null);

    const url = new URL(window.location.href);

    //Role Based Access
    const access = useAccess();

    useEffect(() => {
        listSchool()
            .then((data: any) => {
                setSchools(data.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const isValidPhoneNumber = (phoneNumber: string) => {
        if (phoneNumber == null || (phoneNumber && phoneNumber.length !== 10)) return false
        return true
    }

    const isValidEmail = (email: string) => {
        let regex = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
        return regex.test(email)
    }

    const handleUpload = async (e: any) => {
        e.preventDefault();
        setNotStoredTeachers([])
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
                for (const teacher of data) {
                    await new Promise((resolve, reject) => setTimeout(resolve, 100));
                    if (teacher["Firstname"] && teacher["Teacher RMN"]) {

                        let haveAnyError = false
                        let errors: string[] = []
                        let firstName = teacher["Firstname"]
                        let lastName = teacher["Lastname"]
                        let phoneNumber = teacher["Teacher RMN"]
                        let email = teacher["Email"]
                        let isActive = teacher["Active"]

                        if (firstName == null || firstName.trim() == '') {
                            haveAnyError = true
                            errors.push(`Invalid Firstname : ${firstName}`)
                        }

                        if (!isValidPhoneNumber(phoneNumber)) {
                            haveAnyError = true
                            errors.push(`Invalid Teacher RMN : ${phoneNumber}`)
                        }
                        if ((email != null && email != '') && !isValidEmail(email)) {
                            haveAnyError = true
                            errors.push(`Invalid Email Address : ${email}`)
                        }

                        isActive = isActive && isActive.trim().toLowerCase() === 'false' ? false : true

                        if (haveAnyError) {
                            setNotStoredTeachers((d) => {
                                const obj = {
                                    "Teacher": firstName + (firstName ? ' - ' : '') + phoneNumber,
                                    "Error Messages": errors
                                }
                                d.push(obj);
                                return d;
                            })
                            setCurrentRecord((n) => n + 1);
                            continue;
                        }

                        const teacherData: any = {
                            firstName,
                            lastName,
                            email,
                            phoneNumber: "+91" + phoneNumber,
                            status: (isActive ? 1 : 0).toString(),
                            address: "",
                            batchCode: "",
                            category: "",
                            dob: "",
                            gender: "",
                            languages: "",
                            leadAvailability: [],
                            photo: "",
                            startDate: "",
                            type: "teacher",
                            whatsapp: "",
                            offlineUser: url.toString().indexOf('/school/') >= 0 ? "1" : "0"
                        }

                        if (selectedSchool) {
                            teacherData.schoolId = selectedSchool
                        }

                        const res = await addTeacherSchedule({
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(teacherData),
                        });

                        if (res?.status === 400) {
                            setNotStoredTeachers((d) => {
                                const obj = {
                                    "Teacher": firstName + (firstName ? ' - ' : '') + phoneNumber,
                                    "Error Messages": res.errors ? res.errors : [res.error]
                                }
                                d.push(obj);
                                return d;
                            })
                        }

                    } else {
                        setNotStoredTeachers((d) => {
                            teacher["Error Messages"] = [`Teacher Record Doesn't Have : Firstname or Teacher RMN`]
                            d.push(teacher)
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
            {(access.canSuperAdmin || access.canProgramManager || access.canPMHead) && (
                <Button
                    type="primary"
                    key="primary"
                    onClick={() => setOpenUpload(true)}
                    icon={<UploadOutlined />}
                >
                    Bulk Upload Teachers
                </Button>
            )}

            <Modal width={'75%'} visible={openUpload} onCancel={() => { setOpenUpload(false), setSelectedSchool(null) }} footer={false}>
                {notStoredTeachers.length > 0 && (
                    <code style={{ maxHeight: "300px" }}>
                        <p style={{ color: 'red', fontWeight: 'bold' }}>Errors : </p>
                        <div>
                            {notStoredTeachers.map((e) => {
                                return <div style={{
                                    wordWrap: "break-word"
                                }}>
                                    <div style={{ display: 'flex' }}>
                                        <p style={{ whiteSpace: 'nowrap' }}>
                                            {e["Firstname"] || e["Teacher RMN"] || e["Teacher"]} :
                                        </p>
                                        <p>
                                            {Array.isArray(e["Error Messages"]) && e["Error Messages"]?.map((error: any, index) => {
                                                return error + (e["Error Messages"]?.length - 1 === index ? "." : ", ")
                                            })}
                                        </p>
                                    </div>
                                </div>
                            })}
                            <hr />
                        </div>
                    </code>
                )}

                <code>
                    File must be CSV and in this format:
                    <pre>
                        Firstname, Lastname, Teacher RMN, Email, Status <br />
                    </pre>
                </code>

                <code>
                    Example:
                    <pre>
                        <table border="1" cellPadding={"5px"} >
                            <tr>
                                <th>Firstname</th>
                                <th>Lastname</th>
                                <th>Teacher RMN</th>
                                <th>Email</th>
                                <th>Active</th>
                            </tr>
                            <tr>
                                <td>John</td>
                                <td>Wick</td>
                                <td>9876543210</td>
                                <td>google@mail.com</td>
                                <td>True/False</td>
                            </tr>
                        </table>
                    </pre>

                    <b>Note : </b>
                    <p>
                        &emsp;&emsp; Mandatory Fields : Firstname, Teacher RMN.<br />
                        &emsp;&emsp; For Teacher RMN enter 10 Digit Phone number.<br />
                        &emsp;&emsp; Active field will have value as True or False.
                    </p>
                </code>

                {totalRecords ? <Progress percent={currentRecord ? parseFloat((currentRecord / totalRecords * 100).toFixed(2)) : 0}></Progress> : ""}

                <Button target='_blank' href={SPREADSHEETS.TEACHER_BULK_UPLOAD} type="dashed" htmlType="submit" style={{ fontWeight: 'bold', margin: "3px" }}>
                    Open Teacher Bulk Upload spreadsheet format.
                </Button>

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

export default TeacherBulkUpload;
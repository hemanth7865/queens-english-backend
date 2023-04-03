import { addTeacherSchedule, teacherBatchesView } from '@/services/ant-design-pro/api';
import { handleAPIResponse } from '@/services/ant-design-pro/helpers';
import { EditOutlined } from '@ant-design/icons'
import { Button, Modal, Select } from 'antd'
import React, { useState } from 'react'

export type UpdateFormProps = {
    schools: any[];
    teacher: any;
};

const SchoolChangeContainer: React.FC<UpdateFormProps> = ({ teacher, schools }) => {
    const [container, setContainer] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedSchool, setSelectedSchool] = useState<any>(teacher?.school?.id);
    const [error, setError] = useState<string | undefined>();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!selectedSchool || selectedSchool?.trim()?.length === 0) {
            setError('Please select school')
            return;
        }
        setError(undefined)
        setIsLoading(true)
        let msg: any;
        try {
            msg = await teacherBatchesView(teacher.id);
        } catch (error) {
            handleAPIResponse({ status: 400 }, "School Updated Successfully", "Failed To Update School");
            setIsLoading(false)
            return;
        }
        const existingData = msg.data;
        if (existingData.schoolId === selectedSchool) {
            setError('Please change the school')
            setIsLoading(false)
            return;
        }
        existingData.schoolId = selectedSchool
        const dataForm: any = {
            id: existingData.id,
            teacherId: existingData.teacherId,
            batchCode: existingData.batchCode,
            category: existingData.category,
            firstName: existingData.firstName,
            lastName: existingData.lastName,
            dob: existingData.dob,
            phoneNumber: existingData.phoneNumber,
            email: existingData.email,
            address: existingData.address,
            whatsapp: existingData.whatsapp,
            gender: existingData.gender,
            languages: existingData.languages,
            startDate: existingData.startDate,
            type: existingData.type,
            photo: existingData.photo,
            status: existingData.status,
            schoolId: existingData.schoolId,
            leadAvailability: [],
            lead: [],
        };
        if (existingData?.teacher && existingData?.teacher[0]) {
            dataForm.lead = [
                {
                    resume: existingData?.teacher[0].resume,
                    qualification: existingData?.teacher &&
                        existingData?.teacher.map(function (lead: { qualification: any; }, i: any) {
                            return lead.qualification;
                        }),
                    totalexp: existingData?.teacher &&
                        existingData?.teacher.map(function (lead: { totalexp: any; }, i: any) {
                            return lead.totalexp;
                        }),
                    video: existingData?.teacher[0]?.video,
                    certificates: existingData?.teacher[0]?.certificates,
                    joiningdate: existingData?.teacher &&
                        existingData?.teacher.map(function (lead: { joiningdate: any; }, i: any) {
                            return lead.joiningdate;
                        }),
                    ratings: 1,
                    classestaken: 10,
                    teachertype: "teacher",
                },
            ]
        }
        try {
            // 登录
            const msg = await addTeacherSchedule({
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataForm),
            });

            handleAPIResponse(msg, "School Updated Successfully", "Failed To Update School");
        } catch (error) {
            handleAPIResponse({ status: 400 }, "School Updated Successfully", "Failed To Update School");
        }
        setIsLoading(false)
    }

    const handleOnClose = () => {
        setContainer(false)
        setSelectedSchool(null)
        setError(false)
    }

    return (
        <>
            <Button shape="circle" onClick={() => setContainer(true)}>
                <EditOutlined />
            </Button>
            <Modal visible={container} onCancel={handleOnClose} footer={false}>
                <h2>Change School</h2>
                <h4>Teacher name : {teacher?.name}</h4>
                <Select
                    placeholder="Select School"
                    onChange={(value) => setSelectedSchool(value)}
                    value={selectedSchool}
                    showSearch
                    style={{ display: 'block' }}
                    allowClear
                    options={schools.map((s) => ({ value: s.id, label: `${s.schoolName} ~ ${s.schoolCode}` }))}
                    optionLabelProp="label"
                    optionFilterProp='label'
                    disabled={isLoading}
                />
                {error && <h4 style={{ color: 'red' }}>{error}</h4>}
                <form id="uploadForm" target="_blank" method="post" encType="multipart/form-data" onSubmit={handleSubmit} style={{ marginTop: 10 }}>
                    <Button disabled={isLoading} loading={isLoading} onSubmit={handleSubmit} type="primary" htmlType="submit" style={{ marginRight: 10 }}>
                        Upload File
                    </Button>
                    <Button type="default" onClick={handleOnClose}>
                        Cancel
                    </Button>
                </form>
            </Modal>
        </>
    )
}

export default SchoolChangeContainer
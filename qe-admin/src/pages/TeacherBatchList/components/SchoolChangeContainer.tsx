import { teacherBatchesView } from '@/services/ant-design-pro/api';
import { EditOutlined } from '@ant-design/icons'
import { Button, Modal, Select } from 'antd'
import React, { useState } from 'react'

export type UpdateFormProps = {
    schools: any[];
    teacher: any;
};

const SchoolChangeContainer: React.FC<UpdateFormProps> = ({ teacher, schools }) => {
    // console.log('TEACHER ---->>', JSON.stringify(teacher))
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
        try {
            let msg: any = await teacherBatchesView(teacher.id);
            const existingData = msg.data;
            console.log(existingData)
            if (existingData.schoolId === selectedSchool) {
                setError('Please change the school')
                setIsLoading(false)
                return;
            }
            existingData.schoolId = selectedSchool

        } catch (error) {
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
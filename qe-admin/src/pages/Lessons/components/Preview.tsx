import { SECTION_TYPES } from '@/components/Constants/constants'
import { updateImageSasBlob } from '@/services/ant-design-pro/helpers'
import { Col, Divider, Row, Select } from 'antd'
import { useState } from 'react';
import { DeviceFrameset } from 'react-device-frameset'
import "../../../../node_modules/react-device-frameset/dist/styles/marvel-devices.min.css";

type Section = {
    type: string;
    description: string;
    key: string;
}

type Exercise = {
    heading: string;
    subHeading: string;
    key: string;
    sections: Section[]
}

const devices = [
    { label: 'Galaxy S8+', device: 'Samsung Galaxy S5', height: 700, width: 325, value: 0 },
    { label: 'iPhone XR', device: 'iPhone X', height: 896, width: 414, value: 1 },
    { label: 'Galaxy S20 Ultra', device: 'Galaxy Note 8', height: 915, width: 412, value: 2 },
    { label: 'iPad Mini', device: 'iPad Mini', height: 1024, width: 768, value: 3 },
]

const Preview = ({ formData }: { formData: Exercise[] }) => {
    const [device, setDevice] = useState(devices[0])

    return (
        <div
            style={{
                display: "flex",
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Row style={{ alignItems: 'center', gap: 20 }} >
                <Select
                    defaultValue={device.value}
                    onChange={(e) => setDevice(devices.filter(i => i.value === e)[0])}
                    options={devices}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>Dimensions</span>
                    <span>{device.height + " X " + device.width}</span>
                </div>
            </Row>
            <DeviceFrameset
                device={device.device}
                color="black"
                zoom={0.85}
                height={device.height}
                width={device.width}
                id="mobileDevice"
            >
                <Col style={{
                    width: "100%",
                    height: "100%",
                    marginTop: device.device === "iPhone X" ? 40 : 0,
                    paddingBottom: device.device === "iPhone X" ? 40 : 20,
                    padding: 15,
                    borderRadius: 5,
                    boxShadow: "0px 10px 50px -30px rgba(0,0,0,0.2)",
                    border: "1px solid #efefef",
                    overflowY: "scroll"
                }} >
                    {formData.map((exercise, index) => {
                        return (
                            <Col>
                                <Row>
                                    <Col
                                        span={10}
                                        style={{
                                            fontSize: 20
                                        }}
                                    ><i style={{ fontSize: 30 }}>E</i>xercise {index + 1}</Col>
                                    <Col
                                        span={14}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-end',
                                            alignItems: 'end'
                                        }}
                                    >
                                        <Row
                                            style={{
                                                fontSize: 18,
                                                color: "#8C2132",
                                                fontWeight: "bold",
                                                textAlign: 'right'
                                            }}
                                        >{exercise.heading?.toUpperCase()}</Row>
                                        {exercise?.subHeading && exercise.subHeading.trim() !== "" && <Row
                                            style={{ fontSize: 14, textAlign: 'right' }}
                                        >{exercise.subHeading}</Row>}
                                    </Col>
                                </Row>
                                <div style={{ margin: "8px 0", borderRadius: 3, height: 5, width: "100%", backgroundColor: "#186E98" }} />
                                {exercise?.sections?.map((section) => {
                                    return <Row>
                                        {section.type === SECTION_TYPES.DESCRIPTION && section.description && <div id="ViewLessonScriptData" dangerouslySetInnerHTML={{ __html: updateImageSasBlob(section.description) }} />}
                                    </Row>
                                })}
                                <Divider />
                            </Col>
                        )
                    })}
                </Col>
            </DeviceFrameset>
        </div>
    )
}

export default Preview
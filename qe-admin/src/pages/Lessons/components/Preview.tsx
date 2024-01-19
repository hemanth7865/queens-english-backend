import { SECTION_TYPES } from '@/components/Constants/constants'
import { getImageURL, updateImageSasBlob } from '@/services/ant-design-pro/helpers'
import { Button, Col, Divider, Row, Select } from 'antd'
import { useState, useEffect, useRef } from 'react';
import { DeviceFrameset } from 'react-device-frameset'
import { useSpeechSynthesis } from 'react-speech-kit';
import "../../../../node_modules/react-device-frameset/dist/styles/marvel-devices.min.css";

type Section = {
    type: string;
    description: string;
    key: string;
}

type Exercise = {
    heading: string;
    newHeading: boolean;
    subHeading: string;
    key: string;
    sections: Section[]
    image?: string;
}

const devices = [
    { label: 'Galaxy S8+', device: 'Samsung Galaxy S5', height: 700, width: 325, value: 0 },
    { label: 'iPhone XR', device: 'iPhone X', height: 896, width: 414, value: 1 },
    { label: 'Galaxy S20 Ultra', device: 'Galaxy Note 8', height: 915, width: 412, value: 2 },
    { label: 'iPad Mini', device: 'iPad Mini', height: 1024, width: 768, value: 3 },
]

const Preview = ({ formData }: { formData: Exercise[] }) => {
    const [device, setDevice] = useState(devices[0])
    const [valueToSpeak, setValueToSpeak] = useState<any[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    const onEnd = () => {
        setCurrentTextIndex(currentTextIndex + 1);
    };
    const { speak, cancel, voices, speaking } = useSpeechSynthesis({ onEnd });

    let textForSpeaking: any[] = [];

    useEffect(() => {
        if (currentTextIndex > 0) {
            speakContent();
        }
    }, [currentTextIndex]);

    useEffect(() => {
        parseHTML();
    }, [formData])

    const parseHTML = async () => {
        formData.map((exercise, eIndex) => {
            exercise.sections.map((section, sIndex) => {

                extractContent(section.description);
            })
        })

        setValueToSpeak(textForSpeaking);
    }

    const extractContent = (description: any) => {
        // Parse the HTML string into a DOM document
        const parser = new DOMParser();
        const doc = parser.parseFromString(description, 'text/html');

        // Find all elements with style="color: blue"
        const blueElements = doc.querySelectorAll('[style="color: blue;"]');

        blueElements.forEach((element) => {
            const content = element.textContent || element.innerText;
            textForSpeaking.push(content);
        })

        return [];
    }

    const speakContent = () => {
        setIsSpeaking(true);
        speakValue(valueToSpeak[currentTextIndex]);
    }

    const speakValue = (textToSpeak: any) => {
        setTimeout(() =>
            speak({
                text: textToSpeak,
                voice: voices[2],
                rate: 0.9,
            }), 700);
    }

    const pauseStopSpeech = (isStop?: boolean) => {
        setIsSpeaking(false);
        cancel();
        if (isStop) {
            setCurrentTextIndex(0);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Row style={{ width: '100%', alignItems: 'center', justifyContent: 'center', }} >
                <Col span={6}>
                    <Select
                        defaultValue={device.value}
                        onChange={(e) => setDevice(devices.filter(i => i.value === e)[0])}
                        options={devices}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* <span>Dimensions</span> */}
                        <span>({device.height + " X " + device.width})</span>
                    </div>
                </Col>
                <Col span={8} offset={6} align="middle">
                    {!isSpeaking ? (
                        <Button style={{ background: '#2E8540', borderColor: '#2E8540' }}
                            type="primary"
                            key="play"
                            onClick={() => speakContent()}
                        >
                            Play
                        </Button>
                    )
                        : (
                            <>
                                <Button
                                    type="primary"
                                    key="pause"
                                    onClick={() => pauseStopSpeech(false)}
                                >
                                    Pause
                                </Button>
                                <Button style={{ marginLeft: 10 }}
                                    type="primary"
                                    key="stop"
                                    danger
                                    onClick={() => pauseStopSpeech(true)}
                                >
                                    Stop
                                </Button>
                            </>
                        )}
                </Col>
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
                                            fontSize: '1em'
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
                                                fontSize: '1em',
                                                color: exercise?.newHeading ? "#8C2132" : '#000',
                                                fontWeight: "bold",
                                                textAlign: 'right'
                                            }}
                                        >{exercise.heading?.toUpperCase()}</Row>
                                        {exercise?.subHeading && exercise.subHeading.trim() !== "" && <Row
                                            style={{ fontSize: '0.8em', textAlign: 'right' }}
                                        >{exercise.subHeading}</Row>}
                                    </Col>
                                </Row>
                                <div style={{ margin: "8px 0", borderRadius: 3, height: 5, width: "100%", backgroundColor: "#186E98" }} />
                                {exercise?.image && (
                                    <Row>
                                        <div className='image'>
                                            <img
                                                src={getImageURL(exercise.image)}
                                                alt="exercise-image"
                                                className="image_image"
                                            />
                                        </div>
                                    </Row>
                                )}
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
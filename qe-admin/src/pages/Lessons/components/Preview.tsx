import { SECTION_TYPES } from '@/components/Constants/constants'
import { getStorageFileURL, updateImageSasBlob } from '@/services/ant-design-pro/helpers'
import { Button, Col, Divider, Row, Select } from 'antd'
import { useState, useEffect } from 'react';
import { useSpeechSynthesis } from 'react-speech-kit';

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
    { label: 'Galaxy S8+', height: 700, width: 325, value: 0 },
    { label: 'iPhone XR', height: 896, width: 414, value: 1 },
    { label: 'Galaxy S20 Ultra', height: 915, width: 412, value: 2 },
    { label: 'iPad Mini', height: 1024, width: 768, value: 3 },
]

const Preview = ({ formData }: { formData: Exercise[] }) => {

    const [device, setDevice] = useState(devices[0])
    const [valueToSpeak, setValueToSpeak] = useState<any[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    const onEnd = () => {
        setCurrentTextIndex(prev => prev + 1);
    };

    const { speak, cancel, voices } = useSpeechSynthesis({ onEnd });

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

        textForSpeaking = [];

        formData.forEach((exercise) => {
            exercise.sections.forEach((section) => {
                extractContent(section.description);
            })
        })

        setValueToSpeak(textForSpeaking);
    }

    const extractContent = (description: any) => {

        const parser = new DOMParser();
        const doc = parser.parseFromString(description, 'text/html');

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

            <Row style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>

                <Col span={6}>
                    <Select
                        defaultValue={device.value}
                        onChange={(e) => setDevice(devices.filter(i => i.value === e)[0])}
                        options={devices}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>({device.height + " X " + device.width})</span>
                    </div>
                </Col>

                <Col span={8} offset={6} align="middle">

                    {!isSpeaking ? (
                        <Button
                            style={{ background: '#2E8540', borderColor: '#2E8540' }}
                            type="primary"
                            onClick={() => speakContent()}
                        >
                            Play
                        </Button>
                    ) : (
                        <>
                            <Button
                                type="primary"
                                onClick={() => pauseStopSpeech(false)}
                            >
                                Pause
                            </Button>

                            <Button
                                style={{ marginLeft: 10 }}
                                type="primary"
                                danger
                                onClick={() => pauseStopSpeech(true)}
                            >
                                Stop
                            </Button>
                        </>
                    )}

                </Col>

            </Row>

            <div
                id="mobileDevice"
                style={{
                    width: device.width,
                    height: device.height,
                    border: "1px solid #efefef",
                    borderRadius: 10,
                    overflow: "hidden",
                    background: "#fff",
                    marginTop: 20,
                    boxShadow: "0px 10px 50px -30px rgba(0,0,0,0.2)"
                }}
            >

                <Col
                    style={{
                        width: "100%",
                        height: "100%",
                        padding: 15,
                        overflowY: "scroll"
                    }}
                >

                    {formData.map((exercise, index) => {

                        return (

                            <Col key={index}>

                                <Row>

                                    <Col span={10} style={{ fontSize: '1em' }}>
                                        <i style={{ fontSize: 30 }}>E</i>xercise {index + 1}
                                    </Col>

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
                                        >
                                            {exercise.heading?.toUpperCase()}
                                        </Row>

                                        {exercise?.subHeading && exercise.subHeading.trim() !== "" && (
                                            <Row style={{ fontSize: '0.8em', textAlign: 'right' }}>
                                                {exercise.subHeading}
                                            </Row>
                                        )}

                                    </Col>

                                </Row>

                                <div
                                    style={{
                                        margin: "8px 0",
                                        borderRadius: 3,
                                        height: 5,
                                        width: "100%",
                                        backgroundColor: "#186E98"
                                    }}
                                />

                                {exercise?.image && (
                                    <Row>
                                        <div className='image'>
                                            <img
                                                src={getStorageFileURL(exercise.image)}
                                                alt="exercise-image"
                                                className="image_image"
                                            />
                                        </div>
                                    </Row>
                                )}

                                {exercise?.sections?.map((section, i) => {

                                    return (

                                        <Row key={i}>

                                            {section.type === SECTION_TYPES.DESCRIPTION &&
                                                section.description && (
                                                    <div
                                                        id="ViewLessonScriptData"
                                                        dangerouslySetInnerHTML={{
                                                            __html: updateImageSasBlob(section.description)
                                                        }}
                                                    />
                                                )}

                                        </Row>

                                    )

                                })}

                                <Divider />

                            </Col>

                        )

                    })}

                </Col>

            </div>

        </div>

    )

}

export default Preview

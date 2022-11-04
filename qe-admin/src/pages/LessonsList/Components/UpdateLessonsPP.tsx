import { Button, message, Modal, Progress, Input } from 'antd';
import { useState } from 'react'
import { getAllLessons, updateLesson } from "@/services/ant-design-pro/api";
import { csvToArray } from "@/services/ant-design-pro/helpers";

const UpdateLessonsPP = () => {
    const [openUpload, setOpenUpload] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [currentRecord, setCurrentRecord] = useState<number>(0);
    const [storagePath, setStoragePath] = useState<string>("assets/v2/l1-up");

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

                const lessons = data.reduce(function (r: any, a: any) {
                    r[a.No] = r[a.No] || [];
                    r[a.No].push(a);
                    return r;
                }, Object.create(null));

                setTotalRecords(Object.keys(lessons).length);
                setCurrentRecord(0);

                for (const lessonKey in lessons) {
                    setCurrentRecord((n) => n + 1);
                    await new Promise((resolve, reject) => setTimeout(resolve, 100));
                    const pps = lessons[lessonKey];
                    const lessonNumber = parseInt(lessonKey) < 10 ? `0${lessonKey}` : lessonKey;
                    const lesson = await getAllLessons({ lessonId: lessonNumber });
                    const ppNames = lesson.practiceProblems.map((i: any) => i.name);
                    const duplicatedRecords = [];
                    for (const pp of pps) {
                        const CHANGE_IMAGE_PATH = pp.imageUrl.split("/").length < 2;
                        const CHANGE_QUESTION_AUDIO_PATH = pp.questionSoundUrl.split("/").length < 2;
                        const CHANGE_ANSWER_AUDIO_PATH = pp.answerSoundUrl.split("/").length < 2;
                        delete pp.No;
                        let storagePathPP = storagePath;

                        /**
                         * Remap PPs
                         */
                        if (pp.type === "repeat") {
                            pp.name += ".0";
                            storagePathPP = `${storagePath}/repeat`;
                        }

                        if (pp.type === "questionAndAnswer") {
                            pp.name += ".1";
                            storagePathPP = `${storagePath}/qa`;
                        }

                        if (CHANGE_IMAGE_PATH) {
                            pp.imageUrl = `${storagePathPP}/images/${pp.imageUrl}`;
                        }

                        if (CHANGE_QUESTION_AUDIO_PATH) {
                            pp.questionSoundUrl = `${storagePathPP}/question/${pp.questionSoundUrl}`;
                        }

                        if (CHANGE_ANSWER_AUDIO_PATH) {
                            pp.answerSoundUrl = `${storagePathPP}/answer/${pp.answerSoundUrl}`;
                        }

                        lesson.practiceProblems.push(pp);

                        if (ppNames.includes(pp.name)) {
                            duplicatedRecords.push(pp);
                        }
                    }
                    if (duplicatedRecords.length > 0) {
                        for (let duplicatedRecord of duplicatedRecords) {
                            message.error(`Fix duplicated record ${duplicatedRecord.name} for lesson ${lessonKey} for type ${duplicatedRecord.type}`);
                        }
                        break;
                    }

                    await updateLesson({
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(lesson),
                    })

                    message.success(`Success updated lesson ${lessonNumber}`);
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
            >
                Update existing lessons PPs
            </Button>

            <Modal visible={openUpload} onCancel={() => setOpenUpload(false)} footer={false}>
                <code>
                    File must be CSV and in this format:
                    <pre>
                        No,name,questionSoundUrl,answerSoundUrl,type,
                        questionText,expectedAnswer,imageUrl
                    </pre>
                </code>

                {totalRecords ? <Progress percent={currentRecord ? parseFloat((currentRecord / totalRecords * 100).toFixed(2)) : 0}></Progress> : ""}

                <br />

                <label>Assets Base Path: </label>
                <Input value={storagePath} onChange={(e) => setStoragePath(e.target.value)} placeholder="Assets Base Path" />

                <br />

                <form id="uploadForm" action="/be/csv/collection-agents/bulk-assignment" target="_blank" method="post" encType="multipart/form-data" onSubmit={handleUpload}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <input type="file" name="agents" required id="file" />
                    <Button loading={isLoading} type="primary" htmlType="submit">
                        Upload File
                    </Button>
                </form>

                <div style={{ textAlign: "right" }}>
                    <Button type="default" onClick={() => window.location.reload()}>
                        Cancel
                    </Button>
                </div>
            </Modal>
        </>
    )
}

export default UpdateLessonsPP;
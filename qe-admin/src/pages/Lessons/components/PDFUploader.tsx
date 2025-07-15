import { uploadPDFStorage } from '@/services/ant-design-pro/api';
import { getStorageFileURL } from '@/services/ant-design-pro/helpers';
import { EyeOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, notification, Spin, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';

const { Text } = Typography;

type PDFUploaderProps = {
    pdfType: string;
    fileName?: string;
};

const PDFUploader = ({ pdfType, fileName }: PDFUploaderProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [showPDFPreview, setShowPDFPreview] = useState(false);
    const [isFileExists, setIsFileExists] = useState<boolean | undefined>(undefined);
    const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);

    const containerMap: Record<string, string> = {
        FreeSpeaking: 'free-speaking-pdfs',
    };

    const pdfPath = fileName && pdfType && containerMap[pdfType]
        ? `/assets/${containerMap[pdfType]}/${fileName}`
        : undefined;

    useEffect(() => {
        if (!pdfPath) return;

        const url = getStorageFileURL(pdfPath);
        setPdfUrl(url);

        const controller = new AbortController();

        if (url) {
            fetch(url, { method: 'HEAD', signal: controller.signal })
                .then((res) => setIsFileExists(res.ok))
                .catch(() => setIsFileExists(false));
        }

        return () => controller.abort();
    }, [pdfPath]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            notification.error({ message: 'Only PDF files are allowed.' });
            return;
        }

        setLoading(true);
        notification.warning({ message: 'Uploading PDF...' });

        try {
            const formData = new FormData();
            formData.append('pdf', file);

            const result = await uploadPDFStorage(
                {
                    pdfType,
                    name: fileName || file.name,
                },
                {
                    body: formData,
                }
            );

            if (!result?.fileUrl) {
                throw new Error('Failed to upload PDF');
            }

            notification.success({ message: 'PDF uploaded successfully' });

            // Update preview state
            const updatedUrl = getStorageFileURL(result.fileUrl);
            setPdfUrl(updatedUrl);
            setIsFileExists(true);
        } catch (err: any) {
            notification.error({
                message: 'Upload Failed',
                description: err.message,
            });
        }

        setLoading(false);
    };

    if (isFileExists === undefined) {
        return <></>
    }

    return (
        <Spin spinning={loading}>
            <div className="pdf-uploader">
                {isFileExists && pdfUrl ? (
                    <>
                        <Text type="success">PDF is already uploaded.</Text>
                        <div style={{ marginTop: 10 }}>
                            <Button
                                icon={<EyeOutlined />}
                                onClick={() => setShowPDFPreview(prev => !prev)}
                                style={{ marginRight: 10 }}
                            >
                                {showPDFPreview ? 'Hide PDF' : 'View PDF'}
                            </Button>
                        </div>
                        {showPDFPreview && (
                            <div style={{ marginTop: 20 }}>
                                <iframe
                                    src={pdfUrl}
                                    title="Uploaded PDF"
                                    width="100%"
                                    height="500px"
                                    style={{ border: '1px solid #ccc', borderRadius: 4 }}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <label className="custom-file-upload">
                        <input
                            type="file"
                            accept="application/pdf"
                            style={{ display: 'none' }}
                            onChange={handleUpload}
                            ref={fileInputRef}
                        />
                        <Button icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()}>
                            Upload PDF
                        </Button>
                    </label>
                )}
            </div>
        </Spin>
    );
};

export default PDFUploader;

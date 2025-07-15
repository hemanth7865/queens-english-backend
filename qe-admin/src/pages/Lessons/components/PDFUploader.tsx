import { uploadPDFStorage, checkPDFExists } from '@/services/ant-design-pro/api';
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
    const [isFileExists, setIsFileExists] = useState<boolean | undefined>(undefined);
    const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined);

    const containerMap: Record<string, string> = {
        FreeSpeaking: 'free-speaking-pdfs',
    };

    const containerPath = pdfType && containerMap[pdfType] ? `assets/${containerMap[pdfType]}` : undefined;

    useEffect(() => {
        if (!fileName || !pdfType) return;

        const checkExists = async () => {
            try {
                const res = await checkPDFExists({
                    pdfType,
                    name: fileName,
                });

                const exists = res?.exists;
                setIsFileExists(exists);

                if (exists && containerPath) {
                    const url = getStorageFileURL(`${containerPath}/${fileName}`);
                    setPdfUrl(url);
                }
            } catch (err) {
                setIsFileExists(false);
            }
        };

        checkExists();
    }, [fileName, pdfType]);

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

    if (isFileExists === undefined) return null;

    return (
        <Spin spinning={loading}>
            <div className="pdf-uploader">
                {isFileExists && pdfUrl ? (
                    <>
                        <Text type="success">📄 PDF is already uploaded.</Text>
                        <div style={{ marginTop: 10 }}>
                            <Button
                                icon={<EyeOutlined />}
                                onClick={() => {
                                    if (pdfUrl) {
                                        window.open(pdfUrl, '_blank');
                                    }
                                }}
                            >
                                View PDF
                            </Button>
                        </div>
                    </>
                ) : (
                    <Button
                        style={{ fontWeight: 'bold', color: '#1e90ff' }}
                        type="dashed"
                        onClick={() => fileInputRef.current?.click()}
                        shape="round"
                    >
                        <UploadOutlined /> Upload PDF
                    </Button>
                )}
            </div>
        </Spin>
    );
};

export default PDFUploader;

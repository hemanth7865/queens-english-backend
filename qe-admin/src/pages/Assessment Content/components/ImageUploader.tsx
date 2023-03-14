import React, { useEffect, useState } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Modal, Upload } from 'antd';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import "./form.css";


export type ImageUploaderProps = {
    imageUrl?: string;
    questionNumber?: string;
    data?: any;
    setImagestoUpload: (imagesToUpload: any) => void;
    imagesToUpload?: any[];
};

const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG file!');
    }
    return isJpgOrPng;
};

const ImageUploader: React.FC<ImageUploaderProps> = (props: any) => {
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>(props.imageUrl);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    useEffect(() => {
        if (props.imageUrl) {
            setImageUrl(props.imageUrl);
            setFileList([{
                uid: '-1',
                name: `Q${props.questionNumber}`,
                status: 'done',
                url: props.imageUrl,
            }])
        }
    }, [props.imageUrl]);

    const handleCancel = () => setPreviewOpen(false);

    const getBase64 = (file: RcFile): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });

    const handleChange: UploadProps['onChange'] = async ({ fileList: newFileList }) => {
        if (newFileList) {
            const file: UploadFile[] = [{
                uid: '-1',
                name: `Q${props.questionNumber}`,
                status: 'done',
                url: URL.createObjectURL(newFileList[0].originFileObj)
            }];
            setFileList(file);
            props.setImagestoUpload({ data: newFileList[0].originFileObj, name: `Q${props.questionNumber}` })
        }
    };

    const onPreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };

    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    return (
        <>
            <div className='ant-upload'>
                <Upload
                    name="questionImage"
                    beforeUpload={beforeUpload}
                    onChange={handleChange}
                    accept="image/*"
                    listType='picture-card'
                    showUploadList={true}
                    onPreview={(file) => onPreview(file)}
                    isImageUrl={() => true}
                    fileList={fileList}
                    onRemove={() => setFileList([])}
                    style={{ objectFit: "fill" }}
                >
                    {fileList.length > 0 ? null : uploadButton}
                </Upload>
            </div>
            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
                <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </>
    );
};

export default ImageUploader;
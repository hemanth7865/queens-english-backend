import React, { useEffect, useState, useRef } from 'react';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Modal, Spin } from 'antd';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import "./form.css";
import { uploadImagesStorage } from '@/services/ant-design-pro/api';


export type ImageUploaderProps = {
    imageURI?: string;
    questionNumber?: string;
    data?: any;
    handleContentChange: (value: any) => void;
    update: number
    setImageURI: (value: string) => void;
};


const ImageUploader: React.FC<ImageUploaderProps> = (props: any) => {
    const uploadRef = useRef<any>();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCancel = () => setPreviewOpen(false);

    const getBase64 = (file: RcFile): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                resolve(reader.result as string);
            }
            reader.onerror = (error) => reject(error);
        });

    const onPreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };

    const handleImageChange = async (e: any) => {
        if (e.target.files[0].size > 204800) {
            alert("Please upload an image of less than 200 KB");
            return;
        }
        setLoading(true);
        const form = new FormData();
        form.append('images', e.target.files[0]);
        await uploadImagesStorage(
            {
                fileLocation: "assessment-questions",
                type: "assessment-question-image",
                path: `${props.data.assessmentName}/${props.data.setNumber}`,
                name: `Q${props.data.number}.png`
            },
            {
                body: form
            });
        props.handleContentChange({ type: "image", number: props.data.number, index: props.data.index, imageUrl: `/assets/assessment-questions/${props.data.assessmentName}/${props.data.setNumber}/Q${props.data.number}.png` })
        setLoading(false);
    }

    const removeImage = async () => {
        setLoading(true);
        await props.handleContentChange({ type: "word", number: props.data.number, index: props.data.index, imageRemove: true });
        setLoading(false);
    };

    return (
        <>
            <Spin spinning={loading}>
                <div className='ant-upload'>
                    {
                        props.imageURI ?
                            <div className='image'>
                                <img src={props.imageURI} alt="question-image" className="image_image" />
                                <div className="image_overlay">
                                    <EyeOutlined onClick={() => onPreview({
                                        url: props.imageURI,
                                        uid: '-1',
                                        name: `Q${props.questionNumber}`,
                                    })}
                                        className="overlay-props"
                                        title="View Image"
                                    />
                                    <DeleteOutlined onClick={removeImage} className="overlay-props" title="Remove Image" />
                                </div>
                            </div>
                            :
                            <div className='image'>
                                <label className="custom-file-upload" title='Upload New Image'>
                                    <input type="file" name="uploadImage" accept="image/png" onChange={handleImageChange} style={{ marginTop: "25px", marginLeft: "110px" }} ref={uploadRef} />
                                    Upload Image
                                </label>
                            </div>
                    }
                </div>
                <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
            </Spin>
        </>
    );
};

export default ImageUploader;
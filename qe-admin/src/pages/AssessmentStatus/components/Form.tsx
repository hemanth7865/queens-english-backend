// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, notification, Rate } from "antd";
import { putAssessment } from "@/services/ant-design-pro/api";

export type AssessmentFormProps = {
  setVisible: () => void;
  assessmentData: {};
};

const { Option } = Select;

const AssessmentForm: React.FC<AssessmentFormProps> = (props) => {
  //console.log('assessment form', props.assessmentData)
  const {
    studentName,
    id,
    assessmentId,
    studentId,
    teacherId,
    currentLessonNumber,
    currentLessonId,
    classProfileId,
    status,
    totalScore,
    vocabScore,
    pronunciationScore,
    confidenceScore
  } = props.assessmentData ? props.assessmentData : "";
  const { scores } = props.assessmentData ? props.assessmentData : "";

  console.log('scores', vocabScore, pronunciationScore, confidenceScore)
  const [selectAnswer, setSelectAnswer] = useState([] as any);
  const [vocalScoreStar, setVocalScoreStar] = useState("")
  const [confidenceScoreStar, setConfidenceScoreStar] = useState("");
  const [pronounciationScoreStar, setPronounciationScoreStar] = useState("");

  const desc = ['terrible', 'bad', 'normal', 'good', 'wonderful'];

  const openNotificationWithIcon = type => {
    notification[type]({
      message: type == 'error'?'Failed to update assessment': 'Success! Assessment Updated',
      description:
        '',
    });
    setTimeout(() => {
      window.location.reload()
    }, 1000);
  };

  const sumStr = (str) => {
    const sumall = str.map((item) => Object.values(item)).toString();
    let strArr = sumall.split(",");
    console.log('strArr', strArr)
    let sum = strArr
      .filter((word) => word == 1||0)
      .reduce(function (total, num) {
        return parseFloat(total) + parseFloat(num);
      });
      console.log('sum', sum)
    return sum;
    
  }


  const onFinish = async (values: any) => {
    //console.log("Success:", values);
    const scores = [
      { question: 'Q1', score: values.Q1 },
      { question: 'Q2', score: values.Q2 },
      { question: 'Q3', score: values.Q3 },
      { question: 'Q4', score: values.Q4 },
      { question: 'Q5', score: values.Q5 },
      { question: 'Q6', score: values.Q6 },
      { question: 'Q7', score: values.Q7 },
      { question: 'Q8', score: values.Q8 },
      { question: 'Q9', score: values.Q9 },
      { question: 'Q10', score: values.Q10 },
      { question: 'Q11', score: values.Q11 },
      { question: 'Q12', score: values.Q12 },
      { question: 'Q13', score: values.Q13 },
      { question: 'Q14', score: values.Q14 },
      { question: 'Q15', score: values.Q15 },
    ];

    const total = sumStr(scores);

    const data = {
      studentName: values.StudentName,
      status: values.Status,
      id,
      scores,
      assessmentId,
      studentId,
      teacherId,
      currentLessonId,
      currentLessonNumber,
      classProfileId,
      totalScore: total,
      vocabScore: vocalScoreStar,
      confidenceScore: confidenceScoreStar,
      pronunciationScore: pronounciationScoreStar
    };

    console.log("data form", data);
    try {
      const msg = await putAssessment({
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (msg.status === "ok") {
        console.log("API call sucessfull", msg);
      }
      console.log(msg);
      openNotificationWithIcon('success')
    } catch (error) {
      console.log("addRule error", error);
    }
  };

  function handleChange(score: any, question: any) {
    console.log(score, question);
    setSelectAnswer([...selectAnswer, { question, score }]);
  }

  //console.log("select state", selectAnswer);

  const [form] = Form.useForm();
  const defaultValues = () => {
    form.setFieldsValue({
      StudentName: studentName,
      Status: status,
      Q1: scores
        ? scores.length
          ? scores[0]
            ? scores[0].score
            : "NA"
          : "NA"
        : "NA",
      Q2: scores
        ? scores.length
          ? scores[1]
            ? scores[1].score
            : "NA"
          : "NA"
        : "NA",
      Q3: scores
        ? scores.length
          ? scores[2]
            ? scores[2].score
            : "NA"
          : "NA"
        : "NA",
      Q4: scores
        ? scores.length
          ? scores[3]
            ? scores[3].score
            : "NA"
          : "NA"
        : "NA",
      Q5: scores
        ? scores.length
          ? scores[4]
            ? scores[4].score
            : "NA"
          : "NA"
        : "NA",
      Q6: scores
        ? scores.length
          ? scores[5]
            ? scores[5].score
            : "NA"
          : "NA"
        : "NA",
      Q7: scores
        ? scores.length
          ? scores[6]
            ? scores[6].score
            : "NA"
          : "NA"
        : "NA",
      Q8: scores
        ? scores.length
          ? scores[7]
            ? scores[7].score
            : "NA"
          : "NA"
        : "NA",
      Q9: scores
        ? scores.length
          ? scores[8]
            ? scores[8].score
            : "NA"
          : "NA"
        : "NA",
      Q10: scores
        ? scores.length
          ? scores[9]
            ? scores[9].score
            : "NA"
          : "NA"
        : "NA",
      Q11: scores
        ? scores.length
          ? scores[10]
            ? scores[10].score
            : "NA"
          : "NA"
        : "NA",
      Q12: scores
        ? scores.length
          ? scores[11]
            ? scores[11].score
            : "NA"
          : "NA"
        : "NA",
      Q13: scores
        ? scores.length
          ? scores[12]
            ? scores[12].score
            : "NA"
          : "NA"
        : "NA",
      Q14: scores
        ? scores.length
          ? scores[13]
            ? scores[13].score
            : "NA"
          : "NA"
        : "NA",
      Q15: scores
        ? scores.length
          ? scores[14]
            ? scores[14].score
            : "NA"
          : "NA"
        : "NA",
      VocalScore: vocabScore,
      PronounciationScore: pronunciationScore,
      ConfidenceScore: confidenceScore,
    });
  };
  useEffect(() => {
    defaultValues();
  }, [studentName]);

  return (
    <Form
      form={form}
      name="basic"
      labelCol={{ span: 7 }}
      wrapperCol={{ span: 18 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      autoComplete="off"
    >
      <Form.Item name="StudentName" label="Student Name">
        <Input placeholder="Student Name" name="studentName" />
      </Form.Item>

      <Form.Item name="Status" label="Status">
        <Select
          placeholder="Choose status"
        >
          <Option value="DUE">DUE</Option>
          <Option value="COMPLETED">COMPLETED</Option>
        </Select>
      </Form.Item>

      <Form.Item name="Q1" label="Q1 score">
        <Select
          placeholder="Choose score"
          onChange={(value) => {
            handleChange(value, "A1");
          }}
        >
          <Option value="1">1</Option>
          <Option value="0">0</Option>
          <Option value="NA">NA</Option>
        </Select>
      </Form.Item>

      <Form.Item name="Q2" label="Q2 score">
        <Select
          placeholder="Choose score"
          onChange={(value) => {
            handleChange(value, "A2");
          }}
        >
          <Option value="1">1</Option>
          <Option value="0">0</Option>
          <Option value="NA">NA</Option>
        </Select>
      </Form.Item>

      <Form.Item name="Q3" label="Q3 score">
        <Select
          placeholder="Choose score"
          onChange={(value) => {
            handleChange(value, "A3");
          }}
        >
          <Option value="1">1</Option>
          <Option value="0">0</Option>
          <Option value="NA">NA</Option>
        </Select>
      </Form.Item>

      <Form.Item name="Q4" label="Q4 score">
        <Select
          placeholder="Choose score"
          onChange={(value) => {
            handleChange(value, "A4");
          }}
        >
          <Option value="1">1</Option>
          <Option value="0">0</Option>
          <Option value="NA">NA</Option>
        </Select>
      </Form.Item>

      <Form.Item name="Q5" label="Q5 score">
        <Select
          placeholder="Choose score"
          onChange={(value) => {
            handleChange(value, "A5");
          }}
        >
          <Option value="1">1</Option>
          <Option value="0">0</Option>
          <Option value="NA">NA</Option>
        </Select>
      </Form.Item>

      <Form.Item name="Q6" label="Q6 score">
        <Select
          placeholder="Choose score"
          onChange={(value) => {
            handleChange(value, "A6");
          }}
        >
          <Option value="1">1</Option>
          <Option value="0">0</Option>
          <Option value="NA">NA</Option>
        </Select>
      </Form.Item>

      <Form.Item name="Q7" label="Q7 score">
        <Select
          placeholder="Choose score"
          onChange={(value) => {
            handleChange(value, "A7");
          }}
        >
          <Option value="1">1</Option>
          <Option value="0">0</Option>
          <Option value="NA">NA</Option>
        </Select>
      </Form.Item>

      <Form.Item name="Q8" label="Q8 score">
        <Select
          placeholder="Choose score"
          onChange={(value) => {
            handleChange(value, "A8");
          }}
        >
          <Option value="1">1</Option>
          <Option value="0">0</Option>
          <Option value="NA">NA</Option>
        </Select>
      </Form.Item>

      <Form.Item name="Q9" label="Q9 score">
        <Select
          placeholder="Choose score"
          onChange={(value) => {
            handleChange(value, "A9");
          }}
        >
          <Option value="1">1</Option>
          <Option value="0">0</Option>
          <Option value="NA">NA</Option>
        </Select>
      </Form.Item>

      <Form.Item name="Q10" label="Q10 score">
        <Select
          placeholder="Choose score"
          onChange={(value) => {
            handleChange(value, "A10");
          }}
        >
          <Option value="1">1</Option>
          <Option value="0">0</Option>
          <Option value="NA">NA</Option>
        </Select>
      </Form.Item>

      <Form.Item name="Q11" label="Q11 score">
        <Select
          placeholder="Choose score"
          onChange={(value) => {
            handleChange(value, "A11");
          }}
        >
          <Option value="1">1</Option>
          <Option value="0">0</Option>
          <Option value="NA">NA</Option>
        </Select>
      </Form.Item>

      <Form.Item name="Q11" label="Q11 score">
        <Select
          placeholder="Choose score"
          onChange={(value) => {
            handleChange(value, "A11");
          }}
        >
          <Option value="1">1</Option>
          <Option value="0">0</Option>
          <Option value="NA">NA</Option>
        </Select>
      </Form.Item>

      <Form.Item name="Q12" label="Q12 score">
        <Select
          placeholder="Choose score"
          onChange={(value) => {
            handleChange(value, "A12");
          }}
        >
          <Option value="1">1</Option>
          <Option value="0">0</Option>
          <Option value="NA">NA</Option>
        </Select>
      </Form.Item>

      <Form.Item name="Q13" label="Q13 score">
        <Select
          placeholder="Choose score"
          onChange={(value) => {
            handleChange(value, "A13");
          }}
        >
          <Option value="1">1</Option>
          <Option value="0">0</Option>
          <Option value="NA">NA</Option>
        </Select>
      </Form.Item>

      <Form.Item name="Q14" label="Q14 score">
        <Select
          placeholder="Choose score"
          onChange={(value) => {
            handleChange(value, "A14");
          }}
        >
          <Option value="1">1</Option>
          <Option value="0">0</Option>
          <Option value="NA">NA</Option>
        </Select>
      </Form.Item>

      <Form.Item name="Q15" label="Q15 score">
        <Select
          placeholder="Choose score"
          onChange={(value) => {
            handleChange(value, "A15");
          }}
        >
          <Option value="1">1</Option>
          <Option value="0">0</Option>
          <Option value="NA">NA</Option>
        </Select>
      </Form.Item>

      <Form.Item name="VocalScore" label="Vocal Score">
      <Rate tooltips={desc}  onChange={(value) => {
            setVocalScoreStar(value)
          }}
          />
      </Form.Item>

      <Form.Item name="PronounciationScore" label="Pronounciation Score">
        <Rate tooltips={desc} name = "pronounciationScore" value={pronounciationScoreStar} onChange={(value) => {
            setPronounciationScoreStar(value)
          }}/>
      </Form.Item>

      <Form.Item name="ConfidenceScore" label="Confidence Score">
        <Rate tooltips={desc} name = "confidenceScore" value={confidenceScoreStar} onChange={(value) => {
            setConfidenceScoreStar(value)
          }}/>
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AssessmentForm;

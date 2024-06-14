export type QuestionType = "MCQ" | "SPEAKING" | "GENERAL";
export type Option = {
  option: string;
  value: string;
};

export type OlympiadQuestionArray = {
  id: string;
  type: QuestionType;
  question: string;
  options?: Option[];
  correctOption?: string;
  topic?: string;
  image?: string;
  expectedAnswer?: string;
};

export type OlympiadContentFormType = {
  id: string;
  level: string;
  grade: string;
  questions?: OlympiadQuestionArray[];
};

export type OlympiadQuestionList = OlympiadContentFormType[];

export const LEVELS = ["1", "2", "3"];
export const GRADES = [
  "LKG",
  "SKG",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];
export const TYPES: QuestionType[] = [
  "MCQ",
  "SPEAKING",
  "GENERAL",
];

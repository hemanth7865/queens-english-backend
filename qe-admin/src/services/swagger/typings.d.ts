// @ts-ignore
/* eslint-disable */

declare namespace API {
  type Order = {
    id?: number;
    petId?: number;
    quantity?: number;
    shipDate?: string;
    /** Order Status */
    status?: "placed" | "approved" | "delivered";
    complete?: boolean;
  };

  type Category = {
    id?: number;
    name?: string;
  };

  type User = {
    id?: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    phone?: string;
    /** User Status */
    userStatus?: number;
  };

  type Tag = {
    id?: number;
    name?: string;
  };

  type Pet = {
    id?: number;
    category?: Category;
    name: string;
    photoUrls: string[];
    tags?: Tag[];
    /** pet status in the store */
    status?: "available" | "pending" | "sold";
  };

  type ApiResponse = {
    code?: number;
    type?: string;
    message?: string;
  };

  type AssessmentItem = {
    id: string;
    name: string;
    displayName: string;
    lessonDue: number;
    active: boolean;
    isFreeSpeech?: boolean;
    date?: string;
  };

  type AssessmentList = AssessmentItem[];

  type AssessmentQuestion = {
    setNumber?: string;
    assessmentId: string;
    assessmentQuestion: {
      number: number;
      question: string;
      instruction?: string;
      answer?: string;
      type?: string;
      imageUrl?: string;
    }[];
    id: string;
    name: string;
    displayName: string;
    lessonNumber?: string;
    lessonId?: string;
    active: boolean;
    isFreeSpeech?: boolean;
    date?: string;
  };

  type AssessmentQuestionList = AssessmentQuestion[];

  export interface Lesson {
    id: string;
    number: string;
    type: string;
    practiceProblems: {
      name: string;
      imageUrl: string;
      questionSoundUrl: string;
      expectedAnswer: string;
      type: string;
      answerSoundUrl?: string;
    }[];
    exercises: any[];
    numberOfNewWords: number;
    version: string;
  }
}

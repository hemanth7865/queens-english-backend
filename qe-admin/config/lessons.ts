import lessons from "./../data/lessons.json";
export const LESSONS = lessons.sort(
  (a, b) => parseInt(a.number) - parseInt(b.number)
);

export type Lesson = {
  id: string;
  number: string;
  type: string;
};

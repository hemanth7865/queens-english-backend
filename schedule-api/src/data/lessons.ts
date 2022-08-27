const lessons = require("./lessons.json");

export const LESSONS = lessons.sort(
  (a, b) => parseInt(a.number) - parseInt(b.number)
);

export const getListOfLessonsIDs = (lessons: string[]): string[] => {
  let ids: string[] = [];

  for (let lesson of lessons) {
    let l: Lesson | undefined = LESSONS.filter((l) => {
      if (lesson && lesson.length > 0) {
        let lessonNumber: string = lesson;
        if (parseInt(lesson) < 10) {
          lessonNumber = "0" + parseInt(lesson);
        }
        return l.number === lessonNumber;
      }

      return false;
    })[0];

    if (l?.id) {
      ids.push(l.id);
    }
  }

  return ids;
};

export const getLessonByID = (lesson: string): Lesson | undefined => {
  return LESSONS.filter((l) => {
    if (lesson && lesson.length > 0) {
      return l.id === lesson;
    }

    return false;
  })[0];
};

export type Lesson = {
  id: string;
  number: string;
  type: string;
};

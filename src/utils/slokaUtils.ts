import chapter1 from '../data/chapter1.json';
import chapter2 from '../data/chapter2.json';
import chapter3 from '../data/chapter3.json';
import chapter4 from '../data/chapter4.json';
import chapter5 from '../data/chapter5.json';
import chapter6 from '../data/chapter6.json';
import chapter7 from '../data/chapter7.json';
import chapter8 from '../data/chapter8.json';
import chapter9 from '../data/chapter9.json';
import chapter10 from '../data/chapter10.json';
import chapter11 from '../data/chapter11.json';
import chapter12 from '../data/chapter12.json';
import chapter13 from '../data/chapter13.json';
import chapter14 from '../data/chapter14.json';
import chapter15 from '../data/chapter15.json';
import chapter16 from '../data/chapter16.json';
import chapter17 from '../data/chapter17.json';
import chapter18 from '../data/chapter18.json';

export interface Sloka {
  id: string;
  chapter: number;
  verse: number;
  sanskrit: string;
  pronunciation: string;
  meaning: string;
}

export interface Chapter {
  chapter: number;
  slokas: Sloka[];
}

// Function to get slokas from a specific chapter
export const getChapterSlokas = (chapterNumber: number): Sloka[] => {
  const chapters: { [key: number]: Chapter } = {
    1: chapter1,
    2: chapter2,
    3: chapter3,
    4: chapter4,
    5: chapter5,
    6: chapter6,
    7: chapter7,
    8: chapter8,
    9: chapter9,
    10: chapter10,
    11: chapter11,
    12: chapter12,
    13: chapter13,
    14: chapter14,
    15: chapter15,
    16: chapter16,
    17: chapter17,
    18: chapter18
  };
  return chapters[chapterNumber]?.slokas || [];
};

// Function to get all slokas combined
export const getAllSlokas = () => {
  const chapters: Chapter[] = [
    chapter1, chapter2, chapter3, chapter4, chapter5, chapter6,
    chapter7, chapter8, chapter9, chapter10, chapter11, chapter12,
    chapter13, chapter14, chapter15, chapter16, chapter17, chapter18
  ];
  return {
    slokas: chapters.reduce<Sloka[]>((acc, chapter) => [...acc, ...chapter.slokas], [])
  };
};

export default getAllSlokas(); 
export interface WheelResult {
  student: string;
  question: string | null;
}

export interface GameState {
  isSpinning: boolean;
  winner: WheelResult | null;
}

export const DEFAULT_STUDENTS = [
  "An", "Bình", "Chi", "Dương", "Hà", "Hải", "Hùng", "Khánh", "Lan", "Linh",
  "Minh", "Nam", "Nhi", "Phương", "Quân", "Quỳnh", "Sơn", "Thảo", "Thắng", "Trang",
  "Trinh", "Tuấn", "Vy", "Yến", "Hoàng", "Thi", "Lộc", "Kiên", "Đức", "Hằng",
  "Trung", "Ngọc", "Bảo", "Vân", "Tiên", "Anh", "Cường", "Nga", "Hòa", "Triều"
];

export const DEFAULT_QUESTIONS = [
  "1. She ___ to school yesterday. A. goes | B. went | C. go | D. going (Đáp án: B)",
  "2. They ___ a new car last month. A. buy | B. bought | C. buying | D. buys (Đáp án: B)",
  "3. I ___ the movie last night. A. watch | B. watched | C. watches | D. watching (Đáp án: B)",
  "4. We ___ football on Sunday. A. play | B. played | C. plays | D. playing (Đáp án: B)",
  "5. He ___ his homework two hours ago. A. finish | B. finished | C. finishes | D. finishing (Đáp án: B)",
  "6. ___ you ___ to Da Nang last year? A. Do / travel | B. Did / traveled | C. Did / travel | D. Are / traveling (Đáp án: C)",
  "7. My father ___ dinner early yesterday. A. cook | B. cooked | C. cooking | D. cooks (Đáp án: B)",
  "8. They ___ at home last weekend. A. were | B. are | C. was | D. be (Đáp án: A)",
  "9. She ___ very tired after the trip. A. is | B. were | C. was | D. be (Đáp án: C)",
  "10. I ___ the book on the table this morning. A. leave | B. left | C. leaving | D. leaves (Đáp án: B)",
  "11. He ___ his keys yesterday. A. lose | B. lost | C. losing | D. loses (Đáp án: B)",
  "12. We ___ to the beach last summer. A. go | B. goes | C. went | D. going (Đáp án: C)",
  "13. She ___ a letter to her friend. A. write | B. wrote | C. writing | D. writes (Đáp án: B)",
  "14. The students ___ early this morning. A. arrive | B. arrived | C. arriving | D. arrives (Đáp án: B)",
  "15. ___ he ___ the guitar when he was young? A. Did / play | B. Does / play | C. Did / played | D. Was / playing (Đáp án: A)",
  "16. My mom ___ a cake for my birthday last year. A. makes | B. made | C. making | D. make (Đáp án: B)",
  "17. She ___ a beautiful picture yesterday. A. draw | B. drew | C. drawing | D. draws (Đáp án: B)",
  "18. They ___ happy after the trip. A. are | B. were | C. was | D. be (Đáp án: B)",
  "19. I ___ him at the party last night. A. meet | B. met | C. meeting | D. meets (Đáp án: B)",
  "20. The dog ___ loudly last night. A. bark | B. barked | C. barking | D. barks (Đáp án: B)",
  "21. She ___ a book now. A. read | B. is reading | C. are reading | D. reads (Đáp án: B)",
  "22. They ___ football at the moment. A. play | B. playing | C. are playing | D. is playing (Đáp án: C)",
  "23. I ___ to music right now. A. am listen | B. am listening | C. is listening | D. listening (Đáp án: B)",
  "24. He ___ TV in the living room. A. is watching | B. are watching | C. watches | D. watch (Đáp án: A)",
  "25. We ___ dinner at the moment. A. are having | B. is having | C. have | D. having (Đáp án: A)",
  "26. The students ___ an English test now. A. take | B. takes | C. are taking | D. is taking (Đáp án: C)",
  "27. My mom ___ in the kitchen right now. A. is cook | B. are cooking | C. is cooking | D. cooks (Đáp án: C)",
  "28. Look! The birds ___ in the sky. A. are flying | B. is flying | C. fly | D. flying (Đáp án: A)",
  "29. The baby ___ loudly. A. is cry | B. are crying | C. crying | D. is crying (Đáp án: D)",
  "30. I ___ for my friend at the bus stop. A. am wait | B. waiting | C. am waiting | D. is waiting (Đáp án: C)"
];
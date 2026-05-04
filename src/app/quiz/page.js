'use client'; // 상태 관리(useState)를 위해 꼭 필요합니다.

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // 1단계에서 만든 파일 불러오기

export default function QuizPage() {
  console.log('현재 내 컴퓨터가 인식한 URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  const [questions, setQuestions] = useState([]); // 불러온 문제들
  const [userAnswers, setUserAnswers] = useState({}); // 학생이 선택한 답
  const [score, setScore] = useState(null); // 최종 점수

  console.log(questions);

  // 1. 화면이 켜지자마자 랜덤 문제 10개 불러오기
  useEffect(() => {
    async function fetchQuestions() {
      const { data, error } = await supabase.from('questions').select('*').limit(10);

      if (error) console.error('문제 불러오기 에러:', error);
      else setQuestions(data);
    }
    fetchQuestions();
  }, []);

  // 2. 학생이 보기를 선택했을 때 실행되는 함수
  const handleSelect = (questionId, option) => {
    setUserAnswers({ ...userAnswers, [questionId]: option });
  };

  // 3. 채점 및 결과 제출 함수
  const handleSubmit = async () => {
    let currentScore = 0;

    // 채점 로직: 각 문제의 정답과 학생의 답을 비교
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correct_answer) {
        currentScore += 10; // 한 문제당 10점 (총 100점 만점)
      }
    });

    setScore(currentScore); // 화면에 점수 띄우기 위해 상태 업데이트

    // Supabase 'results' 테이블에 점수 저장
    const { error } = await supabase.from('results').insert([
      { topic: '과학', score: currentScore },
      // 주의: 지금은 테스트를 위해 user_id를 뺐습니다. 나중에 로그인 기능을 붙이면 추가해야 합니다.
    ]);

    if (error) console.error('결과 저장 에러:', error);
    else alert(`제출 완료! 점수: ${currentScore}점`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>초등학교 과학 퀴즈</h1>

      {/* 문제 리스트 출력 */}
      {questions.map((q, index) => (
        <div key={q.id} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h3>
            {index + 1}. {q.question_text}
          </h3>

          {/* JSONB로 저장된 보기 배열(options)을 화면에 버튼으로 출력 */}
          {q.options.map((option) => (
            <div key={option}>
              <label>
                <input type="radio" name={q.id} value={option} onChange={() => handleSelect(q.id, option)} />
                {option}
              </label>
            </div>
          ))}
        </div>
      ))}

      <button onClick={handleSubmit} style={{ padding: '10px 20px', fontSize: '16px', background: 'blue', color: 'white' }}>
        제출하고 채점하기
      </button>

      {/* 채점 결과가 있으면 화면에 표시 */}
      {score !== null && <div style={{ marginTop: '20px', fontSize: '24px', fontWeight: 'bold' }}>최종 점수: {score}점 / 100점</div>}
    </div>
  );
}

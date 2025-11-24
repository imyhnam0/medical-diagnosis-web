import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ChatPage.css";

const API_BASE_URL = 'http://localhost:8080/api/analyze';

// 각 질문마다 API를 호출하고 있습니다.
// 질문별로 매핑된 endpoint를 사용해서 사용자의 응답(input)에 대해 API 요청을 합니다.
const apiEndpoints = [
  "symptoms",            // step 0: followUpQuestion (초기)
  "symptoms",            // step 1: 운동/스트레스
  "symptoms",            // step 2: 기타 증상
  "aggravation",         // step 3: 악화요인
  "riskfactor",          // step 4: 위험요인(질환)
  "drinking-smoking",    // step 5: 음주
  "drinking-smoking",    // step 6: 흡연
  "job",                 // step 7: 직업
  "exercise-stress",     // step 8: 운동/신체활동
  "past-disease"         // step 9: 과거질환
];

// 각 step별 questionIndex (섹션 내 인덱스)
const questionIndexes = [
  0,  // step 0: followUpQuestion -> symptoms 섹션의 첫 번째 질문
  1,  // step 1: 운동/스트레스 -> symptoms 섹션의 두 번째 질문
  2,  // step 2: 기타 증상 -> symptoms 섹션의 세 번째 질문
  0,  // step 3: 악화요인 -> aggravation 섹션의 첫 번째 질문
  0,  // step 4: 위험요인 -> riskfactor 섹션의 첫 번째 질문
  0,  // step 5: 음주 -> drinking-smoking 섹션의 첫 번째 질문
  1,  // step 6: 흡연 -> drinking-smoking 섹션의 두 번째 질문
  0,  // step 7: 직업 -> job 섹션의 첫 번째 질문
  0,  // step 8: 운동/신체활동 -> exercise-stress 섹션의 첫 번째 질문
  0   // step 9: 과거질환 -> past-disease 섹션의 첫 번째 질문
];

// 질문 리스트
const questionList = [
  "운동 또는 스트레스와 관련이 있나요?",
  "지금까지 말한 증상말고 다른 증상이 있나요?",
  "어떤 상황에서 증상이 더 심해지나요? (예: 움직이거나 눕거나 추울 때 등)",
  "현재 가지고 있는 질환이 있나요? (예: 당뇨, 고혈압, 암, 간질환 등)",
  "평소에 얼마나 자주 음주를 하시나요?\n(예: 일주일에 몇 번, 한 번에 어느 정도 등)",
  "흡연을 하시나요? 혹은 주위에 흡연하는 사람이 있나요?\n(예: 네,아니요 등)",
  "현재 어떤 일을 하고 계신가요?",
  "평소 생활에서 운동이나 신체활동은 어느 정도 하시나요?",
  "과거에 진단받은 만성 질환이 있나요?(예: 고혈압, 당뇨, 고지혈증, 심장질환, 간질환, 결합조직질환, 자가면역질환, 비만 등)",
];

// (POST) 본문: { question, answer, questionIndex }
async function extractKeywords(endpoint, question, answer, questionIndex) {
  try {
    const fullUrl = `${API_BASE_URL}/${endpoint}`;
    const res = await fetch(fullUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer, questionIndex })
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API 오류 (${res.status}):`, errorText);
      throw new Error(`Server error: ${res.status}`);
    }
    const data = await res.json();
    // API 응답에 keywords가 있으면 그걸 반환
    return data.keywords || []; 
  } catch (e) {
    console.error("API 호출 오류:", e);
    return [];
  }
}

const ChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const followUpQuestion =
    (location.state && location.state.followUpQuestion && location.state.followUpQuestion.trim()) || "어떤식으로 아픈가요?";
  const initialUserInput = (location.state && location.state.initialUserInput) || "";

  // 메시지 초기화
  const [messages, setMessages] = useState([{ role: "assistant", content: followUpQuestion }]);
  const [questionStep, setQuestionStep] = useState(0); // 현재 몇 번째 질문인지
  const [input, setInput] = useState("");
  const [allKeywords, setAllKeywords] = useState([]); // 누적 추출 키워드
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const hasInitializedRef = useRef(false);

  // 초기 진입시: initialUserInput이 있으면 followUpQuestion에 대해 "네"로 답변하여 키워드 추출 (한 번만 실행)
  useEffect(() => {
    // 이미 실행되었으면 스킵
    if (hasInitializedRef.current) return;
    
    const autoProceed = async () => {
      if (initialUserInput && initialUserInput.trim()) {
        hasInitializedRef.current = true;
        setIsLoading(true);

        // followUpQuestion에 대한 답변을 "네"로 해서 키워드 추출
        const endpoint0 = apiEndpoints[0];
        const kw = await extractKeywords(endpoint0, initialUserInput, "네", 0);

        // 키워드만 추가하고 메시지는 변경하지 않음 (followUpQuestion만 표시)
        setAllKeywords(Array.isArray(kw) ? kw : []);
        setIsLoading(false);
      }
    };
    autoProceed();
    // eslint-disable-next-line
  }, []);

  // 항상 대화의 끝으로 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 질문에 대답(input)하면 각 엔드포인트로 API를 호출
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const step = questionStep;
    const userInput = input.trim();
    
    // 1. 먼저 사용자 메시지를 화면에 표시
    setMessages(prev => {
      // 중복 체크
      if (
        prev.length > 0 &&
        prev[prev.length - 1].role === "user" &&
        prev[prev.length - 1].content === userInput
      ) {
        return prev;
      }
      return [...prev, { role: "user", content: userInput }];
    });

    // 입력 필드 클리어 및 로딩 시작
    setInput("");
    setIsLoading(true);

    // 각 질문 단계에 맞는 엔드포인트로 호출
    const endpoint = apiEndpoints[step] || apiEndpoints[apiEndpoints.length - 1];
    // 현재 질문 가져오기
    const currentQuestion = step === 0 ? followUpQuestion : (questionList[step - 1] || "");
    // questionIndex는 각 섹션 내에서의 인덱스
    const questionIndex = questionIndexes[step] ?? 0;

    // 2. 서버로 API 호출
    const kw = await extractKeywords(endpoint, currentQuestion, userInput, questionIndex);

    // 3. 키워드 업데이트
    setAllKeywords(prev => {
      const newKeywords = Array.isArray(kw) ? kw : [];
      // 중복 제거하면서 추가
      const uniqueNew = newKeywords.filter(k => !prev.includes(k));
      return prev.concat(uniqueNew);
    });

    // 4. 1초 대기 후 다음 질문 표시
    await new Promise(resolve => setTimeout(resolve, 1000));

    const nextStep = step + 1;
    
    // 5. 다음 질문 추가
    if (nextStep <= questionList.length) {
      setMessages(prev => {
        const nextQuestion = questionList[nextStep - 1];
        return [...prev, { role: "assistant", content: nextQuestion }];
      });
    }

    setQuestionStep(nextStep);
    setIsLoading(false);

    // 마지막 질문까지 끝났는지 확인 (questionList.length는 9개, step 0~9까지 총 10개 질문)
    // step 0: followUpQuestion
    // step 1~9: questionList[0~8]
    // 마지막 질문(step 9)에 답변하면 완료
    if (nextStep > questionList.length) {
      // 모든 질문 완료 - ResultPage로 이동
      setTimeout(() => {
        navigate('/result');
      }, 500);
    }
  };

  // Enter키로 메시지 전송
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      sendMessage();
    }
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-header">AI 상담</div>
      <div className="chat-box">
        {messages.map((m, idx) => (
          <div key={idx} className={`message-wrapper ${m.role}`}>
            {m.role === 'assistant' && <div className="message-label">SNU MedAI</div>}
            <div className={`bubble ${m.role}`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>
      <div className="chat-input-area">
        <input
          className="chat-input"
          placeholder={isLoading ? "분석 중..." : "메시지를 입력하세요..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          disabled={isLoading}
        />
        <button className="chat-send" onClick={sendMessage} disabled={isLoading || !input.trim()}>
          ➤
        </button>
      </div>
      {/* (참고) 각 답변마다 API로 키워드 추출한 결과가 누적됩니다. */}
      {/* <div style={{ color: "#aaa", fontSize: 13, margin: 8 }}>
        전체 추출 키워드: {JSON.stringify(allKeywords)}
      </div> */}
    </div>
  );
};

export default ChatPage;

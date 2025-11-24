import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeChestPain } from '../utils/api';
import './IsDiseaseRightPage.css';

const IsDiseaseRightPage = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleCheck = async () => {
    if (!input.trim()) {
      alert('증상을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await analyzeChestPain({ userInput: input });
      console.log('🔍 checkChestPain 결과:', result);

      if (result.result === 'TRUE') {
        console.log('✅ 흉통 관련 증상으로 판단됨');
        const followUpQuestion = result.followUpQuestion?.trim() || '';
        
        navigate('/age', {
          state: {
            followUpQuestion,
            initialUserInput: input
          }
        });
      } else {
        console.log('❌ 흉통 관련이 아닌 것으로 판단됨');
        setShowAlert(true);
      }
    } catch (error) {
      console.error('💥 오류 발생:', error);
      alert(`서버 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="isdiseaseright-page">
      <div className="isdiseaseright-container">
        <div className="isdiseaseright-header">
          <button className="back-button" onClick={handleBack}>
            ←
          </button>
          <h1 className="isdiseaseright-title">AI 증상 판별</h1>
          <div style={{ width: '48px' }}></div>
        </div>

        <div className="isdiseaseright-content">
          <div className="info-card">
            <div className="ai-icon">🧠</div>
            <h2 className="info-title">현재 느끼는 주요 증상을 입력해주세요</h2>
            <p className="info-subtitle">
              AI가 입력하신 내용을 분석하여<br />
              증상 여부를 판별합니다
            </p>
          </div>

          <div className="input-card">
            <div className="input-header">
              <span className="input-icon">✏️</span>
              <span className="input-label">증상 입력</span>
            </div>
            <textarea
              className="symptom-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="예: 가슴이 답답해요, 숨이 막혀요, 심장이 두근거려요"
              disabled={isLoading}
              rows={3}
            />
            {!isLoading && (
              <button className="analyze-button" onClick={handleCheck}>
                <span>✨</span>
                <span>AI로 증상 분석하기</span>
              </button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-card">
              <div className="spinner"></div>
              <p>AI가 증상을 분석하고 있습니다...</p>
            </div>
          </div>
        )}

        {showAlert && (
          <div className="alert-overlay" onClick={() => setShowAlert(false)}>
            <div className="alert-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="alert-icon">⚠️</div>
              <h3 className="alert-title">알림</h3>
              <p className="alert-message">흉통관련 질환이 아닙니다.</p>
              <button className="alert-button" onClick={() => setShowAlert(false)}>
                확인
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IsDiseaseRightPage;


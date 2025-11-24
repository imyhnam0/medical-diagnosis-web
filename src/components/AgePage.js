import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { analyzeAgeBmiGender } from '../utils/api';
import './AgePage.css';

const AgePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { followUpQuestion, initialUserInput } = location.state || {};

  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateBmi = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      const heightInMeters = h / 100;
      const calculated = w / (heightInMeters * heightInMeters);
      setBmi(parseFloat(calculated.toFixed(1)));
    } else {
      setBmi(null);
    }
  };

  React.useEffect(() => {
    calculateBmi();
  }, [height, weight]);

  const handleAnalyze = async () => {
    const ageNum = parseInt(age);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (!ageNum || ageNum <= 0 || ageNum > 150) {
      alert('올바른 나이를 입력해주세요.');
      return;
    }

    if (!gender) {
      alert('성별을 선택해주세요.');
      return;
    }

    if (!heightNum || heightNum <= 0) {
      alert('올바른 키를 입력해주세요.');
      return;
    }

    if (!weightNum || weightNum <= 0) {
      alert('올바른 체중을 입력해주세요.');
      return;
    }

    if (!bmi || bmi <= 0 || bmi > 100) {
      alert('체중과 키를 입력하여 BMI를 계산해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await analyzeAgeBmiGender({
        age: ageNum,
        bmi: bmi,
        gender: gender,
        height: heightNum
      });

      // 분석 완료 후 바로 다음 페이지로 이동
      if (response) {
        navigate('/chat', {
          state: {
            followUpQuestion: followUpQuestion || '',
            initialUserInput: initialUserInput || ''
          }
        });
      }
    } catch (error) {
      console.error('분석 오류:', error);
      alert('분석 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="age-page">
      <div className="age-container">
        <div className="age-header">
          <button className="back-button" onClick={handleBack}>←</button>
          <h1 className="age-title">나이/BMI/성별 분석</h1>
          <div style={{ width: '48px' }}></div>
        </div>

        <div className="age-content">
          <div className="input-card">
            <div className="card-header">
              <span>👤</span>
              <span>개인 정보 입력</span>
            </div>

            <div className="input-group">
              <label>나이</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="나이를 입력하세요"
              />
            </div>

            <div className="input-group">
              <label>성별</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="남성"
                    checked={gender === '남성'}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  남성
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="여성"
                    checked={gender === '여성'}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  여성
                </label>
              </div>
            </div>

            <div className="input-group">
              <label>키 (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="키를 입력하세요 (예: 175)"
              />
            </div>

            <div className="input-group">
              <label>체중 (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="체중을 입력하세요"
              />
            </div>

            {bmi && (
              <div className="bmi-display">
                <span>📊</span>
                <span>계산된 BMI: {bmi}</span>
              </div>
            )}

            <button
              className="analyze-button"
              onClick={handleAnalyze}
              disabled={isLoading}
            >
              {isLoading ? '분석 중...' : '분석하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgePage;


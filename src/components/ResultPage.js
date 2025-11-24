import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTopDiseases, getAllDiseases, getDiseaseInfo, resetDiagnosis } from '../utils/api';
import './ResultPage.css';

const ResultPage = () => {
  const navigate = useNavigate();
  const [topDiseases, setTopDiseases] = useState([]);
  const [diseaseScores, setDiseaseScores] = useState({});
  const [diseaseInfo, setDiseaseInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const [topData, allData] = await Promise.all([
        getTopDiseases(),
        getAllDiseases()
      ]);

      // top-diseases API 응답 형식: { top: [{ diseaseName, score }] }
      if (topData.top && Array.isArray(topData.top)) {
        const topList = topData.top
          .filter(item => item.diseaseName && item.diseaseName.trim())
          .map(item => ({
            diseaseName: item.diseaseName,
            score: typeof item.score === 'number' ? item.score : 0
          }));
        setTopDiseases(topList);
      }

      // all-diseases API 응답 형식: { all: [{ diseaseName, score }] }
      if (allData.all && Array.isArray(allData.all)) {
        const scores = {};
        allData.all.forEach(item => {
          if (item.diseaseName && item.diseaseName.trim()) {
            scores[item.diseaseName] = typeof item.score === 'number' ? item.score : 0;
          }
        });
        setDiseaseScores(scores);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('결과 로딩 오류:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (topDiseases.length > 0) {
      loadDiseaseInfo();
    }
  }, [topDiseases]);

  const loadDiseaseInfo = async () => {
    setIsLoadingInfo(true);
    try {
      const promises = topDiseases.map(async (disease) => {
        if (!diseaseInfo[disease.diseaseName]) {
          try {
            const info = await getDiseaseInfo({ diseaseName: disease.diseaseName });
            return { diseaseName: disease.diseaseName, info };
          } catch (error) {
            console.error(`질병 정보 로딩 실패: ${disease.diseaseName}`, error);
            return { diseaseName: disease.diseaseName, info: null };
          }
        }
        return null;
      });

      const results = await Promise.all(promises);
      results.forEach(result => {
        if (result && result.info) {
          setDiseaseInfo(prev => ({
            ...prev,
            [result.diseaseName]: result.info
          }));
        }
      });
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const handleGoToMain = async () => {
    try {
      await resetDiagnosis();
    } catch (error) {
      console.error('리셋 오류:', error);
    }
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="result-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>결과를 분석하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (topDiseases.length === 0) {
    return (
      <div className="result-page">
        <div className="result-header">
          <button className="back-button" onClick={() => navigate(-1)}>←</button>
          <h1 className="result-title">진단 결과</h1>
          <div style={{ width: '48px' }}></div>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🏥</div>
          <h2>진단 데이터가 없습니다</h2>
          <p>다른 페이지에서 질병 정보를 입력해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="result-page">
      <div className="result-header">
        <button className="back-button" onClick={() => navigate(-1)}>←</button>
        <h1 className="result-title">진단 결과</h1>
        <div style={{ width: '48px' }}></div>
      </div>

      <div className="result-content">
        {/* TOP 2 질병 카드 */}
        <div className="top-disease-card">
          <div className="top-card-header">
            <div className="top-card-icon">🏆</div>
            <h2 className="top-card-title">진단 결과 TOP 2</h2>
          </div>
          <div className="top-diseases-list">
            {topDiseases.map((disease, idx) => {
              const info = diseaseInfo[disease.diseaseName];
              return (
                <div key={idx} className="disease-rank-card">
                  <div className="disease-rank-header">
                    <div className="disease-name-main">{disease.diseaseName}</div>
                    <div className="disease-score-badge">
                      {disease.score.toFixed(1)}점
                    </div>
                  </div>
                  {isLoadingInfo && !info && (
                    <div className="disease-info-loading">질병 정보를 불러오는 중...</div>
                  )}
                  {!isLoadingInfo && info && (
                    <div className="disease-info-content">
                      <div className="disease-description">{info.description || "정보를 가져올 수 없습니다."}</div>
                      <div className="disease-prognosis">{info.prognosis || "예후 정보를 가져올 수 없습니다."}</div>
                    </div>
                  )}
                  {!isLoadingInfo && !info && (
                    <div className="disease-info-error">정보를 가져올 수 없습니다.</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 기타 질병 리스트 */}
        {Object.keys(diseaseScores).length > topDiseases.length && (
          <div className="other-diseases-card">
            <div className="other-card-header">
              <div className="other-card-icon">📋</div>
              <h2 className="other-card-title">기타 질병</h2>
            </div>
            <div className="other-diseases-list">
              {Object.entries(diseaseScores)
                .filter(([name]) => !topDiseases.some(d => d.diseaseName === name))
                .map(([name, score]) => (
                  <div key={name} className="other-disease-item">
                    <div className="other-disease-name">{name}</div>
                    <div className="other-disease-score">{score.toFixed(1)}점</div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* 처음으로 버튼 */}
      <button className="go-to-main-button" onClick={handleGoToMain}>
        <span className="button-icon">🏠</span>
        <span className="button-text">처음으로</span>
      </button>
    </div>
  );
};

export default ResultPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveDemoRequest } from '../utils/api';
import './HomePage.css';

const chatMessages = [
  {
    sender: 'SNU MedAI',
    message: '안녕하세요. 의학 진단 AI 어시스턴트입니다. 어떤 증상이 있으신가요?',
    isAI: true,
  },
  {
    sender: 'You',
    message: '가슴이 아파요.',
    isAI: false,
  },
  {
    sender: 'SNU MedAI',
    message: '가슴이 어떻게 아프신가요?',
    isAI: true,
  },
];

const stats = [
  { label: '응답 시간', value: '2초 미만' },
  { label: '진단 추천 정확도', value: 'xx%' },
];

const flowSteps = [
  { title: '증상 판별', description: '흉통인지 아닌지를 판별합니다.' },
  { title: '사회적 이력', description: '직업, 생활 습관, 사회적 요인을 조사합니다.' },
  { title: '악화 요인', description: '증상을 악화시키는 요인을 파악합니다.' },
  { title: '과거 질환 이력', description: '과거 질환 이력을 조사합니다.' },
  { title: '위험 요인', description: '관련 위험 요인을 종합적으로 평가합니다.' },
];

const featureItems = [
  {
    icon: '🩺',
    title: '정밀 문진 시스템',
    description: 'AI 기반 지능형 문진으로 환자의 증상과 병력을 체계적으로 수집합니다.',
  },
  {
    icon: '🧠',
    title: 'AI 증상 분석',
    description: '실시간으로 증상을 분석하고 잠재적 질환을 식별합니다.',
  },
  {
    icon: '📊',
    title: '위험도 평가',
    description: '환자의 위험 요인을 종합적으로 평가하여 우선순위를 제시합니다.',
  },
  {
    icon: '📋',
    title: '종합 리포트',
    description: '의료진이 바로 활용할 수 있는 상세한 진단 리포트를 제공합니다.',
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [visibleChats, setVisibleChats] = useState(0);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // 채팅 메시지를 한 개씩 순차적으로 표시
    const timers = [];

    chatMessages.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleChats(index + 1);
      }, 500 + (index * 1000)); // 첫 메시지 0.5초 후, 이후 각 메시지마다 1초 간격

      timers.push(timer);
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    // Observe all elements with scroll-reveal class
    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => {
      timers.forEach(timer => clearTimeout(timer));
      observer.disconnect();
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSubmitMessage('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const result = await saveDemoRequest(email);

      if (result.success) {
        setSubmitMessage('데모 요청이 성공적으로 전송되었습니다. 곧 연락드리겠습니다.');
        setEmail('');
      } else {
        setSubmitMessage(result.error || '요청 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('데모 요청 오류:', error);
      setSubmitMessage('요청 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="home-shell">
      {/* Floating orbs for visual depth */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <header className="home-header">
        <div className="home-logo">
          <div className="logo-checkmark">✓</div>
          <div className="logo-wordmark">
            <span className="logo-text">SNU MedAI</span>
            <span className="logo-subtext">Clinical Intelligence</span>
          </div>
        </div>

        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <a href="#app-info" onClick={(e) => { e.preventDefault(); scrollToSection('app-info'); setMobileMenuOpen(false); }}>앱 소개</a>
          <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); setMobileMenuOpen(false); }}>주요 기능</a>
          <a href="#previsit" onClick={(e) => { e.preventDefault(); scrollToSection('previsit'); setMobileMenuOpen(false); }}>진단 절차</a>
          <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); setMobileMenuOpen(false); }}>개발자 소개</a>
          {mobileMenuOpen && (
            <button
              className="mobile-close-button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="메뉴 닫기"
            >
              ✕
            </button>
          )}
        </nav>


      </header>

      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      <main className="home-main">
        <div className="hero-content scroll-reveal">
          <div className="hero-left">
            <div className="hero-eyebrow">서울대학교병원 · SNU MedAI</div>
            <h1 className="hero-title">
              인공지능으로 완성하는{' '}
              <span className="hero-title-accent">차세대 환자 진료</span>
            </h1>
            <p className="hero-description">
              누구나 간편하게 사용할 수 있는 혁신적인 비대면 헬스케어 솔루션입니다.
            </p>
            <div className="hero-actions">
              <button className="request-demo-button" onClick={() => navigate('/isdiseaseright')}>
                진단 시작하기
              </button>
              <button className="ghost-button" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>
                기능 살펴보기
              </button>
            </div>
            <div className="hero-stats">
              {stats.map((stat) => (
                <div className="stat-card" key={stat.label}>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-right">
            <div className="chat-card">
              <div className="card-heading">
                <div className="heading-dots">
                  <span></span><span></span><span></span>
                </div>
                <span>실시간 상담 미리보기</span>
                <span className="card-chip">보안 모드</span>
              </div>

              <div className="chat-demo">
                {chatMessages.map((msg, idx) => {
                  if (idx >= visibleChats) return null;
                  return (
                    <div
                      key={idx}
                      className={`chat-message ${msg.isAI ? 'ai-message' : 'user-message'}`}
                    >
                      {msg.isAI && <div className="chat-sender">{msg.sender}</div>}
                      <div className="chat-bubble">{msg.message}</div>
                    </div>
                  );
                })}
              </div>

              <div className="chat-footnote">
                의학 데이터베이스를 기반으로 동작합니다.
              </div>
            </div>
          </div>
        </div>

        <section id="app-info" className="content-section scroll-reveal">
          <div className="section-heading">
            <p className="section-subtitle">Application</p>
            <h2 className="section-title">앱 소개</h2>

          </div>

          <div className="app-info-container">
            <div className="app-dual-showcase scroll-reveal">
              {/* 첫 번째 카드 - 실제 앱 스크린샷 */}
              <div className="app-showcase-card">
                <div className="showcase-header">
                  <div className="showcase-badge">
                    <span className="badge-icon">📱</span>
                    <span>실제 구현</span>
                  </div>
                  <h3>모바일 진단 앱</h3>
                  <p>누구나 쉽게 사용할 수 있는 직관적인 인터페이스</p>
                </div>
                <div className="app-screenshot-section">
                  <div className="phone-mockup">
                    <div className="phone-frame">
                      <div className="phone-notch"></div>
                      <div className="phone-screen">
                        <img
                          src="/images/app-screenshot.png"
                          alt="앱 스크린샷"
                          className="app-screenshot-image"
                          onError={(e) => {
                            e.target.parentElement.parentElement.parentElement.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                    <div className="phone-glow"></div>
                  </div>
                </div>
                <div className="app-features-list">
                  <div className="app-feature-item">
                    <span className="feature-check">✓</span>
                    <span>iOS & Android 지원</span>
                  </div>
                  <div className="app-feature-item">
                    <span className="feature-check">✓</span>
                    <span>실시간 증상 분석</span>
                  </div>
                  <div className="app-feature-item">
                    <span className="feature-check">✓</span>
                    <span>간편한 진단 리포트</span>
                  </div>
                </div>
              </div>

              {/* 두 번째 카드 - AI 의사 컨셉 */}
              <div className="app-showcase-card">
                <div className="showcase-header">
                  <div className="showcase-badge ai-badge">
                    <span className="badge-icon">🤖</span>
                    <span>AI 기술</span>
                  </div>
                  <h3>앱의 기능</h3>
                  <p>의사를 대신하여 정확한 진단을 제공하는 AI</p>
                </div>
                <div className="app-screenshot-section">
                  <div className="doctor-image-wrapper">
                    <img
                      src="/images/doctor_app.png"
                      alt="AI 진단 어시스턴트"
                      className="doctor-app-image"
                      onError={(e) => {
                        e.target.parentElement.style.display = 'none';
                      }}
                    />
                    <div className="doctor-glow"></div>
                  </div>
                </div>
                <div className="app-features-list">
                  <div className="app-feature-item">
                    <span className="feature-check">✓</span>
                    <span>AI 기반 문진 시스템</span>
                  </div>
                  <div className="app-feature-item">
                    <span className="feature-check">✓</span>
                    <span>임상 검증된 질문 흐름</span>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="content-section scroll-reveal">
          <div className="section-heading">
            <p className="section-subtitle">Capabilities</p>
            <h2 className="section-title">주요 기능</h2>
            <p className="section-description">
              임상 환경에 바로 적용할 수 있도록 설계된 기능과 안정적인 의료 데이터 보호 체계를 제공합니다.
            </p>
          </div>

          <div className="feature-grid">
            {featureItems.map((feature) => (
              <div className="feature-item" key={feature.title}>
                <div className="feature-icon-large">{feature.icon}</div>
                <div className="feature-copy">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="previsit" className="content-section scroll-reveal">
          <div className="section-heading">
            <p className="section-subtitle">Workflow</p>
            <h2 className="section-title">진단 절차</h2>
            <p className="section-description">
              AI 기반 진단 시스템은 체계적인 절차를 통해 환자의 정보를 수집하고 분석합니다.
              다음 순서로 진단이 진행됩니다.
            </p>
          </div>

          <div className="timeline">
            {flowSteps.map((step, index) => (
              <div className="timeline-step" key={step.title}>
                <div className="timeline-marker">
                  <span>{index + 1}</span>
                </div>
                <div className="timeline-card">
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="content-section scroll-reveal">
          <div className="section-heading">
            <p className="section-subtitle">About</p>
            <h2 className="section-title">개발자 소개</h2>
            <p className="section-description">
              의료 현장을 오래 이끌어 온 전문가들이 직접 설계한 임상 친화적 AI입니다.
            </p>
          </div>

          <div className="about-grid">
            <div className="about-panel">
              <div className="developer-header">
                <div>
                  <h3 className="developer-name">최동주 교수</h3>
                  <p className="developer-title">서울대학교 명예교수</p>
                </div>
                <div className="tag-list">
                  <span>심부전</span>
                  <span>심장이식</span>
                  <span>디지털 헬스케어</span>
                </div>
              </div>
              <p>
                심부전 및 심혈관 질환 분야의 권위자로, 서울대학교 의과대학을 졸업하고 동 대학원에서 석·박사 학위를 취득했습니다.
                경상국립대병원과 분당서울대학교병원 순환기내과에서 30여 년간 교수로 재직하며 환자 치료를 이끌었고,
                현재는 서울대학교 명예교수로 활동하고 있습니다.
              </p>
            </div>

            <div className="about-panel">
              <div className="about-detail">
                <h4>전문 진료 분야</h4>
                <p>심부전, 심근병증, 허혈성 심근질환, 고혈압, 관상동맥질환</p>
              </div>
              <div className="about-detail">
                <h4>연구 분야</h4>
                <p>
                  디지털 헬스케어 및 인공지능(AI)을 활용한 심전도 분석과 환자 관리 연구를 활발히 수행하며,
                  대한디지털임상의학회 회장 및 차기 이사장을 역임했습니다.
                </p>
              </div>
              <div className="about-detail">
                <h4>연락처</h4>
                <p className="developer-contact">
                  <a href="mailto:djchoi@snu.ac.kr">djchoi@snu.ac.kr</a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="demo" className="content-section scroll-reveal">
          <div className="cta-banner">
            <div className="cta-copy">
              <p className="section-subtitle">Request Access</p>
              <h2>데모 요청</h2>
              <p className="demo-description">
                SNU MedAI의 데모를 체험해보세요. 이메일 주소를 입력하면 체험 링크를 안내해드립니다.
              </p>
              <ul className="checklist">
                <li>피드백 기반 모델 개선 및 지속 업데이트</li>
              </ul>
            </div>

            <form className="demo-form" onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  className="email-input"
                  placeholder="이메일 주소를 입력해주세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '전송 중...' : '데모 요청'}
                </button>
              </div>
              {submitMessage && (
                <div className={`submit-message ${submitMessage.includes('성공') ? 'success' : 'error'}`}>
                  {submitMessage}
                </div>
              )}
            </form>
          </div>
        </section>

      </main>
    </div>
  );
};

export default HomePage;

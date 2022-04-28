import React, { useMemo } from 'react';
import './index.scss';

const Timestamp: React.FC = () => {
  const timestamps = useMemo(
    () => [
      {
        when: '21.07.19 - 현재',
        title: 'IGAWorks Adpopcorn FE 개발자',
        organizer: 'IGAWorks',
        tags: ['company', '재직중'],
      },
      {
        when: '21.02.24',
        title: '서울과학기술대학교 컴퓨터공학과 졸업',
        organizer: '서울과학기술대학교 (SEOULTECH)',
        tags: ['graduation'],
      },
      {
        when: '20.12.01 - 21.07.08',
        title: '짐싸 FE 개발자',
        organizer: '짐싸 (Zimssa)',
        tags: ['company'],
      },
      {
        when: '20.07.01 - 20.08.28',
        title: '우아한 테크 캠프',
        organizer: '우아한 형제들 (woowahan)',
        tags: ['company', 'intern'],
      },
      {
        when: '19.10.01 - 20.06.30',
        title: '철도경영정책연구소 교통 수요 분석',
        organizer: '철도경영정책 연구소',
        tags: ['lab', '학부생'],
      },
      {
        when: ' 19.9.16 - 19.11.30',
        title: 'DevelUp (데벨업)',
        organizer: '구름 (Goorm)',
        tags: ['activiy'],
      },
      {
        when: '19.08.12 ~ 19.09.11',
        title: '블로키TF팀 FE 인턴',
        organizer: '데이블 (Dable)',
        tags: ['company', 'intern'],
      },
    ],
    [],
  );
  return (
    <section>
      <div className="subtitle">
        <h3 className="subtitle__h3">Timestamp</h3>
      </div>
      <div className="timestamp-container">
        {timestamps.map(({ when, title, organizer, tags }) => (
          <div className="timestamp" key={when}>
            <div className="timestamp__main">
              <div className="when">{when}</div>
              <div className="title">{title}</div>
            </div>
            <div className="timestamp__details">
              <div className="organizer">{organizer}</div>
              {tags.map((tag) => (
                <div className="tags" key={tag}>
                  {tag}
                </div>
              ))}
            </div>
            <div className="timestamp__description"></div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Timestamp;

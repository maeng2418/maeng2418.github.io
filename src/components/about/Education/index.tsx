import React, { useMemo } from 'react';
import './index.scss';

const Education: React.FC = () => {
  const educations = useMemo(
    () => [
      {
        term: '2015.03 - 2021.02',
        title: '서울과학기술대학교 (SEOULTECH)',
        description: '컴퓨터공학과 학사',
      },
      {
        term: '2011.03 - 2014.02',
        title: '공주한일고등학교 (HANIL HIGH SCHOOL)',
        description: '인문계(이과)',
      },
    ],
    [],
  );
  return (
    <section>
      <div className="subtitle">
        <h3 className="subtitle__h3">Education</h3>
      </div>
      <div className="education-container">
        {educations.map(({ term, title, description }) => (
          <div className="education">
            <div className="item__details">
              <div className="term">{`[${term}]`}</div>
              <div className="title">{title}</div>
              <div className="description">{description}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Education;

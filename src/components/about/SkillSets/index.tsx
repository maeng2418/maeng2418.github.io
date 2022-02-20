import React, { useMemo } from 'react';
import './index.scss';

const SkillSets: React.FC = () => {
  const skillSet = useMemo(
    () => [
      {
        category: 'Front End Skills',
        skills: [
          'Typescript',
          'Javascript',
          'HTML/CSS',
          'ReactJS',
          'NextJS',
          'Emotion',
          'Styeld Components',
          'Storybook',
        ],
      },
      {
        category: 'Back End Skills',
        skills: ['NodeJS', 'NextJS', 'MySQL', 'MongoDB'],
      },
      {
        category: 'Collaboration Skills',
        skills: ['Git/Github', 'Notion', 'Slack', 'Jira'],
      },
      {
        category: 'Deploy Skills',
        skills: ['Netlify', 'Docker', 'AWS EC2', 'AWS Pipeline', 'AWS ECS', 'Github Action'],
      },
      {
        category: 'Etc...',
        skills: ['Figma', 'Firebase'],
      },
    ],
    [],
  );
  return (
    <section>
      <div className="subtitle">
        <h3 className="subtitle__h3">Skill Sets</h3>
      </div>
      <div className="skill-sets-container">
        {skillSet.map(({ category, skills }) => (
          <div className="skill-set" key={category}>
            <div className="category">{category}</div>
            <div className="items">
              {skills.map((skill) => (
                <div className="item" key={skill}>
                  <span className="skill">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SkillSets;

import React from 'react';
import AboutMe from './AboutMe';
import Education from './Education';
import Experience from './Experience';
import Footer from './Footer';
import './index.scss';
import Projects from './Projects';
import SkillSets from './SkillSets';
import Timestamp from './Timestamp';

const About: React.FC = () => {
  return (
    <>
      <main className="about">
        <div className="title">
          <h1 className="title__h1">{`{ Portfolio }`}</h1>
        </div>
        <AboutMe />
        <SkillSets />
        <Projects />
        <Timestamp />
        <Experience />
        <Education />
      </main>
      <Footer />
    </>
  );
};

export default About;

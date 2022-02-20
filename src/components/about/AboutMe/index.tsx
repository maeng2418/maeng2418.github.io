import { graphql, StaticQuery } from 'gatsby';
import React, { forwardRef } from 'react';
import './index.scss';

const AboutMe = forwardRef<HTMLDivElement>((_props, ref) => {
  return (
    <StaticQuery
      query={aboutQuery}
      render={(data) => {
        const { siteUrl, name, social } = data.site.siteMetadata;
        return (
          <section ref={ref}>
            <div className="subtitle">
              <h3 className="subtitle__h3">About Me</h3>
            </div>
            <div className="about-me-container">
              <div className="personal-infos">
                <div className="profile-image">
                  <img className="author-image" src="/profile.gif" alt="프로필 이미지" />
                </div>
                <div className="detail-wrapper">
                  <div className="details">
                    <span className="name">{name}</span>
                    <div className="detail flex">
                      <span className="category">Email</span>
                      <a id="email" href={`mailto:${social.email}`}>
                        {social.email}
                      </a>
                    </div>
                    <div className="detail flex">
                      <span className="category">Github</span>
                      <a
                        href={`https://github.com/${social.github}`}
                      >{`https://github.com/${social.github}`}</a>
                    </div>
                    <div className="detail flex">
                      <span className="category">Blog</span>
                      <a href={siteUrl}>{siteUrl}</a>
                    </div>
                    <div className="detail flex">
                      <span className="category">LinkedIn</span>
                      <a href={`https://www.linkedin.com/in/${social.linkedin}`}>
                        {`https://www.linkedin.com`}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="introduce">
                <div className="subtitle">Let me Introduce myself</div>
                <div className="about">
                  <h1>안녕하세요!</h1>
                  <h1>새로운 아이디어와 가치를 창출하는</h1>
                  <h1>
                    <strong>{`프론트엔드 개발자, ${name}입니다!`}</strong>
                  </h1>
                  <br />
                  <h2>저는,</h2>
                  <h2>
                    - <b className="boldred">동료와 함께 성장하는</b>,
                  </h2>
                  <ul>
                    <li>동료들과 지식과 경험을 나누며 함께 성장하는 것을 즐깁니다.</li>
                  </ul>
                  <h2>
                    - <b className="boldgreen">새로운 기술에 끊임없이 도전</b>하며{' '}
                    <b className="boldgreen">즐겁게 노력하며 성장</b>하는,
                  </h2>
                  <ul>
                    <li>문제를 해결함에 있어 새로운 것을 도전하는 것을 두려워하지 않습니다.</li>
                  </ul>
                  <h2>
                    - <b className="boldblue">사람들에게 가치를 줄 수 있는 코드</b>를 만드는
                    사람입니다.
                  </h2>
                  <ul>
                    <li>제가 가진 기술로, 어떤 가치를 만들어낼 수 있는지 끊임없이 고민합니다.</li>
                  </ul>
                  <br />
                  <br />
                  <h2>My Tech Skills are..</h2>
                  <br />
                  <p>
                    <code>React.js</code>, <code>Next.js</code>, <code>Typescript</code>,{' '}
                    <code>Javascript</code>, <code>HTML/CSS(SASS)</code>,{' '}
                    <code>StyledComponent</code> 를 활용해 프론트엔드 개발을 하고 있습니다.
                  </p>
                  <ul>
                    <li>
                      <strong>React.JS</strong>을 통해 SPA을 개발할 수 있습니다.
                    </li>
                    <li>
                      <strong>Next.JS</strong>을 통해 SSR 개발할 수 있습니다.
                    </li>
                    <li>
                      <strong>디자인시스템</strong>을 개발한 경험이 있습니다.
                    </li>
                    <li>
                      <strong>Webpack, Babel, ES6</strong> 등에 익숙합니다.
                    </li>
                    <li>
                      <strong>Storybook</strong>을 활용한 UI 컴포넌트 테스트 경험이 있습니다.
                    </li>
                    <li>
                      <strong>테스트 코드 및 배포 자동화(CI/CD)</strong>을 통해 생산성을 향상하고자
                      노력합니다.
                    </li>
                    <li>
                      <strong>성능 및 리소스 최적화</strong>을 위해 노력합니다.
                    </li>
                  </ul>
                  <br />
                  <br />
                  <h2>My Soft Skills are..</h2>
                  <br />
                  <ul>
                    <li>
                      프로젝트를 통한 다양한 협업 경험이 있어 다양한 분야의 사람들과{' '}
                      <strong>유연한 커뮤니케이션</strong>이 가능합니다.
                    </li>
                    <li>
                      항상 <strong>긍정적인 생각</strong>을 가지고 문제를 <strong>해결</strong>
                      하려고 노력합니다. 따라서 어떤 문제상황이 닥친다 하더라도 포기하지 않고 문제를
                      해결하기 위해 노력합니다.
                    </li>
                    <li>
                      어떤 요구사항이 주어지더라도,{' '}
                      <strong>주어진 Task를 시간 내에 완성하기 위해 끊임없이 노력</strong>합니다.
                    </li>
                    <li>
                      <strong>코드 리뷰</strong>를 통해 동료들과 함께 지식과 경험을 공유하고
                      피드백을 주고 받으며 서비스를 점진적으로 발전시킬 수 있습니다.
                    </li>
                    <li>
                      <strong>새로운 아이디어</strong>를 통해 의미있는 가치를 창출할 수 있습니다.
                    </li>
                    <li>
                      <strong>커뮤니티와 오픈소스</strong>에 관심이 많습니다. 다양한 사람들과
                      소통하는 것을 즐깁니다.
                    </li>
                  </ul>
                  <br />
                  <br />
                  <h2>My Design Skills are..</h2>
                  <br />
                  <ul>
                    <li>
                      <strong>UI/UX</strong>에 관심이 많으며, 완벽한 사용자 경험을 위해 지속적으로
                      고민하고 또 노력합니다.
                    </li>
                    <li>
                      Figma를 활용해 <strong>디자인시스템</strong>을 직접 만들어본 경험이 있습니다.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        );
      }}
    />
  );
});
const aboutQuery = graphql`
  query AboutQuery {
    site {
      siteMetadata {
        name
        siteUrl
        social {
          github
          facebook
          linkedin
          instagram
          email
        }
      }
    }
  }
`;

export default AboutMe;

import React from 'react';
import './index.scss';

const About: React.FC = () => {
  return (
    <div>
      <div className="title">
        <h1 className="title__h1">{`{ ddongule }`}</h1>
      </div>
      <div className="subtitle">
        <h3 className="subtitle__h3">About Me</h3>
      </div>
      <div className="about-me-container">
        <div className="personal-infos">
          <div className="profile-image">
            <img src="../assets/images/me.gif" alt="강민경의 사진" />
          </div>
          <div className="detail-wrapper">
            <div className="details">
              <span className="name">강민경</span>
              <div className="detail flex">
                <span className="category">Email</span>
                <div id="email">mnk918p@gmail.com</div>
              </div>
              <div className="detail flex">
                <span className="category">Github</span>
                <a href="https://github.com/ddongule">https://github.com/ddongule</a>
              </div>
              <div className="detail flex">
                <span className="category">Blog</span>
                <a href="https://mingule.tistory.com/">https://mingule.tistory.com/</a>
              </div>
              <div className="detail flex">
                <span className="category">LinkedIn</span>
                <a href="https://www.linkedin.com/in/minkyung-kang/">
                  https://www.linkedin.com/in/minkyung-kang/
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="introduce">
          <div className="subtitle">Let me Introduce myself</div>
          <div className="about">
            <h1>반갑습니다!</h1>
            <h1>기술을 통해 행복을 만드는</h1>
            <h1>
              <strong>웹 프론트엔드 개발자, 강민경입니다!</strong>
            </h1>
            <br />
            <h2>저는,</h2>
            <h2>
              - <b className="boldred">함께 할 때 더 빛나는</b>,
            </h2>
            <ul>
              <li>동료들과 지식을 나누며 함께 성장하는 것을 즐깁니다.</li>
            </ul>
            <h2>
              - <b className="boldgreen">새로움에 도전</b>하며{' '}
              <b className="boldgreen">즐겁게 노력</b>하는,
            </h2>
            <ul>
              <li>문제를 해결함에 있어 새로운 것을 도전하는 것을 두려워하지 않습니다.</li>
            </ul>
            <h2>
              - <b className="boldblue">사람들에게 가치를 줄 수 있는 코드</b>를 만드는 사람입니다.
            </h2>
            <ul>
              <li>제가 가진 기술로, 어떤 가치를 만들어낼 수 있는지 끊임없이 고민합니다.</li>
            </ul>
            <br />
            <br />
            <h2>My Tech Skills are..</h2>
            <br />
            <p>
              <code>React.js</code>, <code>HTML/CSS(SASS)</code>, <code>Javascript</code> 를 활용해
              프론트엔드 개발을 하고 있습니다.
            </p>
            <ul>
              <li>
                <strong>Semantic Markup</strong>을 통해 웹 표준을 지키려고 노력합니다.
              </li>
            </ul>
            <ul>
              <li>
                <strong>반응형 웹</strong>을 고려한 UI를 개발할 수 있습니다.
              </li>
            </ul>
            <ul>
              <li>
                <strong>ECMAScript6 문법</strong>에 익숙합니다.
              </li>
            </ul>
            <ul>
              <li>
                <strong>Webpack</strong>과 같은 Module Bundler를 사용할 수 있습니다.
              </li>
            </ul>
            <ul>
              <li>
                Storybook을 활용한 Unit Test, Cypress를 활용한 E2E Test를 활용한 경험이 있습니다.
              </li>
            </ul>
            <ul>
              <li>
                프로젝트에 알맞은 성능 최적화 기준을 세우고, 최적화를 주도적으로 진행할 수 있습니다.
              </li>
            </ul>
            <br />
            <br />
            <h2>My Soft Skills are..</h2>
            <br />
            <ul>
              <li>
                페어 프로그래밍 경험을 통해 <strong>협업의 가치</strong>를 잘 알고 있습니다.
              </li>
              <li>
                프로젝트를 통한 다양한 협업 경험이 있어 다양한 분야의 사람들과{' '}
                <strong>조화롭게 소통</strong>이 가능합니다.
              </li>
              <li>
                항상 <strong>열린 마음</strong>을 가지고 모두가 이해할 수 있는 언어로{' '}
                <strong>대화</strong>하려고 노력합니다. 그렇기에 어떤 문제상황이 닥친다 하더라도
                함께 문제를 정의하고 해결해 나갈 수 있습니다.
              </li>
              <li>
                어떤 요구사항이 주어지더라도,{' '}
                <strong>주어진 Task를 시간 내에 완성하기 위해 끊임없이 노력</strong>합니다.
              </li>
              <li>
                <strong>생각을 행동으로</strong>, <strong>행동을 가치로</strong> 만드는 것을
                즐깁니다. 단 한 명의 사용자만이 있더라도, 그 가치가 있다면 뚝딱뚝딱 만들어냅니다.
              </li>
              <li>
                <strong>코드 리뷰</strong>를 좋아합니다. 함께 의견을 나누는 과정을 통해 서비스가
                점진적으로 발전해 나간다고 생각합니다. 이러한 아름다운 과정을 위해 의견을 적극적으로
                제시하는 것을 주저하지 않습니다.
              </li>
              <li>
                <strong>톡톡 튀는 아이디어</strong>로 다른 사람들에게 영감을 줍니다.
              </li>
              <li>
                <strong>Community와 Open Source</strong>에 관심이 많습니다. 많은 사람들을 만나고
                경험을 나누며 이야기하는 것을 즐깁니다.
              </li>
            </ul>
            <br />
            <br />
            <h2>My Design Skills are..</h2>
            <br />
            <p>
              <code>Figma</code>, <code>Adobe XD</code>, <code>Photoshop</code> 등의 도구를 활용해
              필요한 부분에 빠르게 적용할 수 있습니다.
            </p>
            <ul>
              <li>
                <strong>사용자를 위한 디자인</strong>에 관심이 많으며, 완벽한 사용자 경험을 위해
                지속적으로 고민하고 또 노력합니다.
              </li>
            </ul>
            <ul>
              <li>
                프로젝트에 알맞은 <strong>UI를 직접 디자인하고, 프로젝트에 적용</strong>할 수
                있습니다.
              </li>
            </ul>
            <ul>
              <li>
                필요하다면 프로젝트를 위한 <strong>로고나 아이콘</strong> 등을 직접 만들어 사용할 수
                있습니다.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="subtitle">
        <h3 className="subtitle__h3">Skill Sets</h3>
      </div>
      <div className="skill-sets-container">
        <div className="description">
          <div className="description-item">
            <span className="level expert">4 - 5</span>: 많이 사용해보았으며 자신이 있는 기술
          </div>
          <div className="description-item">
            <span className="level">3</span>: 어느 정도 프로젝트에 적용할 수 있는 기술
          </div>
          <div className="description-item">
            <span className="level">1 - 2</span>: 현재 관심이 있어 입문 수준인 기술
          </div>
        </div>
        <div className="skill-set">
          <div className="category">Front End Skills</div>
          <div className="items">
            <div className="item">
              <span className="skill">Javascript</span>
              <span className="level expert">4</span>
            </div>
            <div className="item">
              <span className="skill">HTML/CSS(SASS)</span>
              <span className="level expert">4</span>
            </div>
            <div className="item">
              <span className="skill">React</span>
              <span className="level expert">4</span>
            </div>
            <div className="item">
              <span className="skill">Styled Components</span>
              <span className="level false">3</span>
            </div>
          </div>
        </div>
        <div className="skill-set">
          <div className="category">Back End Skills</div>
          <div className="items">
            <div className="item">
              <span className="skill">Python</span>
              <span className="level expert">4</span>
            </div>
            <div className="item">
              <span className="skill">Django</span>
              <span className="level false">3</span>
            </div>
            <div className="item">
              <span className="skill">Django-Rest-Framework</span>
              <span className="level false">3</span>
            </div>
          </div>
        </div>
        <div className="skill-set">
          <div className="category">Collaboration Skills</div>
          <div className="items">
            <div className="item">
              <span className="skill">Git/Github</span>
            </div>
            <div className="item">
              <span className="skill">Notion</span>
            </div>
            <div className="item">
              <span className="skill">Slack</span>
            </div>
          </div>
        </div>
        <div className="skill-set">
          <div className="category">Deploy Skills</div>
          <div className="items">
            <div className="item">
              <span className="skill">Netlify</span>
            </div>
            <div className="item">
              <span className="skill">Heroku</span>
            </div>
            <div className="item">
              <span className="skill">Pythonanywhere</span>
            </div>
            <div className="item">
              <span className="skill">AWS S3/Cloudfront</span>
            </div>
          </div>
        </div>
        <div className="skill-set">
          <div className="category">Etc...</div>
          <div className="items">
            <div className="item">
              <span className="skill">Keynote</span>
            </div>
            <div className="item">
              <span className="skill">Figma</span>
            </div>
            <div className="item">
              <span className="skill">Photoshop</span>
            </div>
            <div className="item">
              <span className="skill">Adobe XD</span>
            </div>
          </div>
        </div>
      </div>
      <div className="subtitle">
        <h3 className="subtitle__h3">Projects</h3>
      </div>
      <div className="projects-container">
        <div className="project">
          <a
            className="project__details"
            href="https://babble.gg"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="item__image">
              <img
                src="https://w.namu.la/s/3e07bd52160793373d4ef45df8833485d0ec97e2e38808734339494bc804a238289ad9e541f15ef5f7e3d7b620f5e2a57dddd59820f6ed3af937d0cd53fa29b8a13f6a290078fd2cae00d163b0f36159"
                alt="[팀] 관심사 기반 빠른 게임 팀 매칭 서비스, Babble logo 이미지"
              />
            </div>
            <div className="item__details">
              <div className="title">
                [팀] 관심사 기반 빠른 게임 팀 매칭 서비스, Babble{' '}
                <span className="term">(21.07.23 v1.0.0)</span>
              </div>
              <div className="description">
                우아한 테크코스 레벨3 팀 프로젝트로, 게임을 같이 할 사람이 없는 사람들을 위해 태그를
                기반으로 빠르게 팀을 매칭해 줄 수 있는 사이트를 만들었습니다.
              </div>
              <div className="attribution">프로젝트 디자인, 프론트엔드 개발을 맡았습니다. </div>
              <div className="tags">
                <div className="tag">React</div>
                <div className="tag">Javascript</div>
                <div className="tag">SCSS</div>
                <div className="tag">Storybook</div>
                <div className="tag">Cypress</div>
                <div className="tag">Webpack</div>
                <div className="tag">Babel</div>
                <div className="tag">WebSocket</div>
                <div className="tag">AWS S3, Cloudfront</div>
              </div>
            </div>
          </a>
          <div className="project__links">
            <a href="https://github.com/woowacourse-teams/2021-babble">
              <div className="github-logo"></div>
            </a>
          </div>
        </div>
        <div className="project">
          <a
            className="project__details"
            href=" https://610e2c3380568900398f148d-ulwliiyqae.chromatic.com/?path=/story/chunks-chatbox--default"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="item__image">
              <img
                src="https://w.namu.la/s/3e07bd52160793373d4ef45df8833485d0ec97e2e38808734339494bc804a238289ad9e541f15ef5f7e3d7b620f5e2a57dddd59820f6ed3af937d0cd53fa29b8a13f6a290078fd2cae00d163b0f36159"
                alt="[팀] Babble Design Guide logo 이미지"
              />
            </div>
            <div className="item__details">
              <div className="title">
                [팀] Babble Design Guide <span className="term">(21.07.23 v1.0.0)</span>
              </div>
              <div className="description">
                우아한 테크코스 레벨3 팀 프로젝트 Babble의 자체적인 Design Guide 입니다.
              </div>
              <div className="attribution">프로젝트 디자인, 프론트엔드 개발을 맡았습니다. </div>
              <div className="tags">
                <div className="tag">Storybook</div>
                <div className="tag">Chromatic</div>
              </div>
            </div>
          </a>
          <div className="project__links">
            <a href="https://github.com/woowacourse-teams/2021-babble">
              <div className="github-logo"></div>
            </a>
          </div>
        </div>
        <div className="project">
          <a className="project__details" href="" target="_blank" rel="noopener noreferrer">
            <div className="item__image">
              <img
                src="https://w.namu.la/s/3e07bd52160793373d4ef45df8833485d0ec97e2e38808734339494bc804a238289ad9e541f15ef5f7e3d7b620f5e2a57dddd59820f6ed3af937d0cd53fa29b8a13f6a290078fd2cae00d163b0f36159"
                alt="[개인 &amp; Open Source] Simple 포트폴리오 Boilerplate logo 이미지"
              />
            </div>
            <div className="item__details">
              <div className="title">
                [개인 &amp; Open Source] Simple 포트폴리오 Boilerplate{' '}
                <span className="term">(21.06.25 v1.0.0)</span>
              </div>
              <div className="description">
                지금! 보고계신 이 사이트도 이 Boilerplate로 만들어졌습니다. 제 포트폴리오 사이트를
                만들면서 다른 사람들도 편하게 포트폴리오를 만들 수 있게 하고 싶어 만들어 본
                Boilerplate 입니다. 간단히 db.json, markDown파일만 수정하면 쉽게 나만의 포트폴리오를
                만들 수 있습니다. 오픈소스 프로젝트로 기획했습니다.
              </div>
              <div className="attribution">
                사용자가 원하는 환경에 맞추어 사이트를 볼 수 있도록 dark/light 모드를 지원합니다.
                또, 다양한 언어를 지원해 보다 글로벌한 포트폴리오를 만들 수 있습니다.
              </div>
              <div className="tags">
                <div className="tag">React</div>
                <div className="tag">Javascript</div>
                <div className="tag">CRA</div>
                <div className="tag">React-transition-group</div>
                <div className="tag">SCSS</div>
                <div className="tag">Netlify</div>
              </div>
            </div>
          </a>
          <div className="project__links">
            <a href="https://github.com/ddongule/ddongule-simple-portfolio">
              <div className="github-logo"></div>
            </a>
          </div>
        </div>
        <div className="project">
          <a
            className="project__details"
            href="https://stockulator.ddongule.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="item__image">
              <img
                src="https://w.namu.la/s/3e07bd52160793373d4ef45df8833485d0ec97e2e38808734339494bc804a238289ad9e541f15ef5f7e3d7b620f5e2a57dddd59820f6ed3af937d0cd53fa29b8a13f6a290078fd2cae00d163b0f36159"
                alt="[개인] Stockulator logo 이미지"
              />
            </div>
            <div className="item__details">
              <div className="title">
                [개인] Stockulator <span className="term">(21.06.21 v1.0.0)</span>
              </div>
              <div className="description">
                주식 평균 단가를 매번 계산하기 귀찮아하시는 어머니를 위해 만든 웹입니다. 실시간 주식
                가격을 검색할 수 있습니다. 또한 현재 가진 주식의 가격과 개수 그리고 사고싶은 주식의
                개수를 입력하면 평균 단가가 어떻게 바뀌는지 알려줍니다.
              </div>
              <div className="attribution">
                Express.js로 Yahoo 증권의 실시간 주식 가격을 API를 통해 가져오는 서버를 만들었고,
                가져온 주식 가격을 계산해 평균 단가를 보여줍니다.
              </div>
              <div className="tags">
                <div className="tag">React</div>
                <div className="tag">Javascript</div>
                <div className="tag">Express.js</div>
                <div className="tag">SCSS</div>
                <div className="tag">Snowpack</div>
                <div className="tag">Netlify</div>
              </div>
            </div>
          </a>
          <div className="project__links">
            <a href="https://github.com/ddongule/stockulator">
              <div className="github-logo"></div>
            </a>
          </div>
        </div>
      </div>
      <div className="subtitle">
        <h3 className="subtitle__h3">Timestamp</h3>
      </div>
      <div className="timestamp-container">
        <div className="timestamp">
          <div className="timestamp__main">
            <div className="when">21.02.01 - 현재</div>
            <div className="title">2021 우아한 테크코스 3기 FE 참여</div>
          </div>
          <div className="timestamp__details">
            <div className="organizer">우아한 형제들</div>
            <div className="tags">woowatechcourse</div>
          </div>
          <div className="timestamp__description"></div>
        </div>
        <div className="timestamp">
          <div className="timestamp__main">
            <div className="when">20.08.25</div>
            <div className="title">중앙대학교 응용통계학과 졸업</div>
          </div>
          <div className="timestamp__details">
            <div className="organizer">중앙대학교(CAU)</div>
            <div className="tags">graduation</div>
          </div>
          <div className="timestamp__description"></div>
        </div>
        <div className="timestamp">
          <div className="timestamp__main">
            <div className="when">18.11.01 - 21.03.05</div>
            <div className="title">매일경제 인턴 및 연구원</div>
          </div>
          <div className="timestamp__details">
            <div className="organizer">매일경제 신문사</div>
            <div className="tags">company</div>
          </div>
          <div className="timestamp__description"></div>
        </div>
        <div className="timestamp">
          <div className="timestamp__main">
            <div className="when">19.12.19</div>
            <div className="title">디지털 리더스 어워즈 우수상</div>
          </div>
          <div className="timestamp__details">
            <div className="organizer">한국 정보화 진흥원</div>
            <div className="tags">awards</div>
          </div>
          <div className="timestamp__description"></div>
        </div>
        <div className="timestamp">
          <div className="timestamp__main">
            <div className="when">18.11.03</div>
            <div className="title">{`다빈치 SW 메이커 페스티벌
            한국공간정보통신 CEO 최우수상`}</div>
          </div>
          <div className="timestamp__details">
            <div className="organizer">중앙대학교 다빈치 SW 교육원</div>
            <div className="tags">awards</div>
          </div>
          <div className="timestamp__description"></div>
        </div>
        <div className="timestamp">
          <div className="timestamp__main">
            <div className="when">18.02.12</div>
            <div className="title">
              {`중앙대학교 iOS 기반 App개발 특성화 캠프
              최종 프로젝트 장려상`}
            </div>
          </div>
          <div className="timestamp__details">
            <div className="organizer">중앙대학교 Link 사업단</div>
            <div className="tags">awards</div>
          </div>
          <div className="timestamp__description"></div>
        </div>
      </div>
      <div className="subtitle">
        <h3 className="subtitle__h3">Experiences</h3>
      </div>
      <div className="experience-container">
        <a href="https://woowacourse.github.io/" target="_blank" rel="noopener noreferrer">
          <div className="experience">
            <div className="item__image">
              <img
                src="https://w.namu.la/s/3e07bd52160793373d4ef45df8833485d0ec97e2e38808734339494bc804a238289ad9e541f15ef5f7e3d7b620f5e2a57dddd59820f6ed3af937d0cd53fa29b8a13f6a290078fd2cae00d163b0f36159"
                alt="우아한 테크코스 logo 이미지"
              />
            </div>
            <div className="item__details">
              <div className="title">
                우아한 테크코스 <span className="term">(21.02 - 현재 진행 중)</span>
              </div>
              <div className="description">
                우아한테크코스는 우아한 형제들에서 운영하는 웹 개발 교육과정입니다. 현장 역량을 키워
                재교육 없이 현장의 업무를 바로 시작할 수 있고, 다른 사람들과 소통하고 협업할 수 있는
                자기주도적인 개발자를 양성합니다. 여러 미션들이 주어지고, 크루들과 페어프로그래밍,
                협업 등을 배우며 웹 개발자의 역량을 키워나갑니다. 단순히 개발 능력 뿐만아니라
                구성원과의 Soft Skill 또한 배웁니다.
              </div>
            </div>
          </div>
        </a>
        <a href="https://woowacourse.github.io/" target="_blank" rel="noopener noreferrer">
          <div className="experience">
            <div className="item__image">
              <img
                src="https://w.namu.la/s/3e07bd52160793373d4ef45df8833485d0ec97e2e38808734339494bc804a238289ad9e541f15ef5f7e3d7b620f5e2a57dddd59820f6ed3af937d0cd53fa29b8a13f6a290078fd2cae00d163b0f36159"
                alt="우아한 테크코스 logo 이미지"
              />
            </div>
            <div className="item__details">
              <div className="title">
                우아한 테크코스 <span className="term">(21.02 - 현재 진행 중)</span>
              </div>
              <div className="description">
                우아한테크코스는 우아한 형제들에서 운영하는 웹 개발 교육과정입니다. 현장 역량을 키워
                재교육 없이 현장의 업무를 바로 시작할 수 있고, 다른 사람들과 소통하고 협업할 수 있는
                자기주도적인 개발자를 양성합니다. 여러 미션들이 주어지고, 크루들과 페어프로그래밍,
                협업 등을 배우며 웹 개발자의 역량을 키워나갑니다. 단순히 개발 능력 뿐만아니라
                구성원과의 Soft Skill 또한 배웁니다.
              </div>
            </div>
          </div>
        </a>
        <a href="https://woowacourse.github.io/" target="_blank" rel="noopener noreferrer">
          <div className="experience">
            <div className="item__image">
              <img
                src="https://w.namu.la/s/3e07bd52160793373d4ef45df8833485d0ec97e2e38808734339494bc804a238289ad9e541f15ef5f7e3d7b620f5e2a57dddd59820f6ed3af937d0cd53fa29b8a13f6a290078fd2cae00d163b0f36159"
                alt="우아한 테크코스 logo 이미지"
              />
            </div>
            <div className="item__details">
              <div className="title">
                우아한 테크코스 <span className="term">(21.02 - 현재 진행 중)</span>
              </div>
              <div className="description">
                우아한테크코스는 우아한 형제들에서 운영하는 웹 개발 교육과정입니다. 현장 역량을 키워
                재교육 없이 현장의 업무를 바로 시작할 수 있고, 다른 사람들과 소통하고 협업할 수 있는
                자기주도적인 개발자를 양성합니다. 여러 미션들이 주어지고, 크루들과 페어프로그래밍,
                협업 등을 배우며 웹 개발자의 역량을 키워나갑니다. 단순히 개발 능력 뿐만아니라
                구성원과의 Soft Skill 또한 배웁니다.
              </div>
            </div>
          </div>
        </a>
        <a href="https://woowacourse.github.io/" target="_blank" rel="noopener noreferrer">
          <div className="experience">
            <div className="item__image">
              <img
                src="https://w.namu.la/s/3e07bd52160793373d4ef45df8833485d0ec97e2e38808734339494bc804a238289ad9e541f15ef5f7e3d7b620f5e2a57dddd59820f6ed3af937d0cd53fa29b8a13f6a290078fd2cae00d163b0f36159"
                alt="우아한 테크코스 logo 이미지"
              />
            </div>
            <div className="item__details">
              <div className="title">
                우아한 테크코스 <span className="term">(21.02 - 현재 진행 중)</span>
              </div>
              <div className="description">
                우아한테크코스는 우아한 형제들에서 운영하는 웹 개발 교육과정입니다. 현장 역량을 키워
                재교육 없이 현장의 업무를 바로 시작할 수 있고, 다른 사람들과 소통하고 협업할 수 있는
                자기주도적인 개발자를 양성합니다. 여러 미션들이 주어지고, 크루들과 페어프로그래밍,
                협업 등을 배우며 웹 개발자의 역량을 키워나갑니다. 단순히 개발 능력 뿐만아니라
                구성원과의 Soft Skill 또한 배웁니다.
              </div>
            </div>
          </div>
        </a>
      </div>
      <div className="subtitle">
        <h3 className="subtitle__h3">Education</h3>
      </div>
      <div className="education-container">
        <div className="education">
          <div className="item__details">
            <div className="term">[2015.03 - 2020.08]</div>
            <div className="title">중앙대학교 (Chung-Ang University)</div>
            <div className="description">응용통계학과 학사 졸업</div>
          </div>
        </div>
        <div className="education">
          <div className="item__details">
            <div className="term">[2010.03 - 2013.02]</div>
            <div className="title">과천 외국어고등학교(Gwacheon Foreign Language HighSchool)</div>
            <div className="description">영어과 졸업</div>
          </div>
        </div>
      </div>
      <div className="footer-container">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/ddongule/ddongule-simple-portfolio"
        >
          <p className="footer-contents">
            <span className="icon">© 2021</span> ddongule-simple-portfolio
          </p>
        </a>
      </div>
    </div>
  );
};

export default About;

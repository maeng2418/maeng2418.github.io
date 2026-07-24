---
title: 'AWS ECS와 CodePipeline'
date: 2022-03-10 09:25:00
category: 'Development'
thumbnail: '../../images/AWS.png'
draft: false
---

<aside>
💡 AWS의 ECS 그리고 AWS의 CodePipeline을 통해 CI / CD를 개선시켜보았다.

</aside>

## 들어가기 전에.

AWS ECS를 사용하기 전에 먼저 Docker에 대해 알아볼 필요가 있다.

**Docker**는 컨테이너에 기반해 애플리케이션을 구축하는 소프트웨어 플랫폼이다. 가상 머신처럼 독립된 실행환경을 만들어주는 것으로, 운영체제를 설치하 것과 유사한 효과를 낼 수 있지만, 실제 운영체제를 설치하지 않기 때문에 설치 용량이 적고 실행 속도 또한 빠르다. 예전에는 윈도에 VM Ware와 같은 가상 머신을 설치하였으나 최근에는 리눅스 계열에서 Docker가 그 역할을 대신하고 있다. Docker와 가상머신의 차이는 가상 머신은 **하드웨어** 스택을 가상화하지만 컨테이너는 이와 달리 **운영체제 수준**에서 가상화를 실시하여 다수의 컨테이너를 **OS 커널에서 직접 구동한다**. 컨테이너는 훨씬 가볍고 운영체제 커널을 공유하며, 시작이 훨씬 빠르고 운영체제 전체 부팅보다 메모리를 훨씬 적게 차지한다.

Amazon ECS는 Cloud 환경에 적용 가능한 Container Service로 OS를 포함하지 않아 가볍고, 빠른 배포, 빠른 기동이 가능한 컨테이너 오케스트레이션 서비스로, 이번 포스팅을 통해 Dockerfile을 생성하고, 이를 이미지로 빌드하여 ECR에 업로드하는 방법과 테스크를 작성해서 클러스트 컨테이너의 서비스를 실행시켜 배포하는 방법 그리고 코드 파이프라인 서비스를 이용하여 CI/CD를 구축하는 방법에 대해서 알아보도록 하자.

## 1. Dockerfile 작성

Docker 이미지를 만들기 위한 설정파일로, 컨테이너가 어떻게 행동해야 하는지에 대해 설정한다.

프로젝트는 Svelte에서 제공하는 기본 프로젝트로 Svelete 개발내용은 생략하도록 하겠다.

```jsx
FROM node:alpine as builder

# work dir 를 만들기
RUN mkdir -p /usr/src/app

# work dir 고정
WORKDIR /usr/src/app

# NPM 설치
ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY package*.json /usr/src/app/package.json
RUN npm install --silent

# 소스를 작업폴더로 복사하고 빌드
COPY . /usr/src/app
RUN npm run build

FROM nginx:alpine

# nginx의 기본 설정을 삭제
RUN rm -rf /etc/nginx/conf.d

# 앱의 nginx설정 파일을 아래 경로에 복사
COPY conf /etc/nginx

# 위에서 생성한 앱의 빌드산출물을 nginx의 샘플 앱이 사용하던 폴더로 이동
COPY --from=builder /usr/src/app/public /usr/share/nginx/html

# 80 포트 오픈
EXPOSE 80

# container 실행 시 자동으로 실행할 command. nginx 시작함
CMD ["nginx", "-g", "daemon off;"]
```

## 2. 이미지 빌드

Docker에서 이미지란, 서비스 운영에 필요한 `서버 프로그램`, `소스코드 및 라이브러리`, `컴파일된 실행 파일`
을 묶는 형태이다. 컨테이너 생성 및 실행에 필요한 모든 파일과 설정값(환경)을 지닌 것으로 더이상의 의존성 파일을 컴파일하거나 이것저것 설치할 필요 없는 상태의 파일을 의미한다.

`$ docker build -t {IMGAE_TAG_NAME} {DOCKER_FILE_PATH}`

![Untitled](../../images/aws_ecs_code_pipeline_1.png)

**여기서 잠깐!** 만약 Mac을 이용하고 있다면??

조금있다 ECR에 빌드한 이미지를 업로드할 때 주의할 점이 하나 있다.

MAC m1 OS는 기본적으로 arm기반 아키텍처이기 때문에 m1 노트북으로 도커파일을 빌드하여 도커이미지를 생성하면 platform이 `linux/arm64`으로 생성된다. 하지만 일반적으로 amazonlinux OS를 사용하는 AWS EC2는 `linux/arm64`가 아닌 `linux/amd64` 이기 때문에 M1에서 빌드한 이미지를 EC2 에서 사용하려면 빌드 단계에서`--platform` 옵션으로 `linux/arm64`로 지정해주어야 한다.

이미지 빌드가 완료되면 Docker 대시보드의 이미지 메뉴에 다음과 같이 이미지가 생성되었음을 확인할 수 있다.

![Untitled](../../images/aws_ecs_code_pipeline_2.png)

이미지가 생성되었으니 정상적으로 컨테이너가 동작하는지 실행시켜보기 위해 다음 명령어를 입력한다.

`$ docker run -it -p {HOST_PORT}:{CONTAINER_PORT} {DOCKER_IMAGE}`

![Untitled](../../images/aws_ecs_code_pipeline_3.png)

정상적으로 컨테이너가 실행이 된다면, 대시보드에서도 해당 컨테이너가 실행 중임을 확인할 수 있다.

![Untitled](../../images/aws_ecs_code_pipeline_4.png)

설정한 포트로 접속하면 다음과 같이 정상적으로 프로그램이 동작함을 확인할 수 있다.

![Untitled](../../images/aws_ecs_code_pipeline_5.png)

이제 Docker 이미지를 성공적으로 생성했으니, 이미지를 AWS ECR에 업로드 해보자!

## 3. 환경 구축

### 3-1. VPC 생성

VPC 대시보드에서 `VPC 마법사`를 통해 VPC를 생성한다.

![Untitled](../../images/aws_ecs_code_pipeline_6.png)

### 3-2. 알아보기 쉽게 Subnet Name을 수정

![Untitled](../../images/aws_ecs_code_pipeline_7.png)

### 3-3. 라우팅 테이블에서 Public과 Private 둘로 묶어준다.

Public 서브넷들을 연결시켜 `public-rt`를 구성하고 Private 서브넷들을 연결시켜 `private-rt`를 구성한다.

![Untitled](../../images/aws_ecs_code_pipeline_8.png)

### 3-4. 인터넷 게이트웨이 생성하여 vpc에 연결

vpc 마법사를 통해 이미 생성되어있다면 넘어가도 좋다.

![Untitled](../../images/aws_ecs_code_pipeline_9.png)

### 3-5. public-rt에 인터넷 게이트웨이 추가

vpc 마법사를 통해 이미 생성되어있다면 넘어가도 좋다.

![Untitled](../../images/aws_ecs_code_pipeline_10.png)

### 3-6. ECS 컨테이너와 LoadBalance에 대한 보안 그룹을 생성

ECS 컨테이너를 생성할 때, 로드밸런서를 설정하기 때문에 로드 밸런서의 보안 그룹을 설정한다.

![Untitled](../../images/aws_ecs_code_pipeline_11.png)

ECS 컨테이너의 경우 Private Subnet에 배치하여 외부에서 접근하지 못하고 로드밸런서를 통해서 들어오도록 소스를 로드밸런서 보안 그룹으로 설정한다.

![Untitled](../../images/aws_ecs_code_pipeline_12.png)

### 3-7. NAT Gateway 생성

클러스터를 생성하고, EC2 인스턴스를 Private Subnet에 배치하기 위해 NAT Gateway를 통해 Private Subnet의 인스턴스가 인터넷에 연결되어야 하기 때문에 NAT Gateway를 Public Subnet에 배치한다.

![Untitled](../../images/aws_ecs_code_pipeline_13.png)

### 3-8. private-rt에 NAT 게이트웨이 추가

라우팅 테이블에서 `private-rt`의 라우팅 편집을 통해 NAT 게이트 웨이를 추가한다.

![Untitled](../../images/aws_ecs_code_pipeline_14.png)

## 4. ECR에 이미지 업로드

AWS ECS에서는 ECR이라는 프라이빗 도커 레지스트리 서비스를 제공하고 있다. 도커 레지스트리는 도커 이미지를 저장 및 관리하는 서비스로 이전에 생성했던 도커 이미지를 업로드 하기 위해 AWS 콘솔에 접속하여 ECR 레포지토리를 생성한다.

![Untitled](../../images/aws_ecs_code_pipeline_15.png)

![Untitled](../../images/aws_ecs_code_pipeline_16.png)

리포지토리를 생성하고나면 대시보드에서 `푸시 명령 보기` 를 참고해 좀 전에 만들었던 Docker 이미지를 해당 리포지토리로 업로드 할 수 있다.

![Untitled](../../images/aws_ecs_code_pipeline_17.png)

이미지 업로드가 성공적으로 완료되었다면 리포지토리에 이미지가 업로드된 것을 확인할 수 있다.

![Untitled](../../images/aws_ecs_code_pipeline_18.png)

## 5. 작업 정의

Task definition에서 작업 및 컨테이너가 참고할 이미지, 사용할 리소스 양, 시작 유형, 로깅 구성 등 다양한 매개변수를 정의할 수 있다.

![Untitled](../../images/aws_ecs_code_pipeline_19.png)

알맞은 유형을 선택하고 다음 단계로 넘어간다.

![Untitled](../../images/aws_ecs_code_pipeline_20.png)

테스크 정의 이름과 테스크 역할, 작업 메모리, 작업 CPU 단위 등을 입력하고 컨테이너 추가 버튼을 클릭한다.

![Untitled](../../images/aws_ecs_code_pipeline_21.png)

컨테이너 이름과 이미지 및 포트 매핑정보를 입력하고 추가를 클릭한다.

컨테이너 포트는 호스트 포트0, 컨테이너 포트80을 입력한다. 호스트 포트를 지정할 경우 각 호스트에서 테스크의 인스턴스화를 하나 이상 실행할 수 없다. 정적 포트 매핑이 단일 컨테이너 포트 80에만 매핑 할 수 있기 때문이다.

![Untitled](../../images/aws_ecs_code_pipeline_22.png)

## 6. 클러스터 생성

컨테이너 인스턴스들은 논리적인 그룹으로 묶이게 되는데 이 단위를 클러스터 라고 부른다. 작업을 배포하기 위한 인스턴스는 반드시 Cluster 에 등록되어야 한다.

![Untitled](../../images/aws_ecs_code_pipeline_23.png)

용도에 알맞은 템플릿을 선택하고 다음 단계로 넘어간다.

![Untitled](../../images/aws_ecs_code_pipeline_24.png)

서브넷은 private subnet을 선택하고, IP 할당은 비활성화를 선택한다. 보안 그룹은 ECS-Container를 선택한다.

![Untitled](../../images/aws_ecs_code_pipeline_25.png)

## 7. 서비스 생성

서비스를 통해 클러스터에서 실행하고 유지 관리할 작업 정의를 지정할 수 있다.

![Untitled](../../images/aws_ecs_code_pipeline_26.png)

작업 시작 유형과 작업 정의를 택하고 서비스 이름 및 배포 유형 등을 선택하고 다음단계로 넘어간다.

![Untitled](../../images/aws_ecs_code_pipeline_27.png)

Blue/Green Deployments는 무중단 배포의 한 방식으로 기존 버전과 새버전이 공존하는 Rolling Update와는 달리 아래 그림과 기존 버전과 새버전이 별도로 존재하는 배포 형태를 말한다. Blue/Green Deployments의 이점은 Rolling Update 대비 두가지 버전이 공존하면서 생기는 문제가 발생하지 않으며, 배포후에도 기존 버전이 일정시간 유지를 할 수 있어 새로운 버전의 배포가 문제가 있을 경우 더 빠른 Roll-back이 가능하다.

네트워크 구성을 설정한다. 만약 로드밸런서가 없다면 EC2콘솔에서 로드밸런서를 생성하도록 한다.

![Untitled](../../images/aws_ecs_code_pipeline_28.png)

로드밸런스 생성에 필요한 Target Group을 먼저 생성한다.

![Untitled](../../images/aws_ecs_code_pipeline_29.png)

![Untitled](../../images/aws_ecs_code_pipeline_30.png)

Application Load Balancer를 생성한다.

![Untitled](../../images/aws_ecs_code_pipeline_31.png)

VPC는 프로젝트-vpc를 선택하고 Subnet은 public subnet을 선택하고 보안 그룹은 ECS-ALB를 선택한다.

![Untitled](../../images/aws_ecs_code_pipeline_32.png)

다시 ECS 서비스 생성 페이지로 이동하여, 로드밸런서 부분에 새로고침 버튼을 누르면, 로드밸런서가 새로 생겼음을 확인할 수 있다.

![Untitled](../../images/aws_ecs_code_pipeline_33.png)

AWS CodeDeploy를 사용한 블루/그린 배포를 원활하게 하려면, 2개의 대상 그룹이 필요하므로 대상그룹을 추가 등록하고 서비스 생성을 완료한다.

![Untitled](../../images/aws_ecs_code_pipeline_34.png)

![Untitled](../../images/aws_ecs_code_pipeline_35.png)

서비스 생성을 완료하면 클러스터의 서비스에 작업 목록에 우리가 지정한 작업이 실행중인 것을 확인할 수 있다.

![Untitled](../../images/aws_ecs_code_pipeline_36.png)

이제 로드밸런서의 DNS로 접속해 보면 성공적으로 웹 페이지가 출력된다.

![Untitled](../../images/aws_ecs_code_pipeline_37.png)

## 8. 파이프라인 생성

이제 파이프라인 서비스를 통해 Github에 Commit이 올라오면 자동으로 빌드 및 배포가 되도록 해보자.

파이프라인 생성에 앞서 먼저, 프로젝트 루트 경로에 `buildspec.yml`, `appspec.yaml`, `taskdef.json`파일을 생성하고 GitHub에 푸쉬해둔다.

**buildspec.yml** 파일은 런타임에 소스 코드를 내려 받은 후 빌드하는 시점에 실행될 명령어 목록을 정의한 파일이다. `pre_build`, `build`, `post_build` 3단계에 걸쳐 실행될 명령어 목록을 작성해야 한다.

```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
  build:
    commands:
      - echo Build started on `date`
      - echo Building the Docker image...
      - docker build -t $IMAGE_REPO_NAME:$IMAGE_TAG . --no-cache
      - docker tag $IMAGE_REPO_NAME:$IMAGE_TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG
  post_build:
    commands:
      - echo Build completed on `date`
      - echo Pushing the Docker image...
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG
      - printf '[{"name":"%s","imageUri":"%s"}]' $CONTAINER_NAME $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:latest > imagedefinitions.json

artifacts:
  files:
    - imagedefinitions.json
    - taskdef.json
    - appspec.yaml
```

`artifacts`는 빌드의 결과로 생성된 파일 목록을 의미한다. `imagedefinitions.json`에는 빌드 완료 후 배포 대상이 되는 컨테이너의 정보를 보관하는데, 이 정보를 기반으로 **Amazon ECS** 서비스에 소속된 작업 정의를 개정하고, 서비스를 업데이트하는 과정을 자동으로 진행한다.

**appspec.yaml** 파일은 CodeDeploy에서 배포를 관리하는 데 사용한다.

```yaml
version: 0.0
Resources:
  - TargetService:
      Type: AWS::ECS::Service
      Properties:
        TaskDefinition: <TASK_DEFINITION>
        LoadBalancerInfo:
          ContainerName: 'docker-svelte-container'
          ContainerPort: 80
```

**taskdef.json** 파일은 작업정의 파일로, ECS의 작업정의에서 JSON 내용을 복사해서 파일로 생성한다.

![Untitled](../../images/aws_ecs_code_pipeline_38.png)

다시 AWS 콘솔로 되돌아와서 파이프라인을 생성하자.

![Untitled](../../images/aws_ecs_code_pipeline_39.png)

![Untitled](../../images/aws_ecs_code_pipeline_40.png)

소스 공급자로 `Github(버전 2)`를 선택하고 GitHub에 연결을 클릭한다.

![Untitled](../../images/aws_ecs_code_pipeline_41.png)

연결된 깃헙 주소를 입력하고 새 앱 설치를 클릭한다.

![Untitled](../../images/aws_ecs_code_pipeline_42.png)

원하는 레포지토리를 선택하고 Save한다.

![Untitled](../../images/aws_ecs_code_pipeline_43.png)

연결버튼을 눌러 GitHub 연결을 마무리한다.

![Untitled](../../images/aws_ecs_code_pipeline_44.png)

CodePipeline에 연결할 리포지토리 이름과 브랜치 이름도 입력하고 변경감지옵션에 체크한다.

![Untitled](../../images/aws_ecs_code_pipeline_45.png)

빌드 공급자로 AWS CodeBuild를 선택하고 프로젝트 생성버튼을 클릭한다.

![Untitled](../../images/aws_ecs_code_pipeline_46.png)

환경이미지는 관리형 이미지, 운영체제는 Ubuntu, 런타임은 Standard, 이미지는 Standard:5.0, 환경 유형은 Linux를 선ㅌ, 도커 이미지를 빌드하거나 빌드의 권한을 승격하기위해 권한이 있음에 체크한다. 서브넷은 NAT 게이트웨이가 포함되어 있는 Private Subnet을 선택해주고 VPC 검증을 해준다. 이후 buildspec.yml에서 필요로하는 환경변수들을 입력해준다. 빌드사양은 buildspec 파일 사용을 체크해준다.

![Untitled](../../images/aws_ecs_code_pipeline_47.png)

추가로, 서브모듈 풀링을 **SSH Key**를 이용하기 때문에 해당 파이프라인에 종속되어 생성된 코드 빌드 역할에 `AWSAppRunnerServicePolicyForECRAccess` 권한을 추가해주고, BuildSpec의 imagedefinitions.json이 S3에 업로드되기 때문에 `AmazonS3FullAccess` 권한을 CodeBuild 서비스 역할에 연결한다. 그리고, `EC2InstanceProfileForImageBuilderECRContainerBuilds`를 추가하여 이미지를 푸쉬할 수 있도록 한다.

![Untitled](../../images/aws_ecs_code_pipeline_48.png)

buildspec.yml에 사용할 환경변수를 추가해준다.

![Untitled](../../images/aws_ecs_code_pipeline_49.png)

배포 공급자로 Amazon ECS(Blue/Green)를 선택해주고 애플리케이션과 배포그룹을 선택해준다. 그리고 ECS 작업 정의와 AWS Code Deploy App Spec 파일로 BuildArtifact을 선택해준다.

![Untitled](../../images/aws_ecs_code_pipeline_50.png)

Source → Build → Deploy 과정을 성공적으로 마치면, 드디어 깃헙에 커밋푸쉬를 하면 자동으로 해당 프로젝트를 빌드하고 배포하는 코드파이프라인 세팅이 끝났다.

![Untitled](../../images/aws_ecs_code_pipeline_51.png)

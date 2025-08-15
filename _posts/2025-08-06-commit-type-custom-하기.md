> jekyll을 사용하다보면 조금 불편한 부분이 있다. <br>
그 중 하나가 commit message의 format을 강제하는 기능인데, 반드시 git commit -m 이후 메시지에 "feat:, docs:, fix:, chore:" 중 하나를 넣고 커밋을 해야한다. <br> 
이 설정을 수정하고 싶어서 방법을 찾아봤는데 생각보다 간단하고 유용하게 쓸 수 있어서 가져와보았다.

# commit message format이 강제되면 무엇이 좋을까?

우선 이렇게 포맷을 강제하는 이유부터 생각해보자. 규칙이 강제되는 메시지는 몇 가지 장점을 가질 수 있다. 

첫번째, 변경 이력에 대한 자동화가 가능하다. 규칙이 존재한다면 semantic-release 같은 도구를 사용했을 떄 버전업이나 CHANGELOG 등의 작성 시 유리해질 것이다. 

두번째, 팀 협업에서 커뮤니케이션 효율이 올라갈 것이다. 커밋 로그만 봐도 어떤 변경이 있었는지 파악이 가능하니 코드 확인을 하지 않아도 대략적인 맥락의 파악이 가능할 것이다.

세번째, 일관성이 유지되기 때문에 git log나 git blame을 봐도 깔끔하게 잘 정리되어 보일 것이다.

하지만 당연하게도 단점이 존재한다. 우리가 개인적인 프로젝트를 진행하는데 이런 방법을 사용하면 커밋할 때마다 수고를 들여야할 것이다. 거기에 강도가 너무 세다면, 그러니까 세부적인 변경 사항마다 사용할 메시지 규칙이 존재한다면 오히려 나중에 가서는 구분이 되지 않아 불편해질 것이다. 

우리가 하는 블로그는 당연하게도 개인 프로젝트이기 때문에 여러번 커밋하면서 많이 귀찮아질 수 있다. 그래서 커밋 메시지를 평소에도 규칙성있게 하는 사람들 빼고는 이 규칙을 해제하고 싶어할 것이다.

그러면 이 포맷은 어떤 패키지에 의해 강제되었던 걸까?

## commitlint와 Conventional Commits
바로 commitlint이다. 이 도구는 Git commit message가 일정한 형식을 따르도록 강제한다. <br>
주로 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)라는 표준 규칙을 기반으로 사용된다. 주로 자동화나 협업 효율을 높이기 위해 사용된다.

목적은 일관된 커밋 메시지 유지, 커밋 자동화, 변경 의도 가시화가 있다. <br>
기본적으로 아래와 같은 형식을 따른다. Conventional Commits의 예시이다.
```
<type>(<scope>): <subject>

<body>
<footer>
```
- type: 변경 종류 (feat, fix, docs etc...)
- scope: 변경 범위 (선택사항, 예: auth, api)
- subject: 한 줄 요약
- body: 상세 내용 (선택사항)
- footer: 관련 이슈, Breaking Changes, etc... (선택사항) 


아래는 자주 쓰이는 Type의 목록이다.
| Type      | 의미                                   |
|-----------|----------------------------------------|
| feat      | 새로운 기능 추가                       |
| fix       | 버그 수정                              |
| docs      | 문서 변경                              |
| style     | 코드 스타일 변경(기능 영향 없음)       |
| refactor  | 코드 리팩토링 (기능 변화 없음)         |
| perf      | 성능 개선                              |
| test      | 테스트 코드 추가/수정                  |
| chore     | 빌드, 설정, 기타 관리 작업             |

결국 이 방법은 장점이 뚜렷하지만 개인 프로젝트에서는 크게 의미를 가지지 못하기에 형식을 강제하지 못하게 만드는 것을 추천한다. 

## commit message 형식 자유롭게 만드는 방법
이제 이 형식을 해제하는 방법을 알아보겠다. <br> jekyll의 깃허브 블로그 폴더를 보면 `package.json`이 보일 것이다. 이 파일의 역할은 Node.js 프로젝트의 mata-data, dependency, 실행 스크립트, settings을 전부 담고 있는 핵심 파일이다. 

여기서 우리는 devDependencies 부분만 확인하겠다. `cmd(ctrl) + F ` 누르고 `commitlint` 검색하면 아래와 같이 있을 것이다.

```
  "commitlint": {
    "extends": [
      "@commitlint/config-conventional"
    ],
    "rules": {
      "body-max-line-length": [0, "always"]
    }
  },
```
여기에 몇가지만 추가하면 되는데, 바로 
```
"type-empty": [0, "never"],
"subject-empty": [0, "never"]
```
이 두 파라미터이다. 

`type-empty`는 말 그대로 타입을 설정하지 않아도 되게 만들어준다. <br>
`subject-empty`는 완전히 빈 subject도 허용하게 만들어준다.

이렇게 하고 commit하면 앞으로는 원래하던 것처럼 자유로운 형식으로 메시지를 입력할 수 있게 된다. 
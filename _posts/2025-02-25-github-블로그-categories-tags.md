---
title: "github 블로그: 카테고리와 태그 설정하기"
date: 2025-02-25
categories: [github, blog-settings]
tags: [jekyll, front-matter, yaml]
---

> 자. 지금까지의 포스트를 읽은 당신은 jekyll chirpy 테마를 사용하기 위한 준비를 전부 마쳤다. <br> 
그렇게 들뜬 마음으로 첫 포스트를 쓰기 시작한 당신은 뭔가 이상한 점을 맞닥뜨린다. <br>
제목, 날짜, 카테고리, 태그를 설정하는 방법을 모른다는 것이다... <br>
그래서 이번 시간에는 Front Matter라는 개념을 배우고 태그와 카테고리를 설정하는 것을 배워본다.

# Front Matter
Front Matter를 인터넷에 검색하면 다음과 같이 설명한다.

> Front-matter is a block of YAML or JSON at the beginning of the file that is used to configure settings for your writings. <br> Front-matter is terminated by three dashes when written in YAML or three semicolons when written in JSON.

간단히 설명하자면 YAML이나 JSON 형식의 Meta Data 라고 할 수 있다. <br>
이 메타데이터가 하는 일은 간단하다. 제목, 날짜, 태그, 카테고리.. 그 외에도 기본적으로 사용할 수 있는 필드가 있다.

그럼 이 front matter는 어떻게 설정하는 것일까?

```markdown
---
title: "your title"
date: YYYY-MM-DD
categories: [category 1, category 2]
tags: [tag 1, tag 2]
---
```

이런 형태의 포맷을 포스팅하려는 마크다운 파일 가장 위에 붙이면 된다.

그럼 끝이다!

라고 하기엔 여러분은 아직 궁금한게 있을 것이다. <br>
바로... '카테고리나 태그는 어떻게 써야하는지' 이다...

# Category와 Tag
두 개의 개념을 잘 아는 사람도 있을거지만 아닌 사람들도 제법 있을 것이기에, 먼저 구글링을 통해 두 용어의 의미상 차이를 알아보자.<br>

```
카테고리(Category)
-  콘텐츠를 넓은 주제별로 그룹화하는 분류이다.
-  보통 한 사이트(블로그 등)의 전체적인 구조를 결정짓는 기본 분류 체계라고 할 수 있다.
-  예: IT, 여행, 음식, 영화 등

태그(Tag)
- 콘텐츠의 구체적인 키워드 혹은 속성을 나타낸다.
- 특정 글이나 콘텐츠의 세부 주제를 연결하는 역할을 한다.
- 예: Python, 맛집, 런던, 카페, 다이어트 등.
```

이렇게 보면 감이 오지 않을 수도 있다. 그러니 다음 표를 보자

| 속성         | `categories`                     | `tags`                             |
|--------------|----------------------------------|------------------------------------|
| 구조         | 계층형 (구분 구조)              | 비계층형 (자유 키워드)             |
| 사용 목적    | 콘텐츠 분류 / 섹션 구분         | 내용 설명 / 연관 키워드 검색용     |
| URL 생성     | `/categories/이름/`              | `/tags/이름/`                      |
| 일반 수      | 적고 고정됨 (예: 5~10개)         | 많고 자유롭게 붙임 (예: 수십~수백 개) |
| 시각적 UI    | 메뉴, 사이드바, 페이지 분류      | 태그 클라우드, 관련 포스트 필터    |

jekyll은 이러한 형태의 카테고리와 태그를 사용한다. <br>
이 때문에 약간 귀찮은 것이, 카테고리는 순서를 지켜야한다는 것이다. 

예를 들어보자. 
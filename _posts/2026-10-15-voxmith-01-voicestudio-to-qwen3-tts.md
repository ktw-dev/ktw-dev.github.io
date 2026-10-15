---
title: "Voxmith 제작기 (1) VoiceStudio를 설치하다가 Qwen3-TTS에 정착하기까지"
date: 2026-10-15 16:00:00 +0900
categories: [개발 노트, Voxmith]
tags: [claude-code, voxmith, tts, voice-cloning, qwen3-tts, mlx, macos]
series: Voxmith 제작기
series_order: 1
description: 남이 만든 음성 복제 앱을 설치하다가 막힌 문제를 Claude Code와 함께 하나씩 해결하다 보니, 두 시간 만에 Qwen3-TTS 전용 스크립트와 바탕화면 드롭 앱이 만들어졌다. Voxmith가 시작된 과정을 정리했다.
---

> Voxmith는 내 목소리를 복제해 수업 나레이션을 만드는 macOS 앱이다. 그런데 처음부터 앱을 만들 생각은 없었다. <br>
시작은 GitHub에서 찾은 음성 복제 앱 하나를 설치하는 일이었다. <br>
이번 글에서는 그 앱을 설치하고 쓰다가 엔진을 하나씩 탈락시키고, 결국 Qwen3-TTS를 앱 밖에서 직접 실행하는 스크립트를 만들기까지 걸린 두 시간을 따라가 본다.

> 이번 글에서 다루는 것
> - 설치 가이드만 쓰는 워크스페이스를 만든 이유와 그 규칙
> - Claude Code가 틀린 버전(v0.5.7)을 적은 일과, 그 실수를 규칙으로 바꾼 과정
> - DMG로 설치한 앱이 "손상됨"으로 뜬 원인(격리 속성과 링커 서명)
> - OmniVoice의 20초 참조 음성 버그와, 문장 경계로 참조 클립 5개를 자른 방법
> - 상업적 이용 조사, VoxCPM2와 MOSS-TTS-Nano의 탈락, Qwen3-TTS Base의 발견
> - 앱 밖에서 mlx-audio를 직접 다룬 과정과, Claude Code의 두 번째 실수
> - 첫 `qwen3tts` 스크립트, `.srt` 입력·출력, 바탕화면 드롭 앱
{: .prompt-info }

## 출발점: 설치 가이드만 쓰는 워크스페이스

2026년 10월 12일 밤 10시 38분, 나는 `~/Documents/claude-code/install-manager` 라는 빈 폴더에서 Claude Code를 열고 이렇게 적었다. 오타는 그대로 옮긴다.

> 이 워크스페이스는 내가 설치하려는 어떤 앱, 깃허브 주소를 들고 오면 개발 도구인 경우 그것에 맛는 의존성을 설치하고 앱까지 설지하는것. 깃허브주소라면 설치하는 방법과, 그 사용 가이드를 만들어주는 역할을 하는 곳이야. 폴더구조는 최상단 폴더 - 워크스페이스 규칙은 따로, 그릐고 설치할 앱에 대한 폴더 - 폴더 내에는 가이드가 들어있게 해주면 돼.

Claude Code는 먼저 이 Mac에 무엇이 설치되어 있는지 확인했다. `which brew git node npm python3 uv pipx gh`, `sw_vers`, `uname -m` 을 실행해 보니 macOS 27.0.1, arm64, Homebrew, git, node, uv, Python 3.13이 있었고 `pipx` 와 `gh` 는 없었다. 그다음 아래 파일들을 만들었다.

| 파일 | 역할 |
|---|---|
| `CLAUDE.md` | 워크스페이스 규칙 |
| `INDEX.md` | 앱 목록 표(앱, 출처, 설치 방법, 설치일, 상태, 한 줄 설명) |
| `_template/INSTALL.md`, `_template/GUIDE.md` | 앱 폴더마다 복사해 쓰는 양식 |

규칙의 요지는 다음과 같다. 저장소 문서를 먼저 읽고, 일반 앱은 `brew`, Python 도구는 `uv tool`, Node 도구는 `npm -g` 로 설치하되 저장소가 공식으로 권장하는 방법을 우선한다. `sudo`, `~/.zshrc` 수정, 시스템 전역 설정 변경은 미리 사용자에게 묻고, `curl | sh` 스크립트는 먼저 읽고 요약한다. `INSTALL.md` 에는 실제로 실행한 명령과 확인한 버전을 적는다.

### "가이드만 알려 줘"

1분 뒤에 첫 번째 앱을 가져왔다. 오픈 소스 음성 스튜디오 앱인 [VoiceStudio](https://github.com/debpalash/VoiceStudio)였다.

> https://github.com/debpalash/VoiceStudio 를 설치할거야. 설치 방법 알려주면 돼. 네가 직접 설치하는게 아닌, 가이드를 알려주면, 내가 보고 직접 설치하거나, 너보고 대신 설치하라고 명령할거야. 사용가이드의 경우 fluentkorean 을 사용하여 글을 다듬고 제공해야해

Claude Code는 저장소를 임시 폴더에 `git clone --depth 1` 로 받아 읽기만 했다. `README.md`, `pyproject.toml`, 설치 문서, 설치 스크립트, `CHANGELOG.md`, 기능 목록, 모델 다운로드 문서까지 꽤 많이 읽었다. 저장소에는 코딩 에이전트를 위한 설치 지침(`docs/install/agent.md`)도 있었는데, "모델을 받기 전에 크기와 라이선스를 묻는다", "분석 동의 창은 사용자에게 맡긴다" 같은 내용이었다.

결과물은 `voicestudio/INSTALL.md`(7572자)와 `voicestudio/GUIDE.md`(6342자)였다. 설치 방법은 세 가지로 정리되었다.

1. 공식 셸 설치 스크립트(권장). `sudo` 를 쓰지 않고, 체크섬이 틀리면 설치를 거부한다.
2. DMG 직접 다운로드와 체크섬 확인.
3. 소스 빌드(`bun` 필요).

이때 워크스페이스 규칙도 하나 바뀌었다. `CLAUDE.md` 첫머리에 "**기본 동작은 «가이드 작성»이다.** 사용자가 '설치해줘'처럼 명시적으로 지시하기 전에는 아무것도 설치하지 않는다"가 들어갔다. 이 규칙은 이후 두 시간 내내 지켜졌다. 재서명, 모델 다운로드, 모델 삭제는 모두 Claude Code가 근거를 먼저 설명하고 내가 승인한 뒤에야 실행되었다.

그런데 이 가이드에는 틀린 정보가 하나 들어 있었다. 최신 버전을 **v0.5.7**로 적은 것이다.

## DMG가 "손상됨"으로 뜨다

나는 가이드를 보고 DMG로 직접 설치했다. 그리고 앱을 열자 macOS가 "손상되었기 때문에 열 수 없습니다"라는 경고를 띄웠다. 해결 방법이라고 안내된 화면도 함께 캡처해 붙였다.

> dmg로 하니까 이상하게 됐어. [Image #1] 해결 방법은 [Image #2] 라고 되어있는데, 이렇게 해도 되는건겠지?

Claude Code는 바로 명령을 실행하지 않고 읽기 전용 점검부터 했다.

1. 내려받은 `VoiceStudio-Electron-0.5.6-mac-arm64.dmg` 의 SHA-256을 계산하고, GitHub 릴리스의 `SHA256SUMS.txt` 와 비교했다. v0.5.6 값과 정확히 일치했다. 내려받은 파일은 공식 릴리스에 올라온 파일이 맞았다.
2. 그런데 v0.5.7의 `SHA256SUMS.txt` 는 **404**였고, `releases/latest` 는 `v0.5.6` 으로 리디렉션되었다.
3. 설치된 앱에는 `com.apple.quarantine`(Brave 브라우저가 붙인 격리 속성)과 `com.apple.provenance` 속성이 있었다.
4. `codesign -dv` 결과는 `flags=0x20002(adhoc,linker-signed)` 였고, 검증하면 `code has no resources but signature indicates they must be present` 가 나왔다.

정리하면 "손상됨"은 파일이 망가졌다는 뜻이 아니었다. Electron 빌드에 링커가 붙인 불완전한 임시 서명이 있었고, 여기에 브라우저의 격리 속성이 더해지면서 Gatekeeper 검사가 실패한 것이다.

### 틀린 버전과 새 규칙

이 점검에서 가이드의 "최신 v0.5.7"이 틀렸다는 사실도 드러났다. 실제로 게시된 최신 릴리스는 v0.5.6이었다. Claude Code는 원인을 "CHANGELOG에서 버전을 가져왔기 때문"이라고 밝히고 문서를 고쳤다. `INSTALL.md` 의 버전을 0.5.6으로 정정하고, 문제 해결 절을 "개발자를 확인할 수 없음"과 "손상됨" 두 경우로 나눴다.

그리고 같은 실수가 반복되지 않도록 워크스페이스 `CLAUDE.md` 에 규칙 두 개를 추가했다.

- 최신 버전은 `CHANGELOG.md` 나 `package.json` 이 아니라 실제로 게시된 릴리스로 확인한다. 확인 방법은 `releases/latest` 의 리디렉션 주소를 보는 것이다.
- 서명되지 않은 macOS 앱은 Gatekeeper 문제("개발자를 확인할 수 없음", "손상됨")를 미리 안내한다.

```bash
curl -fsSLI -o /dev/null -w '%{url_effective}' https://github.com/<owner>/<repo>/releases/latest
```

에이전트가 실수하면 그 자리에서 고치는 것으로 끝내지 않고, 다음 세션에서 일하는 에이전트도 읽는 규칙 파일에 남겨 둔다. 이 습관은 이후 Voxmith 프로젝트에서도 계속 이어졌다.

### 승인 후 재서명

Claude Code는 실행할 명령 세 개와 그 근거만 보여 주고 기다렸다. 나는 "해봐"라고 답했다.

```bash
xattr -dr com.apple.quarantine /Applications/VoiceStudio.app
codesign --force --deep --sign - /Applications/VoiceStudio.app
codesign --verify --deep --strict --verbose=2 /Applications/VoiceStudio.app
```

실행하기 전에는 앱이 실행 중이 아닌지 확인했다. 결과는 `valid on disk`, `satisfies its Designated Requirement` 였다. `spctl -a -vv` 는 여전히 `rejected` 를 돌려줬지만, Apple 개발자 인증서가 없는 앱은 항상 이렇게 나오므로 실행에는 문제가 없다고 Claude Code가 설명했다. 실제로 `open` 으로 실행하니 메인 프로세스와 헬퍼 프로세스가 정상적으로 실행되었다.

앱 안의 첫 실행 설정(런타임 설치, 기본 모델 약 2.3 GB, 개인 정보 동의, 모델 라이선스 동의)은 Claude Code가 대신 누르지 않고 순서만 안내했다. 버튼은 내가 직접 눌렀다.

## OmniVoice의 20초 버그

앱이 열리자 내 목소리를 녹음한 파일을 참조 음성으로 등록하고 복제를 시도했다. 그런데 오류가 났다.

```text
RuntimeError: omnivoice sidecar synthesize error: ValueError: Automatic reference transcription needs an installed speech-to-text model...
```

음성 인식 모델은 분명히 설치되어 있었다. 나는 오류 전문을 붙여 넣고 "이건 어떻게 처리해야하나"라고만 물었다.

Claude Code는 이번에도 읽기 전용으로 추적했다. 먼저 앱의 로컬 백엔드 API(`GET /health`, `/models`)를 조회했고, 백엔드 로그를 읽었고, 마지막으로 앱 런타임 안의 Python 코드를 직접 열었다. 그 코드에서 원인을 찾았다.

- `omnivoice/utils/audio.py` 에는 `CLONE_REF_TEXT_MAX_SECONDS = 20.0`, `CLONE_REF_WINDOW_SECONDS = 15.0` 이 정의되어 있었다.
- `omnivoice.py` 305행에는 `_DEFAULT_ASR_MODEL = "openai/whisper-large-v3-turbo"` 가 고정되어 있었고, 이 모델을 로컬 캐시에서만 찾았다.
- `ffprobe` 로 길이를 재 보니 내가 등록한 음성 파일은 **67.74초**였다.

참조 음성이 20초 이하이면, 앱에 설치된 음성 인식 모델(faster-whisper-large-v3-turbo, 1.6 GB)이 대본을 자동으로 만든다. 20초를 넘으면 엔진이 그중에서 가장 좋은 15초 구간을 스스로 고르는데, 이때 쓰는 음성 인식 모델은 `openai/whisper-large-v3-turbo` 로 고정되어 있다. 이 모델은 설치되어 있지도 않고 앱의 모델 카탈로그에도 없다. 그래서 다른 음성 인식 모델이 설치되어 있어도 "모델이 없다"는 오류가 난 것이다. CHANGELOG에는 v0.5.7에서 이 문제를 고쳤다고 적혀 있었지만, 앞에서 확인했듯이 v0.5.7은 아직 받을 수 없었다.

해결 방법은 단순했다. 참조 음성을 3~10초의 깨끗한 구간으로 잘라 다시 등록하면 된다. 앱 로그에도 "20초를 넘으면 품질이 떨어지니 3~10초로 자르라"는 경고가 있었다.

### 클립을 여러 개 등록하면 합쳐서 배울까

> 그럼 음성을 여러개 나눠서 등록해도 되나

Claude Code는 백엔드의 프로필 코드(`profiles.py`)를 읽고, 프로필 하나에는 참조 음성을 하나만 넣을 수 있다고 답했다. 67초를 여섯 조각으로 나누면 프로필 여섯 개가 따로 생길 뿐, 조각을 합쳐서 학습하지는 않는다. 대신 5~10초 클립 몇 개를 각각 등록하고, 같은 문장으로 생성해 비교한 뒤, 마음에 드는 결과를 **고정(lock)** 해서 음성과 시드를 기준으로 저장하는 방법을 권했다.

### 문장 경계에서 자른 참조 클립 5개

> 몇개 잘라서 다운로드 폴더에 넣어줘

여기서 Claude Code가 고른 방법이 꽤 좋았다. 무음 구간만 기준으로 자르면 문장 중간이 끊길 수 있다. 그래서 앱에 이미 설치된 음성 인식 모델(`faster_whisper`, CPU, int8)로 먼저 전사해 문장마다 시작과 끝 시각을 구했다. 67초짜리 녹음에서 문장 13개가 나왔다.

그다음 말투가 비슷한 문장끼리 묶어 `ffmpeg` 로 자르고, 클립마다 같은 이름의 `.txt` 대본을 저장했다. 마지막으로 자른 파일을 다시 Whisper로 전사해 앞뒤 단어가 잘리지 않았는지 검증했다. 다섯 개 모두 문장이 온전하게 인식되었다.

| 파일 | 길이 | 말투 |
|---|---|---|
| `ref1-narration-a.wav` | 11.90초 | 차분한 낭독 |
| `ref2-narration-b.wav` | 10.60초 | 차분한 낭독 |
| `ref3-daily-question.wav` | 8.65초 | 일상 대화와 질문 |
| `ref4-conversational.wav` | 12.00초 | 감정이 들어간 대화 |
| `ref5-science.wav` | 8.00초 | 수업 설명 |

날짜와 금액만 읽은 문장, 1.6초짜리 "그럼요."는 일부러 뺐다. `ref5-science` 는 대본에 숫자가 많아서, 대본을 함께 넣으면 숫자 읽기가 실제 발음과 어긋날 수 있다는 주의 사항도 함께 적혀 있었다. 원본 녹음과 앱 데이터는 건드리지 않고 복사본만 만들었다. 이 다섯 클립은 이후 Voxmith의 `refs/` 폴더로 그대로 옮겨진다.

> 참조 클립은 내 목소리라서 이 글에는 싣지 않았다. 음성 복제는 당사자가 허락한 목소리로만 해야 한다.
{: .prompt-warning }

## 상업적으로 써도 될까

음성이 생성되기 시작하자 다른 걱정이 생겼다. 나는 이 목소리로 수업 영상을 만들 생각이었다.

> 혹시 내 복제 음성은 상업적 이용이 돼?

Claude Code는 저장소의 `docs/licensing/model-inventory.md` 와 `model-license-data.json` 을 읽었다. 기본 엔진인 `k2-fsa/OmniVoice` 항목은 `license: "CC-BY-NC (version unspecified); ..."`, 분류는 `noncommercial / restricted` 였다. 모델 카드의 메모에는 "코드는 Apache-2.0이고 가중치는 비상업용"이라고 구분되어 있었다.

결론은 분명했다. 기본 엔진 OmniVoice로 만든 음성은 상업적으로 쓰면 안 된다. 목소리가 내 것인지는 상관이 없고, **모델 가중치의 라이선스(CC-BY-NC)** 가 적용된다. 앱 자체의 AGPL-3.0은 생성된 음성의 권리와 관계가 없다. Claude Code는 유료 강의 영상, 판매 교재, 수익 창출 유튜브, 학원 홍보 자료를 상업적 이용의 예로 들었고, 법률 자문은 할 수 없다는 점도 함께 적었다.

상업적으로 쓸 수 있는 후보로는 Apache-2.0 라이선스이면서 한국어 음성 복제를 지원하는 엔진들이 제시되었다. VoxCPM2(약 5 GB), CosyVoice 3(약 9.8 GB, 설치 복잡), Confucius4-TTS, MOSS-TTS-Nano(약 0.4 GB)였다.

이어서 Qwen3-TTS(voice design)도 물어봤다. Claude Code는 Hugging Face API로 모델 카드의 라이선스를 직접 조회했고, VoiceDesign 모델과 Base 모델 모두 `apache-2.0` 이었다. 다만 VoiceDesign은 설명문으로 새 목소리를 만드는 모델이라 내 목소리 복제에는 쓸 수 없었다. 이때 Claude Code가 지나가듯 한 말이 있다.

> Qwen 쪽에는 음성 복제용 모델(`Qwen3-TTS-12Hz-1.7B-Base`)도 Apache-2.0으로 공개되어 있지만, VoiceStudio 모델 목록에는 없어서 앱에서 바로 쓸 수는 없다.

20분도 지나지 않아 이 한 줄이 프로젝트 전체의 방향을 정하게 된다.

## VoxCPM2: 16 GB Mac에서는 너무 느렸다

상업용으로 쓸 수 있는 가장 유력한 후보는 VoxCPM2였다. Claude Code가 설치 가이드(`VOXCPM2.md`)를 썼고, 나는 앱의 모델 카탈로그에서 직접 설치했다. 처음에는 화면에 "이용할 수 없음 / 실패"가 떠서 당황했는데, 상태 API를 조회해 보니 설치가 실패한 것이 아니라 **설치를 아직 시작하지 않은 상태**였다. "실패"는 재확인 버튼으로 점검한 결과일 뿐이었다.

설치하고 나서 생성 버튼을 눌렀다. 그리고 한참을 기다렸다.

> 근데 얘는 말하게 하는데 되게 오래 걸린다

Claude Code는 로그에서 첫 요청의 단계를 추적하고, `memory_pressure`, `vm_stat`, `sysctl vm.swapusage` 로 메모리 상태를 확인했다.

| 단계 | 걸린 시간 | 다시 생기는 경우 |
|---|---|---|
| 모델 다운로드 (5 GB) | 약 1분 45초 | 처음 한 번 |
| 메모리 적재 | 약 1분 16초 | 앱 재시작, 15분 유휴 후 언로드, 엔진 전환 |
| 워밍업 | 약 58초 | 위와 같음 |
| 실제 생성 1회 | **83.54초** | 매번 |

마지막 줄의 83.54초는 나중에 로그를 다시 확인해서 얻은 값이다. 적재가 끝난 뒤에도 문장 하나를 만드는 데 1분 20초가 넘게 걸린 셈이다. 같은 날 OmniVoice는 생성 1회에 8~20초였다.

Claude Code가 정리한 구조적 원인은 다음과 같았다.

- Apple GPU(MPS)에서 `adjusted dtype bfloat16 -> float32` 가 일어나 메모리를 두 배로 쓴다.
- 이때 남은 메모리는 11%였고 스왑은 6.7 GB였다.
- `torch.compile` 은 CUDA 전용 최적화라 꺼져 있다.
- 앱은 기본으로 엔진을 하나만 메모리에 올려 두기 때문에, 엔진을 바꿀 때마다 2분가량 다시 적재한다.

메모리가 16 GB인 이 Mac에서는 품질과 상관없이 실제로 쓰기 어려웠다.

### MOSS-TTS-Nano도 탈락

> 음 그럼 더 가벼운 음성복제는 없는거지?

Claude Code는 앱의 엔진 목록 API 결과를 표로 정리하고 엔진 문서들을 읽었다.

| 엔진 | 크기·속도 | 라이선스 | 이 Mac |
|---|---|---|---|
| MOSS-TTS-Nano | 1억 파라미터, 0.24 GB, CPU 4코어 실시간 | Apache-2.0 | 버튼 설치 가능 |
| GPT-SoVITS | 약 2 GB | MIT | 버튼 설치 불가, 별도 API 서버 필요 |
| VoxCPM2 | 5 GB, 이 Mac에서 느림 | Apache-2.0 | 설치됨 |
| Confucius4-TTS | 약 5 GB, CPU에서 6초 음성에 약 100초 | Apache-2.0 | 더 무거움 |

MOSS-TTS-Nano는 문서에서도 "큰 엔진보다 품질이 낮다"고 밝히고 있었다. 나는 직접 설치해서 써 본 뒤 이렇게 답했다.

> nano는 아예 슬수가 없고, OmniVoice랑 비슷한 정도가 딱 좋은데

정리하면 내가 원하는 조건은 세 가지였다. 속도는 OmniVoice 정도이고, 상업적으로 쓸 수 있고, 한국어 음성 복제가 되어야 한다.

## Qwen3-TTS Base를 찾다

Claude Code는 남은 후보를 다시 검토했다. CosyVoice 3는 CUDA가 없으면 CPU(float32)로만 돌고, dots.tts는 체크포인트가 9 GB였고, IndexTTS는 조건부 라이선스에 한국어가 없었다. 그래서 앞에서 지나가듯 언급했던 Qwen3-TTS Base를 다시 살펴보게 되었다.

Hugging Face에서 `mlx-community` 의 Qwen3-TTS 변환본 목록을 검색하고, 앱 venv 안에 이미 들어 있던 `mlx_audio/tts/models/qwen3_tts/` 코드를 읽었다. `config.tts_model_type == "base"` 분기와 `ref_audio`/`ref_text` 처리를 보고 Base 모델이 참조 음성 복제를 지원한다고 판단했다.

| 모델 | 크기 | 라이선스 |
|---|---|---|
| `1.7B-Base-4bit` | 2.34 GB | apache-2.0 |
| `1.7B-Base-8bit` | 3.1 GB | apache-2.0 |
| `0.6B-Base-8bit` | 1.99 GB | apache-2.0 |

제안 근거는 세 가지였다. Apache-2.0이고, 4bit 모델이 OmniVoice(3.0 GB)보다 작고, Apple Silicon용 MLX로 실행되므로 VoxCPM2처럼 float32 변환으로 메모리가 두 배가 되는 문제가 없다는 것이다. 다만 Claude Code는 코드만 읽고 내린 판단이라는 점을 분명히 하고, 불확실한 점(앱에 등록된 모델이 아니라는 점, 언어 코드 처리 등)도 함께 적었다. 그리고 앱 설정은 건드리지 말고 먼저 시험해 보자며 2.34 GB 다운로드 승인을 요청했다.

### 첫 시험

> 다운받고 적용바업ㅂ도 알려줘

"다운받고 적용 방법도 알려 줘"라는 뜻이었다. 다운로드는 약 44초 걸렸다. Claude Code는 앱이 mlx-audio를 호출하는 방식(`mlx_audio.tts.utils.load_model`)을 그대로 따라 시험 스크립트를 작성하고, 참조 클립 두 개로 문장 두 개를 생성했다.

| 파일 | 생성 시간 | 음성 길이 |
|---|---|---|
| `qwen3-ref1-s1.wav` (첫 생성) | 10.3초 | 7.6초 |
| `qwen3-ref1-s2.wav` | 8.2초 | 10.7초 |
| `qwen3-ref3-s1.wav` | 5.3초 | 6.6초 |
| `qwen3-ref3-s2.wav` | 5.4초 | 9.4초 |

모델을 적재하는 데는 3.3초가 걸렸다. 생성한 파일은 다시 faster-whisper로 전사해 내용이 맞는지 확인했다. 네 파일 모두 입력 문장대로 읽었지만, "계수"는 "개수"로 받아 적혔다. 이 발음 문제는 뒤에서 다시 다룬다.

### 앱에 끼워 넣기: `POST /engines/select`

공식 목록에 없는 모델을 앱에서 쓰려면 어떻게 해야 할까. Claude Code는 백엔드 코드를 추적해 `POST /engines/select` 의 `model_id` 에 큐레이션 키뿐 아니라 **임의의 Hugging Face repo id** 를 넣을 수 있다는 것을 찾아냈다. 이 방법을 `QWEN3-TTS.md` 에 정리했고, 나는 터미널에서 직접 실행했다.

```bash
curl -s -X POST http://localhost:3900/engines/select \
  -H 'Content-Type: application/json' \
  -d '{"family":"tts","backend_id":"mlx-audio","model_id":"mlx-community/Qwen3-TTS-12Hz-1.7B-Base-4bit"}'
```

응답은 다음과 같았다.

```json
{"family":"tts","active":"mlx-audio","env_override":false,"routing_status":"accelerated","effective_device":"mps","routing_reason":null}
```

> 이렇게 되면 적용된거야?

Claude Code는 앱의 `prefs.json` 에 `mlx_audio_model_id = mlx-community/Qwen3-TTS-12Hz-1.7B-Base-4bit` 가 저장된 것을 확인하고 적용되었다고 답했다. 앱 안에서 생성해 보니 첫 생성은 적재 시간을 포함해 4.6초가 걸렸고, 그 뒤로는 2.7~3.9초가 걸렸다. VoxCPM2의 83초와 비교하면 차이가 컸다.

다만 Claude Code는 함정도 하나 짚었다. 앱의 MLX-Audio 어댑터는 참조 음성을 받는 모델을 CSM 하나로만 인식하고, `generate()` 에서 `TypeError` 가 나면 참조 음성 없이 **조용히** 다시 생성한다. 그래서 더빙이나 일괄 작업은 거부될 수 있고, 결과가 내 목소리가 아니면 이 경로를 의심해야 한다.

## "프로덕션 재정의"는 Qwen에 닿지 않았다

앱에는 "프로덕션 재정의"라는 세부 설정 패널이 있었다. 나는 이 패널에서 소리를 다듬어 볼 생각이었다.

> 했는데, 프로덕션으로 커스텀 해볼게. 이거 각 커스텀이 뭐 의미하는거야

Claude Code는 먼저 이 패널이 코드에서 어떤 이름으로 정의되어 있는지 찾아야 했다. 482 MB짜리 `app.asar` 를 `strings | grep` 으로 검색했지만 한국어 키가 나오지 않았고, `grep -a -o -E` 정규식은 `exceeds complexity limits` 오류로 실패했다. 결국 Python으로 바이트를 직접 검색해 한국어 로케일의 `production_overrides => 프로덕션 재정의` 를 찾아냈다.

그다음 백엔드의 `generation.py` 에서 각 파라미터가 어디로 전달되는지 추적했다. 결론은 실망스러웠다.

| 항목 | 기본값 | Qwen3-TTS에 적용되는가 |
|---|---|---|
| 단계 `num_step` | 32 | 아니다 |
| CFG `guidance_scale` | 2.0 | 아니다 |
| 속도 | 자동 | 아니다(전달되지만 모델이 지원하지 않음) |
| `t_shift`, 위치 온도, 클래스 온도, 레이어 패널티 | 각각 0.1, 5.0, 0.0, 5.0 | 아니다 |
| 노이즈 제거, 후처리 | 켜짐 | 아니다 |
| 시드 | 무작위 | 불확실(앱은 PyTorch 난수만 고정하는데 Qwen3는 MLX 난수를 씀) |

패널에 있는 조절 항목은 대부분 OmniVoice 전용이었다. 화면에서 값을 아무리 바꿔도 Qwen3-TTS에는 전달되지 않는다. Claude Code가 제시한 대안은 참조 클립 바꾸기, 대본 정확히 넣기, 문장 부호로 쉼 조절하기, 여러 번 생성해 고르기 정도였다.

## 앱 밖으로 나가다: mlx-audio CLI

> 그러면 qwen3-tts를 내가 내부적으로 건드릴 방법은 없는거야?

이 질문을 계기로 작업의 방향이 바뀌었다. Claude Code는 앱 안에 들어 있는 mlx-audio의 명령줄 도구를 찾아 `--help` 로 옵션을 확인하고, 모델 폴더의 `generation_config.json` 에서 기본값(`temperature 0.9`, `top_p 1.0`, `top_k 50`, `repetition_penalty 1.05`)을 읽었다. 그리고 직접 한 번 실행해 봤다. 아래는 그때 `QWEN3-TTS.md` 에 기록한 명령이다. `$PY` 는 mlx-audio가 들어 있는 Python이고, `$R` 은 참조 클립 폴더다.

```bash
"$PY" -m mlx_audio.tts.generate \
  --model mlx-community/Qwen3-TTS-12Hz-1.7B-Base-4bit \
  --text "안녕하세요. 오늘은 화학 반응식의 계수를 맞추는 방법을 정리해 보겠습니다." \
  --ref_audio $R/ref3-daily-question.wav \
  --ref_text "$(cat $R/ref3-daily-question.txt)" \
  --lang_code korean \
  --temperature 0.7 --top_k 30 --repetition_penalty 1.1 \
  --output_path ~/Downloads/voicestudio-test --file_prefix t07
```

모델 적재를 포함해 약 14초가 걸렸다. 앱 화면에서는 못 바꾸던 temperature, top_k, top_p, repetition_penalty, ref_text, lang_code를 앱 밖에서는 바꿀 수 있었다. 속도는 모델이 지원하지 않으므로 `ffmpeg` 의 `atempo` 로 후처리하고, 시드는 CLI 옵션이 없으므로 Python 스크립트에서 `mx.random.seed` 로 고정해야 한다는 내용도 함께 정리되었다.

Claude Code는 앱 내부의 `tts_backend.py` 를 고치는 방법은 권하지 않았다. 앱을 업데이트하면 고친 파일이 덮어써지기 때문이다. 대신 "문장, 참조 클립, 온도, 시드, 속도만 넣으면 되는 짧은 실행 스크립트"를 제안했다. 이 제안이 나중에 Voxmith로 발전하는 `qwen3tts` 스크립트의 출발점이다.

### temperature, top_p, 그리고 `--ref_text`

> 그럼 temperature를 0.7로, top_p 는 0.85, --ref_text 는... 뭘 얘기하는건지 잘 모르겠는데 음성 파일을 넣어주면 되는건가?

Claude Code는 `--ref_text` 가 음성 파일이 아니라 **참조 음성에서 말한 내용을 적은 글**이라고 설명했다. 클립을 자를 때 만들어 둔 `.txt` 를 그대로 넣으면 된다. 그리고 차이를 들려주려고 대본을 넣은 버전과 뺀 버전을 CLI로 만들었다.

- 대본을 넣으면(with-text) 목소리와 말투(억양, 리듬)를 함께 따라 한다.
- 대본을 빼면(timbre-only) 음색만 따라 하고 말투는 모델이 정한다.

### Claude Code의 두 번째 실수: 요청하지 않은 1.5 GB 다운로드

그런데 Hugging Face 캐시를 확인하던 Claude Code가 이상한 폴더를 발견했다. `models--mlx-community--whisper-large-v3-turbo-asr-fp16`(1.5 GB)이 방금 새로 만들어져 있었다.

알고 보니 mlx-audio CLI는 `--ref_text` 가 없으면 **음성 인식 모델을 스스로 내려받아 대본을 만들어 넣는다**. 그러니 "대본 없는 버전"으로 만든 파일은 실제로는 대본을 넣은 버전과 같았다. 비교 자체가 성립하지 않았던 것이다.

Claude Code는 답변에 "**제가 실수한 부분**"이라는 소제목을 따로 두고, 요청하지 않은 1.5 GB 모델이 내려받아졌다는 사실과 VoiceStudio는 이 모델을 쓰지 않는다는 점을 밝혔다. 잘못 만든 파일은 지우고, Python에서 `ref_text` 없이 `model.generate` 를 직접 호출해 진짜 음색 전용 버전(`t07-p085-timbre-only.wav`)을 다시 만들었다. 내려받은 모델은 내 허락을 받은 뒤에 지웠다. 이 함정은 `QWEN3-TTS.md` 의 설정 표에도 기록했다.

옵션 이름만 보고 "빼면 안 쓴다"고 가정하면 이런 일이 생긴다. 이번에는 Claude Code가 캐시를 확인하다가 스스로 찾아냈다.

## "말 끝이 뚝 끊기는데"

자정을 조금 넘긴 00시 14분, 나는 그동안 들으면서 신경 쓰이던 점을 이야기했다.

> 응 이상한거는  지워. 그리고 스크립트를 입력할 때는 발음나는대로 적을 예정이야. 그리고, 항상 말 끝이 뚝 끊기는데, 이거 해결 못하나?

두 번째 문장에 담긴 내용도 중요한 결정이었다. "계수"가 "개수"로 읽히는 문제는 대본을 "곗수"처럼 소리 나는 대로 적어서 피하기로 했다. 그래서 스크립트는 입력을 고치지 않고 그대로 쓰도록 만들어졌다.

세 번째 문장에서 말한 문제가 이 시기에 남은 마지막 과제였다. Claude Code는 생성 파일의 끝부분을 numpy로 측정했고, 모든 파일의 마지막 20 ms가 -180 dB, 즉 완전한 0이라는 것을 확인했다. 소리가 잦아드는 구간 없이 바로 0으로 떨어지고 있었다. 문장 부호를 바꿔 보고(마침표, 말줄임표, 물결표), 다른 시드로 재생성하는 방식도 써 봤지만 효과가 없었다.

Claude Code가 내린 진단은 "모델이 마지막 음절을 내자마자 '생성 끝'(EOS) 토큰을 내보내기 때문"이었다. 그래서 처음 몇 번 나오는 EOS를 거부하고 다시 뽑게 해서, 모델이 몇 프레임 더 생성하도록 만들었다. 당시에는 12 Hz 코덱이니 1프레임이 약 83 ms라고 계산했다(2편에서 80 ms로 바로잡힌다). 아래 코드는 이 아이디어가 지금 Voxmith에 `hold_eos` 라는 이름으로 남아 있는 형태다. 모델 인스턴스의 `_sample_token` 을 감싸서, EOS가 뽑히면 EOS의 logit을 -1e9로 가린 뒤 다시 뽑는 부분을 보면 된다.

```python
def hold_eos(model, state):
    """Reject the first state['extra'] end-of-speech samples of each generation."""
    original = model._sample_token

    def sample(logits, *a, **kw):
        eos = kw.get("eos_token_id")
        token = original(logits, *a, **kw)
        if eos is not None and state["held"] < state["extra"] and int(token[0, 0]) == eos:
            state["held"] += 1
            mask = mx.where(mx.arange(logits.shape[-1]) == eos, -1e9, 0.0).astype(logits.dtype)
            return original(logits + mask, *a, **kw)
        return token

    model._sample_token = sample
```

숫자로 보면 효과가 분명했다. 시드 세 개로 비교했을 때, hold 0에서는 끝의 조용한 구간이 47~69 ms였지만 hold 2 이상에서는 207 ms 이상으로 늘었고, 끝이 -90 dB의 깨끗한 무음으로 마무리되었다. 전사해 봐도 엉뚱한 말이 덧붙지 않았다. 앞에서 시도한 재생성 방식은 줄마다 8.5~11.5초가 걸리고도 말끝이 여전히 잘렸는데, EOS를 거부하는 방식은 줄마다 2.2~2.8초면 끝났다.

나는 이것으로 말끝 문제가 해결되었다고 믿었다. 하지만 이 숫자가 정말로 무엇을 재고 있었는지는 다음 날 다시 검토하게 된다. 원인 분석, 디버깅 과정, 그리고 이 수정이 실제로는 무엇을 했는지는 2편에서 자세히 다룬다.

## 첫 `qwen3tts` 스크립트

말끝 처리가 들어간 스크립트 `tools/qwen3tts.py` 와 셸 래퍼 `tools/qwen3tts` 가 이렇게 완성되었다. 기본값은 음색만 복제(timbre-only), temperature 0.7, top_p 0.85였고, 결과는 `~/Downloads/voicestudio-out/` 에 저장되었다.

```bash
./qwen3tts "문장" -n intro
./qwen3tts -f ~/Desktop/script.txt -n lesson01
```

옵션으로 참조 클립(`-r ref1-narration-a`), 시드(`--seed 21`), 속도(`--speed 0.95`), 문장 사이 간격(`--gap-ms 500`), 대본 함께 넣기(`--with-text`)를 받을 수 있었다.

### "앱에서 입력하면 이게 적용되는 거지?"

여기서 내가 한 가지를 오해했다.

> 그러면 지금 저 음색복제에 억양 절제는 앱에서 스크립트 입력하면 알아서 저걸로 적용된다는거지?

Claude Code는 적용되지 않는다고 분명히 답하고, 차이를 표로 정리했다.

| 항목 | 앱에서 입력할 때 | `./qwen3tts` 로 실행할 때 |
|---|---|---|
| 복제 방식 | 앱이 대본을 자동으로 만들어 넘기므로 말투까지 따라 함 | 음색만 복제 |
| 억양 | 모델 기본값(temperature 0.9, top_p 1.0) | 절제(0.7 / 0.85) |
| 말끝 | 끊길 수 있음 | 처리함 |
| 저장 | 앱 생성 기록 | `~/Downloads/voicestudio-out/` |

그리고 두 가지 선택지를 제시했다. 하나는 앱 내부 코드를 고치는 것인데, 앱을 업데이트할 때마다 고친 내용이 사라지고 다른 엔진에 영향을 줄 위험이 있다. 다른 하나는 스크립트를 터미널 없이 쓸 수 있게 만드는 것이다. Claude Code는 두 번째를 추천했다.

## `.srt` 입력과 바탕화면 드롭 앱

> 그래 그러면 qwentts 로 진행해보자. 근데 이 모델은 .srt 는 처리 못하는거야?

모델은 일반 텍스트만 받으므로 `.srt` 를 직접 읽지는 못한다. 그래서 Claude Code는 스크립트가 `.srt` 를 읽고, 자막마다 음성을 생성해서 **자막 시각에 배치**하도록 기능을 추가했다. 반대로 `.txt` 를 넣으면 실제로 말한 시각에 맞춘 `.srt` 를 함께 만들어 준다.

시험용 자막에는 여유 있는 구간과 일부러 짧게 잡은 구간을 섞었다. 결과 로그는 다음과 같았다.

```text
[1/3] slot 5.0s -> audio 5.0s, sped up x1.16
[2/3] slot 3.0s -> audio 3.3s, sped up x1.30, OVERFLOW: ends +0.31s past its cue
[3/3] slot 2.0s -> audio 3.4s, sped up x1.30, OVERFLOW: ends +1.45s past its cue
```

생성한 음성이 자막 구간보다 길면 재생 속도를 최대 1.3배(`--fit-max-speed`)까지 높여 구간에 맞춘다. 그래도 넘치면 다음 자막을 뒤로 밀고 `OVERFLOW` 로 표시해서, 내가 어느 줄을 고쳐야 하는지 알 수 있게 했다. 2초짜리 구간에 3.4초 분량의 문장을 넣은 3번 줄은 1.3배로도 모자라 1.45초 넘쳤다.

### 바탕화면에 끌어다 놓는 앱

앞에서 고른 "터미널 없이 쓰기"는 AppleScript 드롭 앱으로 만들었다. `tools/droplet.applescript` 를 `osacompile` 로 컴파일해 `~/Desktop/Qwen3 TTS.app` 을 만들었고, `.txt` 나 `.srt` 를 아이콘에 끌어다 놓으면 기본 설정으로 생성한 뒤 결과 폴더를 연다. 줄별 처리 기록은 같은 이름의 `.log` 에 남는다.

여기서 macOS 앱에서 흔히 생기는 문제가 두 개 나타났다.

1. Finder에서 실행되는 앱에는 Homebrew 경로가 PATH에 없어서 `ffmpeg` 를 찾지 못한다. 그래서 래퍼에 `export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"` 를 추가했다.
2. 드롭 동작을 `open -W -a` 로 흉내 내 시험했더니 **1분 43초**가 걸렸다. Claude Code는 macOS의 폴더 접근 권한 확인 창 때문에 처리가 1분 넘게 멈춰 있었던 것으로 추정했다. 확정은 아니었지만, 처음 실행할 때 **허용**을 눌러 달라고 안내했다.

두 번째 문제는 이후 Voxmith 앱 창을 만들 때 다시 나타나서, 결국 프로젝트 규칙("다시 빌드한 앱은 처음 실행할 때 문서 폴더 접근을 다시 묻고, 허용하기 전까지 서버가 시작 단계에서 멈춘다")으로 남았다. 이 드롭 앱 자체는 다음 날인 10월 14일에 `/Applications/Voxmith.app` 으로 대체되어 지워졌다.

시험용 출력 파일은 모두 지우고 3문장 샘플 하나만 남겼다. 이때가 10월 13일 00시 32분이었다. VoiceStudio 설치 가이드를 부탁한 지 두 시간이 채 지나지 않았다.

## 정리

두 시간 동안 일어난 일을 돌아보면, 나는 짧은 질문만 던졌고 Claude Code는 매번 코드와 로그를 직접 읽어 답을 찾았다. 그 과정에서 배운 것을 적어 둔다.

1. **에이전트의 실수는 규칙 파일에 남겨야 다시 일어나지 않는다.** CHANGELOG에서 가져온 v0.5.7은 404였다. Claude Code는 실수를 인정하는 데서 멈추지 않고 "최신 버전은 `releases/latest` 로 확인한다"는 규칙을 `CLAUDE.md` 에 넣었다.
2. **"손상됨"은 파일이 망가졌다는 뜻이 아닐 수 있다.** 체크섬이 공식 값과 일치했고, 원인은 불완전한 링커 서명과 브라우저 격리 속성의 조합이었다. 고치기 전에 읽기 전용으로 점검하고, 승인을 받은 뒤 실행하는 순서가 안전했다.
3. **목소리가 내 것이어도 모델 가중치의 라이선스가 따로 적용된다.** OmniVoice는 가중치가 CC-BY-NC라서 상업적으로 쓸 수 없었다. Qwen3-TTS는 Apache-2.0이다.
4. **앱 화면의 설정이 실제 모델에 전달되는지 확인해야 한다.** "프로덕션 재정의"의 조절 항목은 대부분 Qwen3-TTS에 전달되지 않았다. 이 사실을 확인한 것이 앱을 떠나 직접 스크립트를 만들게 된 계기였다.
5. **옵션을 빼면 기본 동작이 무엇인지까지 확인해야 한다.** `--ref_text` 를 빼면 CLI가 1.5 GB 모델을 내려받아 대본을 채워 넣었고, 그 바람에 비교 실험 하나가 무의미해졌다.
6. **측정값이 좋아졌다고 문제가 해결된 것은 아니다.** 말끝 문제는 숫자로는 해결된 것처럼 보였다. 이 교훈은 다음 글에서 제대로 다룬다.

이 글에 나온 Qwen3-TTS(`Qwen/Qwen3-TTS-12Hz-1.7B-Base` 와 MLX 변환본 `mlx-community/Qwen3-TTS-12Hz-1.7B-Base-4bit`)와 VoxCPM2(`openbmb/VoxCPM2`)는 Apache-2.0 라이선스로 공개된 모델이다. VoiceStudio는 AGPL-3.0이고, Voxmith에는 VoiceStudio의 코드가 들어 있지 않다.

다음 글에서는 고쳤다고 믿었던 말끝 끊김 문제를 다시 분석한다. 에이전트 여섯 개로 원인을 진단하다가, 이 수정이 실제로는 아무것도 고치지 않았다는 사실을 알게 되는 이야기다.

#!/bin/bash

# 1. 제목 인자 받기
title="$1"

if [ -z "$title" ]; then
  echo "❌ 제목을 입력해주세요. 예: newpost \"제목\""
  exit 1
fi

# 2. 제목을 slug 형태로 변환 (공백 → 하이픈, 소문자)
slug=$(echo "$title" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')

# 3. 날짜 및 시간 설정
date=$(date +"%Y-%m-%d")
datetime=$(date +"%Y-%m-%d %H:%M:%S %z")

# 4. 파일 경로 지정
filename="_posts/${date}-${slug}.md"

# 5. 파일 생성
mkdir -p _posts

cat <<EOF > "$filename"
---
title: "$title"
date: $datetime
categories: [Blog]
tags: [template]
---

EOF

echo "✅ Created: $filename"
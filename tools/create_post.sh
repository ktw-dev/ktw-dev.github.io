#!/bin/bash

# 1. 제목 인자 받기
title="$1"
custom_date="$2"  # 선택적 인자

if [ -z "$title" ]; then
  echo "❌ 제목을 입력해주세요. 예: newpost \"제목\" [YYYY-MM-DD]"
  exit 1
fi

# 2. 제목을 slug 형태로 변환 (공백 → 하이픈, 소문자)
slug=$(echo "$title" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')

# 3. 날짜 및 시간 설정
if [ -n "$custom_date" ]; then
  date="$custom_date"
  # custom_date가 유효한지 검사 (간단한 형식만 체크)
  if ! [[ "$date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    echo "❌ 날짜 형식이 올바르지 않습니다. 예: 2025-09-11"
    exit 1
  fi
  datetime="$date 00:00:00 +0900"
else
  date=$(date +"%Y-%m-%d")
  datetime=$(date +"%Y-%m-%d %H:%M:%S %z")
fi

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

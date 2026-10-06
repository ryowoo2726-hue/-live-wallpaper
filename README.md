# Live Wallpaper

인터랙티브 배경화면 프로젝트를 작품별 폴더로 보관합니다.

| 프로젝트 | 설명 | 실행 |
| --- | --- | --- |
| [fish-gather](fish-gather/) | 푸른 바다 속 실루엣 물고기. 마우스에 모이고, 먹이가 사라지면 각자 다시 헤엄칩니다. | [웹에서 열기](https://ryowoo2726-hue.github.io/-live-wallpaper/fish-gather/) |

## 로컬 실행

Node.js 20 이상에서 저장소 루트의 터미널로 실행합니다.

```sh
node fish-gather/serve.mjs
```

브라우저에서 `http://127.0.0.1:5173`을 엽니다. Windows에서는 `fish-gather/local-open.cmd`를 더블클릭해 실행할 수도 있습니다.

- 마우스 또는 터치: 물고기 모으기
- 방향키: 키보드로 모으는 위치 이동
- Escape: 물고기 관심 풀기
- Space: 재생 / 일시 정지
- F11: 브라우저 전체 화면

## 배포

`main` 브랜치에 올리면 GitHub Actions가 GitHub Pages에 자동 배포합니다. 각 프로젝트의 `dist/` 폴더가 프로젝트 이름 경로로 배포됩니다. 사이트의 첫 화면은 현재 `fish-gather/`입니다.

로컬에서 배포 파일을 준비하려면 다음을 실행합니다.

```sh
node scripts/build-pages.mjs
```

결과는 `_site/`에 생성됩니다. 로컬 실행 도구와 Git 기록은 배포 파일에 포함되지 않습니다.

새 작품은 별도 폴더에 추가하고 웹 실행 파일을 그 안의 `dist/`에 저장하면 자동으로 배포 대상에 포함됩니다.

## 이미지 출처

- 배경: [사용한 Pinterest 이미지](https://kr.pinterest.com/pin/9077636745555703/), [배경 원본 사이트](https://fondecranvip.com/fond-decran-ocean/?img=30)
- 물고기: 사용자가 제공한 `fish-gather/dist/assets/silhouette_fishes/` 이미지

이미지 권리는 각 원저작자에게 있습니다.

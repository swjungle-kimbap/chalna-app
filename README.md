# <img src="https://github.com/user-attachments/assets/f64a92e3-ea35-4627-9d53-71e03889aff1" alt="프로젝트제목" width="40" align="center"> Chalna
<div align="center">
  <img src="https://github.com/user-attachments/assets/0e3ec3ca-1110-4e52-b2e1-40da1bc267aa" alt="포스터" width="500" align="center">
  <br>
  <br>
  블루투스, GPS를 활용한 거리기반 채팅 애플리케이션입니다
</div>



## 🔧 개발 기간
- 24.06.14 ~ 24.07.19 



## 🧑‍💻 기술 스택

<div align="center">
   <span style="color: blue; font-size: 24px; font-weight: bold;">🌐 Front-End</span>
</div>
<br>
<div align="center">
  <img src="https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=white"/>
  <img src="https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>
</div>

<br>
<br>

<div align="center">
   <span style="color: blue; font-size: 24px; font-weight: bold;">🖥️ Back-End</span>
</div>
<br>
<div align="center">
  <img src="https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=java&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white"/>
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white"/>
</div>


## 👥 역할 분담

<div align="center">
<table width="100%">
  <tr>
    <td width="50%" valign="top">
      <h3 align="center">🌐 Front-End</h3>
      <table width="100%" align="center">
        <tr>
          <th>이름</th>
          <th>역할</th>
        </tr>
        <tr>
          <td>김은식</td>
          <td>BLE 기능, 장소 채팅, 마이페이지, 인연 로그</td>
        </tr>
        <tr>
          <td>박지아</td>
          <td>채팅, 채팅목록, 친구목록</td>
        </tr>
        <tr>
          <td>김주영</td>
          <td>FCM 발/수신, FCM 설정, 인연 스크린</td>
        </tr>
      </table>
    </td>
    <td width="50%" valign="top">
      <h3 align="center">🖥️ Back-End</h3>
      <table width="100%" align="center">
        <tr>
          <th>이름</th>
          <th>역할</th>
        </tr>
        <tr>
          <td>이다빈</td>
          <td>로그인, 파일 전송, 위치 기록, AWS 서버 구축 및 배포</td>
        </tr>
        <tr>
          <td>이다인</td>
          <td>파일 전송, 채팅</td>
        </tr>
        <tr>
          <td>최동환</td>
          <td>Security, 리펙토링, 장소 채팅</td>
        </tr>
        <tr>
          <td>김주영</td>
          <td>FCM 발/수신, FCM 설정, 인연 보내기</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</div>

## 🪧 아키텍쳐

<div align="center">
  <img src="https://github.com/user-attachments/assets/baf01d95-17eb-40b1-bde9-51a0f37b1267" alt="스크린샷 2024-07-22 오후 1 40 53" />
</div>

## ✍️ 시작 가이드
⚙️ Client

실행
```
yarn install
npx react-native start
```
배포 
```
./android/gradlew assembleRelease
adb install android/app/build/outputs/apk/release/app-release.apk
```

## <img src="https://github.com/user-attachments/assets/29c1f291-db41-4e3e-8835-f3d63795eede" alt="주요기능" width="35" align="center">  주요 기능

<div align="center">
  <h3>인연 찾기</h3>
  <img src="https://github.com/user-attachments/assets/94af3637-1dc6-419b-b769-124a80ccc6b2" alt="인연 탐색" width="250">
  <br>
  주변의 찰나 사용자를 찾아 메세지를 보낼 수 있어요
</div>

<div align="center">
  <h3>인연 대화</h3>
  <img src="https://github.com/user-attachments/assets/8ffae29e-1e31-428d-9b73-ab82ed911d94" alt="인연 대화" width="250">
  <br>
  인연 메세지를 수락하면 5분간 대화를 할 수 있어요
</div>

<div align="center">
  <h3>인연 기록</h3>
  <img src="https://github.com/user-attachments/assets/5a02542f-f13d-461e-b92c-31fbe4b9884a" alt="인연 기록" width="250">
  <br>
  인연과 친구가 되면 지금까지 스쳤던 기록을 볼 수 있어요
</div>

<div align="center">
  <h3>장소 채팅</h3>
  <img src="https://github.com/user-attachments/assets/a9daa400-7379-43a5-92e5-a51a8c00b6a7" alt="장소 채팅" width="250">
  <br>
  내 주변 장소 채팅에 참가하거나 직접 만들 수 있어요
</div>

<div align="center">
  <h3>마이페이지</h3>
  <img src="https://github.com/user-attachments/assets/76e823d8-69a9-483d-9127-79061230636b" alt="마이 페이지" width="250">
  <br>
  인연 알림 설정을 할 수 있어요
</div>

<div align="center">
  <h3>로그인</h3>
  <img src="https://github.com/user-attachments/assets/73c8923b-da98-4176-a7bf-acbbb6a7671d" alt="로그인" width="250">
  <br>
  찰나를 시작해보세요
</div>

## 🖼️ 포스터

<div align="center">
<img src="https://github.com/user-attachments/assets/77da18d4-ad33-43fc-a60c-73c1ccc553ac" alt="포스터" width="800" align="center"/>
</div>




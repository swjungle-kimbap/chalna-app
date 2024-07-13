import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  // BleMainComponent style
  bleMainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  detectContainer: {
    height: 100, // 고정 높이 설정
    top: '20%',
    position: 'absolute',
    zIndex: 2,
  },
  lottieImage: {
    width: 600,
    height: 600,
    top: '5%',
    position: 'absolute',
    zIndex: 1,
  },
  // DetectDisplay style
  detectIconContainer: {
    position: 'relative', // 자식 요소의 절대 위치를 위해 설정
    width: 350, // lottieImage와 동일한 너비
    height: 350, // lottieImage와 동일한 높이
    justifyContent: 'center',
    alignItems: 'center',
  },
  detectIconWrapper: {
    position: 'absolute',
  },
  detectIcon: {
    width: 50,
    height: 50,
  },
  // BleBottomComponent style
  bleBottomContainer: {
    height: 150, // 고정 높이 설정
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 15,
    textAlign: 'center', // 텍스트 가운데 정렬 추가
  },
  blockText: {
    marginTop: 40,
    fontSize: 20,
    textAlign: 'center', // 텍스트 가운데 정렬 추가
  },
  blockText2: {
    marginTop: 10,
    fontSize: 20,
    textAlign: 'center', // 텍스트 가운데 정렬 추가
  },
  findText: {
    fontSize: 20,
    marginBottom: 40,
    color: 'gray',
    textAlign: 'center', // 텍스트 가운데 정렬 추가
  },
  bleBottomSubContainer: {
    width: 300, // 고정 너비
    height: '100%', // 고정 높이
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  findTextSmall: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10, // 5에서 20으로 증가
    textAlign: 'center', // 텍스트 가운데 정렬 추가
  },
  // MessageGif style
  messageButtonContainer: {
    alignSelf: 'center', // 가운데 정렬 추가
    alignItems: 'center',
  },
  messageGif: {
    width: 150,
    height: 150,
  },
});

export default styles;

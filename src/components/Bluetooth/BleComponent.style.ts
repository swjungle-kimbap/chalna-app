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
    height: '50%', // 고정 높이
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  findTextSmall: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center', // 텍스트 가운데 정렬 추가
    marginBottom: -40,
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
  messageBoxContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // 다른 컴포넌트들보다 위에 나타나도록 zIndex 설정

  },  
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default styles;

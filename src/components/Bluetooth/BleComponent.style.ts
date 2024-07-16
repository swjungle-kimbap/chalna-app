import { StyleSheet } from 'react-native';
import ColorTheme from "../../styles/ColorTheme";

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
    top: '1%',
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
    color:'gray',
    fontSize: 15,
    textAlign: 'center', // 텍스트 가운데 정렬 추가
  },
  blockText: {
    color:'gray',
    marginTop: 40,
    fontSize: 20,
    textAlign: 'center', // 텍스트 가운데 정렬 추가
  },
  blockText2: {
    color:'gray',
    marginTop: 10,
    fontSize: 20,
    textAlign: 'center', // 텍스트 가운데 정렬 추가
  },
  background: {
    backgroundColor: ColorTheme.colors.light_sub,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between', // 상하 배치
    alignItems: 'center',
    paddingBottom: 10,
  },
  TVButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 20,
    left: 100,
    height: 40,
    width: 40,
    borderRadius: 20,
    paddingVertical: 2, // 상하 여백 설정
    paddingHorizontal: 3, // 좌우 여백 설정
    zIndex: 3
  },
  findText: {
    fontSize: 16,
    marginBottom: 40,
    color: 'gray',
    textAlign: 'center', // 텍스트 가운데 정렬 추가
  },
  bleBottomSubContainer: {
    width: 300, // 고정 너비
    height: '20%', // 고정 높이
    justifyContent: 'center',
    alignItems: 'center',
  },
  findTextSmall: {
    fontSize: 16,
    color: 'gray',
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

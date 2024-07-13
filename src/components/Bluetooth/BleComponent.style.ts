import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  // BleMainComponent style
  bleMainContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  detectContainer: {
    marginBottom: 20, // DetectDisplay와 LottieView 사이의 간격을 설정
  },
  lottieImage: {
    width: 350,
    height: 350,
  },
  // DetectDisplay style
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  image: {
    width: 50,
    height: 50,
  },
  // BleBottomComponent style
  bleBottomContainer: {
    bottom: 0,
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
    marginBottom: 20,
    color: 'gray',
    textAlign: 'center', // 텍스트 가운데 정렬 추가
  },
  findTextSmall: {
    fontSize: 15,
    color: 'gray',
    marginBottom: 15, // 5에서 20으로 증가
    textAlign: 'center', // 텍스트 가운데 정렬 추가
  },
  // MessageGif style
  messageButtonContainer: {
    position: 'absolute', // 절대 위치 추가
    alignSelf: 'center', // 가운데 정렬 추가
    alignItems: 'center',
    marginBottom: 10, // marginTop 추가
  },
  messageGif: {
    width: 150,
    height: 150,
  },
});

export default styles;

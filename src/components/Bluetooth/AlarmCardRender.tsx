import { AxiosResponse, MatchAcceptResponse } from '../../interfaces';
import Button from '../common/Button'
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import FontTheme from '../../styles/FontTheme';
import { axiosPost } from '../../axios/axios.method';
import { navigate } from '../../navigation/RootNavigation';
import {urls} from "../../axios/config";
import { MatchFCM } from '../../interfaces/ReceivedFCMData.type';
import FastImage from 'react-native-fast-image';

export interface AlaramItemProps{
  item: MatchFCM;
  expandedCardId: string;
  restTime: number;
  handleCardPress: (notificationId: string) => void;
  removeAlarmItem: (notificationId: string, DeleteAll?:boolean) =>void;
  closeModal: Function;
}

const AlarmCardRender: React.FC<AlaramItemProps> =
  ({ item, expandedCardId, restTime, closeModal, handleCardPress, removeAlarmItem }) => {

    const handleAcceptButton = async (notificationId:string) => {
    const matchAcceptResponse = await axiosPost<AxiosResponse<MatchAcceptResponse>>
                              (urls.ACCEPT_MSG_URL + notificationId, "인연 수락");
    removeAlarmItem(notificationId);
    navigate("채팅", { chatRoomId: matchAcceptResponse.data.data.chatRoomId });
  }

  return (
  <TouchableOpacity onPress={() => handleCardPress(item.id)}>
    <View style={styles.modalContent}>
      <View style={styles.headerText}>
        <Text style={styles.alarmCnt}>{`${item.overlapCount}번 스쳐간 인연입니다.`}</Text>
        <Text style={styles.alarmCnt}>{restTime >= 5 ? "방금 전" : restTime > 0 ? `${restTime}분 남음` : "1분 미만"}</Text>
      </View>
      {expandedCardId === item.id ? (
        <>
          {
            item.image ? 
            <FastImage
            style={styles.fullScreenImage}
            source={{ uri: item.image, priority: FastImage.priority.normal }}
            resizeMode={FastImage.resizeMode.contain}
          />
          : <Text
            numberOfLines={5}
            ellipsizeMode="tail"
            style={styles.alarmContent}>{item.message}</Text>
          }
          
          <View style={styles.btnContainer}>
            <Button style={{flex:1}} variant="sub" title="대화하기"
              onPress={async () => {
                handleAcceptButton(item.id);
                closeModal();
              }} />
            <Button style={{flex:1}} variant="sub" title="지우기"
              onPress={() => {removeAlarmItem(item.id)}} />
          </View>
        </>
      ) : (
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.alarmContent}
        >
          {item.message}
        </Text>
      )}
    </View>
  </TouchableOpacity>
);
};

const styles = StyleSheet.create({
  headerText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fullScreenImage: {
    width: '100%',
    height: 200,
  },
   modalContent: {
    width: '100%',
    padding: 13,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
  },
  alarmCnt: {
    fontSize:12,
    marginBottom:5,
    fontFamily: FontTheme.fonts.title,
    color: '#979797',
  },
  alarmContent: {
    fontSize: 14,
    textAlign: 'left',
    width: '100%',
    fontFamily: FontTheme.fonts.main,
    color: '#060606',
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});


export default AlarmCardRender;

import { AlarmItem, MatchAcceptResponse } from '../../interfaces';
import Button from '../common/Button'
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import FontTheme from '../../styles/FontTheme';
import { axiosPost, axiosPut } from '../../axios/axios.method';
import Config from 'react-native-config';
import { AxiosResponse } from 'axios';
import { navigate } from '../../navigation/RootNavigation';
import {urls} from "../../axios/config";

export interface AlaramItemProps{
  item: AlarmItem;
  expandedCardId: number;
  handleCardPress: (notificationId: number) => void;
  removeAlarmItem: (notificationId: number, DeleteAll?:boolean) =>void;
}

const AlarmCardRender: React.FC<AlaramItemProps> =
  ({ item, expandedCardId, handleCardPress, removeAlarmItem }) => {

  const handleAcceptButton = async (notificationId:number) => {
    removeAlarmItem(notificationId);
    const matchAcceptResponse = await axiosPost<AxiosResponse<MatchAcceptResponse>>
                              (urls.ACCEPT_MSG_URL + notificationId.toString(), "인연 수락");
    navigate("채팅", { chatRoomId: matchAcceptResponse.data.data.chatRoomId });
  }

  const handleDeleteButton = async (notificationId:number) => {
    await axiosPut(urls.DELETE_MSG_URL + notificationId.toString(), "인연 알림 지우기");
    removeAlarmItem(notificationId);
  }

  return (
  <TouchableOpacity onPress={() => handleCardPress(item.notificationId)}>
    <View style={styles.modalContent}>
      <Text style={styles.alarmCnt}>{`${item.overlapCount}번 스쳐간 인연입니다.`}</Text>
      {expandedCardId === item.notificationId ? (
        <>
          <Text
            numberOfLines={5}
            ellipsizeMode="tail"
            style={styles.alarmContent}
          >
            {item.message}
          </Text>
          <View style={styles.btnContainer}>
            <Button style={{flex:1}} variant="sub" title="대화하기"
              onPress={async () => {handleAcceptButton(item.notificationId)}} />
            <Button style={{flex:1}} variant="sub" title="지우기"
              onPress={async () => {handleDeleteButton(item.notificationId)}} />
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
   modalContent: {
    width: '100%',
    padding: 13,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  alarmCnt: {
    fontSize:10,
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

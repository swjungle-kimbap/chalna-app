import { AlarmItem } from '../../interfaces';
import Button from '../common/Button'
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import FontTheme from '../../styles/FontTheme';

export interface AlaramItemProps{
  item: AlarmItem;
  expandedCardId: number | null;
  handleCardPress: (createAt: number) => void;
  navigate: () => void;
  removeAlarmItem: (idx:number) =>void;
}

const AlarmCardRender: React.FC<AlaramItemProps> = ({ item, expandedCardId, handleCardPress, navigate, removeAlarmItem }) => {
  return (<TouchableOpacity onPress={() => handleCardPress(item.idx)}>
    <View style={styles.modalContent}>
      <Text style={styles.alarmCnt}>{`${item.overlapCount}번 스쳐간 인연입니다.`}</Text>
      {expandedCardId === item.idx ? (
        <>
          <Text 
            numberOfLines={5}
            ellipsizeMode="tail"
            style={styles.alarmContent}
          >
            {item.message}
          </Text>
          <View style={styles.btnContainer}>
            <Button style={{flex:1}} variant="sub" title="대화하기" onPress={() => navigate()} />
            <Button style={{flex:1}} variant="sub" title="지우기" onPress={() => removeAlarmItem(item.idx)} />
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
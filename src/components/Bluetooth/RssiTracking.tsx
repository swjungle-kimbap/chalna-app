import { FlatList, Modal, StyleSheet, TouchableWithoutFeedback, View }from 'react-native';
import Text from '../common/Text';
import RoundBox from '../common/RoundBox';
import { useMMKVNumber } from 'react-native-mmkv';
import { userMMKVStorage } from '../../utils/mmkvStorage';

const RssiTracking = ({closeModal, modalVisible, items}) => {
  const [advertiseMode, setAdvertiseMode] = useMMKVNumber('bluetooth.advertiseMode', userMMKVStorage);
  const [txPowerLevel, setTxPowerLevel] = useMMKVNumber('bluetooth.txPowerLevel', userMMKVStorage);
  const [scanMode, setScanMode] = useMMKVNumber('bluetooth.scanMode', userMMKVStorage);
  const [numberOfMatches, setNumberOfMatches] = useMMKVNumber('bluetooth.numberOfMatches', userMMKVStorage);
  const [RSSIvalue, setRSSIvalue] = useMMKVNumber('bluetooth.rssivalue', userMMKVStorage);

  const renderAlarmCard = ({ item }) => {
    return (
      <RoundBox>
        <Text>ID: {item.uuid.slice(19)} RSSI: {item.rssi}</Text>
      </RoundBox>
    )
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <TouchableWithoutFeedback onPress={closeModal}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <>
              <RoundBox>
                <Text>advertiseMode: {advertiseMode} txPowerLevel: {txPowerLevel} scanMode: {scanMode}</Text>
                <Text>numberOfMatches: {numberOfMatches} RSSIvalue: {RSSIvalue}</Text>
              </RoundBox>
              <View style={styles.modalpos}>
                <FlatList
                  data={items ? Array.from(items, ([uuid, rssi]:[string, number]) => ({ uuid, rssi })) : []}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={renderAlarmCard}
                />
              </View>
            </>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  height:'70%',
},
modalpos: {
  position: 'absolute',
  top: 65,
  left:10,
  width:'80%',
  maxHeight: '40%',
},
});


export default RssiTracking;
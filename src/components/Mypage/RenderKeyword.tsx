import { Text, StyleSheet, View } from "react-native";
import FontTheme from '../../styles/FontTheme';
import Button from '../../components/common/Button';
import RoundBox from "../../components/common/RoundBox";

type RenderKeywordProps = {
  item: string;
  itemDelete: (value:string) => void
}

const RenderKeyword:React.FC<RenderKeywordProps> = ({ item, itemDelete }) => {
  return (
    <RoundBox style={{ height: 40, padding:0}}>
      <View style={styles.keywordContainer}>
        <Text style={styles.keywordText}>{item}</Text>
        <Button
          iconSource={require('../../assets/buttons/CloseButton.png')}
          imageStyle={styles.closeButton}
          onPress={() => itemDelete(item)}
        />
      </View>
    </RoundBox>
  );
};

const styles = StyleSheet.create({
   keywordContainer: {
    flexDirection: 'row',
    justifyContent:'space-between',
  },
  closeButton: {
    width: 16,
    height: 16,
    color: '#979797',
    margin:10,
  },
  keywordText: {
    fontSize: 13,
    color: '#007AFF',
    fontFamily: FontTheme.fonts.main,
    paddingVertical: 10,
    paddingLeft: 10,
  },
});

export default RenderKeyword;
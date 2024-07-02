import { useEffect, useState } from "react";
import InlineButton from "../../components/Mypage/InlineButton";
import Toggle from "../../components/common/Toggle";
import { Text, StyleSheet, TextInput, View, Alert, FlatList } from "react-native";
import FontTheme from '../../styles/FontTheme';
import Button from '../../components/common/Button';
import RenderKeyword from "../../components/Mypage/RenderKeyword";

const keywords = ["a", "basdfdsafasd", "가가가가가가가가가가"];

const KeywordSelectScreen: React.FC = ({}) => {
  const [isKeyword, setIsKeyword] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>("키워드를 추가해 주세요");
  const [keywordList, setKeywordList] = useState<Array<string>>([]);

  useEffect(()=> {
    
  })

  const handleDeleteKeyword = (item) => {
    const filteredKeywordList = keywords.filter((value) => value !== item); 
    setKeywordList(filteredKeywordList);
  }

  const handleAddKeyword = () => {
    keywords.push(keyword);
  }

  return (
    <View style={styles.background}>
      <View style={styles.mypage}>
        <InlineButton text="키워드 알림 설정" textstyle={{ paddingTop: 10 }} horizon="bottom">
          <Toggle value={isKeyword} toggleHandler={(value) => setIsKeyword(value)} />
        </InlineButton>
        {isKeyword && (
          <>
            <View style={styles.headerText}>
              <Text style={styles.text}>
                선호 키워드 추가 [{keywords.length}/20]
                <Button
                  title="💬"
                  onPress={() => {
                    Alert.alert("선호 키워드 설정", "인연 메세지에서 설정된 키워드가 포함된 알림만 받아요!");
                  }}
                />
              </Text>
              <Button title="전체 삭제" titleStyle={styles.alldeleteButton} />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={keyword}
                onChangeText={(value) => setKeyword(value)}
                maxLength={15}
              />
              <Button iconSource={require('../../assets/buttons/addButton.png')} 
                imageStyle={styles.addButton} onPress={handleAddKeyword}/>
            </View>
            <FlatList
              data={keywords}
              renderItem={({ item }) => ( 
                <RenderKeyword item={item} itemDelete={handleDeleteKeyword} /> 
              )}
              keyExtractor={(_, index) => index.toString()}
              style={{ maxHeight: '75%' }}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  alldeleteButton: {
    fontSize: 14, 
    color:'#979797', 
    paddingTop: 10,
  },
  headerText:{
    flexDirection: 'row',
    justifyContent:'space-between',
  },
  inputContainer: {
    height: 40,
    width: '100%',
    color: '#333',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    elevation: 2,
    flexDirection: 'row',
    justifyContent:'space-between',
  }, 
  addButton: {
    width: 20,
    height: 20,
    margin:10,
    color: '#979797'
  },
  mypage: {
    width: "90%",
    alignSelf: 'center', 
    paddingTop: 20,
  },
  background: {
    backgroundColor: "#fff",
    flex: 1,
  },
  inlineButtons: {
    justifyContent:"space-evenly",
    height:150
  },
  textInput: {
    color: '#333',
    paddingLeft: 10,
  },
  text: {
    fontSize: 15,
    color: '#000',
    fontFamily: FontTheme.fonts.main,
    paddingVertical: 7,
  }
});

export default KeywordSelectScreen;

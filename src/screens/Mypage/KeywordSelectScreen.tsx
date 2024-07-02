import { useEffect, useState, useRef, useCallback } from "react";
import InlineButton from "../../components/Mypage/InlineButton";
import Toggle from "../../components/common/Toggle";
import { Text, StyleSheet, TextInput, View, Alert, FlatList,
  Keyboard, TouchableWithoutFeedback 
 } from "react-native";
import FontTheme from '../../styles/FontTheme';
import Button from '../../components/common/Button';
import RenderKeyword from "../../components/Mypage/RenderKeyword";
import { getAsyncObject, setAsyncObject } from "../../utils/asyncStorage";
import { SavedKeywords } from "../../interfaces";
import useChangeBackgroundSave from "../../hooks/useChangeBackgroundSave";
import { isKeywordAlarmState } from "../../recoil/atoms";
import { useRecoilState } from "recoil";
import { useFocusEffect } from "@react-navigation/core";
import { axiosDelete, axiosPatch, axiosPost } from "../../axios/axios.method";
import { urls } from "../../axios/config";

const KeywordSelectScreen: React.FC = ({}) => {
  const [isKeyword, setIsKeyword] = useRecoilState<boolean>(isKeywordAlarmState);
  const [keyword, setKeyword] = useState<string>("");
  const [keywordList, setKeywordList] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const fetchData = async () => {
      const savedKeywords = await getAsyncObject<SavedKeywords>("savedKeywords");
      console.log(savedKeywords);
      if (savedKeywords.interestKeyword) {
        setKeywordList(savedKeywords.interestKeyword);
      }
    }
    fetchData();
  }, [])

  useFocusEffect(
    useCallback(() => {
      return () => {
        setAsyncObject<SavedKeywords>("savedKeywords", { interestKeyword: keywordList });
      };
    }, [keywordList])
  );

  useChangeBackgroundSave<SavedKeywords>("savedKeywords", {interestKeyword:keywordList});

  const handleDeleteKeyword = (item) => {
    const filteredKeywordList = keywordList.filter((value) => value !== item); 
    setKeywordList(filteredKeywordList);
    axiosDelete(`${urls.DELETE_ALL_KEYWORDS_URL}/${item}`, "선호 키워드 삭제")
  }

  const handleAllDeleteKeyword = () => {
    axiosDelete(urls.DELETE_ALL_KEYWORDS_URL, "선호 키워드 전체 삭제")
    setKeywordList([]);
  }

  const handleAddKeyword = () => {
    if (keywordList.includes(keyword)) {
      Alert.alert("부적절한 입력", "중복된 값을 넣었습니다.");
      return;
    }

    if (keyword.trim() === "" ) {
      Alert.alert("부적절한 입력", "값을 입력해 주세요.");
      return;
    }

    axiosPost(urls.ADD_KEYWORD_URL, "선호 키워드 추가", {interestKeyword: keyword});
    setKeywordList([...keywordList, keyword]);
    setKeyword(""); 
  }

  useEffect(() => {
    if (isKeyword && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isKeyword]); 

  const handleIsKeywordAlarm = (value) => {
    setIsKeyword(value)
    axiosPatch(urls.PATCH_APP_SETTING_URL, "앱 설정", {isKeywordAlarm: value});
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.background}>
        <View style={styles.mypage}>
          <InlineButton text="키워드 알림 설정" textstyle={{ paddingTop: 10 }} horizon="bottom">
            <Toggle value={isKeyword} toggleHandler={handleIsKeywordAlarm} />
          </InlineButton>
          {isKeyword && (
            <>
              <View style={styles.headerText}>
                <Text style={styles.text}>
                  선호 키워드 추가 [{keywordList ? keywordList.length: 0}/20]
                  <Button
                    title="  💬"
                    onPress={() => {
                      Alert.alert("선호 키워드 설정", "인연 메세지에서 설정된 키워드가 포함된 알림만 받아요!");
                    }}
                  />
                </Text>
                <Button title="전체 삭제" titleStyle={styles.alldeleteButton} onPress={handleAllDeleteKeyword}/>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={keyword}
                  onChangeText={(value) => setKeyword(value)}
                  maxLength={15}
                  ref={inputRef}
                  blurOnSubmit={false}
                  onSubmitEditing={() => handleAddKeyword()} 
                />
                <Button iconSource={require('../../assets/buttons/addButton.png')} 
                  imageStyle={styles.addButton} onPress={handleAddKeyword}/>
              </View>
              <FlatList
                data={keywordList}
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
    </TouchableWithoutFeedback>
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
    width:"80%"
  },
  text: {
    fontSize: 15,
    color: '#000',
    fontFamily: FontTheme.fonts.main,
    paddingVertical: 7,
  }
});

export default KeywordSelectScreen;

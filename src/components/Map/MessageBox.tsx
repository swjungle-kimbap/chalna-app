import  { useState, useEffect, useRef } from 'react';
import RoundBox from '../common/RoundBox';
import Button from '../common/Button';
import { StyleSheet, TextInput, View, Alert } from 'react-native';
import Text from '../common/Text';
import { getAsyncString, setAsyncString } from "../../utils/asyncStorage";
import useBackgroundSave from '../../hooks/useChangeBackgroundSave';
import { useRecoilState } from 'recoil';
import { showMsgBoxState } from '../../recoil/atoms';

const tags = ['상담', '질문', '대화', '만남'];

type MessageBoxProps = {
  isSendingMsg: boolean;
  handleSendingMessage: () => void; 
};

const MessageBox: React.FC<MessageBoxProps> = ({isSendingMsg, handleSendingMessage})  => {
  const [showMsgBox, setShowMsgBox] = useRecoilState<boolean>(showMsgBoxState);
  const [msgText, setMsgText] = useState('안녕하세요!');
  const [selectedTag, setSelectedTag] = useState<string>(''); 
  const msgTextRef = useRef(msgText);

  useEffect(() => {
    const fetchSavedData = async () => {
      const savedmsgText = await getAsyncString('msgText')
      setMsgText(savedmsgText);
      const savedTag = await getAsyncString('tag')
      setSelectedTag(savedTag);
    };
    fetchSavedData();
  }, []);
  
  const handleTagPress = async (tag: string) => {
    setSelectedTag(prevTag => {
      if (prevTag === tag)
        return '';
      setAsyncString('tag', tag);
      return tag 
    }); 
  };
  const checkvalidInput = () => {
    if (!isSendingMsg && msgTextRef.current.length < 5) {
      Alert.alert('내용을 더 채워 주세요', '5글자 이상 입력해 주세요!');
      return false;
    } else {
      setAsyncString('msgText', msgText);
      return true;
    }
  }
  useEffect(()=> {
    setAsyncString('msgText', msgText);
  }, [showMsgBox])

  useBackgroundSave<string>('msgText', msgTextRef, msgText);
  return (
    <>
      {showMsgBox ? (
          <View style={styles.msgcontainer} >
            <RoundBox width='95%' style={[styles.msgBox, {borderColor : isSendingMsg ? '#14F12A': '#979797'}]}>
              <View style={styles.titleContainer}>
                <Text variant='title' style={styles.title}>메세지</Text>
                  {tags.map((tag) => (
                    <Button titleStyle={[styles.tagText, selectedTag === tag && styles.selectedTag]} 
                      variant='sub' title={`#${tag}`}  onPress={() => handleTagPress(tag)} 
                      key={tag} activeOpacity={0.6} />
                  ))}
              </View>
              <TextInput value={msgText} style={[styles.textInput, { color: '#333' }]}
                  onChange={(event) => {setMsgText(event.nativeEvent.text);}}
                  />
              <Button title={isSendingMsg ? '멈추기' : '보내기'} variant='main' 
              onPress={() =>{
                const checkValid = checkvalidInput();
                if (isSendingMsg || checkValid)
                  handleSendingMessage();}}/>
            </RoundBox>
          </View>
      ) : (
        <RoundBox width='95%' style={[styles.buttonContainer, {borderColor : isSendingMsg ? '#14F12A': '#979797'}]}>
          <Button title='인연 보내기' onPress={() => setShowMsgBox(true)}/>
        </RoundBox>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  tagText:{
    paddingTop: 15,
  },
  selectedTag: {
    color: '#000', 
  },
  closebutton: {
    width:15,
    height:15,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // 요소 간격 최대화
    width: '100%', // 컨테이너 너비를 꽉 채움
    marginBottom: 10,
  },
  sendButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', 
    width: '100%', 
  },
  msgcontainer: {
    position: 'absolute',
    width: '95%',
    bottom: 10, 
    right: 5,
    zIndex: 2,
  },
  tagcontainer: {
    position: 'absolute',
    width: '95%',
    bottom: 280, 
    right: 5,
    zIndex: 2,
  },
  msgBox: {
    width: '95%',
    paddingTop: 0,
    padding: 20,
    borderTopWidth: 4,
  },
  title: {
    paddingTop: 15,
    fontSize: 18,
  },
  textInput: {
    width: '100%',
    padding: 10,
    borderColor: '#000',
    color: '#FFF',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
  tagContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    width: '100%', 
    marginBottom: 10,
  },
  MsgContainer: {
    width: '95%',
    position: 'absolute',
    bottom: 65, 
    right: 5,
    zIndex: 2,
  },
  buttonContainer: {
    width: '75%',
    position: 'absolute',
    bottom: 10, 
    right: 10,
    zIndex: 2,
    borderTopWidth: 2,
  }
});

export default MessageBox;
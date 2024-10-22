import React, { useCallback, useRef, useMemo, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Dimensions, LogBox } from "react-native";
import BottomSheet, { BottomSheetView, BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useRecoilValue, useRecoilState } from "recoil";
import { LocalChatListState, getLocalChatRefreshState } from "../../recoil/atoms";
import RoundBox from "../common/RoundBox";
import Text from "../common/Text";
import Button from "../common/Button";
import { LocalChat } from "../../interfaces";
import ProfileImage from "../common/ProfileImage";
import { distanceLimit } from "./LocalChatMarkerOverlay";
import { localChatJoin, autolocalChat , joinLocalChat} from "../../service/LocalChat"; // autolocalChat 임포트 추가
import color from "../../styles/ColorTheme";

LogBox.ignoreLogs([
  "[Reanimated] Tried to modify key `reduceMotion` of an object which has been already passed to a worklet. See https://docs.swmansion.com/react-native-reanimated/docs/guides/troubleshooting#tried-to-modify-key-of-an-object-which-has-been-converted-to-a-shareable for more details."
]);

const MapBottomSheet = ({ cameraMove, setShowLocalChatModal }) => {
  const sheetRef = useRef<BottomSheet>(null);
  const localChatList = useRecoilValue(LocalChatListState);
  const [refresh, setRefresh] = useRecoilState(getLocalChatRefreshState);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const snapPoints = useMemo(() => [Math.floor(screenHeight * 1 / 100), Math.floor(screenHeight * 38 / 100), Math.floor(screenHeight * 70 / 100)], []);
  const [height, setHeight] = useState(snapPoints[0]);
  const [isBottom, setIsBottom] = useState(true);

  const handleSnapPress = useCallback((index) => {
    sheetRef.current?.snapToIndex(index);
  }, []);

  const onTapCard = ({ longitude, latitude }) => {
    cameraMove({ longitude, latitude });
  }

  const handleSheetChanges = (index: number) => {
    if (index === 1) {
      setHeight(snapPoints[1]);
    } else if (index == 0) {
      setHeight(snapPoints[0]);
      setIsBottom(true);
    }
  };

  const LocalChatRender = useCallback(({ item, index }) => {
    const localChat: LocalChat = item.localChat;
    const distance = Math.round(localChat.distance * 1000);

    const handleJoinChat = async () => {
      if (item.isJoined) {
        await autolocalChat(localChat, localChat.distance , setRefresh);
      } else {
        await joinLocalChat(localChat, localChat.distance, setRefresh);
      }
    };

    return (
      <TouchableOpacity onPress={() => {
        onTapCard({ longitude: localChat.longitude, latitude: localChat.latitude });
        handleJoinChat();
        handleSnapPress(1);
      }}>
        <RoundBox key={index} style={{ elevation: 0, backgroundColor: distance > distanceLimit ? 'gray' : 'white' }}>
          <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
            <View style={styles.chatRoomText}>
              <ProfileImage profileImageId={localChat.imageId} avatarStyle={styles.fullScreenImage} />
              <View style={{ alignItems: 'flex-start' }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={[styles.titleText, distance > distanceLimit && { color: '#f2f2f2' }]}>{localChat.name}</Text>
                  <Text style={[styles.numberText, distance > distanceLimit && { color: '#e6e6e6' }]}>{localChat.chatRoomMemberCount}</Text>
                  {item.isJoined && <Text style={[styles.numberText, distance > distanceLimit && { color: '#e6e6e6' }]}>참가중</Text>}
                </View>
                <Text style={[styles.descriptionText, distance > distanceLimit && { color: '#d9d9d9' }]}>{localChat.description}</Text>
              </View>
            </View>
            <Text style={[styles.distanceText, distance > distanceLimit && { color: '#cccccc' }]}>{distance}m</Text>
          </View>
        </RoundBox>
      </TouchableOpacity>
    );
  }, [localChatList, cameraMove, setRefresh]);

  const RenderHeader = useCallback(() => (
    <RoundBox style={styles.headerContainer}>
        <Button
          iconSource={require('../../assets/Icons/GoUpIcon.png')}
          imageStyle={styles.handle}
          onPress={() => {
            setHeight(snapPoints[2]);
            setIsBottom(false);
          }}
        />
      </RoundBox>
  ), []);

  return (
    <>
      <View style={[styles.container, { height }]}>
        {isBottom && (
          <View style={{ alignItems: 'center', justifyContent: 'center'}}>
            <RenderHeader />
          </View>
        ) }        
        <BottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
        >
          <Text style={styles.headText}>장소 채팅방 목록</Text>
          {localChatList.length ?
            <BottomSheetFlatList
              data={localChatList || []}
              keyExtractor={(item) => item.localChat.id.toString()}
              renderItem={LocalChatRender}
            /> :
            <BottomSheetView style={styles.textContainer}>
              <Text style={styles.descriptionText}>장소 채팅방이 없습니다. </Text>
              <Text style={styles.descriptionText}>장소 채팅방을 만들어 보세요!</Text>
              <RoundBox>
                <Button title="만들기" onPress={() => setShowLocalChatModal(true)} />
              </RoundBox>
            </BottomSheetView>
          }
        </BottomSheet>
   

      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 5,
    width: 40,
    height: 40,
    borderRadius: 35, 
    shadowColor: '#000', // 그림자 색상
    shadowOffset: {
      width: 0,
      height: 2,
    }, // 그림자의 오프셋 설정
    backgroundColor: 'white',
    shadowOpacity: 0.8, // 그림자의 투명도 설정
    shadowRadius: 8, // 그림자의 번지는 반경 설정
    elevation: 4, // 안드로이드에서 그림자 효과를 주기 위해 필요한 속성
  },
  handle: {
    width: 25,
    height: 25,
  },
  distanceText: {
    color: 'gray',
    fontSize: 12,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: {
    color: 'black',
    fontSize: 18,
  },
  titleText: {
    color: 'black',
    fontSize: 18,
    marginLeft: 10,
  },
  numberText: {
    color: 'gray',
    fontSize: 13,
    marginLeft: 10,
  },
  descriptionText: {
    fontSize: 13,
    color: '#666',
    paddingLeft: 10,
  },
  chatRoomText: {
    flexDirection: 'row',
    marginRight: 10,
  },
  fullScreenImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  container: {
    margin: 0,
    flex:1,
    zIndex: 3,
  },
});

export default MapBottomSheet;

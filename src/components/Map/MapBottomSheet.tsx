import React, { useCallback, useRef, useMemo, useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, Image, Dimensions, LogBox } from "react-native";
import BottomSheet, {BottomSheetView , BottomSheetFlatList, BottomSheetScrollView}from "@gorhom/bottom-sheet";
import { useRecoilState, useRecoilValue } from "recoil";
import { LocalChatListState, ProfileImageMapState } from "../../recoil/atoms";
import RoundBox from "../common/RoundBox";
import Text from "../common/Text";
import Button from "../common/Button";
import FastImage, { Source } from "react-native-fast-image";
import { LocalChat } from "../../interfaces";

LogBox.ignoreLogs([
  "[Reanimated] Tried to modify key 'reduceMotion' of an object which has been already passed to a worklet."
]);

const MapBottomSheet = ({cameraMove, setShowLocalChatModal}) => {
  const sheetRef = useRef<BottomSheet>(null);
  const localChatList = useRecoilValue(LocalChatListState);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const [profileImageMap, setProfileImageMap] = useRecoilState(ProfileImageMapState);
  const snapPoints = useMemo(() => [Math.floor(screenHeight * 3/100), Math.floor(screenHeight * 30/100), Math.floor(screenHeight * 70/100)], []);
  const [height, setHeight] = useState(snapPoints[0]);
  const [isBottom, setIsBottom] = useState(true);

  const handleSnapPress = useCallback((index) => {
    sheetRef.current?.snapToIndex(index);
  }, []);

  const onTapCard = ({longitude, latitude}) => {
    cameraMove({longitude, latitude});
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
    const localChat:LocalChat = item.localChat;
    const profilePicture = profileImageMap.get(localChat.imageId);
    const distance = Math.round(localChat.distance * 1000);

    return (
      <TouchableOpacity onPress={() => {
          onTapCard({longitude: localChat.longitude, latitude: localChat.latitude})
          handleSnapPress(1);
        }}>
        <RoundBox key={index} style={{elevation: 0}}> 
          <View style={{justifyContent:'space-between', flexDirection: 'row'}}>
            <View style={styles.chatRoomText}>
              {(profilePicture) ?
              (<FastImage
                style={styles.fullScreenImage}
                source={{uri: profilePicture, priority: FastImage.priority.normal } as Source}
                resizeMode={FastImage.resizeMode.cover}
                />) : (
              <Image source={require('../../assets/images/anonymous.png')} style={styles.fullScreenImage}/>)}
              <View style={{flexDirection: 'column', justifyContent:'flex-start'}}>
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.titleText}>{localChat.name}</Text>
                  <Text style={styles.numberText}>{localChat.chatRoomMemberCount}</Text>
                </View>
                <Text style={styles.descriptionText}>{localChat.description}</Text> 
              </View>
            </View>
            <Text style={styles.distanceText}>{distance}m</Text>
          </View>
        </RoundBox>
      </TouchableOpacity>
    );
}, []);

const RenderHeader = useCallback(() => (
  <TouchableOpacity style={styles.headerContainer} 
    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
    onPress={() => {
      setHeight(snapPoints[2]);
      setIsBottom(false);
    }}>
    <View style={styles.header}>
      <View style={styles.handle} />
    </View>
    </TouchableOpacity>
  ), []);

  return (
    <>
    <View style={[styles.container, {height}]}>
      {isBottom &&
        <View style={{alignItems:'center', justifyContent:'center'}}>
          <RenderHeader/> 
        </View>}
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
      > 
      {localChatList.length ? 
        <BottomSheetFlatList 
          data={localChatList || []} 
          keyExtractor={(item) => item.localChat.id.toString()}
          renderItem={LocalChatRender} 
        /> :
        <BottomSheetView style = {styles.textContainer}>
          <Text style={styles.descriptionText}>장소 채팅방이 없습니다. </Text>
          <Text style={styles.descriptionText}>장소 채팅방을 만들어 보세요!</Text>
          <RoundBox>
            <Button title="만들기" onPress={()=> setShowLocalChatModal(true)}/>
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
    position:'absolute',
    paddingBottom: 6,
  },
  header: {
    width: 40,
    height: 6,
    backgroundColor: 'gray',
    borderRadius: 3,
  },
  handle: {
    width: 40,
    height: 6,
    backgroundColor: 'gray',
    borderRadius: 3,
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
  titleText: {
    color: 'black',
    fontSize: 18,
    marginLeft:10,
  },
  numberText: {
    color: 'gray',
    fontSize: 13,
    marginLeft: 10,
  },
  descriptionText: {
    fontSize: 13,
    color: '#666',
    textAlign:'left'
  },
  chatRoomText: {
    flexDirection:'row',
    marginRight: 10, 
  },
  fullScreenImage: {
    width: 40,
    height: 40,
    borderRadius:10,
  },
  container: {
    margin: 0,
    zIndex: 3,
  },
});


export default MapBottomSheet;
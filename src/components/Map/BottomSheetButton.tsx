import RoundBox from "../common/RoundBox";
import Button from "../../components/common/Button";
import { useState } from "react";
import { StyleSheet } from "react-native";
import React from "react";
import MapBottomSheet from "./MapBottomSheet";

const BottomSheetButton = () => {
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);

  const openModal = () => {
    setBottomSheetVisible(true);
  };

  return (
    <>
      <MapBottomSheet />
      <RoundBox style={styles.localChatButton}>
        <Button
          iconSource={require('../../assets/buttons/AddLocalChatButton.png')}
          imageStyle={styles.buttonImage}
          onPress={openModal}
        />
      </RoundBox>
    </>
  )
}

const styles = StyleSheet.create({
  localChatButton : {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 20,
    right: 20,
    height: 50, 
    width: 50,
    borderRadius: 30, 
    paddingVertical: 2, 
    paddingHorizontal: 3, 
    zIndex:3
  },
  buttonImage: {
    width: 35,
    height: 35,
    tintColor: '#979797'
  },
})


export default BottomSheetButton;
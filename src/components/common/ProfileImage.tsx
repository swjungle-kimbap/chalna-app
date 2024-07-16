import {useCallback, useEffect, useMemo, useState} from "react";
import FastImage, { Source } from "react-native-fast-image";
import { Image } from "react-native";
import { getImageUri } from "../../utils/FileHandling";

const defaultImg = require('../../assets/images/anonymous.png');

const ProfileImage = ({ profileImageId, avatarStyle, resizeMode=true }) => {
  const [profileUri, setProfileUri] = useState("");

  const getUri = useCallback(async () => {
    try {
      const savedUri = await getImageUri(profileImageId);
      setProfileUri(savedUri);
    } catch (error) {
      console.error("Failed to get profile image URL", error);
      setProfileUri("");  // or setProfileUri(defaultImg) if you want to use default image URI
    }
  }, [profileImageId]);

  useEffect(() => {
    getUri();
  }, [getUri]);

  const imageSource = useMemo(() => profileUri ? { uri: profileUri, priority: FastImage.priority.normal } : defaultImg, [profileUri]);

  return (
      <FastImage
          style={avatarStyle}
          source={imageSource as Source}
          resizeMode={FastImage.resizeMode.cover}
      />
  );
};

export default ProfileImage;

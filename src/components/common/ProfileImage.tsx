import { useEffect, useState } from "react";
import FastImage, { Source } from "react-native-fast-image";
import { Image } from "react-native";
import { getImageUri } from "../../utils/FileHandling";

const defaultImg = require('../../assets/images/anonymous.png');

const ProfileImage = ({ profileImageId, avatarStyle }) => {
  const [profileUri, setProfileUri] = useState("");

  useEffect(() => {
    const getUri = async () => {
      try {
        const savedUri = await getImageUri(profileImageId);
        setProfileUri(savedUri);
      } catch (error) {
        console.error("Failed to get profile image URL", error);
        setProfileUri("");
      }
    };

    getUri();
  }, [profileImageId]);

  return (
    <>
      {profileUri ? (
        <FastImage
          style={avatarStyle}
          source={{ uri: profileUri, priority: FastImage.priority.normal } as Source}
          resizeMode={FastImage.resizeMode.cover}
        />
      ) : (
        <Image source={defaultImg} style={avatarStyle} />
      )}
    </>
  );
};

export default ProfileImage;
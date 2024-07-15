import { Alert, StyleSheet, View, TouchableOpacity } from "react-native";
import Text from "../common/Text";
import { useRef } from "react";
import { useRecoilState } from "recoil";
import { locationState } from "../../recoil/atoms";
import color from "../../styles/ColorTheme";

const ArrowButton = ({cameraMove}) => {
  const [currentLocation, setCurrentLocation] = useRecoilState(locationState);
  const intervalRef = useRef(null);

  const move = (idx, direction) => {
    const colCoordiScale = 10 ** (-4) * idx;
    const rowCoordiScale = 14 * 10 ** (-5) * idx;
    let newLocation = { ...currentLocation };
    switch (direction) {
      case 'up':
        newLocation.latitude += colCoordiScale;
        break;
      case 'down':
        newLocation.latitude -= rowCoordiScale;
        break;
      case 'left':
        newLocation.longitude -= colCoordiScale;
        break;
      case 'right':
        newLocation.longitude += rowCoordiScale;
        break;
      default:
        break;
    }
    return newLocation;
  };

  const handleLongPress = (direction) => {
    let index = 1;
    intervalRef.current = setInterval(()=> {
      const newLocation = move(index, direction);
      setCurrentLocation(newLocation);
      cameraMove(newLocation);
      index += 1
    }, 125)
  };
  const handlePressOut = () => {
    clearInterval(intervalRef.current);
  };

  return (
     <View style={styles.dpadContainer}>
        <View style={styles.dpadRow}>
          <View style={styles.placeholder} />
          <TouchableOpacity
            onLongPress={() => handleLongPress('up')}
            onPressOut={handlePressOut}
            delayLongPress={0}
            style={styles.dpadButton}
            activeOpacity={0.6}
          >
            <Text style={styles.dpadText}>↑</Text>
          </TouchableOpacity>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.dpadRow}>
          <TouchableOpacity
            onLongPress={() => handleLongPress('left')}
            onPressOut={handlePressOut}
            delayLongPress={0}
            style={styles.dpadButton}
            activeOpacity={0.6} 
          >
            <Text style={styles.dpadText}>←</Text>
          </TouchableOpacity>
          <View style={styles.placeholder} />
          <TouchableOpacity
            onLongPress={() => handleLongPress('right')}
            onPressOut={handlePressOut}
            delayLongPress={0}
            style={styles.dpadButton}
            activeOpacity={0.6}
          >
            <Text style={styles.dpadText}>→</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dpadRow}>
          <View style={styles.placeholder} />
          <TouchableOpacity
            onLongPress={() => handleLongPress('down')}
            onPressOut={handlePressOut}
            delayLongPress={0}
            style={styles.dpadButton}
            activeOpacity={0.6}
          >
            <Text style={styles.dpadText}>↓</Text>
          </TouchableOpacity>
          <View style={styles.placeholder} />
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  dpadContainer: {
    position: 'absolute',
    bottom: 60,
    right:20,
    zIndex: 2,
  },
  dpadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dpadButton: {
    backgroundColor: color.colors.main,
    padding: 10,
    borderRadius: 5,
  },
  dpadText: {
    color: 'white',
    fontSize: 18,
  },
  placeholder: {
    width: 40,
  },
});
export default ArrowButton;
import { StyleSheet, View, TouchableOpacity } from "react-native";
import Text from "../common/Text";

const RowButton = ({onTapHandler, currentIndex, friendLog, setSelectedMonth, selectedMonth}) => {
  return (
    <View style={styles.dpadContainer}>
      <View style={styles.dpadRow}>
        <TouchableOpacity
          style={styles.dpadButton}
          activeOpacity={0.6}
          onPress={()=> {
            console.log(currentIndex.current);
            console.log(friendLog);
            if (currentIndex.current > 0) {
              currentIndex.current -= 1;
              const currentTime= new Date(friendLog[currentIndex.current].meetTime);
              const nextMonth = currentTime.getMonth();
              if (selectedMonth !== nextMonth) {
                const year = currentTime.getFullYear();
                setSelectedMonth(`${year}-${nextMonth + 1}`)
              }
              onTapHandler(currentIndex.current);
            }
          }}
        >
          <Text style={styles.dpadText}>←</Text>
        </TouchableOpacity>
        <View style={styles.placeholder} />
        <TouchableOpacity
          style={styles.dpadButton}
          activeOpacity={0.6}
          onPress={()=> {
            console.log(currentIndex.current);
            if (currentIndex.current < friendLog.length-1) {
              currentIndex.current += 1;
              const currentTime= new Date(friendLog[currentIndex.current].meetTime);
              const nextMonth = currentTime.getMonth();
              if (selectedMonth !== nextMonth) {
                const year = currentTime.getFullYear();
                setSelectedMonth(`${year}-${nextMonth + 1}`)
              }
              onTapHandler(currentIndex.current);
            }
          }}
        >
          <Text style={styles.dpadText}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dpadContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 2,
  },
  dpadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dpadButton: {
    backgroundColor: '#3EB297',
    padding: 10,
    borderRadius: 5,
  },
  dpadText: {
    color: 'white',
    fontSize: 18,
  },
  placeholder: {
    width: 20,
  },
});

export default RowButton;

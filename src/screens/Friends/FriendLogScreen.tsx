import { ClusterMarkerProp, NaverMapMarkerOverlay, NaverMapView } from "@mj-studio/react-native-naver-map";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, Alert, StyleSheet, FlatList, Dimensions, TouchableOpacity } from "react-native";
import { axiosGet } from "../../axios/axios.method";
import { urls } from "../../axios/config";
import { AxiosResponse, FriendEncounterPostion, Position } from "../../interfaces";
import Text from "../../components/common/Text";
import { useRecoilValue } from 'recoil';
import { locationState } from "../../recoil/atoms";
import RowButton from "../../components/Mypage/RowButton";

function generateDummyGPSData(startLat, startLon, numPoints, timeInterval) {
  const gpsData = [];
  let currentTime = new Date();

  for (let i = 0; i < numPoints; i++) {
    // Randomly change the latitude and longitude
    const deltaLat = Math.random() * 2 - 2;  // ±0.01 range
    const deltaLon = Math.random() * 2 - 0.1;  // ±0.01 range

    const newLat = startLat + deltaLat;
    const newLon = startLon + deltaLon;

    gpsData.push({
      latitude: newLat,
      longitude: newLon,
      meetTime: currentTime.toISOString()
    });

    // Increment the time
    currentTime = new Date(currentTime.getTime() - timeInterval * 1000);
  }

  return gpsData;
}

// Example usage:
const startLatitude = 37.56100278;  
const startLongitude = 126.9996417;
const numberOfPoints = 100;  // Number of GPS points to generate
const timeIntervalInSeconds = 1 * 60 * 60 * 24;  // Time interval between points in seconds

interface FriendLogScreenProps {
  route: {
    params?: {
      otherId?: number;
    }
  }
}

const generateMonths = (needYear) => {
  const months = [];
  for (let year of needYear) {
    for (let month = 11; month >= 0; month--) {
      months.push({ year, month });
    }
  }
  return months;
};

const groupByMonth = (data) => {
  const groupedData = new Map();
  const needYear = new Set();
  const filteredData = data.map((item, index) => {
    const date = new Date(item.meetTime);
    const year = date.getFullYear();
    needYear.add(year);
    const month = date.getMonth();
    const yearMonth = `${year}-${month + 1}`;
    if (!groupedData.has(yearMonth)) {
      groupedData.set(yearMonth, []);
    }
    groupedData.get(yearMonth).push(index);
    return {longitude: item.longitude, latitude:item.latitude, identifier: index.toString(), 
      height:30, width:20}
  });
  return {groupedData, filteredData, needYear};
};

const FriendLogScreen: React.FC<FriendLogScreenProps> = ({route}) => {
  const { otherId = 0 } = route.params ?? {};
  const logMapViewRef = useRef(null);
  const [friendLog, setFriendLog] = useState<FriendEncounterPostion[]>([]);
  const [monthlyLogs, setMonthlyLogs] = useState(new Map());
  const [clusterMarkers, setClusterMarkers] = useState<ClusterMarkerProp[]>([]);
  const currentLocation = useRecoilValue<Position>(locationState);
  const { width } = Dimensions.get('window');
  const flatListRef = useRef(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const currentIndex = useRef(0);
  const [months, setMonths] = useState<{month:number, year:number}[]>([]);
  const [showAnnouncement, setShowAnnouncement] = useState<boolean>(false);

  useEffect(()=> {
    const fetchData = async () => {
      if (otherId) {
        const response = await axiosGet<AxiosResponse<FriendEncounterPostion[]>>
        (`${urls.GET_FRIEND_ENCOUNTER_URL}/${otherId}`, "스쳐간 위치 조회");
        if (response.data?.data){
          const EncounterData = response.data?.data.reverse();
          //const dummyGPSData = generateDummyGPSData(startLatitude, startLongitude, numberOfPoints, timeIntervalInSeconds);
          const {groupedData, filteredData, needYear} = groupByMonth(EncounterData);
          const generatedMonths: {month:number, year:number}[] = generateMonths(needYear);
          setMonths(generatedMonths);
          setFriendLog(EncounterData);
          setMonthlyLogs(groupedData);
          setClusterMarkers(filteredData);
        }
      }
    }
    fetchData();
  }, [])

  const onTapHandler = useCallback((index) => {
    if (friendLog[index]) {
      const { longitude, latitude, meetTime } = friendLog[index];
      logMapViewRef.current.animateCameraTo({ longitude, latitude, zoom:16}, { duration: 300 });
    } else {
      console.log("index is out of range", index);
    }
  }, [friendLog]);

  const formatTimestamp = (meetTime) => {
    const date = new Date(meetTime);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;  
    const day = date.getDate();
    return `${year}/${month}/${day}`;
  }

  const MonthView = memo(({ item, onPress, selectedMonth }) => {
    const { year, month } = item;
    const currentMonth = `${year}-${month + 1}`;
    const montlyList = monthlyLogs.get(currentMonth);
    const monthPress = montlyList ? () => {
      onPress(montlyList[0]);
      currentIndex.current = montlyList[0];
      setSelectedMonth(currentMonth);
    } : () => {};
  
    return (
      <>
        {item.month === 11 && (
          <Text variant="sub" style={styles.yearText}>{year}</Text>
        )}
        <TouchableOpacity onPress={monthPress}>
          <View style={[
            styles.monthContainer,
            selectedMonth === currentMonth && styles.selectedMonthContainer
          ]}>
            <Text style={[
              styles.monthText,
              selectedMonth === currentMonth && styles.selectedMonthText
            ]}>
              {month + 1}
            </Text>
            <Text variant='sub' style={[
              styles.encounterCountText,
              selectedMonth === currentMonth && styles.selectedMonthText
            ]}>
              {montlyList ? montlyList.length : 0}
            </Text>
          </View>
        </TouchableOpacity>
      </>
    );
  });
  return (
    <>
    <View style={styles.headerTab}>
      {friendLog.length === 0 ?
      <>
        <View style={{flexDirection:"row", alignItems:'center', justifyContent:'center'}}>
          <Text variant="sub" style={styles.autoLoginText}>위치를 그리는 중 입니다.</Text>
          <ActivityIndicator size="small" color="#3EB297" />
        </View> 
      </> :
      <View style={{flexDirection:"row", width: width}}>
        {/* <View style={{flexDirection:"column", alignItems:'center', justifyContent:'center', marginHorizontal: 10}}>
          <Text variant="sub" style={{fontsize: 10}}>스친 횟수</Text>
          <Text>{friendLog.length}번</Text>
        </View> */}
        <FlatList
          data={months}
          snapToEnd={true}
          ref={flatListRef}
          horizontal
          pagingEnabled
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <MonthView item={item} onPress={onTapHandler} selectedMonth={selectedMonth} />}
          showsHorizontalScrollIndicator={false}
          initialNumToRender={10} 
          windowSize={21} 
        />
      </View>}
    </View>
    <NaverMapView
      initialCamera={{ ...currentLocation, zoom: 10 }}
      ref={logMapViewRef}
      style={{flex: 1, zIndex:1}}
      clusters={[{animate:false, markers:clusterMarkers, maxZoom:10}]}
    >
      {friendLog.map((log, index) => {
        return(
          <NaverMapMarkerOverlay
            longitude={log.longitude}
            latitude={log.latitude}
            onTap={() => onTapHandler(index)}
            height={80}
            width={100}
            key={index.toString()}
            minZoom={16}
          >
            <View style={{alignItems: 'center'}}>
            <Text style={{
              marginTop: 5,
              fontSize: 11,
              color: 'gray'}}>{friendLog.length - index}번째 만남</Text>
            <Text style={{
              marginTop: 5,
              fontSize: 12,
              color: 'black'}}>{formatTimestamp(log.meetTime)}</Text>
            </View>
          </NaverMapMarkerOverlay>
        )})
      }
    </NaverMapView>
    {friendLog.length !== 0 && 
      <RowButton onTapHandler={onTapHandler} currentIndex={currentIndex} 
        friendLog={friendLog} setSelectedMonth={setSelectedMonth} selectedMonth={selectedMonth}/>}
    </>
  );
};

const styles = StyleSheet.create({
  encounterCountText: {
    fontSize: 12,
  },
  monthContainer: {
    flexDirection: "column",
    marginHorizontal:7,
    marginVertical: 10,
  },
  selectedMonthContainer: {
    backgroundColor: '#3EB297',
    borderRadius: 5,
    padding: 5,
    marginVertical: 10,
  },
  monthText: {
    fontSize: 14,
  },
  selectedMonthText: {
    color: '#fff',
  },
  yearText: {
    fontSize: 10,
    paddingHorizontal: 10,
  },
  selectedMonth:{
    backgroundColor: '#3EB297',
    borderRadius: 10,
  },
  headerTab:{
    height: 60,
    backgroundColor: 'white',
    alignItems:'center',
    justifyContent:'center',
    borderBottomWidth: 2,
    borderColor: '#3EB297',
  },
  loadingConatiner : {
    alignContent:'center',
    justifyContent:'center',
    zIndex: 2,
  },
  autoLoginText: {
    fontSize: 16,
    marginRight: 10,
    color: "black",
  },
})

export default FriendLogScreen;




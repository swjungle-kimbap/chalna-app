import { ClusterMarkerProp, NaverMapMarkerOverlay, NaverMapView } from "@mj-studio/react-native-naver-map";
import { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, Alert, StyleSheet, FlatList, Dimensions } from "react-native";
import { axiosGet } from "../../axios/axios.method";
import { urls } from "../../axios/config";
import { AxiosResponse, FriendEncounterPostion, Position } from "../../interfaces";
import Text from "../../components/common/Text";
import { useRecoilValue } from 'recoil';
import { locationState } from "../../recoil/atoms";
import moment from "moment";

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
    currentTime = new Date(currentTime.getTime() + timeInterval * 1000);
  }

  return gpsData;
}

// Example usage:
const startLatitude = 37.56100278;  
const startLongitude = 126.9996417;
const numberOfPoints = 300;  // Number of GPS points to generate
const timeIntervalInSeconds = 60 * 60 * 24;  // Time interval between points in seconds

interface FriendLogScreenProps {
  route: {
    params?: {
      otherId?: number;
    }
  }
}

const generateMonths = (numYears) => {
  const months = [];
  const currentYear = new Date().getFullYear();

  for (let year = currentYear; year > currentYear - numYears; year--) {
    for (let month = 11; month >= 0; month--) {
      months.push({ year, month });
    }
  }
  return months.reverse();
};


const months:{month:number, year:number}[] = generateMonths(5);

const FriendLogScreen: React.FC<FriendLogScreenProps> = ({route}) => {
  const { otherId = 0 } = route.params ?? {};
  const logMapViewRef = useRef(null);
  const [friendLog, setFriendLog] = useState<FriendEncounterPostion[]>([]);
  const [clusterMarkers, setClusterMarkers] = useState<ClusterMarkerProp[]>([]);
  const [isloading, setIsLoading] = useState(true);
  const currentLocation = useRecoilValue<Position>(locationState);
  const { width } = Dimensions.get('window');
  const flatListRef = useRef(null);

  useEffect(()=> {
    const fetchData = async () => {
      if (otherId) {
        const response = await axiosGet<AxiosResponse<FriendEncounterPostion[]>>
        (`${urls.GET_FRIEND_ENCOUNTER_URL}/${otherId}`, "스쳐간 위치 조회");
        if (response.data?.data){
          //const EncounterData = response.data?.data;
          const dummyGPSData = generateDummyGPSData(startLatitude, startLongitude, numberOfPoints, timeIntervalInSeconds);
          setFriendLog(dummyGPSData);
          const filteredData = dummyGPSData.map((data, index) => {
            return {longitude: data.longitude, latitude:data.latitude, identifier: index.toString(), 
              height:30, width:20}
          })
          setClusterMarkers(filteredData);
        }
      }
    }
    fetchData();
    setIsLoading(false);

  }, [])

  const onTapHandler = (index) => {
    const {longitude, latitude, meetTime} = friendLog[index];
    logMapViewRef.current.animateCameraTo({longitude, latitude});
  };

  const formatTimestamp = (meetTime) => {
    const date = new Date(meetTime);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;  // Months are zero-based
    const day = date.getDate();
    return `${year}/${month}/${day}`;
  }


  const MonthView = ({ item }) => {
    if (item.month === 0)
      return (
        <>
          <Text variant="sub" style={{ fontSize: 10, paddingHorizontal:10 }}>{item.year}</Text>
          <View style={{ flexDirection: "column", alignItems: 'center', paddingHorizontal:10 }}>
            <Text variant="sub" style={{ fontSize: 10 }}>{30}</Text>
            <Text>{item.month + 1}</Text>
          </View>
        </>
      );

    return (
      <View style={{ flexDirection: "column", alignItems: 'center', paddingHorizontal:10 }}>
        <Text variant="sub" style={{ fontSize: 10 }}>{30}</Text>
        <Text>{item.month + 1}</Text>
      </View>
    );
  }

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
      <View style={{flexDirection:"row"}}>
        <View style={{flexDirection:"column", alignItems:'center', justifyContent:'center', marginHorizontal: 10}}>
          <Text variant="sub" style={{fontsize: 10}}>스친 횟수</Text>
          <Text>{friendLog.length}번</Text>
        </View>
        <FlatList
          data={months}
          snapToEnd={true}
          ref={flatListRef}
          horizontal
          pagingEnabled
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <MonthView item={item} />}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={months.length - 1} // 시작 시 마지막 아이템으로 스크롤
          getItemLayout={(data, index) => (
            {length: 30, offset: 30 * index, index}
          )}
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
            height={30}
            width={20}
            key={index.toString()}
            caption={{text:formatTimestamp(log.meetTime)}}
            minZoom={11}
          />
        )})
      }
    </NaverMapView>
    {/* {isloading && 
      (<>
        <View style={styles.loadingConatiner}>
          <Text variant="sub" style={styles.autoLoginText}>위치를 그리는 중 입니다.</Text>
          <ActivityIndicator size="small" color="#3EB297" />
        </View>
      </>
    )} */}
    </>
  );
};

const styles = StyleSheet.create({
  headerTab:{
    height: 60,
    backgroundColor: 'white',
    elevation: 10,
    alignItems:'center',
    justifyContent:'center',
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




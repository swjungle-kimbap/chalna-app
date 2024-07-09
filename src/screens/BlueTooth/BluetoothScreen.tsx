import AlarmButton from "../../components/Bluetooth/AlarmButton";
import MessageBox from "../../components/Bluetooth/MessageBox";

interface BluetoothScreenPrams {
  route: {
    params?: {
      notificationId? : string;
    }
  }
}

const BluetoothScreen: React.FC<BluetoothScreenPrams> = ({ route }) => {
  const { notificationId = "" } = route.params ?? {};
  return (
    <>
      <AlarmButton notificationId={notificationId} />
      <MessageBox/>
    </>
  );
}

export default BluetoothScreen;

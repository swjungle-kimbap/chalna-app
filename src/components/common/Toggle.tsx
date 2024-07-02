import { Switch, SwitchProps } from 'react-native';

interface ToggleProps {
  toggleHandler: (value:boolean) => void;
  value: boolean;
  isdisable?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ value, toggleHandler, isdisable }) => {
  const switchProps: SwitchProps = {
    trackColor: isdisable
      ? { false: '#979797', true: '#979797' } // isDisable이 true면 회색
      : { false: 'red', true: '#14F12A' },
    thumbColor: '#f4f3f4',
    ios_backgroundColor: '#3e3e3e',
    onValueChange: toggleHandler,
    value: value,
    disabled:isdisable,
  };

  return <Switch {...switchProps} />;
};

export default Toggle;
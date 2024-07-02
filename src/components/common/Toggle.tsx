import { Switch, SwitchProps } from 'react-native';

interface ToggleProps {
  toggleHandler: (value:boolean) => void;
  value: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ value, toggleHandler }) => {
  const switchProps: SwitchProps = {
    trackColor: { false: 'red', true: '#14F12A' },
    thumbColor: '#f4f3f4',
    ios_backgroundColor: '#3e3e3e',
    onValueChange: toggleHandler,
    value: value,
  };

  return <Switch {...switchProps} />;
};

export default Toggle;
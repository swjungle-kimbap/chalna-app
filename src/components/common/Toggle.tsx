import { useState, useRef, useEffect } from 'react';
import { Switch, SwitchProps } from 'react-native';
import { useRecoilValue, RecoilValue } from 'recoil';

interface ToggleProps {
  toggleHandler: () => Promise<void>;
  toggleValueState: RecoilValue<boolean>;
}

const Toggle: React.FC<ToggleProps> = ({ toggleValueState, toggleHandler }) => {
  const [isPending, setIsPending] = useState(false);
  const isEnabledToggle = useRecoilValue(toggleValueState);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleToggle = async () => {
    console.log("before disabled: ", isPending);
    if (!isPending) {
      setIsPending(true);
      await toggleHandler();
      // 특정 기간 후에 isPending을 false로 설정
      timeoutRef.current = setTimeout(() => {
        setIsPending(false);
      }, 1000); // 1초 (1000 밀리초) 후에 isPending을 false로 설정
    }
    console.log("after disabled: ", isPending);
  };

  const switchProps: SwitchProps = {
    trackColor: { false: '#979797', true: '#14F12A' },
    thumbColor: '#f4f3f4',
    ios_backgroundColor: '#3e3e3e',
    onValueChange: handleToggle,
    value: isEnabledToggle,
    disabled: isPending,
  };

  // 컴포넌트가 언마운트될 때 타임아웃을 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return <Switch {...switchProps} />;
};

export default Toggle;
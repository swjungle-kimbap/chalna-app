import React, { useState, useEffect, useCallback } from 'react';
import { View, Switch, StyleSheet, SwitchProps } from 'react-native';

interface ToggleProps {
  isEnabled: boolean;
  toggleHandler: () => Promise<void>;
}

const Toggle: React.FC<ToggleProps> = ({ isEnabled, toggleHandler }) => {
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async () => {
    setIsPending(true);

    const timeout = setTimeout(() => {
      setIsPending(false);
    }, 500); // 500ms 타임아웃

    try {
      await toggleHandler();
    } finally {
      clearTimeout(timeout);
      setIsPending(false);
    }
  };

  const switchProps: SwitchProps = {
    trackColor: { false: '#2344F0', true: '#14F12A' },
    thumbColor: '#f4f3f4',
    ios_backgroundColor: '#3e3e3e',
    onValueChange: handleToggle,
    value: isEnabled,
    disabled: isPending,
  };

  return (
    <View>
      <Switch {...switchProps} />
    </View>
  );
};
export default Toggle;
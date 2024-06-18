import BottomTabs from './src/navigation/BottomTabs';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from 'styled-components/native';
import FontTheme from './src/styles/FontTheme'

export default function App() {
  return (
    <ThemeProvider theme={FontTheme}>
      <NavigationContainer>
        <BottomTabs/>
      </NavigationContainer>
    </ThemeProvider>
  );
}

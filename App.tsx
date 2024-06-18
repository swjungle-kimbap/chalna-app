import { ThemeProvider } from 'styled-components/native';
import FontTheme from './src/styles/FontTheme'
import MainScreen from './src/screens/MainScreen';

export default function App() {
  return (
    <ThemeProvider theme={FontTheme}>
      <MainScreen/>
    </ThemeProvider>
  );
}
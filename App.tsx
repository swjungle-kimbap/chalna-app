import { DatabaseProvider } from '@nozbe/watermelondb/DatabaseProvider';
import database from './src/database/database';
import { ThemeProvider } from 'styled-components/native';
import FontTheme from './src/styles/FontTheme'
import MainScreen from './src/screens/MainScreen';

export default function App() {
  return (
    <DatabaseProvider database={database}>
        <ThemeProvider theme={FontTheme}>
            <MainScreen/>
        </ThemeProvider>
    </DatabaseProvider>
  );
}

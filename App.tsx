import { StatusBar } from 'expo-status-bar';
import Nav from './navigation/AppMangement';
import './global.css';
import LoginScreen from './Auth/login';

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <Nav/>
    </>
  );
}

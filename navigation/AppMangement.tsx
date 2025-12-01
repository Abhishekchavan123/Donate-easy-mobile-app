import { StyleSheet } from 'react-native';
import React from 'react';
import Donate from '../screens/donate';
import Index from '../screens/index';
import Login from '../Auth/login';
import Home from '../screens/HomeScreens';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/index';
import { StackScreen } from 'react-native-screens';
import CustomDrawerContent from './CustomDrawerContent';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const nav = () => {
    return (
        <NavigationContainer>
            <DrawerNavigatorContainer />
        </NavigationContainer>
    )
}

const DrawerNavigatorContainer = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    backgroundColor: '#1f1f1f',
                    width: '80%',
                },
            }}
        >
            <Drawer.Screen
                name="HomeStack"
                component={StackNavigatorContainer}
                options={{
                    title: 'DonateEase',
                }}
            />
        </Drawer.Navigator>
    );
};

const StackNavigatorContainer = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="home"
                component={Index}
                options={{
                    title: 'DonateEase',
                }}
            />
            <Stack.Screen
                name="donate"
                component={Donate}
                options={{
                    title: 'Donate Food',
                }}
            />
        </Stack.Navigator>
    );
};


export default nav

const styles = StyleSheet.create({


    container: {
    paddingTop: 10,
    // other styles...
  },



})
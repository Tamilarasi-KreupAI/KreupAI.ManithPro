import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainTabParamList } from '../types';
import { COLORS, FONTS } from '../constants';

// Screens
import CandidateDashboardScreen from '../screens/candidate/DashboardScreen';
import JobsScreen from '../screens/candidate/JobsScreen';
import MessagesScreen from '../screens/candidate/MessagesScreen';
import ProfileScreen from '../screens/candidate/ProfileScreen';

import ApplicationsScreen from '../screens/candidate/ApplicationsScreen';
import InterviewsScreen from '../screens/candidate/InterviewsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.slate400,
                tabBarStyle: {
                    borderTopColor: COLORS.slate200,
                    backgroundColor: COLORS.background,
                    paddingTop: 12,
                    height: 90,
                    paddingBottom: 30,
                },
                tabBarLabelStyle: {
                    fontFamily: FONTS.medium,
                    fontSize: 10,
                    marginBottom: 4,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={CandidateDashboardScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="view-dashboard-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Search"
                component={JobsScreen}
                options={{
                    tabBarLabel: 'Jobs',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="briefcase-search-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Applications"
                component={ApplicationsScreen}
                options={{
                    tabBarLabel: 'Applications',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="file-document-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Interviews"
                component={InterviewsScreen}
                options={{
                    tabBarLabel: 'Interviews',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="video-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Messages"
                component={MessagesScreen}
                options={{
                    tabBarLabel: 'Messages',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="message-text-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="account-circle" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default MainNavigator;

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AdminStackParamList, AdminTabParamList } from '../types';
import { COLORS, FONTS } from '../constants';

// Screens
import AdminDashboardScreen from '../screens/admin/DashboardScreen';
import AdminUsersScreen from '../screens/admin/UsersScreen';
import AdminJobsScreen from '../screens/admin/JobsScreen';
import AdminAnalyticsScreen from '../screens/admin/AnalyticsScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createNativeStackNavigator<AdminStackParamList>();

const AdminTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.slate400,
                tabBarStyle: {
                    borderTopColor: COLORS.slate200,
                    backgroundColor: COLORS.background,
                    paddingTop: 8,
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarLabelStyle: {
                    fontFamily: FONTS.medium,
                    fontSize: 10,
                    marginBottom: 4,
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={AdminDashboardScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="view-dashboard-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Users"
                component={AdminUsersScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="account-group-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Jobs"
                component={AdminJobsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="briefcase-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Analytics"
                component={AdminAnalyticsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="chart-line" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const AdminNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AdminTabs" component={AdminTabs} />
        </Stack.Navigator>
    );
};

export default AdminNavigator;

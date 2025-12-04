import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RecruiterStackParamList, RecruiterTabParamList } from '../types';
import { COLORS, FONTS } from '../constants';

// Screens
import RecruiterDashboardScreen from '../screens/recruiter/DashboardScreen';
import RecruiterJobsScreen from '../screens/recruiter/JobsScreen';
import RecruiterCandidatesScreen from '../screens/recruiter/CandidatesScreen';
import RecruiterApplicationsScreen from '../screens/recruiter/ApplicationsScreen';
import PostJobScreen from '../screens/recruiter/PostJobScreen';
import MessagesScreen from '../screens/candidate/MessagesScreen'; // Reuse from candidate
import ScheduleInterviewScreen from '../screens/recruiter/ScheduleInterviewScreen';
import AnalyticsScreen from '../screens/recruiter/AnalyticsScreen';

const Tab = createBottomTabNavigator<RecruiterTabParamList>();
const Stack = createNativeStackNavigator<RecruiterStackParamList>();

const RecruiterTabs = () => {
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
                component={RecruiterDashboardScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="view-dashboard-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Jobs"
                component={RecruiterJobsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="briefcase-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Candidates"
                component={RecruiterCandidatesScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="account-group-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Applications"
                component={RecruiterApplicationsScreen}
                options={{
                    tabBarLabel: 'Apps',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="file-document-multiple-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Messages"
                component={MessagesScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="message-outline" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const RecruiterNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="RecruiterTabs" component={RecruiterTabs} />
            <Stack.Screen name="PostJob" component={PostJobScreen} />
            <Stack.Screen name="ScheduleInterview" component={ScheduleInterviewScreen} />
            <Stack.Screen name="Analytics" component={AnalyticsScreen} />
            {/* Detail screens will be added here */}
        </Stack.Navigator>
    );
};

export default RecruiterNavigator;

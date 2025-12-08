import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CandidateStackParamList } from '../types';
import MainNavigator from './MainNavigator';
import JobDetailScreen from '../screens/candidate/JobDetailScreen';
import EditProfileScreen from '../screens/candidate/EditProfileScreen';
import ChatScreen from '../screens/candidate/ChatScreen';
import ApplicationDetailScreen from '../screens/candidate/ApplicationDetailScreen';
import SavedJobsScreen from '../screens/candidate/SavedJobsScreen';

const Stack = createNativeStackNavigator<CandidateStackParamList>();

const CandidateNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="MainTabs" component={MainNavigator} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="MessageDetail" component={ChatScreen} />
            <Stack.Screen name="ApplicationDetail" component={ApplicationDetailScreen} />
            <Stack.Screen name="SavedJobs" component={SavedJobsScreen} />
            {/* Add other detail screens here */}
        </Stack.Navigator>
    );
};

export default CandidateNavigator;

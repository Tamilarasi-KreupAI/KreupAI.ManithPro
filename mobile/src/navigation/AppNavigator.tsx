import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants';
import { RootStackParamList } from '../types';

// Navigators
import AuthNavigator from './AuthNavigator';
import CandidateNavigator from './CandidateNavigator';
import B2BNavigator from './B2BNavigator';
import RecruiterNavigator from './RecruiterNavigator';
import AdminNavigator from './AdminNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    const { user, token, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {token ? (
                    user?.role === 'ADMIN' ? (
                        <Stack.Screen name="Admin" component={AdminNavigator} />
                    ) : user?.role === 'B2B' ? (
                        <Stack.Screen name="B2B" component={B2BNavigator} />
                    ) : user?.role === 'RECRUITER' ? (
                        <Stack.Screen name="Recruiter" component={RecruiterNavigator} />
                    ) : (
                        <Stack.Screen name="Candidate" component={CandidateNavigator} />
                    )
                ) : (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;

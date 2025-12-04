import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { B2BStackParamList, B2BTabParamList } from '../types';
import { COLORS, FONTS } from '../constants';

// Screens
import B2BDashboardScreen from '../screens/b2b/DashboardScreen';
import RequirementsScreen from '../screens/b2b/RequirementsScreen';
import SupplyScreen from '../screens/b2b/SupplyScreen';
import ContractsScreen from '../screens/b2b/ContractsScreen';
import B2BProfileScreen from '../screens/b2b/B2BProfileScreen';
import RequirementDetailScreen from '../screens/b2b/RequirementDetailScreen';
import CreateRequirementScreen from '../screens/b2b/CreateRequirementScreen';
import InvoicesScreen from '../screens/b2b/InvoicesScreen';
import AddCandidateScreen from '../screens/b2b/AddCandidateScreen';
import DraftContractScreen from '../screens/b2b/DraftContractScreen';
import InvoiceDetailScreen from '../screens/b2b/InvoiceDetailScreen';

const Tab = createBottomTabNavigator<B2BTabParamList>();
const Stack = createNativeStackNavigator<B2BStackParamList>();

const B2BTabs = () => {
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
                component={B2BDashboardScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="view-dashboard-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Requirements"
                component={RequirementsScreen}
                options={{
                    tabBarLabel: 'Reqs',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="clipboard-list-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Supply"
                component={SupplyScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="account-group-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Contracts"
                component={ContractsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="file-sign" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={B2BProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="domain" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const B2BNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="B2BTabs" component={B2BTabs} />
            <Stack.Screen name="RequirementDetail" component={RequirementDetailScreen} />
            <Stack.Screen name="CreateRequirement" component={CreateRequirementScreen} />
            <Stack.Screen name="AddCandidate" component={AddCandidateScreen} />
            <Stack.Screen name="DraftContract" component={DraftContractScreen} />
            <Stack.Screen name="Invoices" component={InvoicesScreen} />
            <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
        </Stack.Navigator>
    );
};

export default B2BNavigator;

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import Card from '../../components/common/Card';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { B2BStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<B2BStackParamList>;

const B2BDashboardScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<NavigationProp>();

    const renderHeader = () => (
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.companyName}>{user?.company || 'Your Company'}</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
                <Icon name="bell-outline" size={24} color={COLORS.textPrimary} />
                <View style={styles.badge} />
            </TouchableOpacity>
        </View>
    );

    const renderStats = () => (
        <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: '#e0f2fe' }]}>
                <Text style={[styles.statValue, { color: '#0284c7' }]}>12</Text>
                <Text style={[styles.statLabel, { color: '#0284c7' }]}>Active Reqs</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
                <Text style={[styles.statValue, { color: '#16a34a' }]}>45</Text>
                <Text style={[styles.statLabel, { color: '#16a34a' }]}>Candidates</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#fefce8' }]}>
                <Text style={[styles.statValue, { color: '#ca8a04' }]}>3</Text>
                <Text style={[styles.statLabel, { color: '#ca8a04' }]}>Contracts</Text>
            </View>
        </View>
    );

    const renderQuickActions = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
                <TouchableOpacity
                    style={styles.actionItem}
                    onPress={() => navigation.navigate('CreateRequirement')}
                >
                    <View style={[styles.actionIcon, { backgroundColor: COLORS.primaryLight }]}>
                        <Icon name="plus" size={24} color={COLORS.textInverse} />
                    </View>
                    <Text style={styles.actionText}>Post Requirement</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionItem}
                    onPress={() => navigation.navigate('AddCandidate')}
                >
                    <View style={[styles.actionIcon, { backgroundColor: COLORS.success }]}>
                        <Icon name="account-plus" size={24} color={COLORS.textInverse} />
                    </View>
                    <Text style={styles.actionText}>Add Candidate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionItem}
                    onPress={() => navigation.navigate('DraftContract')}
                >
                    <View style={[styles.actionIcon, { backgroundColor: COLORS.warning }]}>
                        <Icon name="file-document-edit" size={24} color={COLORS.textInverse} />
                    </View>
                    <Text style={styles.actionText}>Draft Contract</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionItem}
                    onPress={() => navigation.navigate('Invoices')}
                >
                    <View style={[styles.actionIcon, { backgroundColor: COLORS.info }]}>
                        <Icon name="file-document" size={24} color={COLORS.textInverse} />
                    </View>
                    <Text style={styles.actionText}>View Invoices</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderRecentActivity = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Card style={styles.activityCard}>
                <View style={styles.activityItem}>
                    <Icon name="briefcase-check" size={20} color={COLORS.success} />
                    <View style={styles.activityContent}>
                        <Text style={styles.activityText}>New candidate applied for "Senior React Dev"</Text>
                        <Text style={styles.activityTime}>2 hours ago</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.activityItem}>
                    <Icon name="file-document" size={20} color={COLORS.primary} />
                    <View style={styles.activityContent}>
                        <Text style={styles.activityText}>Contract #1234 approved by client</Text>
                        <Text style={styles.activityTime}>Yesterday</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.activityItem}>
                    <Icon name="account-group" size={20} color={COLORS.warning} />
                    <View style={styles.activityContent}>
                        <Text style={styles.activityText}>5 candidates shortlisted for "Java Dev"</Text>
                        <Text style={styles.activityTime}>2 days ago</Text>
                    </View>
                </View>
            </Card>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {renderHeader()}
                {renderStats()}
                {renderQuickActions()}
                {renderRecentActivity()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    greeting: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.base,
        color: COLORS.textSecondary,
    },
    companyName: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES['2xl'],
        color: COLORS.textPrimary,
        marginTop: 4,
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.slate50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.error,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
    },
    statCard: {
        flex: 1,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    statValue: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.xl,
        marginBottom: 4,
    },
    statLabel: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.xs,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionItem: {
        width: '48%',
        backgroundColor: COLORS.slate50,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    actionText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textPrimary,
    },
    activityCard: {
        padding: 0,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
    },
    activityContent: {
        marginLeft: SPACING.md,
        flex: 1,
    },
    activityText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    activityTime: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.xs,
        color: COLORS.textTertiary,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.slate100,
    },
});

export default B2BDashboardScreen;

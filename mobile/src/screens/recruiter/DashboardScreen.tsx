import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { RecruiterStackParamList } from '../../types';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import Card from '../../components/common/Card';

type NavigationProp = NativeStackNavigationProp<RecruiterStackParamList>;

const RecruiterDashboardScreen = () => {
    const { user, logout } = useAuth();
    const navigation = useNavigation<NavigationProp>();

    const renderHeader = () => (
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>Hello, {user?.firstName} 👋</Text>
                <Text style={styles.subtitle}>Manage your recruitment pipeline</Text>
            </View>
            <View style={styles.headerActions}>
                <TouchableOpacity
                    style={styles.notificationButton}
                    onPress={() => Alert.alert('Notifications', 'No new notifications')}
                >
                    <Icon name="bell-outline" size={24} color={COLORS.textPrimary} />
                    <View style={styles.badge} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={logout}
                >
                    <Icon name="logout" size={24} color={COLORS.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderStats = () => (
        <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: '#e0f2fe' }]}>
                <Text style={[styles.statValue, { color: '#0284c7' }]}>8</Text>
                <Text style={[styles.statLabel, { color: '#0284c7' }]}>Active Jobs</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
                <Text style={[styles.statValue, { color: '#16a34a' }]}>45</Text>
                <Text style={[styles.statLabel, { color: '#16a34a' }]}>Applicants</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#fefce8' }]}>
                <Text style={[styles.statValue, { color: '#ca8a04' }]}>12</Text>
                <Text style={[styles.statLabel, { color: '#ca8a04' }]}>Interviews</Text>
            </View>
        </View>
    );

    const renderQuickActions = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
                <TouchableOpacity
                    style={styles.actionItem}
                    onPress={() => navigation.navigate('PostJob')}
                >
                    <View style={[styles.actionIcon, { backgroundColor: COLORS.primary }]}>
                        <Icon name="plus" size={24} color={COLORS.textInverse} />
                    </View>
                    <Text style={styles.actionText}>Post New Job</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionItem}
                    onPress={() => navigation.navigate('Candidates')}
                >
                    <View style={[styles.actionIcon, { backgroundColor: COLORS.success }]}>
                        <Icon name="account-search" size={24} color={COLORS.textInverse} />
                    </View>
                    <Text style={styles.actionText}>Search Candidates</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionItem}
                    onPress={() => navigation.navigate('ScheduleInterview')}
                >
                    <View style={[styles.actionIcon, { backgroundColor: COLORS.warning }]}>
                        <Icon name="calendar-clock" size={24} color={COLORS.textInverse} />
                    </View>
                    <Text style={styles.actionText}>Schedule Interview</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionItem}
                    onPress={() => navigation.navigate('Analytics')}
                >
                    <View style={[styles.actionIcon, { backgroundColor: COLORS.info }]}>
                        <Icon name="chart-line" size={24} color={COLORS.textInverse} />
                    </View>
                    <Text style={styles.actionText}>View Analytics</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderRecentApplications = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Applications</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>
            <Card style={styles.applicationCard}>
                <View style={styles.applicationItem}>
                    <View style={styles.candidateAvatar}>
                        <Text style={styles.avatarText}>SJ</Text>
                    </View>
                    <View style={styles.applicationInfo}>
                        <Text style={styles.candidateName}>Sarah Johnson</Text>
                        <Text style={styles.jobTitle}>Senior React Developer</Text>
                        <Text style={styles.applicationTime}>Applied 2 hours ago</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: COLORS.info + '20' }]}>
                        <Text style={[styles.statusText, { color: COLORS.info }]}>NEW</Text>
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
                {renderRecentApplications()}
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
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.background,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    greeting: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES['2xl'],
        color: COLORS.textPrimary,
    },
    subtitle: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.base,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    notificationButton: {
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.slate50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    logoutButton: {
        height: 40,
        width: 40,
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
    },
    seeAll: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        color: COLORS.primary,
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
        textAlign: 'center',
    },
    applicationCard: {
        padding: 0,
    },
    applicationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
    },
    candidateAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    avatarText: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.base,
        color: COLORS.textInverse,
    },
    applicationInfo: {
        flex: 1,
    },
    candidateName: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.base,
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    jobTitle: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    applicationTime: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.xs,
        color: COLORS.textTertiary,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    statusText: {
        fontFamily: FONTS.bold,
        fontSize: 10,
    },
});

export default RecruiterDashboardScreen;

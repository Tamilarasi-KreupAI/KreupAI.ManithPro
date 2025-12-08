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

const AdminDashboardScreen = () => {
    const { user } = useAuth();

    const renderHeader = () => (
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>Admin Dashboard</Text>
                <Text style={styles.subtitle}>System Overview & Management</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
                <Icon name="bell-outline" size={24} color={COLORS.textPrimary} />
                <View style={styles.badge} />
            </TouchableOpacity>
        </View>
    );

    const renderStats = () => (
        <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#e0f2fe' }]}>
                <Icon name="account-group" size={32} color="#0284c7" />
                <Text style={[styles.statValue, { color: '#0284c7' }]}>1,234</Text>
                <Text style={[styles.statLabel, { color: '#0284c7' }]}>Total Users</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
                <Icon name="briefcase" size={32} color="#16a34a" />
                <Text style={[styles.statValue, { color: '#16a34a' }]}>89</Text>
                <Text style={[styles.statLabel, { color: '#16a34a' }]}>Active Jobs</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#fefce8' }]}>
                <Icon name="file-document" size={32} color="#ca8a04" />
                <Text style={[styles.statValue, { color: '#ca8a04' }]}>45</Text>
                <Text style={[styles.statLabel, { color: '#ca8a04' }]}>Pending Approvals</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#fef2f2' }]}>
                <Icon name="alert-circle" size={32} color="#dc2626" />
                <Text style={[styles.statValue, { color: '#dc2626' }]}>12</Text>
                <Text style={[styles.statLabel, { color: '#dc2626' }]}>Issues</Text>
            </View>
        </View>
    );

    const renderQuickActions = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
                <TouchableOpacity style={styles.actionItem}>
                    <View style={[styles.actionIcon, { backgroundColor: COLORS.primary }]}>
                        <Icon name="account-check" size={24} color={COLORS.textInverse} />
                    </View>
                    <Text style={styles.actionText}>Approve Users</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem}>
                    <View style={[styles.actionIcon, { backgroundColor: COLORS.success }]}>
                        <Icon name="briefcase-check" size={24} color={COLORS.textInverse} />
                    </View>
                    <Text style={styles.actionText}>Approve Jobs</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem}>
                    <View style={[styles.actionIcon, { backgroundColor: COLORS.warning }]}>
                        <Icon name="chart-bar" size={24} color={COLORS.textInverse} />
                    </View>
                    <Text style={styles.actionText}>View Reports</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionItem}>
                    <View style={[styles.actionIcon, { backgroundColor: COLORS.error }]}>
                        <Icon name="alert" size={24} color={COLORS.textInverse} />
                    </View>
                    <Text style={styles.actionText}>Manage Issues</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderRecentActivity = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Card style={styles.activityCard}>
                <View style={styles.activityItem}>
                    <Icon name="account-plus" size={20} color={COLORS.success} />
                    <View style={styles.activityContent}>
                        <Text style={styles.activityText}>New user registered: John Doe</Text>
                        <Text style={styles.activityTime}>5 minutes ago</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.activityItem}>
                    <Icon name="briefcase-plus" size={20} color={COLORS.info} />
                    <View style={styles.activityContent}>
                        <Text style={styles.activityText}>New job posted: Senior Developer</Text>
                        <Text style={styles.activityTime}>1 hour ago</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.activityItem}>
                    <Icon name="alert-circle" size={20} color={COLORS.warning} />
                    <View style={styles.activityContent}>
                        <Text style={styles.activityText}>Payment issue reported</Text>
                        <Text style={styles.activityTime}>2 hours ago</Text>
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
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
    },
    statCard: {
        width: '48%',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    statValue: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES['2xl'],
        marginTop: SPACING.xs,
        marginBottom: 4,
    },
    statLabel: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.xs,
        textAlign: 'center',
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
        textAlign: 'center',
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

export default AdminDashboardScreen;

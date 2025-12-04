import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import Card from '../../components/common/Card';


const AdminAnalyticsScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Analytics</Text>
                <Text style={styles.headerSubtitle}>Platform insights</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionTitle}>User Growth (Last 6 Months)</Text>
                <View style={styles.growthRow}>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => (
                        <View key={month} style={styles.growthBar}>
                            <View style={[styles.bar, { height: (index + 1) * 30 }]} />
                            <Text style={styles.barLabel}>{month}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Job Statistics</Text>
                <View style={styles.statsGrid}>
                    <Card style={styles.statCard}>
                        <Icon name="briefcase-plus" size={32} color={COLORS.primary} />
                        <Text style={styles.statValue}>89</Text>
                        <Text style={styles.statLabel}>Posted</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <Icon name="briefcase-check" size={32} color={COLORS.success} />
                        <Text style={styles.statValue}>67</Text>
                        <Text style={styles.statLabel}>Active</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <Icon name="check-circle" size={32} color={COLORS.warning} />
                        <Text style={styles.statValue}>45</Text>
                        <Text style={styles.statLabel}>Filled</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <Icon name="close-circle" size={32} color={COLORS.error} />
                        <Text style={styles.statValue}>23</Text>
                        <Text style={styles.statLabel}>Closed</Text>
                    </Card>
                </View>

                <Text style={styles.sectionTitle}>Platform Metrics</Text>
                <View style={styles.metricsGrid}>
                    <Card style={[styles.metricCard, { backgroundColor: '#e0f2fe' }]}>
                        <Text style={[styles.metricValue, { color: '#0284c7' }]}>1,234</Text>
                        <Text style={[styles.metricLabel, { color: '#0284c7' }]}>Total Users</Text>
                        <Text style={[styles.metricChange, { color: '#16a34a' }]}>+12% this month</Text>
                    </Card>

                    <Card style={[styles.metricCard, { backgroundColor: '#f0fdf4' }]}>
                        <Text style={[styles.metricValue, { color: '#16a34a' }]}>567</Text>
                        <Text style={[styles.metricLabel, { color: '#16a34a' }]}>Applications</Text>
                        <Text style={[styles.metricChange, { color: '#16a34a' }]}>+23% this week</Text>
                    </Card>

                    <Card style={[styles.metricCard, { backgroundColor: '#fefce8' }]}>
                        <Text style={[styles.metricValue, { color: '#ca8a04' }]}>45</Text>
                        <Text style={[styles.metricLabel, { color: '#ca8a04' }]}>Placements</Text>
                        <Text style={[styles.metricChange, { color: '#16a34a' }]}>+8% this month</Text>
                    </Card>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate100,
    },
    headerTitle: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES['2xl'],
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    sectionTitle: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
        marginTop: SPACING.md,
    },
    growthRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 200,
        backgroundColor: COLORS.slate50,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
    },
    growthBar: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: 1,
    },
    bar: {
        width: 30,
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.sm,
        marginBottom: SPACING.xs,
    },
    barLabel: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.xs,
        color: COLORS.textSecondary,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
    },
    statCard: {
        width: '48%',
        padding: SPACING.md,
        marginBottom: SPACING.md,
        alignItems: 'center',
    },
    statValue: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES['2xl'],
        marginTop: SPACING.xs,
        marginBottom: 4,
    },
    statLabel: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
    },
    metricsGrid: {
        marginBottom: SPACING.lg,
    },
    metricCard: {
        padding: SPACING.md,
        marginBottom: SPACING.md,
        alignItems: 'center',
    },
    metricValue: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES['2xl'],
        marginBottom: 4,
    },
    metricLabel: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        marginBottom: 4,
    },
    metricChange: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.xs,
    },
});

export default AdminAnalyticsScreen;

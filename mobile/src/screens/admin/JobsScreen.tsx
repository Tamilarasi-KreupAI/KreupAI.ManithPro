import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MOCK_JOBS } from '../../data/mock';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import Card from '../../components/common/Card';

const AdminJobsScreen = () => {
    const renderItem = ({ item }: { item: typeof MOCK_JOBS[0] }) => {
        const statusColor = item.status === 'OPEN' ? COLORS.success : COLORS.error;

        return (
            <Card style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.jobInfo}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.company}>{item.companyName}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Icon name="map-marker" size={14} color={COLORS.textTertiary} />
                        <Text style={styles.metaText}>{item.location}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Icon name="briefcase" size={14} color={COLORS.textTertiary} />
                        <Text style={styles.metaText}>{item.type}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.postedDate}>
                        Posted {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.approveButton}>
                            <Icon name="check" size={16} color={COLORS.textInverse} />
                            <Text style={styles.approveText}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.rejectButton}>
                            <Icon name="close" size={16} color={COLORS.error} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Job Approvals</Text>
                <Text style={styles.headerSubtitle}>{MOCK_JOBS.length} pending</Text>
            </View>

            <FlatList
                data={MOCK_JOBS}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
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
    listContent: {
        padding: SPACING.lg,
    },
    card: {
        marginBottom: SPACING.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    jobInfo: {
        flex: 1,
    },
    title: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    company: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    statusText: {
        fontFamily: FONTS.bold,
        fontSize: 10,
        textTransform: 'uppercase',
    },
    metaRow: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.sm,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.xs,
        color: COLORS.textTertiary,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.slate100,
        paddingTop: SPACING.sm,
    },
    postedDate: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.xs,
        color: COLORS.textTertiary,
    },
    actions: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    approveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.success,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.md,
        gap: 4,
    },
    approveText: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.xs,
        color: COLORS.textInverse,
    },
    rejectButton: {
        padding: 6,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.error,
    },
});

export default AdminJobsScreen;

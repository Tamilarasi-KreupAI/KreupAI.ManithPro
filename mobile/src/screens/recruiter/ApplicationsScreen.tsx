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
import { MOCK_APPLICATIONS } from '../../data/mock';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import Card from '../../components/common/Card';

const RecruiterApplicationsScreen = () => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return COLORS.warning;
            case 'UNDER_REVIEW': return COLORS.info;
            case 'SHORTLISTED': return COLORS.success;
            case 'REJECTED': return COLORS.error;
            default: return COLORS.slate400;
        }
    };

    const renderItem = ({ item }: { item: typeof MOCK_APPLICATIONS[0] }) => {
        const statusColor = getStatusColor(item.status);

        return (
            <Card style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.candidateAvatar}>
                        <Text style={styles.avatarText}>
                            {item.candidate.firstName.charAt(0)}{item.candidate.lastName.charAt(0)}
                        </Text>
                    </View>
                    <View style={styles.candidateInfo}>
                        <Text style={styles.name}>
                            {item.candidate.firstName} {item.candidate.lastName}
                        </Text>
                        <Text style={styles.jobTitle}>{item.job.title}</Text>
                        <Text style={styles.appliedDate}>
                            Applied {new Date(item.appliedAt).toLocaleDateString()}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {item.status.replace('_', ' ')}
                        </Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Icon name="eye" size={16} color={COLORS.primary} />
                        <Text style={styles.actionText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Icon name="calendar" size={16} color={COLORS.success} />
                        <Text style={[styles.actionText, { color: COLORS.success }]}>Schedule</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Icon name="close-circle" size={16} color={COLORS.error} />
                        <Text style={[styles.actionText, { color: COLORS.error }]}>Reject</Text>
                    </TouchableOpacity>
                </View>
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Applications</Text>
                <Text style={styles.headerSubtitle}>{MOCK_APPLICATIONS.length} total</Text>
            </View>

            <FlatList
                data={MOCK_APPLICATIONS}
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
        alignItems: 'center',
        marginBottom: SPACING.md,
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
    candidateInfo: {
        flex: 1,
    },
    name: {
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
    appliedDate: {
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
        textTransform: 'uppercase',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: COLORS.slate100,
        paddingTop: SPACING.sm,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        color: COLORS.primary,
    },
});

export default RecruiterApplicationsScreen;

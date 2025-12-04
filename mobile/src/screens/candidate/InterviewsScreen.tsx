import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MOCK_INTERVIEWS } from '../../data/mock';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import Card from '../../components/common/Card';

const InterviewsScreen = () => {
    const handleJoinMeeting = (meetingLink: string) => {
        Linking.openURL(meetingLink);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED':
                return COLORS.info;
            case 'COMPLETED':
                return COLORS.success;
            case 'CANCELLED':
                return COLORS.error;
            default:
                return COLORS.slate400;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const renderItem = ({ item }: { item: typeof MOCK_INTERVIEWS[0] }) => {
        const statusColor = getStatusColor(item.status);

        return (
            <Card style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateLabel}>{formatDate(item.scheduledAt)}</Text>
                        <Text style={styles.timeLabel}>{formatTime(item.scheduledAt)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                <Text style={styles.jobTitle}>{item.application.job.title}</Text>
                <Text style={styles.companyName}>{item.application.job.companyName}</Text>

                <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                        <Icon name="video" size={16} color={COLORS.textTertiary} />
                        <Text style={styles.detailText}>{item.type}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Icon name="clock-outline" size={16} color={COLORS.textTertiary} />
                        <Text style={styles.detailText}>{item.duration} min</Text>
                    </View>
                </View>

                {item.notes && (
                    <View style={styles.notesContainer}>
                        <Icon name="information-outline" size={16} color={COLORS.info} />
                        <Text style={styles.notesText}>{item.notes}</Text>
                    </View>
                )}

                {item.status === 'SCHEDULED' && item.meetingLink && (
                    <TouchableOpacity
                        style={styles.joinButton}
                        onPress={() => handleJoinMeeting(item.meetingLink!)}
                    >
                        <Icon name="video-outline" size={20} color={COLORS.textInverse} />
                        <Text style={styles.joinButtonText}>Join Meeting</Text>
                    </TouchableOpacity>
                )}
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Interviews</Text>
                <Text style={styles.headerSubtitle}>{MOCK_INTERVIEWS.length} upcoming</Text>
            </View>

            <FlatList
                data={MOCK_INTERVIEWS}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Icon name="calendar-blank-outline" size={64} color={COLORS.slate300} />
                        <Text style={styles.emptyText}>No interviews scheduled</Text>
                        <Text style={styles.emptySubtext}>
                            Your upcoming interviews will appear here
                        </Text>
                    </View>
                }
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
    dateContainer: {
        flex: 1,
    },
    dateLabel: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.primary,
        marginBottom: 2,
    },
    timeLabel: {
        fontFamily: FONTS.medium,
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
    jobTitle: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.base,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    companyName: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    detailsRow: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.sm,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.xs,
        color: COLORS.textTertiary,
    },
    notesContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.info + '10',
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
        gap: SPACING.xs,
    },
    notesText: {
        flex: 1,
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    joinButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        gap: SPACING.xs,
        marginTop: SPACING.xs,
    },
    joinButtonText: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.base,
        color: COLORS.textInverse,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: SPACING['3xl'],
    },
    emptyText: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.xl,
        color: COLORS.textPrimary,
        marginTop: SPACING.md,
    },
    emptySubtext: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.base,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
        textAlign: 'center',
    },
});

export default InterviewsScreen;

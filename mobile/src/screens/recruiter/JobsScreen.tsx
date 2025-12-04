import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RecruiterStackParamList } from '../../types';
import { MOCK_JOBS } from '../../data/mock';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import Card from '../../components/common/Card';

type NavigationProp = NativeStackNavigationProp<RecruiterStackParamList>;

const RecruiterJobsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');

    const filteredJobs = MOCK_JOBS.filter(job => {
        if (filter === 'ALL') return true;
        return job.status === filter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return COLORS.success;
            case 'CLOSED': return COLORS.error;
            case 'PAUSED': return COLORS.warning;
            default: return COLORS.slate400;
        }
    };

    const renderItem = ({ item }: { item: typeof MOCK_JOBS[0] }) => {
        const statusColor = getStatusColor(item.status);

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
                    <View style={styles.metaItem}>
                        <Icon name="account-multiple" size={14} color={COLORS.textTertiary} />
                        <Text style={styles.metaText}>12 applicants</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.postedDate}>
                        Posted {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                    <TouchableOpacity style={styles.viewButton}>
                        <Text style={styles.viewButtonText}>View Details</Text>
                        <Icon name="chevron-right" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Jobs</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('PostJob')}
                >
                    <Icon name="plus" size={24} color={COLORS.textInverse} />
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                {(['ALL', 'OPEN', 'CLOSED'] as const).map((status) => (
                    <TouchableOpacity
                        key={status}
                        style={[styles.filterChip, filter === status && styles.filterChipActive]}
                        onPress={() => setFilter(status)}
                    >
                        <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>
                            {status === 'ALL' ? 'All' : status}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredJobs}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate100,
    },
    headerTitle: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES['2xl'],
        color: COLORS.textPrimary,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        gap: SPACING.sm,
    },
    filterChip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.slate100,
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
    },
    filterText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    filterTextActive: {
        color: COLORS.textInverse,
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
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewButtonText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        color: COLORS.primary,
    },
});

export default RecruiterJobsScreen;

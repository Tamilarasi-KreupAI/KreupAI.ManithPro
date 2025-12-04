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
import { B2BStackParamList } from '../../types';
import { MOCK_BULK_REQUIREMENTS } from '../../data/mock';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import Card from '../../components/common/Card';

type NavigationProp = NativeStackNavigationProp<B2BStackParamList>;

const getStatusColor = (status: string) => {
    switch (status) {
        case 'OPEN':
            return COLORS.success;
        case 'IN_PROGRESS':
            return COLORS.warning;
        case 'COMPLETED':
            return COLORS.info;
        case 'CANCELLED':
            return COLORS.error;
        default:
            return COLORS.slate400;
    }
};

const RequirementsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS'>('ALL');

    const filteredRequirements = MOCK_BULK_REQUIREMENTS.filter(req => {
        if (filter === 'ALL') return true;
        return req.status === filter;
    });

    const renderItem = ({ item }: { item: typeof MOCK_BULK_REQUIREMENTS[0] }) => {
        const statusColor = getStatusColor(item.status);

        return (
            <Card onPress={() => navigation.navigate('RequirementDetail', { requirementId: item.id })} style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                            <Text style={[styles.statusText, { color: statusColor }]}>
                                {item.status.replace('_', ' ')}
                            </Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Icon name="account-group" size={16} color={COLORS.textTertiary} />
                        <Text style={styles.metaText}>{item.quantity} positions</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Icon name="map-marker" size={16} color={COLORS.textTertiary} />
                        <Text style={styles.metaText}>{item.location}</Text>
                    </View>
                </View>

                <View style={styles.skillsRow}>
                    {item.skills.slice(0, 3).map((skill, index) => (
                        <View key={index} style={styles.skillTag}>
                            <Text style={styles.skillText}>{skill}</Text>
                        </View>
                    ))}
                    {item.skills.length > 3 && (
                        <Text style={styles.moreSkills}>+{item.skills.length - 3}</Text>
                    )}
                </View>
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Requirements</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('CreateRequirement')}
                >
                    <Icon name="plus" size={24} color={COLORS.textInverse} />
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                {(['ALL', 'OPEN', 'IN_PROGRESS'] as const).map((status) => (
                    <TouchableOpacity
                        key={status}
                        style={[styles.filterChip, filter === status && styles.filterChipActive]}
                        onPress={() => setFilter(status)}
                    >
                        <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>
                            {status === 'ALL' ? 'All' : status.replace('_', ' ')}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredRequirements}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Icon name="clipboard-list-outline" size={64} color={COLORS.slate300} />
                        <Text style={styles.emptyText}>No requirements found</Text>
                        <Text style={styles.emptySubtext}>Create a new requirement to get started</Text>
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
        marginBottom: SPACING.sm,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.xs,
    },
    title: {
        flex: 1,
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
        marginRight: SPACING.sm,
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
    description: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        lineHeight: 20,
        marginBottom: SPACING.sm,
    },
    metaRow: {
        flexDirection: 'row',
        marginBottom: SPACING.sm,
        gap: SPACING.md,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.xs,
        color: COLORS.textTertiary,
        marginLeft: 4,
    },
    skillsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.xs,
    },
    skillTag: {
        backgroundColor: COLORS.slate100,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    skillText: {
        fontFamily: FONTS.medium,
        fontSize: 10,
        color: COLORS.textSecondary,
    },
    moreSkills: {
        fontFamily: FONTS.medium,
        fontSize: 10,
        color: COLORS.textTertiary,
        alignSelf: 'center',
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
    },
});

export default RequirementsScreen;

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MOCK_CANDIDATE_SUPPLY } from '../../data/mock';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import Card from '../../components/common/Card';

const SupplyScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

    // Get unique skills from all candidates
    const allSkills = Array.from(
        new Set(MOCK_CANDIDATE_SUPPLY.flatMap(c => c.skills))
    ).slice(0, 5);

    const filteredCandidates = MOCK_CANDIDATE_SUPPLY.filter(candidate => {
        const matchesSkill = !selectedSkill || candidate.skills.includes(selectedSkill);
        const matchesSearch = !searchQuery ||
            `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            candidate.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSkill && matchesSearch;
    });

    const handleSubmitCandidate = (candidateId: string, candidateName: string) => {
        Alert.alert(
            'Submit Candidate',
            `Submit ${candidateName} to a requirement?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Submit',
                    onPress: () => Alert.alert('Success', 'Candidate submitted successfully')
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: typeof MOCK_CANDIDATE_SUPPLY[0] }) => {
        return (
            <Card style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {item.firstName.charAt(0)}{item.lastName.charAt(0)}
                        </Text>
                    </View>
                    <View style={styles.candidateInfo}>
                        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                        <Text style={styles.location}>
                            <Icon name="map-marker" size={14} color={COLORS.textTertiary} /> {item.location}
                        </Text>
                    </View>
                    <View style={styles.rateContainer}>
                        <Text style={styles.rate}>${item.rate}/hr</Text>
                    </View>
                </View>

                <Text style={styles.bio} numberOfLines={2}>{item.bio}</Text>

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Icon name="briefcase" size={16} color={COLORS.textTertiary} />
                        <Text style={styles.metaText}>{item.experience} years</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Icon name="school" size={16} color={COLORS.textTertiary} />
                        <Text style={styles.metaText}>{item.education}</Text>
                    </View>
                </View>

                <View style={styles.skillsRow}>
                    {item.skills.slice(0, 4).map((skill, index) => (
                        <View key={index} style={styles.skillTag}>
                            <Text style={styles.skillText}>{skill}</Text>
                        </View>
                    ))}
                    {item.skills.length > 4 && (
                        <Text style={styles.moreSkills}>+{item.skills.length - 4}</Text>
                    )}
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.availabilityBadge}>
                        <Icon name="clock-outline" size={14} color={COLORS.success} />
                        <Text style={styles.availabilityText}>{item.availability}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={() => handleSubmitCandidate(item.id, `${item.firstName} ${item.lastName}`)}
                    >
                        <Icon name="send" size={16} color={COLORS.textInverse} />
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Candidate Supply</Text>
            </View>

            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterChip, !selectedSkill && styles.filterChipActive]}
                    onPress={() => setSelectedSkill(null)}
                >
                    <Text style={[styles.filterText, !selectedSkill && styles.filterTextActive]}>
                        All
                    </Text>
                </TouchableOpacity>
                {allSkills.map((skill) => (
                    <TouchableOpacity
                        key={skill}
                        style={[styles.filterChip, selectedSkill === skill && styles.filterChipActive]}
                        onPress={() => setSelectedSkill(skill === selectedSkill ? null : skill)}
                    >
                        <Text style={[styles.filterText, selectedSkill === skill && styles.filterTextActive]}>
                            {skill}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredCandidates}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Icon name="account-search-outline" size={64} color={COLORS.slate300} />
                        <Text style={styles.emptyText}>No candidates found</Text>
                        <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
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
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        gap: SPACING.sm,
        flexWrap: 'wrap',
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
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    avatarContainer: {
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
        fontSize: FONT_SIZES.lg,
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
    location: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.xs,
        color: COLORS.textTertiary,
    },
    rateContainer: {
        backgroundColor: COLORS.success + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    rate: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.sm,
        color: COLORS.success,
    },
    bio: {
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
        marginBottom: SPACING.md,
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
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.slate100,
        paddingTop: SPACING.sm,
    },
    availabilityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    availabilityText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.xs,
        color: COLORS.success,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.md,
        gap: 4,
    },
    submitButtonText: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.sm,
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
    },
});

export default SupplyScreen;

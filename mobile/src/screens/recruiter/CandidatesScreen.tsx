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
import { MOCK_CANDIDATE_SUPPLY } from '../../data/mock';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import Card from '../../components/common/Card';

const RecruiterCandidatesScreen = () => {
    const renderItem = ({ item }: { item: typeof MOCK_CANDIDATE_SUPPLY[0] }) => {
        return (
            <Card style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.avatar}>
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
                        <Icon name="briefcase" size={14} color={COLORS.textTertiary} />
                        <Text style={styles.metaText}>{item.experience} years</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Icon name="clock-outline" size={14} color={COLORS.success} />
                        <Text style={styles.metaText}>{item.availability}</Text>
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

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Icon name="eye" size={16} color={COLORS.primary} />
                        <Text style={styles.actionText}>View Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.contactButton]}>
                        <Icon name="message" size={16} color={COLORS.textInverse} />
                        <Text style={styles.contactText}>Contact</Text>
                    </TouchableOpacity>
                </View>
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Candidates</Text>
                <TouchableOpacity style={styles.searchButton}>
                    <Icon name="magnify" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={MOCK_CANDIDATE_SUPPLY}
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
    searchButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.slate50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
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
    avatar: {
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
    actions: {
        flexDirection: 'row',
        gap: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.slate100,
        paddingTop: SPACING.sm,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.slate50,
        gap: 4,
    },
    actionText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        color: COLORS.primary,
    },
    contactButton: {
        backgroundColor: COLORS.primary,
    },
    contactText: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textInverse,
    },
});

export default RecruiterCandidatesScreen;

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { B2BStackParamList } from '../../types';
import { MOCK_BULK_REQUIREMENTS } from '../../data/mock';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import Button from '../../components/common/Button';

type Props = NativeStackScreenProps<B2BStackParamList, 'RequirementDetail'>;

const RequirementDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { requirementId } = route.params;
    const requirement = MOCK_BULK_REQUIREMENTS.find(r => r.id === requirementId);

    if (!requirement) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Requirement not found</Text>
            </SafeAreaView>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return COLORS.success;
            case 'IN_PROGRESS': return COLORS.warning;
            case 'COMPLETED': return COLORS.info;
            case 'CANCELLED': return COLORS.error;
            default: return COLORS.slate400;
        }
    };

    const statusColor = getStatusColor(requirement.status);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Requirement Details</Text>
                <TouchableOpacity style={styles.optionButton}>
                    <Icon name="dots-vertical" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Title & Status */}
                <View style={styles.section}>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {requirement.status.replace('_', ' ')}
                        </Text>
                    </View>
                    <Text style={styles.title}>{requirement.title}</Text>
                </View>

                {/* Key Info */}
                <View style={styles.infoGrid}>
                    <View style={styles.infoCard}>
                        <Icon name="account-group" size={24} color={COLORS.primary} />
                        <Text style={styles.infoValue}>{requirement.quantity}</Text>
                        <Text style={styles.infoLabel}>Positions</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Icon name="cash" size={24} color={COLORS.success} />
                        <Text style={styles.infoValue}>${(requirement.budget / 1000).toFixed(0)}K</Text>
                        <Text style={styles.infoLabel}>Budget</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Icon name="calendar" size={24} color={COLORS.warning} />
                        <Text style={styles.infoValue}>{new Date(requirement.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                        <Text style={styles.infoLabel}>Deadline</Text>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{requirement.description}</Text>
                </View>

                {/* Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Details</Text>
                    <View style={styles.detailRow}>
                        <Icon name="map-marker" size={20} color={COLORS.textSecondary} />
                        <Text style={styles.detailLabel}>Location</Text>
                        <Text style={styles.detailValue}>{requirement.location}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Icon name="briefcase" size={20} color={COLORS.textSecondary} />
                        <Text style={styles.detailLabel}>Experience</Text>
                        <Text style={styles.detailValue}>{requirement.experience}</Text>
                    </View>
                </View>

                {/* Skills */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Required Skills</Text>
                    <View style={styles.skillsContainer}>
                        {requirement.skills.map((skill, index) => (
                            <View key={index} style={styles.skillTag}>
                                <Text style={styles.skillText}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsSection}>
                    <Button
                        title="View Submissions"
                        variant="primary"
                        icon={<Icon name="account-multiple" size={20} color={COLORS.textInverse} />}
                        style={styles.actionButton}
                    />
                    <Button
                        title="Edit Requirement"
                        variant="outline"
                        icon={<Icon name="pencil" size={20} color={COLORS.primary} />}
                        style={styles.actionButton}
                    />
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate100,
    },
    backButton: {
        padding: SPACING.xs,
    },
    headerTitle: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
    },
    optionButton: {
        padding: SPACING.xs,
    },
    content: {
        padding: SPACING.lg,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        marginBottom: SPACING.sm,
    },
    statusText: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.xs,
        textTransform: 'uppercase',
    },
    title: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES['2xl'],
        color: COLORS.textPrimary,
        lineHeight: 32,
    },
    infoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
        gap: SPACING.sm,
    },
    infoCard: {
        flex: 1,
        backgroundColor: COLORS.slate50,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    infoValue: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.xl,
        color: COLORS.textPrimary,
        marginTop: SPACING.xs,
    },
    infoLabel: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.xs,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    sectionTitle: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    description: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.base,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate100,
    },
    detailLabel: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.base,
        color: COLORS.textSecondary,
        marginLeft: SPACING.sm,
        flex: 1,
    },
    detailValue: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.base,
        color: COLORS.textPrimary,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    skillTag: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.md,
    },
    skillText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textInverse,
    },
    actionsSection: {
        gap: SPACING.md,
        marginTop: SPACING.lg,
    },
    actionButton: {
        marginBottom: SPACING.sm,
    },
});

export default RequirementDetailScreen;

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Card from '../common/Card';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import { Job } from '../../types';

interface JobCardProps {
    job: Job;
    onPress: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onPress }) => {
    return (
        <Card onPress={onPress} style={styles.container}>
            <View style={styles.header}>
                <View style={styles.companyInfo}>
                    <View style={styles.logoContainer}>
                        {job.companyLogo ? (
                            <Image source={{ uri: job.companyLogo }} style={styles.logo} />
                        ) : (
                            <Text style={styles.logoText}>{job.companyName.charAt(0)}</Text>
                        )}
                    </View>
                    <View>
                        <Text style={styles.companyName}>{job.companyName}</Text>
                        <Text style={styles.location}>{job.location}</Text>
                    </View>
                </View>
                <Icon name="bookmark-outline" size={24} color={COLORS.slate400} />
            </View>

            <Text style={styles.title}>{job.title}</Text>

            <View style={styles.tags}>
                <View style={styles.tag}>
                    <Text style={styles.tagText}>{job.type.replace('_', ' ')}</Text>
                </View>
                <View style={styles.tag}>
                    <Text style={styles.tagText}>{job.experience}</Text>
                </View>
                {job.salary && (
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>{job.salary}</Text>
                    </View>
                )}
            </View>

            <View style={styles.footer}>
                <Text style={styles.postedAt}>Posted 2 days ago</Text>
                <Text style={styles.applicants}>{job.positions} positions</Text>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    companyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoContainer: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.slate100,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.sm,
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.md,
    },
    logoText: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.primary,
    },
    companyName: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    location: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.xs,
        color: COLORS.textTertiary,
    },
    title: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: SPACING.md,
    },
    tag: {
        backgroundColor: COLORS.slate100,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
        marginRight: SPACING.xs,
        marginBottom: SPACING.xs,
    },
    tagText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.xs,
        color: COLORS.textSecondary,
        textTransform: 'capitalize',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.sm,
    },
    postedAt: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.xs,
        color: COLORS.textTertiary,
    },
    applicants: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.xs,
        color: COLORS.primary,
    },
});

export default JobCard;

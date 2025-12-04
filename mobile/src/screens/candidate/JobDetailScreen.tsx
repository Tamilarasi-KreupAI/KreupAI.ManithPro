import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CandidateStackParamList } from '../../types';
import Button from '../../components/common/Button';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';

type Props = NativeStackScreenProps<CandidateStackParamList, 'JobDetail'>;

const JobDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { job } = route.params;
    const insets = useSafeAreaInsets();

    const handleApply = () => {
        Alert.alert('Success', 'Your application has been submitted!');
    };

    if (!job) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Job not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Job Details</Text>
                <TouchableOpacity style={styles.bookmarkButton}>
                    <Icon name="bookmark-outline" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Company Header */}
                <View style={styles.companyHeader}>
                    <View style={styles.logoContainer}>
                        {job.companyLogo ? (
                            <Image source={{ uri: job.companyLogo }} style={styles.logo} />
                        ) : (
                            <Text style={styles.logoText}>{job.companyName.charAt(0)}</Text>
                        )}
                    </View>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.companyName}>{job.companyName} • {job.location}</Text>

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
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Job Description</Text>
                    <Text style={styles.description}>
                        {job.description || 'We are looking for a talented individual to join our team. This role offers a great opportunity to work on exciting projects and grow your career.'}
                    </Text>
                </View>

                {/* Requirements */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Requirements</Text>
                    {(job.requirements && job.requirements.length > 0) ? (
                        job.requirements.map((req, index) => (
                            <View key={index} style={styles.bulletPoint}>
                                <View style={styles.bullet} />
                                <Text style={styles.bulletText}>{req}</Text>
                            </View>
                        ))
                    ) : (
                        <View>
                            <View style={styles.bulletPoint}>
                                <View style={styles.bullet} />
                                <Text style={styles.bulletText}>3+ years of experience in related field</Text>
                            </View>
                            <View style={styles.bulletPoint}>
                                <View style={styles.bullet} />
                                <Text style={styles.bulletText}>Strong communication skills</Text>
                            </View>
                            <View style={styles.bulletPoint}>
                                <View style={styles.bullet} />
                                <Text style={styles.bulletText}>Bachelor's degree or equivalent</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* About Company */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About Company</Text>
                    <Text style={styles.description}>
                        {job.companyDescription || `${job.companyName} is a leading company in the industry, dedicated to innovation and excellence.`}
                    </Text>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.lg }]}>
                <Button
                    title="Apply Now"
                    onPress={handleApply}
                    style={styles.applyButton}
                    textStyle={styles.applyButtonText}
                />
            </View>
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
    bookmarkButton: {
        padding: SPACING.xs,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    companyHeader: {
        alignItems: 'center',
        padding: SPACING.xl,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate100,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: COLORS.slate100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 20,
    },
    logoText: {
        fontFamily: FONTS.bold,
        fontSize: 32,
        color: COLORS.primary,
    },
    jobTitle: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES['2xl'],
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: SPACING.xs,
    },
    companyName: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.base,
        color: COLORS.textSecondary,
        marginBottom: SPACING.lg,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    tag: {
        backgroundColor: COLORS.slate100,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
        marginHorizontal: SPACING.xs,
        marginBottom: SPACING.xs,
    },
    tagText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        textTransform: 'capitalize',
    },
    section: {
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate100,
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
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: SPACING.sm,
        alignItems: 'flex-start',
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.textSecondary,
        marginTop: 8,
        marginRight: SPACING.md,
    },
    bulletText: {
        flex: 1,
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.base,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.background,
        padding: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.slate100,
        paddingBottom: SPACING.xl, // Extra padding for safe area
    },
    applyButton: {
        width: '100%',
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

export default JobDetailScreen;

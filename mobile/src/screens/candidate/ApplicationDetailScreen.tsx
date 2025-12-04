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
import { CandidateStackParamList } from '../../types';
import { MOCK_APPLICATIONS } from '../../data/mock';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import Button from '../../components/common/Button';

type Props = NativeStackScreenProps<CandidateStackParamList, 'ApplicationDetail'>;

const ApplicationDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { applicationId } = route.params;
    const application = MOCK_APPLICATIONS.find(a => a.id === applicationId);

    if (!application) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Application not found</Text>
            </SafeAreaView>
        );
    }

    const steps = [
        { status: 'PENDING', label: 'Applied', date: application.appliedAt },
        { status: 'UNDER_REVIEW', label: 'Under Review', date: null },
        { status: 'INTERVIEW_SCHEDULED', label: 'Interview', date: null },
        { status: 'OFFER_EXTENDED', label: 'Offer', date: null },
    ];

    const currentStepIndex = steps.findIndex(s => s.status === application.status);
    // Simple logic for demo: if status matches, it and previous are active
    // In real app, we'd have dates for each step

    const getStepStatus = (index: number) => {
        // This is a simplified logic for the timeline
        const statusMap: { [key: string]: number } = {
            'PENDING': 0,
            'UNDER_REVIEW': 1,
            'INTERVIEW_SCHEDULED': 2,
            'OFFER_EXTENDED': 3,
            'ACCEPTED': 4,
            'REJECTED': -1,
        };

        const currentIdx = statusMap[application.status] || 0;

        if (application.status === 'REJECTED') return 'rejected';
        if (index < currentIdx) return 'completed';
        if (index === currentIdx) return 'active';
        return 'pending';
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Application Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Job Info */}
                <View style={styles.section}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>{application.job.companyName.charAt(0)}</Text>
                    </View>
                    <Text style={styles.jobTitle}>{application.job.title}</Text>
                    <Text style={styles.companyName}>{application.job.companyName}</Text>
                    <Text style={styles.location}>{application.job.location}</Text>
                </View>

                {/* Timeline */}
                <View style={styles.timelineSection}>
                    <Text style={styles.sectionTitle}>Application Status</Text>
                    <View style={styles.timeline}>
                        {steps.map((step, index) => {
                            const status = getStepStatus(index);
                            let color = COLORS.slate300;
                            let icon = 'circle-outline';

                            if (status === 'completed') {
                                color = COLORS.success;
                                icon = 'check-circle';
                            } else if (status === 'active') {
                                color = COLORS.primary;
                                icon = 'record-circle-outline';
                            } else if (status === 'rejected') {
                                color = COLORS.error;
                                icon = 'close-circle';
                            }

                            return (
                                <View key={index} style={styles.timelineItem}>
                                    <View style={styles.timelineLeft}>
                                        <Icon name={icon} size={24} color={color} />
                                        {index < steps.length - 1 && (
                                            <View style={[styles.line, { backgroundColor: status === 'completed' ? COLORS.success : COLORS.slate200 }]} />
                                        )}
                                    </View>
                                    <View style={styles.timelineRight}>
                                        <Text style={[styles.stepLabel, { color: status === 'pending' ? COLORS.textSecondary : COLORS.textPrimary }]}>
                                            {step.label}
                                        </Text>
                                        {step.date && (
                                            <Text style={styles.stepDate}>
                                                {new Date(step.date).toLocaleDateString()}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsSection}>
                    <Button
                        title="View Job Details"
                        variant="outline"
                        onPress={() => navigation.navigate('JobDetail', { jobId: application.jobId, job: application.job })}
                        style={styles.actionButton}
                    />
                    <Button
                        title="Contact Recruiter"
                        variant="secondary"
                        onPress={() => navigation.navigate('MainTabs', { screen: 'Messages' })}
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
    content: {
        padding: SPACING.lg,
    },
    section: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
        paddingBottom: SPACING.xl,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate100,
    },
    logoContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: COLORS.slate100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    logoText: {
        fontFamily: FONTS.bold,
        fontSize: 24,
        color: COLORS.primary,
    },
    jobTitle: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.xl,
        color: COLORS.textPrimary,
        marginBottom: 4,
        textAlign: 'center',
    },
    companyName: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.base,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    location: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textTertiary,
    },
    timelineSection: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
        marginBottom: SPACING.lg,
    },
    timeline: {
        paddingLeft: SPACING.sm,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 2, // Adjust for line height
    },
    timelineLeft: {
        alignItems: 'center',
        marginRight: SPACING.md,
        width: 24,
    },
    line: {
        width: 2,
        height: 40,
        backgroundColor: COLORS.slate200,
        marginVertical: 4,
    },
    timelineRight: {
        flex: 1,
        paddingBottom: 40,
    },
    stepLabel: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.base,
        marginBottom: 2,
    },
    stepDate: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textTertiary,
    },
    actionsSection: {
        gap: SPACING.md,
    },
    actionButton: {
        marginBottom: SPACING.sm,
    },
});

export default ApplicationDetailScreen;

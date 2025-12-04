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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CandidateStackParamList, ApplicationStatus } from '../../types';
import { MOCK_APPLICATIONS } from '../../data/mock';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import Card from '../../components/common/Card';

type NavigationProp = NativeStackNavigationProp<CandidateStackParamList>;

const getStatusColor = (status: string) => {
    switch (status) {
        case 'INTERVIEW_SCHEDULED':
            return COLORS.info;
        case 'PENDING':
            return COLORS.warning;
        case 'REJECTED':
            return COLORS.error;
        case 'ACCEPTED':
        case 'OFFER_EXTENDED':
            return COLORS.success;
        default:
            return COLORS.slate400;
    }
};

const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ');
};

const ApplicationsScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    const handlePress = (applicationId: string) => {
        navigation.navigate('ApplicationDetail', { applicationId });
    };

    const renderItem = ({ item }: { item: typeof MOCK_APPLICATIONS[0] }) => {
        const statusColor = getStatusColor(item.status);

        return (
            <Card onPress={() => handlePress(item.id)} style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.companyInfo}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoText}>{item.job.companyName.charAt(0)}</Text>
                        </View>
                        <View>
                            <Text style={styles.jobTitle}>{item.job.title}</Text>
                            <Text style={styles.companyName}>{item.job.companyName}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {getStatusLabel(item.status)}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.footerItem}>
                        <Icon name="calendar-clock" size={16} color={COLORS.textTertiary} />
                        <Text style={styles.footerText}>
                            Applied: {new Date(item.appliedAt).toLocaleDateString()}
                        </Text>
                    </View>
                    <Icon name="chevron-right" size={20} color={COLORS.slate400} />
                </View>
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            <View style={styles.header}>
                <Text style={styles.title}>My Applications</Text>
            </View>

            <FlatList
                data={MOCK_APPLICATIONS}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Icon name="file-document-outline" size={64} color={COLORS.slate300} />
                        <Text style={styles.emptyText}>No applications yet</Text>
                        <Text style={styles.emptySubtext}>Start applying to jobs to see them here</Text>
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
    title: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES['2xl'],
        color: COLORS.textPrimary,
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
        marginBottom: SPACING.md,
    },
    companyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
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
    logoText: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.primary,
    },
    jobTitle: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.base,
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    companyName: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
        marginLeft: SPACING.sm,
    },
    statusText: {
        fontFamily: FONTS.bold,
        fontSize: 10,
        textTransform: 'uppercase',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.slate100,
        paddingTop: SPACING.sm,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.xs,
        color: COLORS.textTertiary,
        marginLeft: 4,
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

export default ApplicationsScreen;

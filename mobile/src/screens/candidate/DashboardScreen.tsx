import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import JobCard from '../../components/candidate/JobCard';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import { CandidateStackParamList, Job } from '../../types';
import { MOCK_JOBS } from '../../data/mock';

type NavigationProp = NativeStackNavigationProp<CandidateStackParamList>;

const CandidateDashboardScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation<NavigationProp>();

    const handleJobPress = (job: Job) => {
        navigation.navigate('JobDetail', { jobId: job.id, job });
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>Hello, {user?.firstName} 👋</Text>
                <Text style={styles.subtitle}>Find your dream job today</Text>
            </View>
            <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => Alert.alert('Notifications', 'No new notifications')}
            >
                <Icon name="bell-outline" size={24} color={COLORS.textPrimary} />
                <View style={styles.badge} />
            </TouchableOpacity>
        </View>
    );

    const renderStats = () => (
        <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: '#e0f2fe' }]}>
                <Text style={[styles.statValue, { color: '#0284c7' }]}>12</Text>
                <Text style={[styles.statLabel, { color: '#0284c7' }]}>Applied</Text>
            </View>
            <TouchableOpacity
                style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}
                // @ts-ignore - Navigating to sibling tab
                onPress={() => navigation.navigate('Interviews')}
            >
                <Text style={[styles.statValue, { color: '#16a34a' }]}>3</Text>
                <Text style={[styles.statLabel, { color: '#16a34a' }]}>Interviews</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.statCard, { backgroundColor: '#fefce8' }]}
                onPress={() => navigation.navigate('SavedJobs')}
            >
                <Text style={[styles.statValue, { color: '#ca8a04' }]}>5</Text>
                <Text style={[styles.statLabel, { color: '#ca8a04' }]}>Saved</Text>
            </TouchableOpacity>
        </View>
    );

    const renderSearchBar = () => (
        <TouchableOpacity
            style={styles.searchBar}
            // @ts-ignore - Navigating to sibling tab
            onPress={() => navigation.navigate('Search')}
        >
            <Icon name="magnify" size={24} color={COLORS.slate400} />
            <Text style={styles.searchText}>Search for jobs, companies...</Text>
            <View style={styles.filterButton}>
                <Icon name="tune-variant" size={20} color={COLORS.textInverse} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            <View style={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg }}>
                {renderHeader()}
            </View>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {renderSearchBar()}
                {renderStats()}

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recommended for you</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {MOCK_JOBS.map((job) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onPress={() => handleJobPress(job)}
                        />
                    ))}
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Applications</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    {/* Add Application Cards here later */}
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
    scrollContent: {
        padding: SPACING.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    greeting: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES['2xl'],
        color: COLORS.textPrimary,
    },
    subtitle: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.base,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.slate50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.error,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.slate50,
        borderRadius: BORDER_RADIUS.xl,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchText: {
        flex: 1,
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.base,
        color: COLORS.textPlaceholder,
        marginLeft: SPACING.sm,
    },
    filterButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
    },
    statCard: {
        flex: 1,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    statValue: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.xl,
        marginBottom: 4,
    },
    statLabel: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.xs,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
    },
    seeAll: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        color: COLORS.primary,
    },
});

export default CandidateDashboardScreen;

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CandidateStackParamList } from '../../types';
import { MOCK_JOBS } from '../../data/mock';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../../constants';
import JobCard from '../../components/candidate/JobCard';

type NavigationProp = NativeStackNavigationProp<CandidateStackParamList>;

const SavedJobsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    // In a real app, this would come from AsyncStorage or API
    const [savedJobIds] = useState<string[]>(['1', '3']); // Mock saved jobs

    const savedJobs = MOCK_JOBS.filter(job => savedJobIds.includes(job.id));

    const handleJobPress = (jobId: string, job: typeof MOCK_JOBS[0]) => {
        navigation.navigate('JobDetail', { jobId, job });
    };

    const renderItem = ({ item }: { item: typeof MOCK_JOBS[0] }) => (
        <JobCard job={item} onPress={() => handleJobPress(item.id, item)} />
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Saved Jobs</Text>
                    <Text style={styles.headerSubtitle}>{savedJobs.length} jobs saved</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={savedJobs}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Icon name="bookmark-outline" size={64} color={COLORS.slate300} />
                        <Text style={styles.emptyText}>No saved jobs yet</Text>
                        <Text style={styles.emptySubtext}>
                            Tap the bookmark icon on any job to save it for later
                        </Text>
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
    backButton: {
        padding: SPACING.xs,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES['2xl'],
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    listContent: {
        padding: SPACING.lg,
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
        textAlign: 'center',
        paddingHorizontal: SPACING.xl,
    },
});

export default SavedJobsScreen;

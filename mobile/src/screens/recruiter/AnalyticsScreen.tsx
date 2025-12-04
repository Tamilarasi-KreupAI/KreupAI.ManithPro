import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RecruiterStackParamList } from '../../types';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';

type Props = NativeStackScreenProps<RecruiterStackParamList, 'Analytics'>;

const AnalyticsScreen: React.FC<Props> = ({ navigation }) => {
    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Analytics</Text>
            <View style={{ width: 24 }} />
        </View>
    );

    const renderStatCard = (title: string, value: string, change: string, isPositive: boolean) => (
        <View style={styles.statCard}>
            <Text style={styles.statTitle}>{title}</Text>
            <Text style={styles.statValue}>{value}</Text>
            <View style={styles.changeContainer}>
                <Icon
                    name={isPositive ? 'arrow-up' : 'arrow-down'}
                    size={16}
                    color={isPositive ? COLORS.success : COLORS.error}
                />
                <Text style={[styles.changeText, { color: isPositive ? COLORS.success : COLORS.error }]}>
                    {change} vs last month
                </Text>
            </View>
        </View>
    );

    const renderChart = () => (
        <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Applications Overview</Text>
            <View style={styles.chart}>
                {[40, 65, 30, 80, 55, 90, 45].map((height, index) => (
                    <View key={index} style={styles.barContainer}>
                        <View style={[styles.bar, { height: `${height}%` }]} />
                        <Text style={styles.barLabel}>
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.statsGrid}>
                    {renderStatCard('Total Applications', '1,234', '12%', true)}
                    {renderStatCard('Interviews', '45', '5%', true)}
                    {renderStatCard('Hired', '12', '2%', false)}
                    {renderStatCard('Rejected', '89', '8%', false)}
                </View>
                {renderChart()}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.slate200 },
    backButton: { padding: SPACING.xs },
    headerTitle: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.xl, color: COLORS.textPrimary },
    scrollContent: { padding: SPACING.lg },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.xl },
    statCard: { width: '47%', backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.slate200 },
    statTitle: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs },
    statValue: { fontFamily: FONTS.bold, fontSize: FONT_SIZES['2xl'], color: COLORS.textPrimary, marginBottom: SPACING.xs },
    changeContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    changeText: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.xs },
    chartContainer: { backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.slate200 },
    sectionTitle: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.lg, color: COLORS.textPrimary, marginBottom: SPACING.lg },
    chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 200 },
    barContainer: { alignItems: 'center', gap: SPACING.xs, flex: 1 },
    bar: { width: 8, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.full },
    barLabel: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
});

export default AnalyticsScreen;

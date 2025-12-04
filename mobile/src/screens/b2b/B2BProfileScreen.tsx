import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../../constants';
import Button from '../../components/common/Button';

const B2BProfileScreen = () => {
    const { user, logout } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {user?.company?.charAt(0) || 'C'}
                    </Text>
                </View>
                <Text style={styles.name}>{user?.company}</Text>
                <Text style={styles.role}>Vendor Partner</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Info</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{user?.email}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Contact Person</Text>
                    <Text style={styles.value}>{user?.firstName} {user?.lastName}</Text>
                </View>
            </View>

            <View style={styles.logoutSection}>
                <Button
                    title="Logout"
                    variant="danger"
                    onPress={logout}
                    icon={<Icon name="logout" size={20} color={COLORS.textInverse} />}
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
        alignItems: 'center',
        padding: SPACING.xl,
        backgroundColor: COLORS.slate50,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate200,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    avatarText: {
        fontFamily: FONTS.bold,
        fontSize: 32,
        color: COLORS.textInverse,
    },
    name: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.xl,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    role: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    section: {
        padding: SPACING.lg,
    },
    sectionTitle: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate100,
    },
    label: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.base,
        color: COLORS.textSecondary,
    },
    value: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.base,
        color: COLORS.textPrimary,
    },
    logoutSection: {
        padding: SPACING.xl,
        marginTop: 'auto',
    },
});

export default B2BProfileScreen;

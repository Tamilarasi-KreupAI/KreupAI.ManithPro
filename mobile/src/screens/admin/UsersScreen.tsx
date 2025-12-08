import React, { useState } from 'react';
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
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import Card from '../../components/common/Card';

// Mock users data
const MOCK_USERS = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'CANDIDATE',
        status: 'ACTIVE',
        joinedAt: '2023-01-15',
    },
    {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@techcorp.com',
        role: 'RECRUITER',
        status: 'ACTIVE',
        joinedAt: '2023-02-20',
    },
    {
        id: '3',
        name: 'Vendor Corp',
        email: 'vendor@acme.com',
        role: 'B2B',
        status: 'PENDING',
        joinedAt: '2023-03-10',
    },
    {
        id: '4',
        name: 'Admin User',
        email: 'admin@manithpro.com',
        role: 'ADMIN',
        status: 'ACTIVE',
        joinedAt: '2023-01-01',
    },
];

const AdminUsersScreen = () => {
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING'>('ALL');

    const filteredUsers = MOCK_USERS.filter(user => {
        if (filter === 'ALL') return true;
        return user.status === filter;
    });

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return COLORS.error;
            case 'RECRUITER': return COLORS.primary;
            case 'B2B': return COLORS.warning;
            case 'CANDIDATE': return COLORS.success;
            default: return COLORS.slate400;
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'ACTIVE' ? COLORS.success : COLORS.warning;
    };

    const renderItem = ({ item }: { item: typeof MOCK_USERS[0] }) => {
        const roleColor = getRoleColor(item.role);
        const statusColor = getStatusColor(item.status);

        return (
            <Card style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {item.name.split(' ').map(n => n[0]).join('')}
                        </Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.email}>{item.email}</Text>
                    </View>
                </View>

                <View style={styles.metaRow}>
                    <View style={[styles.badge, { backgroundColor: roleColor + '20' }]}>
                        <Text style={[styles.badgeText, { color: roleColor }]}>{item.role}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
                        <Text style={[styles.badgeText, { color: statusColor }]}>{item.status}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.joinedText}>
                        Joined {new Date(item.joinedAt).toLocaleDateString()}
                    </Text>
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionButton}>
                            <Icon name="eye" size={16} color={COLORS.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Icon name="pencil" size={16} color={COLORS.success} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Icon name="delete" size={16} color={COLORS.error} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Users</Text>
            </View>

            <View style={styles.filterContainer}>
                {(['ALL', 'ACTIVE', 'PENDING'] as const).map((status) => (
                    <TouchableOpacity
                        key={status}
                        style={[styles.filterChip, filter === status && styles.filterChipActive]}
                        onPress={() => setFilter(status)}
                    >
                        <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>
                            {status}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredUsers}
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
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        gap: SPACING.sm,
    },
    filterChip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.slate100,
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
    },
    filterText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    filterTextActive: {
        color: COLORS.textInverse,
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
    userInfo: {
        flex: 1,
    },
    name: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.base,
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    email: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    metaRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    badgeText: {
        fontFamily: FONTS.bold,
        fontSize: 10,
        textTransform: 'uppercase',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.slate100,
        paddingTop: SPACING.sm,
    },
    joinedText: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.xs,
        color: COLORS.textTertiary,
    },
    actions: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    actionButton: {
        padding: 4,
    },
});

export default AdminUsersScreen;

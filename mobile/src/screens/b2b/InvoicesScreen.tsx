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
import { B2BStackParamList } from '../../types';
import { MOCK_INVOICES } from '../../data/mock';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import Card from '../../components/common/Card';

type NavigationProp = NativeStackNavigationProp<B2BStackParamList>;

const getStatusColor = (status: string) => {
    switch (status) {
        case 'PAID':
            return COLORS.success;
        case 'PENDING':
            return COLORS.warning;
        case 'OVERDUE':
            return COLORS.error;
        default:
            return COLORS.slate400;
    }
};

const InvoicesScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    const renderItem = ({ item }: { item: typeof MOCK_INVOICES[0] }) => {
        const statusColor = getStatusColor(item.status);

        return (
            <Card
                style={styles.card}
                onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: item.id })}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.invoiceInfo}>
                        <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
                        <Text style={styles.clientName}>{item.contract.clientName}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Amount</Text>
                    <Text style={styles.amount}>${(item.amount / 1000).toFixed(1)}K</Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.dateInfo}>
                        <Icon name="calendar" size={14} color={COLORS.textTertiary} />
                        <Text style={styles.dateText}>
                            Due: {new Date(item.dueDate).toLocaleDateString()}
                        </Text>
                    </View>
                    {item.paidDate && (
                        <View style={styles.paidInfo}>
                            <Icon name="check-circle" size={14} color={COLORS.success} />
                            <Text style={styles.paidText}>
                                Paid: {new Date(item.paidDate).toLocaleDateString()}
                            </Text>
                        </View>
                    )}
                </View>
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Invoices</Text>
                    <Text style={styles.headerSubtitle}>{MOCK_INVOICES.length} total</Text>
                </View>
            </View>

            <FlatList
                data={MOCK_INVOICES}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Icon name="file-document-outline" size={64} color={COLORS.slate300} />
                        <Text style={styles.emptyText}>No invoices found</Text>
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
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate100,
        gap: SPACING.md,
    },
    backButton: {
        padding: SPACING.xs,
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
    card: {
        marginBottom: SPACING.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    invoiceInfo: {
        flex: 1,
    },
    invoiceNumber: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    clientName: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.sm,
    },
    statusText: {
        fontFamily: FONTS.bold,
        fontSize: 10,
        textTransform: 'uppercase',
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.slate100,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate100,
        marginBottom: SPACING.sm,
    },
    amountLabel: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    amount: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.xl,
        color: COLORS.success,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.xs,
        color: COLORS.textTertiary,
    },
    paidInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    paidText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.xs,
        color: COLORS.success,
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
});

export default InvoicesScreen;

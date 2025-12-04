import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { B2BStackParamList } from '../../types';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import { MOCK_INVOICES } from '../../data/mock';
import Button from '../../components/common/Button';

type Props = NativeStackScreenProps<B2BStackParamList, 'InvoiceDetail'>;

const InvoiceDetailScreen: React.FC<Props> = ({ navigation, route }) => {
    const { invoiceId } = route.params;
    const invoice = MOCK_INVOICES.find(i => i.id === invoiceId);

    if (!invoice) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Invoice not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return COLORS.success;
            case 'PENDING': return COLORS.warning;
            case 'OVERDUE': return COLORS.error;
            default: return COLORS.slate400;
        }
    };

    const statusColor = getStatusColor(invoice.status);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Invoice Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Invoice Number</Text>
                        <Text style={styles.value}>{invoice.invoiceNumber}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>Status</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                            <Text style={[styles.statusText, { color: statusColor }]}>{invoice.status}</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>Amount</Text>
                        <Text style={styles.amount}>${(invoice.amount / 1000).toFixed(1)}K</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.row}>
                        <Text style={styles.label}>Due Date</Text>
                        <Text style={styles.value}>{new Date(invoice.dueDate).toLocaleDateString()}</Text>
                    </View>
                    {invoice.paidDate && (
                        <>
                            <View style={styles.divider} />
                            <View style={styles.row}>
                                <Text style={styles.label}>Paid Date</Text>
                                <Text style={styles.value}>{new Date(invoice.paidDate).toLocaleDateString()}</Text>
                            </View>
                        </>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Client Details</Text>
                    <View style={styles.card}>
                        <Text style={styles.clientName}>{invoice.contract.clientName}</Text>
                        <Text style={styles.clientInfo}>Contract ID: {invoice.contractId}</Text>
                    </View>
                </View>

                <Button
                    title="Download Invoice"
                    onPress={() => { }}
                    variant="outline"
                    style={styles.downloadButton}
                    icon={<Icon name="download" size={20} color={COLORS.primary} />}
                />

                <TouchableOpacity style={styles.bottomBackButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.bottomBackText}>Back to Invoices</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.slate200 },
    backButton: { padding: SPACING.xs },
    headerTitle: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.xl, color: COLORS.textPrimary },
    content: { padding: SPACING.lg },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontFamily: FONTS.medium, color: COLORS.error },
    card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.slate200, marginBottom: SPACING.lg },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.xs },
    label: { fontFamily: FONTS.medium, color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
    value: { fontFamily: FONTS.bold, color: COLORS.textPrimary, fontSize: FONT_SIZES.md },
    amount: { fontFamily: FONTS.bold, color: COLORS.success, fontSize: FONT_SIZES.xl },
    divider: { height: 1, backgroundColor: COLORS.slate100, marginVertical: SPACING.md },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BORDER_RADIUS.sm },
    statusText: { fontFamily: FONTS.bold, fontSize: 12, textTransform: 'uppercase' },
    section: { marginBottom: SPACING.lg },
    sectionTitle: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.lg, color: COLORS.textPrimary, marginBottom: SPACING.md },
    clientName: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.lg, color: COLORS.textPrimary, marginBottom: 4 },
    clientInfo: { fontFamily: FONTS.regular, color: COLORS.textSecondary },
    downloadButton: { marginTop: SPACING.md },
    bottomBackButton: { marginTop: SPACING.lg, alignItems: 'center', padding: SPACING.md },
    bottomBackText: { fontFamily: FONTS.medium, color: COLORS.textSecondary },
});

export default InvoiceDetailScreen;

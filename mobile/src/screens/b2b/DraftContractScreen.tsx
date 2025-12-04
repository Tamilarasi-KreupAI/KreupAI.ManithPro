import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { B2BStackParamList } from '../../types';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import Button from '../../components/common/Button';

type Props = NativeStackScreenProps<B2BStackParamList, 'DraftContract'>;

const DraftContractScreen: React.FC<Props> = ({ navigation }) => {
    const [form, setForm] = useState({
        clientName: '',
        projectTitle: '',
        amount: '',
        startDate: ''
    });

    const handleSubmit = () => {
        if (!form.clientName || !form.projectTitle) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        Alert.alert('Success', 'Contract drafted successfully!');
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Draft Contract</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Client Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter client name"
                        value={form.clientName}
                        onChangeText={(text) => setForm({ ...form, clientName: text })}
                    />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Project Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter project title"
                        value={form.projectTitle}
                        onChangeText={(text) => setForm({ ...form, projectTitle: text })}
                    />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Amount ($)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter amount"
                        value={form.amount}
                        onChangeText={(text) => setForm({ ...form, amount: text })}
                        keyboardType="numeric"
                    />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Start Date</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        value={form.startDate}
                        onChangeText={(text) => setForm({ ...form, startDate: text })}
                    />
                </View>

                <Button title="Save Draft" onPress={handleSubmit} style={styles.submitButton} />
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
    formGroup: { marginBottom: SPACING.lg },
    label: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs },
    input: { borderWidth: 1, borderColor: COLORS.slate200, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, fontFamily: FONTS.regular, fontSize: FONT_SIZES.base, color: COLORS.textPrimary, backgroundColor: COLORS.white },
    submitButton: { marginTop: SPACING.xl },
});

export default DraftContractScreen;

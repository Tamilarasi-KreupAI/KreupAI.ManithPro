import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { B2BStackParamList } from '../../types';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import Button from '../../components/common/Button';

type Props = NativeStackScreenProps<B2BStackParamList, 'AddCandidate'>;

const AddCandidateScreen: React.FC<Props> = ({ navigation }) => {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: ''
    });

    const handleSubmit = () => {
        if (!form.firstName || !form.lastName || !form.email) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }
        Alert.alert('Success', 'Candidate added successfully!');
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Candidate</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter first name"
                        value={form.firstName}
                        onChangeText={(text) => setForm({ ...form, firstName: text })}
                    />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter last name"
                        value={form.lastName}
                        onChangeText={(text) => setForm({ ...form, lastName: text })}
                    />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter email address"
                        value={form.email}
                        onChangeText={(text) => setForm({ ...form, email: text })}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Role / Position</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Senior Developer"
                        value={form.role}
                        onChangeText={(text) => setForm({ ...form, role: text })}
                    />
                </View>

                <Button title="Add Candidate" onPress={handleSubmit} style={styles.submitButton} />
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

export default AddCandidateScreen;

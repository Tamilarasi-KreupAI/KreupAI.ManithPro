import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen = () => {
    const navigation = useNavigation<RegisterScreenNavigationProp>();
    const { register } = useAuth();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<'CANDIDATE' | 'B2B'>('CANDIDATE');

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        if (!firstName) newErrors.firstName = 'First name is required';
        if (!lastName) newErrors.lastName = 'Last name is required';

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            await register({
                firstName,
                lastName,
                email,
                password,
                role,
            });
            // Navigation is handled by the root navigator based on auth state
        } catch (error: any) {
            Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join ManithPro today</Text>
                    </View>

                    <View style={styles.roleContainer}>
                        <TouchableOpacity
                            style={[
                                styles.roleButton,
                                role === 'CANDIDATE' && styles.roleButtonActive,
                            ]}
                            onPress={() => setRole('CANDIDATE')}
                        >
                            <Text
                                style={[
                                    styles.roleText,
                                    role === 'CANDIDATE' && styles.roleTextActive,
                                ]}
                            >
                                Candidate
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.roleButton,
                                role === 'B2B' && styles.roleButtonActive,
                            ]}
                            onPress={() => setRole('B2B')}
                        >
                            <Text
                                style={[
                                    styles.roleText,
                                    role === 'B2B' && styles.roleTextActive,
                                ]}
                            >
                                B2B Partner
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Input
                                    label="First Name"
                                    placeholder="John"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    error={errors.firstName}
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <Input
                                    label="Last Name"
                                    placeholder="Doe"
                                    value={lastName}
                                    onChangeText={setLastName}
                                    error={errors.lastName}
                                />
                            </View>
                        </View>

                        <Input
                            label="Email Address"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon="email-outline"
                            error={errors.email}
                        />

                        <Input
                            label="Password"
                            placeholder="Create a password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            leftIcon="lock-outline"
                            error={errors.password}
                        />

                        <Input
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            leftIcon="lock-check-outline"
                            error={errors.confirmPassword}
                        />

                        <Button
                            title="Sign Up"
                            onPress={handleRegister}
                            loading={loading}
                            style={styles.button}
                        />

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.linkText}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.lg,
    },
    header: {
        marginBottom: SPACING.xl,
        marginTop: SPACING.lg,
    },
    title: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES['3xl'],
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.base,
        color: COLORS.textSecondary,
    },
    roleContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.slate100,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xs,
        marginBottom: SPACING.xl,
    },
    roleButton: {
        flex: 1,
        paddingVertical: SPACING.sm,
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.md,
    },
    roleButtonActive: {
        backgroundColor: COLORS.background,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    roleText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    roleTextActive: {
        color: COLORS.primary,
        fontFamily: FONTS.bold,
    },
    form: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        width: '48%',
    },
    button: {
        marginTop: SPACING.md,
        marginBottom: SPACING.lg,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    footerText: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.base,
        color: COLORS.textSecondary,
    },
    linkText: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.base,
        color: COLORS.primary,
    },
});

export default RegisterScreen;

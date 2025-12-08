import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../../constants';

const ForgotPasswordScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            // API call would go here
            // await authService.forgotPassword(email);

            // Simulate API call
            setTimeout(() => {
                setLoading(false);
                Alert.alert(
                    'Email Sent',
                    'If an account exists with this email, you will receive password reset instructions.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }, 1500);
        } catch (error) {
            setLoading(false);
            Alert.alert('Error', 'Failed to send reset email');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>← Back to Login</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                    Enter your email address and we'll send you instructions to reset your password.
                </Text>

                <View style={styles.form}>
                    <Input
                        label="Email Address"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        leftIcon="email-outline"
                    />

                    <Button
                        title="Send Reset Link"
                        onPress={handleResetPassword}
                        loading={loading}
                        style={styles.button}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
    },
    backButton: {
        marginBottom: SPACING.xl,
    },
    backButtonText: {
        fontFamily: FONTS.medium,
        color: COLORS.textSecondary,
        fontSize: FONT_SIZES.base,
    },
    title: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES['3xl'],
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.base,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xl,
        lineHeight: 24,
    },
    form: {
        marginTop: SPACING.md,
    },
    button: {
        marginTop: SPACING.lg,
    },
});

export default ForgotPasswordScreen;

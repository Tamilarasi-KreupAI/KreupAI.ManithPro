import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    TouchableOpacityProps,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, FONTS, FONT_SIZES, BORDER_RADIUS, SPACING } from '../../constants';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
    gradient?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    title,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    style,
    textStyle,
    gradient = true,
    disabled,
    ...props
}) => {
    const getContainerStyle = (): ViewStyle => {
        let containerStyle: ViewStyle = {};

        // Size styles
        switch (size) {
            case 'sm':
                containerStyle = {
                    paddingVertical: SPACING.xs,
                    paddingHorizontal: SPACING.md,
                    borderRadius: BORDER_RADIUS.sm,
                };
                break;
            case 'lg':
                containerStyle = {
                    paddingVertical: SPACING.md,
                    paddingHorizontal: SPACING.xl,
                    borderRadius: BORDER_RADIUS.lg,
                };
                break;
            default: // md
                containerStyle = {
                    paddingVertical: SPACING.sm + 4,
                    paddingHorizontal: SPACING.lg,
                    borderRadius: BORDER_RADIUS.md,
                };
        }

        // Variant styles (non-gradient)
        if (!gradient || variant === 'outline' || variant === 'text') {
            switch (variant) {
                case 'primary':
                    containerStyle = { ...containerStyle, backgroundColor: COLORS.primary };
                    break;
                case 'secondary':
                    containerStyle = { ...containerStyle, backgroundColor: COLORS.secondary };
                    break;
                case 'outline':
                    containerStyle = {
                        ...containerStyle,
                        backgroundColor: 'transparent',
                        borderWidth: 1.5,
                        borderColor: COLORS.primary,
                    };
                    break;
                case 'text':
                    containerStyle = { ...containerStyle, backgroundColor: 'transparent' };
                    break;
                case 'danger':
                    containerStyle = { ...containerStyle, backgroundColor: COLORS.error };
                    break;
                case 'success':
                    containerStyle = { ...containerStyle, backgroundColor: COLORS.success };
                    break;
            }
        }

        // Disabled state
        if (disabled) {
            containerStyle = { ...containerStyle, opacity: 0.5 };
        }

        return containerStyle;
    };

    const getTextStyle = (): TextStyle => {
        let tStyle: TextStyle = {
            fontFamily: FONTS.bold,
            textAlign: 'center',
        };

        // Size styles
        switch (size) {
            case 'sm':
                tStyle = { ...tStyle, fontSize: FONT_SIZES.sm };
                break;
            case 'lg':
                tStyle = { ...tStyle, fontSize: FONT_SIZES.lg };
                break;
            default: // md
                tStyle = { ...tStyle, fontSize: FONT_SIZES.base };
                break;
        }

        // Variant styles
        switch (variant) {
            case 'outline':
                tStyle = { ...tStyle, color: COLORS.primary };
                break;
            case 'text':
                tStyle = { ...tStyle, color: COLORS.primary };
                break;
            default:
                tStyle = { ...tStyle, color: COLORS.textInverse };
        }

        return tStyle;
    };

    const renderContent = () => (
        <>
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'outline' || variant === 'text' ? COLORS.primary : COLORS.textInverse}
                />
            ) : (
                <>
                    {icon && icon}
                    <Text style={[getTextStyle(), textStyle, icon ? { marginLeft: SPACING.xs } : {}]}>
                        {title}
                    </Text>
                </>
            )}
        </>
    );

    if (gradient && variant === 'primary' && !disabled) {
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                disabled={loading || disabled}
                style={[styles.container, style]}
                {...props}
            >
                <LinearGradient
                    colors={[COLORS.primaryLight, COLORS.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.gradient, getContainerStyle()]}
                >
                    {renderContent()}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            disabled={loading || disabled}
            style={[styles.container, getContainerStyle(), style]}
            {...props}
        >
            {renderContent()}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
});

export default Button;

import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from '../../constants';

interface CardProps extends TouchableOpacityProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'elevated' | 'outlined' | 'flat';
    onPress?: () => void;
}

const Card: React.FC<CardProps> = ({
    children,
    style,
    variant = 'elevated',
    onPress,
    ...props
}) => {
    const getContainerStyle = (): ViewStyle => {
        let containerStyle: ViewStyle = {
            backgroundColor: COLORS.background,
            borderRadius: BORDER_RADIUS.lg,
            padding: SPACING.md,
        };

        switch (variant) {
            case 'elevated':
                containerStyle = {
                    ...containerStyle,
                    ...SHADOWS.sm,
                };
                break;
            case 'outlined':
                containerStyle = {
                    ...containerStyle,
                    borderWidth: 1,
                    borderColor: COLORS.slate200,
                };
                break;
            case 'flat':
                containerStyle = {
                    ...containerStyle,
                    backgroundColor: COLORS.slate50,
                };
                break;
        }

        return containerStyle;
    };

    if (onPress) {
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={onPress}
                style={[getContainerStyle(), style]}
                {...props}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return <View style={[getContainerStyle(), style]}>{children}</View>;
};

export default Card;

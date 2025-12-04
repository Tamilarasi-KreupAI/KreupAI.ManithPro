import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CandidateStackParamList } from '../../types';
import { MOCK_CONVERSATIONS } from '../../data/mock';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';

type NavigationProp = NativeStackNavigationProp<CandidateStackParamList>;

const MessagesScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    const handleConversationPress = (conversationId: string) => {
        navigation.navigate('MessageDetail', { conversationId });
    };

    const renderItem = ({ item }: { item: typeof MOCK_CONVERSATIONS[0] }) => {
        const participant = item.participants[0];
        const isUnread = item.unreadCount > 0;

        return (
            <TouchableOpacity
                style={[styles.conversationItem, isUnread && styles.unreadItem]}
                onPress={() => handleConversationPress(item.id)}
            >
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {participant.firstName.charAt(0)}
                        {participant.lastName.charAt(0)}
                    </Text>
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.topRow}>
                        <Text style={[styles.name, isUnread && styles.unreadText]}>
                            {participant.firstName} {participant.lastName}
                        </Text>
                        <Text style={styles.time}>
                            {new Date(item.lastMessage?.sentAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>

                    <View style={styles.bottomRow}>
                        <Text
                            style={[styles.messagePreview, isUnread && styles.unreadText]}
                            numberOfLines={1}
                        >
                            {item.lastMessage?.content}
                        </Text>
                        {isUnread && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Messages</Text>
                <TouchableOpacity onPress={() => Alert.alert('Coming Soon', 'New Message feature will be available soon!')}>
                    <Icon name="square-edit-outline" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={MOCK_CONVERSATIONS}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Icon name="message-text-outline" size={64} color={COLORS.slate300} />
                        <Text style={styles.emptyText}>No messages yet</Text>
                        <Text style={styles.emptySubtext}>Start a conversation with a recruiter</Text>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate100,
    },
    title: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES['2xl'],
        color: COLORS.textPrimary,
    },
    listContent: {
        paddingBottom: SPACING.xl,
    },
    conversationItem: {
        flexDirection: 'row',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate100,
    },
    unreadItem: {
        backgroundColor: COLORS.slate50,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    avatarText: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.textInverse,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    name: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.base,
        color: COLORS.textPrimary,
    },
    time: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.xs,
        color: COLORS.textTertiary,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    messagePreview: {
        flex: 1,
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginRight: SPACING.sm,
    },
    unreadText: {
        fontFamily: FONTS.bold,
        color: COLORS.textPrimary,
    },
    unreadBadge: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadCount: {
        fontFamily: FONTS.bold,
        fontSize: 10,
        color: COLORS.textInverse,
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
    emptySubtext: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.base,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },
});

export default MessagesScreen;

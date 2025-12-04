import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CandidateStackParamList } from '../../types';
import { MOCK_MESSAGES, MOCK_CONVERSATIONS } from '../../data/mock';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<CandidateStackParamList, 'MessageDetail'>;

const ChatScreen: React.FC<Props> = ({ route, navigation }) => {
    const { conversationId } = route.params;
    const { user } = useAuth();
    const [messages, setMessages] = useState(MOCK_MESSAGES.filter(m => m.conversationId === conversationId));
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    const conversation = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
    const participant = conversation?.participants[0];

    useEffect(() => {
        // Scroll to bottom on load
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    }, []);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMessage = {
            id: `new_${Date.now()}`,
            conversationId,
            senderId: user?.id || 'user1', // Fallback for mock
            recipientId: participant?.id || 'recruiter1',
            content: inputText.trim(),
            type: 'TEXT' as const,
            sentAt: new Date().toISOString(),
        };

        setMessages([...messages, newMessage]);
        setInputText('');
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const renderMessage = ({ item }: { item: typeof messages[0] }) => {
        const isMe = item.senderId === (user?.id || 'user1');

        return (
            <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
                <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                    <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
                        {item.content}
                    </Text>
                    <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.theirTimestamp]}>
                        {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>

                <View style={styles.headerContent}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {participant?.firstName.charAt(0)}
                            {participant?.lastName.charAt(0)}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.headerName}>
                            {participant?.firstName} {participant?.lastName}
                        </Text>
                        <Text style={styles.headerRole}>{participant?.company}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.optionButton}>
                    <Icon name="dots-vertical" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Messages List */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.attachButton}>
                        <Icon name="paperclip" size={24} color={COLORS.slate400} />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor={COLORS.textPlaceholder}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                    />

                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                    >
                        <Icon name="send" size={20} color={COLORS.textInverse} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate100,
        backgroundColor: COLORS.background,
    },
    backButton: {
        padding: SPACING.sm,
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: SPACING.sm,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.sm,
    },
    avatarText: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.base,
        color: COLORS.textInverse,
    },
    headerName: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.base,
        color: COLORS.textPrimary,
    },
    headerRole: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.xs,
        color: COLORS.textSecondary,
    },
    optionButton: {
        padding: SPACING.sm,
    },
    listContent: {
        padding: SPACING.md,
        paddingBottom: SPACING.md,
    },
    messageContainer: {
        marginBottom: SPACING.md,
        maxWidth: '80%',
    },
    myMessage: {
        alignSelf: 'flex-end',
    },
    theirMessage: {
        alignSelf: 'flex-start',
    },
    bubble: {
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
    },
    myBubble: {
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 2,
    },
    theirBubble: {
        backgroundColor: COLORS.slate100,
        borderBottomLeftRadius: 2,
    },
    messageText: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.base,
        lineHeight: 20,
    },
    myMessageText: {
        color: COLORS.textInverse,
    },
    theirMessageText: {
        color: COLORS.textPrimary,
    },
    timestamp: {
        fontFamily: FONTS.regular,
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    myTimestamp: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    theirTimestamp: {
        color: COLORS.textTertiary,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.slate100,
        backgroundColor: COLORS.background,
    },
    attachButton: {
        padding: SPACING.sm,
    },
    input: {
        flex: 1,
        backgroundColor: COLORS.slate50,
        borderRadius: BORDER_RADIUS.xl,
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
        maxHeight: 100,
        marginHorizontal: SPACING.sm,
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.base,
        color: COLORS.textPrimary,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.slate300,
    },
});

export default ChatScreen;

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import { CandidateStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<CandidateStackParamList>;

const ProfileScreen = () => {
    const { user, logout } = useAuth();
    const navigation = useNavigation<NavigationProp>();

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <View style={{ width: 24 }} />
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Icon name="logout" size={24} color={COLORS.error} />
                </TouchableOpacity>
            </View>

            <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                </Text>
            </View>
            <Text style={styles.name}>
                {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.role}>{user?.role}</Text>
            <View style={styles.locationContainer}>
                <Icon name="map-marker-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.location}>{user?.location || 'Add location'}</Text>
            </View>

            <Button
                title="Edit Profile"
                variant="outline"
                size="sm"
                onPress={() => navigation.navigate('EditProfile')}
                style={styles.editButton}
            />
        </View>
    );

    const renderSection = (title: string, content: React.ReactNode, icon: string) => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Icon name={icon} size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            {content}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {renderHeader()}

                {renderSection(
                    'About Me',
                    <Text style={styles.bio}>
                        {user?.bio || 'No bio added yet. Tap "Edit Profile" to tell recruiters about yourself.'}
                    </Text>,
                    'account-outline'
                )}

                {renderSection(
                    'Skills',
                    <View style={styles.skillsContainer}>
                        {user?.skills && user.skills.length > 0 ? (
                            user.skills.map((skill, index) => (
                                <View key={index} style={styles.skillTag}>
                                    <Text style={styles.skillText}>{skill}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.placeholderText}>No skills added yet</Text>
                        )}
                    </View>,
                    'lightning-bolt-outline'
                )}

                {renderSection(
                    'Experience',
                    <View>
                        <Text style={styles.experienceText}>
                            {user?.experience ? `${user.experience} years of experience` : 'Add your experience'}
                        </Text>
                    </View>,
                    'briefcase-outline'
                )}

                {renderSection(
                    'Education',
                    <Text style={styles.text}>
                        {user?.education || 'Add your education'}
                    </Text>,
                    'school-outline'
                )}

                {renderSection(
                    'Links',
                    <View>
                        {user?.linkedIn && (
                            <TouchableOpacity style={styles.linkRow}>
                                <Icon name="linkedin" size={20} color="#0077b5" />
                                <Text style={styles.linkText}>LinkedIn Profile</Text>
                            </TouchableOpacity>
                        )}
                        {user?.portfolio && (
                            <TouchableOpacity style={styles.linkRow}>
                                <Icon name="web" size={20} color={COLORS.textSecondary} />
                                <Text style={styles.linkText}>Portfolio Website</Text>
                            </TouchableOpacity>
                        )}
                        {!user?.linkedIn && !user?.portfolio && (
                            <Text style={styles.placeholderText}>No links added yet</Text>
                        )}
                    </View>,
                    'link-variant'
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingBottom: SPACING.xl,
    },
    header: {
        alignItems: 'center',
        padding: SPACING.xl,
        backgroundColor: COLORS.slate50,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate200,
    },
    headerTop: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    logoutButton: {
        padding: SPACING.xs,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
        borderWidth: 4,
        borderColor: COLORS.background,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    avatarText: {
        fontFamily: FONTS.bold,
        fontSize: 36,
        color: COLORS.textInverse,
    },
    name: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES['2xl'],
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    role: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        color: COLORS.primary,
        marginBottom: SPACING.xs,
        textTransform: 'capitalize',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    location: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    editButton: {
        minWidth: 120,
    },
    section: {
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate100,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
        marginLeft: SPACING.sm,
    },
    bio: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.base,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    skillTag: {
        backgroundColor: COLORS.slate100,
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        marginRight: SPACING.sm,
        marginBottom: SPACING.sm,
    },
    skillText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    text: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.base,
        color: COLORS.textSecondary,
    },
    experienceText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.base,
        color: COLORS.textPrimary,
    },
    placeholderText: {
        fontFamily: FONTS.italic,
        fontSize: FONT_SIZES.sm,
        color: COLORS.slate400,
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    linkText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.base,
        color: COLORS.primary,
        marginLeft: SPACING.sm,
        textDecorationLine: 'underline',
    },
    logoutSection: {
        padding: SPACING.xl,
    },
});

export default ProfileScreen;

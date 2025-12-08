import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';

const EditProfileScreen = () => {
    const navigation = useNavigation();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form State
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [location, setLocation] = useState(user?.location || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
    const [education, setEducation] = useState(user?.education || '');
    const [linkedIn, setLinkedIn] = useState(user?.linkedIn || '');
    const [portfolio, setPortfolio] = useState(user?.portfolio || '');

    const handleSave = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise<void>(resolve => setTimeout(resolve, 1000));

            const updatedUser = {
                ...user!,
                firstName,
                lastName,
                phone,
                location,
                bio,
                skills: skills.split(',').map(s => s.trim()).filter(s => s),
                education,
                linkedIn,
                portfolio,
            };

            updateUser(updatedUser);
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Input
                                    label="First Name"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <Input
                                    label="Last Name"
                                    value={lastName}
                                    onChangeText={setLastName}
                                />
                            </View>
                        </View>
                        <Input
                            label="Phone Number"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            leftIcon="phone-outline"
                        />
                        <Input
                            label="Location"
                            value={location}
                            onChangeText={setLocation}
                            leftIcon="map-marker-outline"
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Professional Details</Text>
                        <Input
                            label="Bio"
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            numberOfLines={4}
                            style={{ height: 100, textAlignVertical: 'top' }}
                        />
                        <Input
                            label="Skills (comma separated)"
                            value={skills}
                            onChangeText={setSkills}
                            placeholder="React, TypeScript, Node.js"
                        />
                        <Input
                            label="Education"
                            value={education}
                            onChangeText={setEducation}
                            leftIcon="school-outline"
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Links</Text>
                        <Input
                            label="LinkedIn URL"
                            value={linkedIn}
                            onChangeText={setLinkedIn}
                            leftIcon="linkedin"
                            autoCapitalize="none"
                        />
                        <Input
                            label="Portfolio URL"
                            value={portfolio}
                            onChangeText={setPortfolio}
                            leftIcon="web"
                            autoCapitalize="none"
                        />
                    </View>

                    <Button
                        title="Save Changes"
                        onPress={handleSave}
                        loading={loading}
                        style={styles.saveButton}
                    />
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate100,
    },
    backButton: {
        padding: SPACING.xs,
    },
    headerTitle: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
    },
    content: {
        padding: SPACING.lg,
        paddingBottom: 40,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        width: '48%',
    },
    saveButton: {
        marginTop: SPACING.sm,
    },
});

export default EditProfileScreen;

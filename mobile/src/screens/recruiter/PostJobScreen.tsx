import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RecruiterStackParamList } from '../../types';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

type Props = NativeStackScreenProps<RecruiterStackParamList, 'PostJob'>;

const PostJobScreen: React.FC<Props> = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [type, setType] = useState('FULL_TIME');
    const [salary, setSalary] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const jobTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'];

    const handleSubmit = async () => {
        if (!title || !description || !location) {
            Alert.alert('Validation Error', 'Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        await new Promise(resolve => setTimeout(() => resolve(true), 1500));
        setIsLoading(false);

        Alert.alert('Success', 'Job posted successfully', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Post New Job</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Input
                    label="Job Title *"
                    placeholder="e.g., Senior React Developer"
                    value={title}
                    onChangeText={setTitle}
                />

                <Input
                    label="Description *"
                    placeholder="Describe the role and responsibilities"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                />

                <Input
                    label="Location *"
                    placeholder="Remote / City, State"
                    value={location}
                    onChangeText={setLocation}
                />

                <View style={styles.section}>
                    <Text style={styles.label}>Job Type *</Text>
                    <View style={styles.typeGrid}>
                        {jobTypes.map((jobType) => (
                            <TouchableOpacity
                                key={jobType}
                                style={[styles.typeChip, type === jobType && styles.typeChipActive]}
                                onPress={() => setType(jobType)}
                            >
                                <Text style={[styles.typeText, type === jobType && styles.typeTextActive]}>
                                    {jobType.replace('_', ' ')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Input
                    label="Salary Range"
                    placeholder="e.g., $80,000 - $120,000"
                    value={salary}
                    onChangeText={setSalary}
                />

                <View style={styles.actions}>
                    <Button
                        title="Post Job"
                        variant="primary"
                        onPress={handleSubmit}
                        loading={isLoading}
                        icon={<Icon name="check" size={20} color={COLORS.textInverse} />}
                    />
                </View>
            </ScrollView>
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
    },
    section: {
        marginBottom: SPACING.lg,
    },
    label: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.base,
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    typeChip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.slate100,
        borderWidth: 1,
        borderColor: COLORS.slate200,
    },
    typeChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    typeText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    typeTextActive: {
        color: COLORS.textInverse,
    },
    actions: {
        marginTop: SPACING.xl,
    },
});

export default PostJobScreen;

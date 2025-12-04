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
import { B2BStackParamList } from '../../types';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

type Props = NativeStackScreenProps<B2BStackParamList, 'CreateRequirement'>;

const CreateRequirementScreen: React.FC<Props> = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState('');
    const [experience, setExperience] = useState('');
    const [location, setLocation] = useState('');
    const [budget, setBudget] = useState('');
    const [skills, setSkills] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        // Basic validation
        if (!title || !description || !quantity) {
            Alert.alert('Validation Error', 'Please fill in all required fields');
            return;
        }

        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(() => resolve(true), 1500));

        setIsLoading(false);
        Alert.alert('Success', 'Requirement created successfully', [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Requirement</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Basic Information</Text>

                <Input
                    label="Title *"
                    placeholder="e.g., Senior React Developers"
                    value={title}
                    onChangeText={setTitle}
                />

                <Input
                    label="Description *"
                    placeholder="Describe the requirement in detail"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    style={styles.textArea}
                />

                <View style={styles.row}>
                    <View style={styles.halfWidth}>
                        <Input
                            label="Quantity *"
                            placeholder="5"
                            value={quantity}
                            onChangeText={setQuantity}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={styles.halfWidth}>
                        <Input
                            label="Experience"
                            placeholder="3+ years"
                            value={experience}
                            onChangeText={setExperience}
                        />
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Location & Budget</Text>

                <Input
                    label="Location"
                    placeholder="Remote / City, State"
                    value={location}
                    onChangeText={setLocation}
                />

                <Input
                    label="Budget (USD)"
                    placeholder="100000"
                    value={budget}
                    onChangeText={setBudget}
                    keyboardType="numeric"
                />

                <Text style={styles.sectionTitle}>Skills</Text>

                <Input
                    label="Required Skills"
                    placeholder="React, Node.js, TypeScript (comma separated)"
                    value={skills}
                    onChangeText={setSkills}
                    multiline
                    numberOfLines={3}
                />

                <Text style={styles.hint}>
                    Separate skills with commas. These will help match candidates.
                </Text>

                <View style={styles.actions}>
                    <Button
                        title="Create Requirement"
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
    sectionTitle: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZES.lg,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
        marginTop: SPACING.md,
    },
    row: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    halfWidth: {
        flex: 1,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    hint: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZES.sm,
        color: COLORS.textTertiary,
        marginTop: -SPACING.sm,
        marginBottom: SPACING.md,
    },
    actions: {
        marginTop: SPACING.xl,
        marginBottom: SPACING.xl,
    },
});

export default CreateRequirementScreen;

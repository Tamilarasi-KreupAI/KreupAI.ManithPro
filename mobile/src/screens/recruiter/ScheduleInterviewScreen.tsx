import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RecruiterStackParamList } from '../../types';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import Button from '../../components/common/Button';

type Props = NativeStackScreenProps<RecruiterStackParamList, 'ScheduleInterview'>;

const ScheduleInterviewScreen: React.FC<Props> = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST'>('UPCOMING');
    const [modalVisible, setModalVisible] = useState(false);
    const [newInterview, setNewInterview] = useState({
        candidate: '',
        job: '',
        date: '',
        type: 'Video Call'
    });

    const [interviews, setInterviews] = useState([
        { id: '1', candidate: 'Sarah Johnson', job: 'Senior React Developer', date: 'Today, 2:00 PM', type: 'Video Call' },
        { id: '2', candidate: 'Michael Chen', job: 'Backend Engineer', date: 'Tomorrow, 10:00 AM', type: 'In-Person' },
        { id: '3', candidate: 'Emily Davis', job: 'UI/UX Designer', date: 'Nov 26, 11:30 AM', type: 'Video Call' },
    ]);

    const handleSchedule = () => {
        if (!newInterview.candidate || !newInterview.job || !newInterview.date) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const interview = {
            id: Date.now().toString(),
            candidate: newInterview.candidate,
            job: newInterview.job,
            date: newInterview.date,
            type: newInterview.type
        };

        setInterviews([interview, ...interviews]);
        setModalVisible(false);
        setNewInterview({ candidate: '', job: '', date: '', type: 'Video Call' });
        Alert.alert('Success', 'Interview scheduled successfully!');
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Interviews</Text>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <Icon name="plus" size={24} color={COLORS.primary} />
            </TouchableOpacity>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabs}>
            <TouchableOpacity
                style={[styles.tab, activeTab === 'UPCOMING' && styles.activeTab]}
                onPress={() => setActiveTab('UPCOMING')}
            >
                <Text style={[styles.tabText, activeTab === 'UPCOMING' && styles.activeTabText]}>Upcoming</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, activeTab === 'PAST' && styles.activeTab]}
                onPress={() => setActiveTab('PAST')}
            >
                <Text style={[styles.tabText, activeTab === 'PAST' && styles.activeTabText]}>Past</Text>
            </TouchableOpacity>
        </View>
    );

    const renderInterviewItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.candidateName}>{item.candidate}</Text>
                    <Text style={styles.jobTitle}>{item.job}</Text>
                </View>
                <View style={styles.typeBadge}>
                    <Icon name={item.type === 'Video Call' ? 'video' : 'account'} size={16} color={COLORS.primary} />
                    <Text style={styles.typeText}>{item.type}</Text>
                </View>
            </View>
            <View style={styles.cardFooter}>
                <View style={styles.dateContainer}>
                    <Icon name="calendar-clock" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.dateText}>{item.date}</Text>
                </View>
                <Button
                    title="Join"
                    size="sm"
                    variant="outline"
                    onPress={() => Alert.alert('Join Meeting', 'Joining video call...')}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderTabs()}
            <FlatList
                data={interviews}
                renderItem={renderInterviewItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Schedule Interview</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="close" size={24} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Candidate Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter candidate name"
                                    value={newInterview.candidate}
                                    onChangeText={(text) => setNewInterview({ ...newInterview, candidate: text })}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Job Position</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter job title"
                                    value={newInterview.job}
                                    onChangeText={(text) => setNewInterview({ ...newInterview, job: text })}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Date & Time</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Tomorrow, 2:00 PM"
                                    value={newInterview.date}
                                    onChangeText={(text) => setNewInterview({ ...newInterview, date: text })}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Interview Type</Text>
                                <View style={styles.typeOptions}>
                                    <TouchableOpacity
                                        style={[styles.typeOption, newInterview.type === 'Video Call' && styles.activeTypeOption]}
                                        onPress={() => setNewInterview({ ...newInterview, type: 'Video Call' })}
                                    >
                                        <Icon name="video" size={20} color={newInterview.type === 'Video Call' ? COLORS.primary : COLORS.textSecondary} />
                                        <Text style={[styles.typeOptionText, newInterview.type === 'Video Call' && styles.activeTypeOptionText]}>Video Call</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.typeOption, newInterview.type === 'In-Person' && styles.activeTypeOption]}
                                        onPress={() => setNewInterview({ ...newInterview, type: 'In-Person' })}
                                    >
                                        <Icon name="account" size={20} color={newInterview.type === 'In-Person' ? COLORS.primary : COLORS.textSecondary} />
                                        <Text style={[styles.typeOptionText, newInterview.type === 'In-Person' && styles.activeTypeOptionText]}>In-Person</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Button
                                title="Schedule Interview"
                                onPress={handleSchedule}
                                style={styles.submitButton}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.slate200 },
    backButton: { padding: SPACING.xs },
    headerTitle: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.xl, color: COLORS.textPrimary },
    addButton: { padding: SPACING.xs },
    tabs: { flexDirection: 'row', padding: SPACING.md, backgroundColor: COLORS.slate50 },
    tab: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: BORDER_RADIUS.md },
    activeTab: { backgroundColor: COLORS.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    tabText: { fontFamily: FONTS.medium, color: COLORS.textSecondary },
    activeTabText: { color: COLORS.primary, fontFamily: FONTS.bold },
    listContent: { padding: SPACING.lg },
    card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.slate200 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
    candidateName: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.lg, color: COLORS.textPrimary },
    jobTitle: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
    typeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary + '10', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.sm, gap: 4 },
    typeText: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.xs, color: COLORS.primary },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.slate100 },
    dateContainer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
    dateText: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, padding: SPACING.lg, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
    modalTitle: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.xl, color: COLORS.textPrimary },
    formGroup: { marginBottom: SPACING.md },
    label: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs },
    input: { borderWidth: 1, borderColor: COLORS.slate200, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, fontFamily: FONTS.regular, fontSize: FONT_SIZES.base, color: COLORS.textPrimary },
    typeOptions: { flexDirection: 'row', gap: SPACING.md },
    typeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.slate200, borderRadius: BORDER_RADIUS.md },
    activeTypeOption: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
    typeOptionText: { fontFamily: FONTS.medium, color: COLORS.textSecondary },
    activeTypeOptionText: { color: COLORS.primary, fontFamily: FONTS.bold },
    submitButton: { marginTop: SPACING.md },
});

export default ScheduleInterviewScreen;

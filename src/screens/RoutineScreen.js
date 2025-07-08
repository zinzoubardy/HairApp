import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Button, 
  ActivityIndicator, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  TouchableOpacity, 
  Image,
  Modal,
  TextInput,
  FlatList,
  Animated,
  Dimensions
} from 'react-native';
import { 
  getLatestAIRoutine, 
  requestAIRoutine, 
  getRoutineProgress, 
  setRoutineStepChecked,
  getUserRoutines,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  getRoutineCategories,
  saveRoutineNotification,
  getRoutineWithSteps
} from '../services/SupabaseService';
import theme from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../i18n';
import NotificationService from '../services/NotificationService';

const { width } = Dimensions.get('window');

const RoutineScreen = () => {
  const { t } = useTranslation();
  const [routines, setRoutines] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [analysisFailed, setAnalysisFailed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [progress, setProgress] = useState({});
  const [progressLoading, setProgressLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [newRoutine, setNewRoutine] = useState({
    title: '',
    category: 'daily',
    description: '',
    steps: []
  });
  const [fadeAnim] = useState(new Animated.Value(0));
  const [categories, setCategories] = useState([]);

  // Sample routine categories with icons and colors (fallback)
  const defaultCategories = [
    { id: 'daily', name: t('daily_routine'), icon: 'sunny', color: '#FF6B6B', gradient: ['#FF6B6B', '#FF8E8E'] },
    { id: 'weekly', name: t('weekly_routine'), icon: 'calendar', color: '#4ECDC4', gradient: ['#4ECDC4', '#6EE7DF'] },
    { id: 'monthly', name: t('monthly_routine'), icon: 'moon', color: '#45B7D1', gradient: ['#45B7D1', '#67C9E1'] },
    { id: 'special', name: t('special_occasion'), icon: 'star', color: '#96CEB4', gradient: ['#96CEB4', '#B8E6C8'] },
    { id: 'ai', name: t('ai_personalized'), icon: 'sparkles', color: '#FFEAA7', gradient: ['#FFEAA7', '#FFF2C7'] }
  ];

  useEffect(() => {
    fetchCategories();
    fetchRoutines();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Debug: Log routines whenever they change
  useEffect(() => {
    console.log('Routines state updated:', routines);
    console.log('Routines length:', routines.length);
  }, [routines]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await getRoutineCategories();
      if (error) {
        console.error('Error fetching categories:', error);
        setCategories(defaultCategories);
      } else {
        setCategories(data || defaultCategories);
      }
    } catch (e) {
      console.error('Error fetching categories:', e);
      setCategories(defaultCategories);
    }
  };

  const fetchRoutines = async () => {
    console.log('Calling fetchRoutines');
    try {
      setLoading(true);
      setErrorMsg('');
      
      // Fetch user routines from backend
      const { data: userRoutines, error: userRoutinesError } = await getUserRoutines();
      console.log('User routines fetched:', userRoutines);
      console.log('User routines error:', userRoutinesError);
      
      if (userRoutinesError) {
        console.error('Error fetching user routines:', userRoutinesError);
        setErrorMsg(t('could_not_load_routine'));
      }

      // Fetch AI routine
      const { data: aiRoutine, error: aiError } = await getLatestAIRoutine();
      console.log('AI routine fetched:', aiRoutine);
      console.log('AI routine error:', aiError);
      
      if (aiError) {
        console.error('Error fetching AI routine:', aiError);
      }

      let allRoutines = [];

      // Add AI routine if available
      if (aiRoutine && aiRoutine.routine) {
        const aiRoutineFormatted = {
          id: 'ai-personalized',
          title: aiRoutine.routine.title || t('ai_personalized_routine'),
          category: 'ai',
          description: t('ai_routine_description'),
          steps: aiRoutine.routine.steps || [],
          icon: 'sparkles',
          color: '#FFEAA7',
          isAI: true,
          progress_percentage: 0
        };
        allRoutines.push(aiRoutineFormatted);
        console.log('Added AI routine:', aiRoutineFormatted);
      }

      // Add user routines
      if (userRoutines && userRoutines.length > 0) {
        const formattedUserRoutines = userRoutines.map(routine => ({
          id: routine.routine_id,
          title: routine.title,
          category: routine.category,
          description: routine.description,
          icon: routine.icon || 'add',
          color: routine.color || theme.colors.accent,
          steps: [], // Will be loaded when routine is selected
          total_steps: routine.total_steps || 0,
          completed_steps: routine.completed_steps || 0,
          progress_percentage: routine.progress_percentage || 0,
          isAI: false
        }));
        allRoutines = [...allRoutines, ...formattedUserRoutines];
        console.log('Added user routines:', formattedUserRoutines);
      }

      // Add sample routines if no routines exist
      if (allRoutines.length === 0) {
        const sampleRoutines = [
          {
            id: 'daily-basic',
            title: t('morning_hair_care'),
            category: 'daily',
            description: t('daily_routine_description'),
            steps: [
              { title: t('gentle_cleansing'), description: t('gentle_cleansing_desc'), duration: '5 min' },
              { title: t('conditioning'), description: t('conditioning_desc'), duration: '3 min' },
              { title: t('styling'), description: t('styling_desc'), duration: '10 min' }
            ],
            icon: 'sunny',
            color: '#FF6B6B',
            progress_percentage: 0
          },
          {
            id: 'weekly-deep',
            title: t('deep_conditioning'),
            category: 'weekly',
            description: t('weekly_routine_description'),
            steps: [
              { title: t('pre_shampoo'), description: t('pre_shampoo_desc'), duration: '15 min' },
              { title: t('deep_conditioning'), description: t('deep_conditioning_desc'), duration: '30 min' },
              { title: t('hair_mask'), description: t('hair_mask_desc'), duration: '20 min' }
            ],
            icon: 'calendar',
            color: '#4ECDC4',
            progress_percentage: 0
          }
        ];
        allRoutines = sampleRoutines;
        console.log('Added sample routines:', sampleRoutines);
      }

      console.log('Final routines array:', allRoutines);
      setRoutines(allRoutines);
      setLoading(false);
    } catch (e) {
      console.error('fetchRoutines error:', e);
      setErrorMsg(t('unexpected_error'));
      setLoading(false);
    }
  };

  const handleRoutinePress = async (routine) => {
    if (routine.steps.length === 0 && !routine.isAI) {
      try {
        const { data: routineWithSteps, error } = await getRoutineWithSteps(routine.id);
        if (!error && routineWithSteps) {
          const updatedRoutine = {
            ...routine,
            steps: routineWithSteps.steps || []
          };
          setSelectedRoutine(updatedRoutine);
          setRoutines(prev => prev.map(r => r.id === routine.id ? updatedRoutine : r));
        }
      } catch (e) {
        console.error('Error loading routine steps:', e);
      }
    } else {
      setSelectedRoutine(routine);
    }
    
    fetchProgress(routine.id);
    setShowRoutineModal(true);
  };

  const fetchProgress = async (routineId) => {
    setProgressLoading(true);
    const { data: progressData, error } = await getRoutineProgress(routineId);
    if (!error && progressData) {
      setProgress(progressData);
    } else {
      setProgress({});
    }
    setProgressLoading(false);
  };

  const handleToggleStep = async (stepIndex) => {
    if (!selectedRoutine) return;
    const newChecked = !progress[stepIndex];
    setProgress({ ...progress, [stepIndex]: newChecked });
    setProgressLoading(true);
    await setRoutineStepChecked(selectedRoutine.id, stepIndex, newChecked);
    setProgressLoading(false);
  };

  const handleCreateRoutine = async () => {
    if (newRoutine.title.trim() && newRoutine.steps.length > 0) {
      try {
        const category = categories.find(cat => cat.id === newRoutine.category);
        const routineData = {
          title: newRoutine.title,
          description: newRoutine.description,
          category: newRoutine.category,
          icon: category?.icon || 'add',
          color: category?.color || theme.colors.accent,
          steps: newRoutine.steps.map((step, index) => ({
            step_order: index,
            title: step.title,
            description: step.description,
            duration: step.duration
          }))
        };

        const { data: createdRoutine, error } = await createRoutine(routineData);
        
        if (error) {
          Alert.alert(t('error'), t('could_not_create_routine'));
          return;
        }

        // Add the new routine to the list
        const newRoutineFormatted = {
          id: createdRoutine.id,
          title: createdRoutine.title,
          category: createdRoutine.category,
          description: createdRoutine.description,
          icon: createdRoutine.icon,
          color: createdRoutine.color,
          steps: newRoutine.steps,
          total_steps: newRoutine.steps.length,
          completed_steps: 0,
          progress_percentage: 0,
          isAI: false
        };

        setRoutines(prev => [...prev, newRoutineFormatted]);
        setNewRoutine({ title: '', category: 'daily', description: '', steps: [] });
        setShowCreateModal(false);
        
        Alert.alert(t('success'), t('routine_created_successfully'));
      } catch (e) {
        console.error('Error creating routine:', e);
        Alert.alert(t('error'), t('could_not_create_routine'));
      }
    }
  };

  const handleRequestAIRoutine = async () => {
    console.log('Requesting AI routine...');
    setRequesting(true);
    setErrorMsg('');
    try {
      const { data, error } = await requestAIRoutine();
      console.log('AI routine request result:', { data, error });
      
      if (error) {
        console.error('AI routine error:', error);
        setErrorMsg(error.message || t('could_not_generate_new_routine'));
      } else {
        console.log('AI routine generated successfully, refreshing routines...');
        // Refresh routines to include the new AI routine
        await fetchRoutines();
        Alert.alert(t('success'), t('ai_routine_generated'));
      }
    } catch (e) {
      console.error('Error requesting AI routine:', e);
      setErrorMsg(t('could_not_generate_new_routine'));
    }
    setRequesting(false);
  };

  const handleAddStep = () => {
    setNewRoutine({
      ...newRoutine,
      steps: [...newRoutine.steps, { title: '', description: '', duration: '' }]
    });
  };

  const handleUpdateStep = (index, field, value) => {
    const updatedSteps = [...newRoutine.steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setNewRoutine({ ...newRoutine, steps: updatedSteps });
  };

  const handleRemoveStep = (index) => {
    const updatedSteps = newRoutine.steps.filter((_, i) => i !== index);
    setNewRoutine({ ...newRoutine, steps: updatedSteps });
  };

  const scheduleNotification = async (routine, step) => {
    try {
      const notificationId = await NotificationService.scheduleRoutineReminder(routine, step, 1);
      
      // Save notification to database
      await saveRoutineNotification({
        routine_id: routine.id,
        step_index: step.index,
        notification_id: notificationId,
        notification_type: 'step_reminder',
        scheduled_time: new Date(Date.now() + 60000).toISOString() // 1 minute from now
      });
      
      Alert.alert(t('reminder_set'), t('reminder_set_message'));
    } catch (error) {
      console.error('Error scheduling notification:', error);
      Alert.alert(t('notification_permission_required'), t('notification_permission_message'));
    }
  };

    const renderRoutineCard = ({ item }) => {
    const category = categories.find(cat => cat.id === item.category) || defaultCategories.find(cat => cat.id === item.category);
    return (
      <TouchableOpacity
        style={[styles.routineCard, { borderColor: category?.color || item.color, borderWidth: 2 }]}
        onPress={() => handleRoutinePress(item)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={category?.gradient || [item.color, item.color]}
          style={styles.routineCardGradient}
        >
          <View style={styles.routineCardHeader}>
            <Ionicons name={item.icon} size={24} color="#FFFFFF" />
            <Text style={styles.routineCardTitle}>{item.title}</Text>
          </View>
          <Text style={styles.routineCardDescription}>{item.description}</Text>
          <View style={styles.routineCardFooter}>
            <View style={styles.routineCardInfo}>
              <Text style={styles.routineCardSteps}>{item.total_steps || item.steps.length} {t('steps')}</Text>
              {item.progress_percentage > 0 && (
                <Text style={styles.routineCardProgress}>{item.progress_percentage}% {t('complete')}</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderStep = (step, index) => (
    <TouchableOpacity
      key={index}
      style={styles.stepRow}
      onPress={() => handleToggleStep(index)}
      activeOpacity={0.7}
    >
      <View style={styles.stepCheckbox}>
        <Ionicons
          name={progress[index] ? 'checkmark-circle' : 'ellipse-outline'}
          size={28}
          color={progress[index] ? theme.colors.accent : theme.colors.text}
        />
      </View>
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <TouchableOpacity
            onPress={() => scheduleNotification(selectedRoutine, { ...step, index })}
            style={styles.reminderButton}
          >
            <Ionicons name="notifications-outline" size={20} color={theme.colors.accent} />
          </TouchableOpacity>
        </View>
        <Text style={styles.stepDescription}>{step.description}</Text>
        {step.duration && (
          <View style={styles.durationBadge}>
            <Ionicons name="time-outline" size={14} color={theme.colors.accent} />
            <Text style={styles.durationText}>{step.duration}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={[theme.colors.background, theme.colors.surface]} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.centralLogoContainer}>
          <Image source={require('../../assets/splash.png')} style={styles.bigLogo} />
        </View>
        
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{t('my_routines')}</Text>
          <Text style={styles.headerSubtitle}>{t('routines_subtitle')}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.createButtonText}>{t('create_routine')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.aiButton}
            onPress={handleRequestAIRoutine}
            disabled={requesting}
          >
            <Ionicons name="sparkles" size={24} color="#FFFFFF" />
            <Text style={styles.aiButtonText}>
              {requesting ? t('generating_routine') : t('request_ai_routine')}
            </Text>
          </TouchableOpacity>
          

        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginTop: 24 }} />
        ) : errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : (
          <Animated.View style={[styles.routinesContainer, { opacity: fadeAnim }]}> 
            <FlatList
              data={routines}
              renderItem={renderRoutineCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.routinesList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>{t('no_routines_yet')}</Text>
                  <Text style={styles.emptySubtext}>{t('create_your_first_routine')}</Text>
                </View>
              }
            />
          </Animated.View>
        )}

        {/* Routine Detail Modal */}
        <Modal
          visible={showRoutineModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowRoutineModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedRoutine?.title}</Text>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>{selectedRoutine?.description}</Text>
              
              {progressLoading ? (
                <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginTop: 24 }} />
              ) : (
                <View style={styles.stepsContainer}>
                  {selectedRoutine?.steps.map((step, index) => renderStep(step, index))}
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>

        {/* Create Routine Modal */}
        <Modal
          visible={showCreateModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{t('create_routine')}</Text>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <TextInput
                style={styles.input}
                placeholder={t('routine_title')}
                value={newRoutine.title}
                onChangeText={(text) => setNewRoutine({ ...newRoutine, title: text })}
                placeholderTextColor={theme.colors.textSecondary}
              />
              
              <TextInput
                style={styles.input}
                placeholder={t('routine_description')}
                value={newRoutine.description}
                onChangeText={(text) => setNewRoutine({ ...newRoutine, description: text })}
                placeholderTextColor={theme.colors.textSecondary}
                multiline
              />

              <View style={styles.categoryContainer}>
                <Text style={styles.categoryLabel}>{t('routine_category')}</Text>
                <View style={styles.categoryButtons}>
                  {categories.slice(0, 4).map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryButton,
                        newRoutine.category === category.id && styles.categoryButtonActive
                      ]}
                      onPress={() => setNewRoutine({ ...newRoutine, category: category.id })}
                    >
                      <Ionicons 
                        name={category.icon} 
                        size={20} 
                        color={newRoutine.category === category.id ? "#FFFFFF" : category.color} 
                      />
                      <Text style={[
                        styles.categoryButtonText,
                        newRoutine.category === category.id && styles.categoryButtonTextActive
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.stepsSection}>
                <View style={styles.stepsHeader}>
                  <Text style={styles.stepsTitle}>{t('routine_steps')}</Text>
                  <TouchableOpacity onPress={handleAddStep} style={styles.addStepButton}>
                    <Ionicons name="add" size={20} color={theme.colors.accent} />
                    <Text style={styles.addStepText}>{t('add_step')}</Text>
                  </TouchableOpacity>
                </View>

                {newRoutine.steps.map((step, index) => (
                  <View key={index} style={styles.stepInputContainer}>
                    <View style={styles.stepInputHeader}>
                      <Text style={styles.stepNumber}>Step {index + 1}</Text>
                      <TouchableOpacity onPress={() => handleRemoveStep(index)}>
                        <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={styles.stepInput}
                      placeholder={t('step_title')}
                      value={step.title}
                      onChangeText={(text) => handleUpdateStep(index, 'title', text)}
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                    <TextInput
                      style={styles.stepInput}
                      placeholder={t('step_description')}
                      value={step.description}
                      onChangeText={(text) => handleUpdateStep(index, 'description', text)}
                      placeholderTextColor={theme.colors.textSecondary}
                      multiline
                    />
                    <TextInput
                      style={styles.stepInput}
                      placeholder={t('step_duration')}
                      value={step.duration}
                      onChangeText={(text) => handleUpdateStep(index, 'duration', text)}
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleCreateRoutine}
              >
                <Text style={styles.saveButtonText}>{t('save_routine')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'transparent',
  },
  centralLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 0,
  },
  bigLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 0,
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: theme.fonts.heading,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: theme.fonts.body,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  createButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: theme.fonts.body,
    marginLeft: 8,
  },
  aiButton: {
    backgroundColor: '#FFEAA7',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#FFEAA7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  aiButtonText: {
    color: '#333333',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: theme.fonts.body,
    marginLeft: 8,
  },
  routinesContainer: {
    flex: 1,
  },
  routinesList: {
    paddingBottom: 24,
  },
  routineCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  routineCardGradient: {
    padding: 20,
  },
  routineCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routineCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
    fontFamily: theme.fonts.heading,
  },
  routineCardDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 16,
    fontFamily: theme.fonts.body,
  },
  routineCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routineCardInfo: {
    flex: 1,
  },
  routineCardSteps: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    fontFamily: theme.fonts.body,
  },
  routineCardProgress: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    fontFamily: theme.fonts.body,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: 16,
    fontFamily: theme.fonts.heading,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 24,
    fontFamily: theme.fonts.body,
  },
  stepsContainer: {
    marginTop: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  stepCheckbox: {
    marginRight: 16,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    flex: 1,
    fontFamily: theme.fonts.heading,
  },
  reminderButton: {
    padding: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    fontFamily: theme.fonts.body,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  durationText: {
    fontSize: 12,
    color: theme.colors.accent,
    marginLeft: 4,
    fontFamily: theme.fonts.body,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 16,
    fontFamily: theme.fonts.body,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
    fontFamily: theme.fonts.heading,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.surface,
    backgroundColor: theme.colors.surface,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  categoryButtonText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 8,
    fontFamily: theme.fonts.body,
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  stepsSection: {
    marginBottom: 24,
  },
  stepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: theme.fonts.heading,
  },
  addStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addStepText: {
    fontSize: 14,
    color: theme.colors.accent,
    marginLeft: 4,
    fontFamily: theme.fonts.body,
  },
  stepInputContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  stepInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.accent,
    fontFamily: theme.fonts.body,
  },
  stepInput: {
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 8,
    fontFamily: theme.fonts.body,
  },
  saveButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.fonts.body,
  },
  errorBox: {
    backgroundColor: theme.colors.error,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: theme.fonts.body,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
    fontFamily: theme.fonts.heading,
  },
  emptySubtext: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: theme.fonts.body,
  },
});

export default RoutineScreen;

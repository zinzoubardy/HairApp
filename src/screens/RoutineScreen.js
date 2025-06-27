import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { getLatestAIRoutine, requestAIRoutine, getRoutineProgress, setRoutineStepChecked } from '../services/SupabaseService';
import theme from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const RoutineScreen = () => {
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [analysisFailed, setAnalysisFailed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [progress, setProgress] = useState({});
  const [progressLoading, setProgressLoading] = useState(false);

  const fetchRoutine = async () => {
    console.log('Calling fetchRoutine');
    try {
      setLoading(true);
      setErrorMsg('');
      const { data, error } = await getLatestAIRoutine();
      if (error) {
        setErrorMsg('Could not load your personalized routine.');
        setRoutine(null);
      } else {
        setRoutine(data);
        // Detect failed analysis in the linked analysis (if available)
        let failed = false;
        if (data && data.analysis_id && data.routine) {
          // Check for failure indicators in the analysis summary or steps
          const routineText = JSON.stringify(data.routine).toLowerCase();
          const failureIndicators = [
            'unable to analyze',
            'technical issues',
            'cannot provide',
            'no data',
            'general advice',
            'not tailored',
            'without the ability to analyze',
            'lack of analytical data',
            'no specific observations',
            'no analysis',
            'not analyzed',
            'not available',
            'not enough information',
            'not enough data',
            'no images',
            'images were not analyzed',
            'analysis failed',
          ];
          failed = failureIndicators.some(indicator => routineText.includes(indicator));
        }
        setAnalysisFailed(failed);
      }
      setLoading(false);
    } catch (e) {
      console.error('fetchRoutine error:', e);
      setErrorMsg('An unexpected error occurred while loading your routine.');
      setRoutine(null);
      setLoading(false);
    }
  };

  const fetchProgress = async (routineId) => {
    setProgressLoading(true);
    const prog = await getRoutineProgress(routineId);
    setProgress(prog);
    setProgressLoading(false);
  };

  useEffect(() => {
    fetchRoutine();
    if (routine && routine.id) {
      fetchProgress(routine.id);
    }
  }, [routine && routine.id]);

  const handleRequestRoutine = async () => {
    setRequesting(true);
    setErrorMsg('');
    const { error } = await requestAIRoutine();
    if (error) {
      setErrorMsg(error.message || 'Could not generate a new routine.');
    }
    await fetchRoutine(); // Always reload from Supabase
    setRequesting(false);
  };

  const handleToggleStep = async (stepIndex) => {
    if (!routine || !routine.id) return;
    const newChecked = !progress[stepIndex];
    setProgress({ ...progress, [stepIndex]: newChecked });
    setProgressLoading(true);
    await setRoutineStepChecked(routine.id, stepIndex, newChecked);
    setProgressLoading(false);
  };

  return (
    <LinearGradient colors={[theme.colors.background, theme.colors.surface]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.centralLogoContainer}>
          <Image source={require('../../assets/splash.png')} style={styles.bigLogo} />
        </View>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Personalized Routine</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.requestButton}
            onPress={handleRequestRoutine}
            disabled={requesting}
          >
            <Text style={styles.requestButtonText}>{requesting ? 'Requesting...' : 'Request Personalized Routine'}</Text>
          </TouchableOpacity>
        </View>
        {loading || progressLoading ? (
          <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginTop: 24 }} />
        ) : errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : analysisFailed ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Could not generate a routine. Please try again after a successful analysis.</Text>
          </View>
        ) : (() => {
          // --- DEBUG LOG ---
          console.log('Routine object:', routine);
          // Support both routine.steps and routine.routine.steps
          const steps = routine?.routine?.steps || routine?.steps;
          const title = routine?.routine?.title || routine?.title;
          if (steps && steps.length > 0) {
            return (
              <View style={styles.routineBox}>
                <Text style={styles.routineTitle}>{title || 'Routine'}</Text>
                {steps.map((step, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.routineStepRow}
                    onPress={() => handleToggleStep(idx)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={progress[idx] ? 'checkbox' : 'square-outline'}
                      size={24}
                      color={progress[idx] ? theme.colors.accent : theme.colors.text}
                      style={{ marginRight: 12 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.routineStepTitle, { color: (routine?.colorAnalysis?.colorHex || theme.colors.accent) }]}>{step.title}</Text>
                      <Text style={styles.routineStepDesc}>{step.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          } else {
            return (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>No routine available. Please request a personalized routine.</Text>
              </View>
            );
          }
        })()}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 180,
    height: 180,
    borderRadius: 90,
    alignSelf: 'center',
    marginBottom: 0,
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: theme.fonts.heading,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  requestButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  requestButtonText: {
    color: theme.colors.onAccent,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: theme.fonts.body,
  },
  routineBox: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 20,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  routineTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: theme.fonts.heading,
  },
  routineStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
  routineStepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.accent,
    fontFamily: theme.fonts.body,
  },
  routineStepDesc: {
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: theme.fonts.body,
    marginTop: 2,
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
  infoBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: theme.fonts.body,
  },
});

export default RoutineScreen;

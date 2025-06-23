import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import styled, { ThemeProvider } from 'styled-components/native'; // Keep ThemeProvider
import { useNavigation, useRoute } from '@react-navigation/native';
import { createRoutine, updateRoutine } from '../services/SupabaseService.js';
import theme from '../styles/theme.js';

// All styled.* definitions are commented out for debugging CssSyntaxError

// Step 1.1: Restore FormContainer
const FormContainer = styled(ScrollView)`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
  /* padding: ${props => props.theme.spacing.md}px; // Removed, using contentContainerStyle on instance */
`;

const HeaderText = styled.Text`
  font-size: ${props => props.theme.typography.h1.fontSize}px;
  font-weight: ${props => props.theme.typography.h1.fontWeight};
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: ${props => props.theme.spacing.lg}px;
  text-align: center;
`;

const InputLabel = styled.Text`
  font-size: ${props => props.theme.typography.label.fontSize}px;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xs}px;
  margin-top: ${props => props.theme.spacing.md}px;
`;

const StyledInput = styled.TextInput.attrs(props => ({
  placeholderTextColor: props.theme.colors.textSecondary,
}))`
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.textPrimary};
  padding: ${props => props.theme.spacing.md}px;
  border-radius: ${props => props.theme.borderRadius.sm}px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border};
  font-size: ${props => props.theme.typography.body.fontSize}px;
`;

const StyledMultilineInput = styled(StyledInput)`
  min-height: 100px;
  text-align-vertical: 'top'; /* For Android */
`;

const StepsHeaderText = styled(InputLabel)`
  font-size: ${props => props.theme.typography.h2.fontSize}px;
  color: ${props => props.theme.colors.textPrimary};
  margin-top: ${props => props.theme.spacing.lg}px;
  margin-bottom: ${props => props.theme.spacing.sm}px;
`;

const StepContainer = styled.View`
  background-color: ${props => props.theme.colors.surfaceVariant};
  padding: ${props => props.theme.spacing.md}px;
  border-radius: ${props => props.theme.borderRadius.md}px;
  margin-bottom: ${props => props.theme.spacing.md}px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border};
`;

const StepInput = styled(StyledInput).attrs(props => ({
  placeholderTextColor: props.theme.colors.textSecondary,
}))`
  /* Add any specific styles for StepInput if different from StyledInput */
  /* For now, it inherits all styles from StyledInput */
  margin-bottom: ${props => props.theme.spacing.sm}px; /* Example: add some margin between step inputs */
`;

const StepTextArea = styled(StyledMultilineInput).attrs(props => ({
  placeholderTextColor: props.theme.colors.textSecondary,
}))`
  /* Add any specific styles for StepTextArea if different from StyledMultilineInput */
  /* For now, it inherits all styles from StyledMultilineInput */
  margin-bottom: ${props => props.theme.spacing.sm}px; /* Example: add some margin */
`;

const ButtonText = styled.Text`
  color: #ffffff; /* Assuming default white text for buttons */
  font-size: ${props => props.theme.typography.button.fontSize}px;
  font-weight: ${props => props.theme.typography.button.fontWeight};
`;

const AddStepButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.primary};
  padding: ${props => props.theme.spacing.md}px;
  border-radius: ${props => props.theme.borderRadius.sm}px;
  align-items: center;
  margin-top: ${props => props.theme.spacing.sm}px;
  margin-bottom: ${props => props.theme.spacing.lg}px;
`;

const RemoveStepButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.error};
  padding: ${props => props.theme.spacing.xs}px ${props => props.theme.spacing.sm}px; /* Adjusted padding */
  border-radius: ${props => props.theme.borderRadius.sm}px; /* Changed from xs to sm */
  align-items: center;
  align-self: flex-end;
  margin-top: ${props => props.theme.spacing.sm}px;
`;

const SaveButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.accent};
  padding: ${props => props.theme.spacing.lg}px;
  border-radius: ${props => props.theme.borderRadius.md}px;
  align-items: center;
  margin-top: ${props => props.theme.spacing.xl}px;
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const RoutineForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const existingRoutine = route.params?.routine;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [routineType, setRoutineType] = useState('');
  const [steps, setSteps] = useState([{ action: '', products_used: '', notes: '' }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingRoutine) {
      setTitle(existingRoutine.title || '');
      setDescription(existingRoutine.description || '');
      setRoutineType(existingRoutine.routine_type || '');
      setSteps(existingRoutine.steps && existingRoutine.steps.length > 0 ? existingRoutine.steps.map(s => ({...s, products_used: Array.isArray(s.products_used) ? s.products_used.join(', ') : (s.products_used || '') })) : [{ action: '', products_used: '', notes: '' }]);
    }
  }, [existingRoutine]);

  const handleStepChange = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([...steps, { action: '', products_used: '', notes: '' }]);
  };

  const removeStep = (index) => {
    if (steps.length === 1) {
      Alert.alert("Cannot Remove", "At least one step is required.");
      return;
    }
    const newSteps = steps.filter((_, i) => i !== index);
    setSteps(newSteps);
  };

  const handleSaveRoutine = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Please enter a title for the routine.");
      return;
    }
    const validSteps = steps.filter(step => step.action && step.action.trim() !== '');
    if (validSteps.length === 0) {
        Alert.alert("Validation Error", "Please add at least one valid step with an action.");
        return;
    }

    setLoading(true);
    const routineData = {
      title,
      description,
      routine_type: routineType,
      steps: validSteps.map((step, index) => ({
        step_number: index + 1,
        action: step.action,
        products_used: step.products_used.split(',').map(p => p.trim()).filter(p => p),
        notes: step.notes,
      })),
    };

    let response;
    if (existingRoutine) {
      response = await updateRoutine(existingRoutine.id, routineData);
      setLoading(false);
      if (response.error) {
        Alert.alert("Error", `Could not update routine: ${response.error.message}`);
      } else {
        Alert.alert("Success", "Routine updated successfully!");
        navigation.goBack();
      }
    } else {
      response = await createRoutine(routineData);
      setLoading(false);
      if (response.error) {
        Alert.alert("Error", `Could not create routine: ${response.error.message}`);
      } else {
        Alert.alert("Success", "Routine created successfully!");
        navigation.goBack();
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <FormContainer contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: theme.spacing.xl }}>
        <HeaderText>{existingRoutine ? 'Edit Routine' : 'Create New Routine'}</HeaderText>

        <InputLabel>Title*</InputLabel>
        <StyledInput
          placeholder="e.g., My Wash Day Routine"
          value={title}
          onChangeText={setTitle}
        />

        <InputLabel>Description</InputLabel>
        <StyledMultilineInput
          placeholder="A brief description of this routine"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <InputLabel>Routine Type</InputLabel>
        <StyledInput
          placeholder="e.g., Wash Day, Daily, Treatment"
          value={routineType}
          onChangeText={setRoutineType}
        />

        <StepsHeaderText>Steps</StepsHeaderText>
        {steps.map((step, index) => (
          <StepContainer key={index}>
            <InputLabel>{`Step ${index + 1}`}</InputLabel>
            <StepInput
              placeholder="Action (e.g., Cleanse, Condition)"
              value={step.action}
              onChangeText={(text) => handleStepChange(index, 'action', text)}
            />
            <StepInput
              placeholder="Products Used (comma-separated)"
              value={step.products_used} // products_used is now a string in local state
              onChangeText={(text) => handleStepChange(index, 'products_used', text)}
            />
            <StepTextArea
              placeholder="Notes (optional)"
              value={step.notes}
              onChangeText={(text) => handleStepChange(index, 'notes', text)}
              multiline
            />
            {steps.length > 1 && (
              <RemoveStepButton onPress={() => removeStep(index)}>
                <ButtonText>Remove Step</ButtonText>
              </RemoveStepButton>
            )}
          </StepContainer>
        ))}
        <AddStepButton onPress={addStep}>
          <ButtonText>+ Add Another Step</ButtonText>
        </AddStepButton>

        <SaveButton onPress={handleSaveRoutine} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <ButtonText>Save Routine</ButtonText>}
        </SaveButton>
      </FormContainer>
    </ThemeProvider>
  );
};

export default RoutineForm;

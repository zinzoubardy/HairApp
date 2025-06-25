import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import styled, { ThemeProvider } from 'styled-components/native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getRoutines, deleteRoutine } from '../services/SupabaseService';
import theme from '../styles/theme';

// Styled Components
const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
  padding: ${props => props.theme.spacing.md}px;
`;

const HeaderText = styled.Text`
  font-size: ${props => props.theme.typography.h1.fontSize}px;
  font-weight: ${props => props.theme.typography.h1.fontWeight};
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: ${props => props.theme.spacing.lg}px;
  text-align: center;
`;

const RoutineItemContainer = styled.View`
  background-color: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.md}px;
  border-radius: ${props => props.theme.borderRadius.md}px;
  margin-bottom: ${props => props.theme.spacing.md}px;
  border-width: 1px;
  border-color: ${props => props.theme.colors.border};
`;

const RoutineTitle = styled.Text`
  font-size: ${props => props.theme.typography.h2.fontSize}px;
  font-weight: ${props => props.theme.typography.h2.fontWeight};
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.sm}px;
`;

const RoutineDescription = styled.Text`
  font-size: ${props => props.theme.typography.body.fontSize}px;
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: ${props => props.theme.spacing.sm}px;
`;

const RoutineType = styled.Text`
  font-size: ${props => props.theme.typography.caption.fontSize}px;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.md}px;
  font-style: italic;
`;

const ButtonGroup = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.sm}px;
`;

const ActionButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.primary};
  padding: ${props => props.theme.spacing.sm}px ${props => props.theme.spacing.md}px;
  border-radius: ${props => props.theme.borderRadius.sm}px;
  margin-left: ${props => props.theme.spacing.sm}px;
`;

const DeleteButtonStyled = styled(ActionButton)`
  background-color: ${props => props.theme.colors.error};
`;

const ActionButtonText = styled.Text`
  color: #ffffff;
  font-size: ${props => props.theme.typography.button.fontSize}px;
  font-weight: ${props => props.theme.typography.button.fontWeight};
`;

const CreateButtonContainer = styled.View`
  margin-top: ${props => props.theme.spacing.md}px;
  margin-bottom: ${props => props.theme.spacing.md}px;
`;

const CreateButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.accent};
  padding: ${props => props.theme.spacing.lg}px;
  border-radius: ${props => props.theme.borderRadius.md}px;
  align-items: center;
`;

const CreateButtonText = styled.Text`
  color: #ffffff;
  font-size: ${props => props.theme.typography.h2.fontSize}px;
  font-weight: ${props => props.theme.typography.h2.fontWeight};
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.theme.colors.background};
`;

const EmptyText = styled.Text`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.body.fontSize}px;
  text-align: center;
  margin-top: ${props => props.theme.spacing.xl}px;
`;

const RoutineScreen = () => {
  const navigation = useNavigation();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRoutines = async () => {
    setLoading(true);
    const { data, error } = await getRoutines();
    if (error) {
      Alert.alert('Error', 'Could not load routines.');
    } else {
      setRoutines(data || []);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchRoutines();
    }, [])
  );

  const handleDelete = async (id) => {
    Alert.alert('Delete Routine', 'Are you sure you want to delete this routine?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await deleteRoutine(id);
          if (error) {
            Alert.alert('Error', 'Could not delete routine.');
          } else {
            fetchRoutines();
          }
        },
      },
    ]);
  };

  const handleEdit = (routine) => {
    navigation.navigate('RoutineForm', { routine });
  };

  const handleCreate = () => {
    navigation.navigate('RoutineForm');
  };

  const renderItem = ({ item }) => (
    <RoutineItemContainer>
      <RoutineTitle>{item.title}</RoutineTitle>
      <RoutineDescription>{item.description}</RoutineDescription>
      <RoutineType>{item.routine_type}</RoutineType>
      <ButtonGroup>
        <ActionButton onPress={() => handleEdit(item)}>
          <ActionButtonText>Edit</ActionButtonText>
        </ActionButton>
        <DeleteButtonStyled onPress={() => handleDelete(item.id)}>
          <ActionButtonText>Delete</ActionButtonText>
        </DeleteButtonStyled>
      </ButtonGroup>
    </RoutineItemContainer>
  );

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </LoadingContainer>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <HeaderText>My Routines</HeaderText>
        <CreateButtonContainer>
          <CreateButton onPress={handleCreate}>
            <CreateButtonText>+ Create New Routine</CreateButtonText>
          </CreateButton>
        </CreateButtonContainer>
        {routines.length === 0 ? (
          <EmptyText>No routines found. Create your first routine!</EmptyText>
        ) : (
          <FlatList
            data={routines}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            renderItem={renderItem}
            refreshing={refreshing}
            onRefresh={fetchRoutines}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        )}
      </Container>
    </ThemeProvider>
  );
};

export default RoutineScreen;

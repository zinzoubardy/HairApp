import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView, Image } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getRoutines, deleteRoutine } from '../services/SupabaseService';
import theme from '../styles/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

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
    <View style={styles.routineItem}>
      <Text style={styles.routineTitle}>{item.title}</Text>
      <Text style={styles.routineDescription}>{item.description}</Text>
      <Text style={styles.routineType}>{item.routine_type}</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)}>
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/splash.png')} style={styles.splashImage} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Routines</Text>
        </View>
        <View style={styles.content}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Text style={styles.createButtonText}>+ Create New Routine</Text>
          </TouchableOpacity>
          {routines.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No routines found. Create your first routine!</Text>
            </View>
          ) : (
            <FlatList
              data={routines}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              renderItem={renderItem}
              refreshing={refreshing}
              onRefresh={fetchRoutines}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    ...theme.shadows.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.accentGlow,
  },
  headerTitle: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  createButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  createButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    fontFamily: theme.fonts.title,
  },
  routineItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    marginBottom: 16,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  routineTitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.primary,
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  routineDescription: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    marginBottom: 8,
    lineHeight: 20,
  },
  routineType: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
    ...theme.shadows.soft,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
    ...theme.shadows.soft,
    borderWidth: 1,
    borderColor: theme.colors.accentGlow,
  },
  actionButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.sm,
    fontWeight: 'bold',
    fontFamily: theme.fonts.body,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.body,
    fontFamily: theme.fonts.body,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 32,
  },
  logoContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  splashImage: {
    width: 100,
    height: 100,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default RoutineScreen;

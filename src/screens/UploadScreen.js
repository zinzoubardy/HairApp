import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Alert, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import theme from "../styles/theme";

const UploadScreen = ({ navigation }) => {
  const [imageUri, setImageUri] = useState(null);
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);

  useEffect(() => {
    const requestPermissions = async () => {
      const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setMediaLibraryPermission(libraryStatus.status === "granted");

      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      setCameraPermission(cameraStatus.status === "granted");
    };
    requestPermissions();
  }, []);

  const pickImageFromGallery = async () => {
    if (mediaLibraryPermission === false) { // Check explicitly for false after initial check
      Alert.alert("Permission Required", "Media library access was denied. Please grant permission in your device settings to select photos.");
      return;
    }
    if (mediaLibraryPermission === null) { // Still waiting or not determined
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission Required", "Media library access is required. Please grant permission to select photos.");
            setMediaLibraryPermission(false);
            return;
        }
        setMediaLibraryPermission(true);
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image from gallery: ", error);
      Alert.alert("Error", "Could not pick image from gallery.");
    }
  };

  const takePhotoWithCamera = async () => {
    if (cameraPermission === false) {
      Alert.alert("Permission Required", "Camera access was denied. Please grant permission in your device settings to take photos.");
      return;
    }
     if (cameraPermission === null) { // Still waiting or not determined
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert("Permission Required", "Camera access is required. Please grant permission to take photos.");
            setCameraPermission(false);
            return;
        }
        setCameraPermission(true);
    }

    try {
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo with camera: ", error);
      Alert.alert("Error", "Could not take photo with camera.");
    }
  };

  const clearImage = () => {
    setImageUri(null);
  };

  const proceedToAnalysis = () => {
    if (imageUri) {
      // Navigate to AnalysisResultScreen, passing the image URI
      navigation.navigate("AnalysisResult", { imageUri: imageUri });
    } else {
      Alert.alert("No Image", "Please select or take an image first.");
    }
  };

  if (mediaLibraryPermission === null || cameraPermission === null) {
    // Show a loading state while waiting for permission status
    return (
      <View style={{...styles.container, backgroundColor: theme.colors.background}}>
        <Text style={{...styles.infoText, fontFamily: theme.fonts.body}}>Requesting permissions...</Text>
      </View>
    );
  }


  return (
    <ScrollView style={{backgroundColor: theme.colors.background}} contentContainerStyle={styles.container}>
      <Text style={{ ...styles.title, color: theme.colors.textPrimary, fontFamily: theme.fonts.title }}>
        Upload Your Hair Photo
      </Text>

      {/* Permission denied warnings */}
      {!mediaLibraryPermission && !cameraPermission && Platform.OS !== 'web' && (
        <View style={styles.permissionWarningContainer}>
          <Text style={{...styles.permissionText, fontFamily: theme.fonts.body}}>
            Camera and Media Library permissions are required to use this feature.
            Please enable them in your device settings.
          </Text>
        </View>
      )}
      {mediaLibraryPermission === false && Platform.OS !== 'web' && (
         <View style={styles.permissionWarningContainer}>
            <Text style={{...styles.permissionText, fontFamily: theme.fonts.body}}>Media Library permission denied. Enable in settings.</Text>
        </View>
      )}
       {cameraPermission === false && Platform.OS !== 'web' && (
         <View style={styles.permissionWarningContainer}>
            <Text style={{...styles.permissionText, fontFamily: theme.fonts.body}}>Camera permission denied. Enable in settings.</Text>
        </View>
      )}


      {!imageUri ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={{...styles.button, backgroundColor: mediaLibraryPermission ? theme.colors.primary : theme.colors.border }}
            onPress={pickImageFromGallery}
            disabled={!mediaLibraryPermission} // Disable if permission not granted
          >
            <Text style={{...styles.buttonText, fontFamily: theme.fonts.body}}>Select from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{...styles.button, backgroundColor: cameraPermission ? theme.colors.primary : theme.colors.border}}
            onPress={takePhotoWithCamera}
            disabled={!cameraPermission} // Disable if permission not granted
          >
            <Text style={{...styles.buttonText, fontFamily: theme.fonts.body}}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <TouchableOpacity
            style={{...styles.button, backgroundColor: theme.colors.secondary, marginTop: theme.spacing.md}}
            onPress={proceedToAnalysis}
          >
            <Text style={{...styles.buttonText, fontFamily: theme.fonts.body}}>Proceed to Analysis</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{...styles.button, backgroundColor: theme.colors.error, marginTop: theme.spacing.sm}}
            onPress={clearImage}
          >
            <Text style={{...styles.buttonText, fontFamily: theme.fonts.body}}>Clear Image</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.title,
    marginBottom: theme.spacing.lg,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    paddingVertical: theme.spacing.sm + 2, // slightly taller buttons
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.sm,
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  buttonText: {
    color: theme.colors.card,
    fontSize: theme.fontSizes.md,
    fontWeight: "bold",
  },
  previewContainer: {
    alignItems: "center",
    marginVertical: theme.spacing.md,
    width: "100%",
  },
  previewImage: {
    width: 300,
    height: 300 * (3/4), // Maintain 4:3 aspect ratio
    resizeMode: "contain",
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginVertical: theme.spacing.md,
  },
  permissionWarningContainer: {
    backgroundColor: theme.colors.error + '33', // Light error color
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.sm,
    width: '90%',
  },
  permissionText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.sm,
    textAlign: 'center',
  }
});

export default UploadScreen;

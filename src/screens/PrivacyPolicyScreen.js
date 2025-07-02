import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={{flex:1,backgroundColor:'#fff'}}>
      <ScrollView contentContainerStyle={{padding:24}}>
        <Text style={{fontWeight:'bold',fontSize:22,marginBottom:16}}>Privacy Policy, Terms of Use & Upload Rules</Text>
        <Text style={{fontWeight:'bold',fontSize:18,marginBottom:8}}>Privacy Policy</Text>
        <Text style={{fontSize:15,marginBottom:16}}>
          This is a placeholder for your full privacy policy. Please provide your actual policy text to replace this section.\n\n
          We respect your privacy. Your data is stored securely and only used for app functionality. You may request deletion of your data at any time.\n\n
          No personal identifiers or faces are required in uploaded images.
        </Text>
        <Text style={{fontWeight:'bold',fontSize:18,marginBottom:8}}>Terms of Use</Text>
        <Text style={{fontSize:15,marginBottom:16}}>
          This is a placeholder for your full terms of use. Please provide your actual terms to replace this section.\n\n
          By using Root & Glow, you agree to use the app responsibly and not upload content you do not have the right to share.\n\n
          You may request deletion of your account and data at any time.
        </Text>
        <Text style={{fontWeight:'bold',fontSize:18,marginBottom:8}}>Upload Rules</Text>
        <Text style={{fontSize:15,marginBottom:16}}>
          • Only upload photos of your hair.\n
          • Do not include faces or personal identifiers in uploaded images.\n
          • Do not upload content you do not have the right to share.\n
          • By uploading, you confirm you have read and accept these rules.
        </Text>
        <TouchableOpacity style={{backgroundColor:'#6D8B74',padding:12,borderRadius:8,alignSelf:'center',marginTop:24}} onPress={() => navigation.goBack()}>
          <Text style={{color:'#fff',fontWeight:'bold',textAlign:'center'}}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default PrivacyPolicyScreen; 
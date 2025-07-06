import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTranslation } from '../i18n';
import theme from '../styles/theme';

const Footer = () => {
  const { t } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  return (
    <View style={styles.footerContainer}>
      <TouchableOpacity onPress={() => setShowDisclaimer(true)}>
        <Text style={styles.disclaimerLink}>{t('disclaimer_title')}</Text>
      </TouchableOpacity>
      <Modal visible={showDisclaimer} transparent animationType="slide" onRequestClose={() => setShowDisclaimer(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('disclaimer_title')}</Text>
            <Text style={styles.modalText}>{t('disclaimer_text')}</Text>
            <TouchableOpacity style={styles.acceptButton} onPress={() => setShowDisclaimer(false)}>
              <Text style={styles.acceptButtonText}>{t('accept_and_continue')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 16,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  disclaimerLink: {
    color: theme.colors.accentGlow,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    maxWidth: 340,
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    marginBottom: 16,
    textAlign: 'center',
  },
  acceptButton: {
    backgroundColor: '#6D8B74',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Footer; 
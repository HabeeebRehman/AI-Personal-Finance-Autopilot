import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { importExpenses } from '../services/expenseService';

const ImportCSVScreen = () => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert('Error', 'Failed to pick document.');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('No file', 'Please select a CSV file first.');
      return;
    }

    setLoading(true);
    try {
      const response = await importExpenses(selectedFile.uri, selectedFile.name);
      if (response.success) {
        Alert.alert('Success', `Successfully imported ${response.data?.inserted} expenses.`);
        setSelectedFile(null);
      } else {
        Alert.alert('Error', response.message || 'Failed to import expenses.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred during upload.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Import CSV</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Upload Expenses</Text>
          <Text style={styles.cardDescription}>
            Select a CSV file with the following columns: amount, category, description, date.
          </Text>

          <TouchableOpacity
            style={styles.pickerButton}
            onPress={handlePickDocument}
          >
            <Text style={styles.pickerButtonText}>
              {selectedFile ? selectedFile.name : 'Select CSV File'}
            </Text>
          </TouchableOpacity>

          {selectedFile && (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUpload}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.uploadButtonText}>Import Now</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>CSV Format Guide</Text>
          <Text style={styles.guideText}>• amount: Number (required)</Text>
          <Text style={styles.guideText}>• category: Text (optional, defaults to "Other")</Text>
          <Text style={styles.guideText}>• description: Text (optional)</Text>
          <Text style={styles.guideText}>• date: YYYY-MM-DD (optional, defaults to today)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollContent: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  guideCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 15,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1976d2',
  },
  guideText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
  },
});

export default ImportCSVScreen;

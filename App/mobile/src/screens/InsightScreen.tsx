import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { fetchWeeklyInsights, InsightData } from '../services/insightService';

const InsightScreen = () => {
  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = useCallback(async () => {
    try {
      setError(null);
      const response = await fetchWeeklyInsights();
      if (response.success && response.data) {
        setInsightData(response.data);
      } else {
        setError(response.message || 'Failed to load insights');
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching insights');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const onRefresh = () => {
    setRefreshing(true);
    loadInsights();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Generating AI Insights...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.headerTitle}>AI Financial Insights</Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadInsights}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : insightData ? (
          <View style={styles.contentContainer}>
            {/* Key Insights Section */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Key Insights</Text>
              {insightData.insights.map((insight, index) => (
                <View key={index} style={styles.insightCard}>
                  <Text style={styles.insightBullet}>•</Text>
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              ))}
            </View>

            {/* Warning Section */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Warning</Text>
              <View style={[styles.card, styles.warningCard]}>
                <Text style={styles.warningText}>{insightData.warning}</Text>
              </View>
            </View>

            {/* Recommendation Section */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Recommendation</Text>
              <View style={[styles.card, styles.recommendationCard]}>
                <Text style={styles.recommendationTitle}>Advisor's Suggestion</Text>
                <Text style={styles.recommendationText}>{insightData.recommendation}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.centerContainer}>
            <Text>No insights available.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  contentContainer: {
    gap: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  insightBullet: {
    fontSize: 18,
    color: '#007AFF',
    marginRight: 10,
    fontWeight: 'bold',
  },
  insightText: {
    flex: 1,
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  warningCard: {
    backgroundColor: '#fff5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#ff4d4f',
  },
  warningText: {
    fontSize: 16,
    color: '#cf1322',
    lineHeight: 22,
    fontWeight: '500',
  },
  recommendationCard: {
    backgroundColor: '#e6f7ff',
    borderLeftWidth: 4,
    borderLeftColor: '#1890ff',
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0050b3',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  recommendationText: {
    fontSize: 16,
    color: '#003a8c',
    lineHeight: 22,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default InsightScreen;

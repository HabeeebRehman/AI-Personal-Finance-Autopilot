import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { fetchExpenses, Expense } from '../services/expenseService';

const MOCKED_INCOME = 50000;

const DashboardScreen = () => {
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateTotals = (expenses: Expense[]) => {
    const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalSpent(spent);
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setError(null);
      const response = await fetchExpenses();
      if (response.success && response.data) {
        calculateTotals(response.data);
      } else {
        setError(response.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching data');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const remainingBalance = MOCKED_INCOME - totalSpent;

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.headerTitle}>Dashboard</Text>

        <View style={styles.cardContainer}>
          {/* Total Income Card */}
          <View style={[styles.card, styles.incomeCard]}>
            <Text style={styles.cardTitle}>Total Income</Text>
            <Text style={styles.cardValue}>₹{MOCKED_INCOME.toFixed(2)}</Text>
          </View>

          {/* Total Spent Card */}
          <View style={[styles.card, styles.spentCard]}>
            <Text style={styles.cardTitle}>Total Spent</Text>
            <Text style={styles.cardValue}>₹{totalSpent.toFixed(2)}</Text>
          </View>

          {/* Remaining Balance Card */}
          <View style={[styles.card, styles.balanceCard]}>
            <Text style={styles.cardTitle}>Remaining Balance</Text>
            <Text style={styles.cardValue}>₹{remainingBalance.toFixed(2)}</Text>
          </View>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e2a3b',
    marginBottom: 24,
  },
  cardContainer: {
    flexDirection: 'column',
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  incomeCard: {
    backgroundColor: '#d4edda', // Light green
  },
  spentCard: {
    backgroundColor: '#f8d7da', // Light red
  },
  balanceCard: {
    backgroundColor: '#d1ecf1', // Light blue
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  errorText: {
    marginTop: 20,
    color: '#d9534f',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default DashboardScreen;

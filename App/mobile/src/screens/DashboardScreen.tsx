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
import { getBudget } from '../services/budgetService';
import { getAlerts, Alert as AlertType } from '../services/alertService';
import AlertCard from '../components/AlertCard';

const MOCKED_INCOME = 50000;

const DashboardScreen = () => {
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [budget, setBudget] = useState<number | null>(null);
  const [alert, setAlert] = useState<AlertType | null>(null);

  const calculateTotals = (expenses: Expense[]) => {
    const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalSpent(spent);
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setError(null);
      
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      // Parallel fetch
      const [expenseRes, budgetRes, alertRes] = await Promise.all([
        fetchExpenses(),
        getBudget(month, year),
        getAlerts(),
      ]);

      if (expenseRes.success && expenseRes.data) {
        calculateTotals(expenseRes.data);
      }

      if (budgetRes.success && budgetRes.data) {
        setBudget(budgetRes.data.amount);
      }

      if (alertRes.success && alertRes.data) {
        setAlert(alertRes.data);
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

  const remainingBalance = (budget || MOCKED_INCOME) - totalSpent;

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

        {alert && <AlertCard alert={alert} />}

        <View style={styles.cardContainer}>
          {/* Budget/Income Card */}
          <View style={[styles.card, styles.incomeCard]}>
            <Text style={styles.cardTitle}>{budget ? 'Monthly Budget' : 'Total Income'}</Text>
            <Text style={styles.cardValue}>₹{(budget || MOCKED_INCOME).toFixed(2)}</Text>
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

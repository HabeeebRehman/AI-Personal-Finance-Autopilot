import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer } from 'victory-native';
import { fetchExpenses, Expense } from '../services/expenseService';
import { processSpendingTrendData } from '../utils/spendingTrendUtils';

const { width } = Dimensions.get('window');

const SpendingTrendScreen = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetchExpenses();
      if (response.success && response.data) {
        setExpenses(response.data);
      } else {
        setError(response.message || 'Failed to fetch expenses');
      }
    } catch (err) {
      setError('An error occurred while loading spending trend');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const trendData = useMemo(() => {
    return processSpendingTrendData(expenses);
  }, [expenses]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Analyzing your spending trend...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Spending Trend</Text>
        
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Daily Spending (Current Month)</Text>
          {trendData.length > 0 ? (
            <VictoryChart
              theme={VictoryTheme ? VictoryTheme.material : undefined}
              width={width - 40}
              height={300}
              scale={{ x: "time" }}
              containerComponent={
                <VictoryVoronoiContainer
                  labels={({ datum }) => `₹${datum.y.toFixed(2)}\n${datum.x.toLocaleDateString()}`}
                  labelComponent={<VictoryTooltip cornerRadius={5} flyoutStyle={{ fill: "white" }} />}
                />
              }
            >
              <VictoryAxis
                tickFormat={(x) => {
                  const date = new Date(x);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
                style={{
                  tickLabels: { fontSize: 10, padding: 5 }
                }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(y) => `₹${y}`}
                style={{
                  tickLabels: { fontSize: 10, padding: 5 }
                }}
              />
              <VictoryLine
                data={trendData}
                style={{
                  data: { stroke: "#007AFF", strokeWidth: 3 },
                  parent: { border: "1px solid #ccc" }
                }}
                animate={{
                  duration: 2000,
                  onLoad: { duration: 1000 }
                }}
              />
            </VictoryChart>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No expenses found to display trend.</Text>
            </View>
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Quick Summary</Text>
          <Text style={styles.summaryText}>
            You have recorded {expenses.length} expenses this month. 
            The graph above shows your spending patterns day by day.
          </Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    color: '#D0021B',
    fontSize: 16,
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: '#999',
    fontSize: 16,
  },
});

export default SpendingTrendScreen;

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AlertCardProps {
  alert: {
    warning: string;
    reason: string;
    suggestion: string;
  };
}

const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="alert-circle" size={24} color="#d32f2f" />
        <Text style={styles.warningTitle}>{alert.warning}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.reasonText}>
          <Text style={styles.boldLabel}>Reason: </Text>
          {alert.reason}
        </Text>
        <View style={styles.suggestionBox}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color="#fbc02d" />
          <Text style={styles.suggestionText}>{alert.suggestion}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 15,
    borderLeftWidth: 6,
    borderLeftColor: '#d32f2f',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginLeft: 10,
  },
  content: {
    paddingLeft: 34,
  },
  reasonText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 12,
  },
  boldLabel: {
    fontWeight: 'bold',
  },
  suggestionBox: {
    flexDirection: 'row',
    backgroundColor: '#fff9c4',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
});

export default AlertCard;

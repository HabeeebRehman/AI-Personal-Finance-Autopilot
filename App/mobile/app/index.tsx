import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { Link } from 'expo-router';

export default function Index() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finance Autopilot</Text>
      <View style={styles.card}>
        <Text style={styles.welcome}>Welcome back,</Text>
        <Text style={styles.name}>{user?.name || user?.email}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <Link href="/add-expense" asChild>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add New Expense</Text>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 40,
  },
  welcome: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#999',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, Clock, CircleCheck as CheckCircle, MapPin, Bell, X } from 'lucide-react-native';
import { router } from 'expo-router';

interface DashboardStats {
  assignedTasks: number;
  completedTasks: number;
}

interface NewTask {
  id: string;
  shopName: string;
  shopLocation: string;
  items: Array<{
    name: string;
    quantity: string;
  }>;
  dueTime: string;
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats>({
    assignedTasks: 12,
    completedTasks: 38,
  });
  
  const [refreshing, setRefreshing] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState<NewTask | null>(null);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New task assigned', message: 'Order #12349 ready for pickup', time: '5 min ago' },
    { id: 2, title: 'Delivery completed', message: 'Order #12345 successfully delivered', time: '1 hour ago' },
  ]);

  // Simulate receiving a new task from admin
  useEffect(() => {
    const timer = setTimeout(() => {
      const mockNewTask: NewTask = {
        id: '1',
        shopName: 'ABC Electronics Store',
        shopLocation: '123 Main Street, Downtown',
        items: [
          { name: 'Laptop', quantity: '2 units' },
          { name: 'Wireless Mouse', quantity: '5 units' },
        ],
        dueTime: '2:00 PM',
      };
      setNewTask(mockNewTask);
      setShowNewTaskModal(true);
    }, 3000); // Show after 3 seconds for demo

    return () => clearTimeout(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setStats(prev => ({
        ...prev,
        assignedTasks: prev.assignedTasks + Math.floor(Math.random() * 3),
        completedTasks: prev.completedTasks + Math.floor(Math.random() * 2),
      }));
      setRefreshing(false);
    }, 1000);
  };

  const StatCard = ({ icon, title, value, color, onPress }: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    color: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.statHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          {icon}
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </TouchableOpacity>
  );

  const handleViewTasks = () => {
    router.push('/(tabs)/location');
  };

  const handleNotifications = () => {
    Alert.alert(
      'Notifications',
      notifications.map(n => `${n.title}: ${n.message}`).join('\n\n'),
      [{ text: 'OK' }]
    );
  };

  const handleAcceptTask = () => {
    if (newTask) {
      setStats(prev => ({
        ...prev,
        assignedTasks: prev.assignedTasks + 1,
      }));
      Alert.alert('Task Accepted', 'Task has been added to your task list!');
      setShowNewTaskModal(false);
      setNewTask(null);
    }
  };

  const handleRejectTask = () => {
    Alert.alert('Task Rejected', 'Task has been declined.');
    setShowNewTaskModal(false);
    setNewTask(null);
  };

  const NewTaskModal = () => (
    <Modal
      visible={showNewTaskModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowNewTaskModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.newTaskModal}>
          <View style={styles.newTaskHeader}>
            <Text style={styles.newTaskTitle}>New Task Assigned</Text>
            <TouchableOpacity onPress={() => setShowNewTaskModal(false)}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          {newTask && (
            <View style={styles.newTaskContent}>
              <View style={styles.newTaskSection}>
                <Text style={styles.newTaskSectionTitle}>Shop Details</Text>
                <Text style={styles.newTaskShopName}>{newTask.shopName}</Text>
                <View style={styles.newTaskLocationRow}>
                  <MapPin size={16} color="#64748B" />
                  <Text style={styles.newTaskLocation}>{newTask.shopLocation}</Text>
                </View>
              </View>

              <View style={styles.newTaskSection}>
                <Text style={styles.newTaskSectionTitle}>Items to Deliver</Text>
                {newTask.items.map((item, index) => (
                  <View key={index} style={styles.newTaskItem}>
                    <Text style={styles.newTaskItemName}>{item.name}</Text>
                    <Text style={styles.newTaskItemQuantity}>{item.quantity}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.newTaskSection}>
                <Text style={styles.newTaskSectionTitle}>Due Time</Text>
                <View style={styles.newTaskTimeRow}>
                  <Clock size={16} color="#F59E0B" />
                  <Text style={styles.newTaskDueTime}>{newTask.dueTime}</Text>
                </View>
              </View>

              <View style={styles.newTaskActions}>
                <TouchableOpacity style={styles.rejectButton} onPress={handleRejectTask}>
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptTask}>
                  <Text style={styles.acceptButtonText}>Accept Task</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>Good morning!</Text>
            <Text style={styles.nameText}>Sarah Johnson</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton} onPress={handleNotifications}>
            <Bell size={24} color="#2563EB" />
            {notifications.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{notifications.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          
          <View style={styles.statsGrid}>
            <StatCard
              icon={<Package size={20} color="#2563EB" />}
              title="Assigned Tasks"
              value={stats.assignedTasks}
              color="#2563EB"
              onPress={handleViewTasks}
            />
            <StatCard
              icon={<CheckCircle size={20} color="#10B981" />}
              title="Completed Tasks"
              value={stats.completedTasks}
              color="#10B981"
              onPress={handleViewTasks}
            />
          </View>
        </View>

        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <TouchableOpacity 
              style={styles.activityItem}
              onPress={() => Alert.alert('Activity Details', 'Delivery completed - Order #12345')}
            >
              <View style={[styles.activityDot, { backgroundColor: '#10B981' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Delivery completed</Text>
                <Text style={styles.activitySubtitle}>Order #12345 - Downtown Office</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.activityItem}
              onPress={() => Alert.alert('Activity Details', 'New task assigned - Order #12346')}
            >
              <View style={[styles.activityDot, { backgroundColor: '#2563EB' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New task assigned</Text>
                <Text style={styles.activitySubtitle}>Order #12346 - Westside Mall</Text>
                <Text style={styles.activityTime}>4 hours ago</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.activityItem}
              onPress={() => Alert.alert('Activity Details', 'Task in progress - Order #12344')}
            >
              <View style={[styles.activityDot, { backgroundColor: '#F59E0B' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Task in progress</Text>
                <Text style={styles.activitySubtitle}>Order #12344 - City Center</Text>
                <Text style={styles.activityTime}>6 hours ago</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <NewTaskModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
    marginTop: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  recentActivity: {
    padding: 20,
    paddingBottom: 100,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    fontFamily: 'Inter-Medium',
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  // New Task Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newTaskModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  newTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  newTaskTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  newTaskContent: {
    padding: 20,
  },
  newTaskSection: {
    marginBottom: 20,
  },
  newTaskSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  newTaskShopName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563EB',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  newTaskLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newTaskLocation: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
    flex: 1,
  },
  newTaskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  newTaskItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    fontFamily: 'Inter-Medium',
  },
  newTaskItemQuantity: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  newTaskTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newTaskDueTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  newTaskActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, Clock, CircleCheck as CheckCircle, TrendingUp, Star, Target, SquareCheck, MapPin, Bell } from 'lucide-react-native';
import { router } from 'expo-router';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
  avgDeliveryTime: string;
  rating: number;
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 45,
    completedTasks: 38,
    pendingTasks: 7,
    completionRate: 84,
    avgDeliveryTime: '2.3 hrs',
    rating: 4.8,
  });
  
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New task assigned', message: 'Order #12349 ready for pickup', time: '5 min ago' },
    { id: 2, title: 'Delivery completed', message: 'Order #12345 successfully delivered', time: '1 hour ago' },
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setStats(prev => ({
        ...prev,
        totalTasks: prev.totalTasks + Math.floor(Math.random() * 3),
        completedTasks: prev.completedTasks + Math.floor(Math.random() * 2),
      }));
      setRefreshing(false);
    }, 1000);
  };

  const StatCard = ({ icon, title, value, subtitle, color, onPress }: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
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
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );

  const QuickAction = ({ icon, title, onPress, color }: {
    icon: React.ReactNode;
    title: string;
    onPress: () => void;
    color: string;
  }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        {icon}
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const handleViewTasks = () => {
    router.push('/(tabs)/tasks');
  };

  const handleTrackLocation = () => {
    router.push('/(tabs)/location');
  };

  const handleNewDelivery = () => {
    Alert.alert(
      'New Delivery',
      'Create a new delivery task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create', onPress: () => router.push('/(tabs)/tasks') }
      ]
    );
  };

  const handleReports = () => {
    Alert.alert('Reports', 'Detailed reports feature coming soon!');
  };

  const handleNotifications = () => {
    Alert.alert(
      'Notifications',
      notifications.map(n => `${n.title}: ${n.message}`).join('\n\n'),
      [{ text: 'OK' }]
    );
  };

  const handleActivityPress = (activity: string) => {
    Alert.alert('Activity Details', `Details for: ${activity}`);
  };

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
              title="Total Tasks"
              value={stats.totalTasks}
              color="#2563EB"
              onPress={handleViewTasks}
            />
            <StatCard
              icon={<CheckCircle size={20} color="#10B981" />}
              title="Completed"
              value={stats.completedTasks}
              color="#10B981"
              onPress={handleViewTasks}
            />
            <StatCard
              icon={<Clock size={20} color="#F59E0B" />}
              title="Pending"
              value={stats.pendingTasks}
              color="#F59E0B"
              onPress={handleViewTasks}
            />
            <StatCard
              icon={<TrendingUp size={20} color="#8B5CF6" />}
              title="Completion Rate"
              value={`${stats.completionRate}%`}
              color="#8B5CF6"
              onPress={handleReports}
            />
            <StatCard
              icon={<Target size={20} color="#EF4444" />}
              title="Avg Delivery Time"
              value={stats.avgDeliveryTime}
              color="#EF4444"
              onPress={handleReports}
            />
            <StatCard
              icon={<Star size={20} color="#F59E0B" />}
              title="Rating"
              value={stats.rating}
              subtitle="Customer Rating"
              color="#F59E0B"
              onPress={handleReports}
            />
          </View>
        </View>

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              icon={<SquareCheck size={24} color="#FFFFFF" />}
              title="View Tasks"
              onPress={handleViewTasks}
              color="#2563EB"
            />
            <QuickAction
              icon={<MapPin size={24} color="#FFFFFF" />}
              title="Track Location"
              onPress={handleTrackLocation}
              color="#10B981"
            />
            <QuickAction
              icon={<Package size={24} color="#FFFFFF" />}
              title="New Delivery"
              onPress={handleNewDelivery}
              color="#F59E0B"
            />
            <QuickAction
              icon={<TrendingUp size={24} color="#FFFFFF" />}
              title="Reports"
              onPress={handleReports}
              color="#8B5CF6"
            />
          </View>
        </View>

        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <TouchableOpacity 
              style={styles.activityItem}
              onPress={() => handleActivityPress('Delivery completed - Order #12345')}
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
              onPress={() => handleActivityPress('New task assigned - Order #12346')}
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
              onPress={() => handleActivityPress('Task in progress - Order #12344')}
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
  statSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  quickActionsContainer: {
    padding: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
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
});
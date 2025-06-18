import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, MapPin, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Filter, X, Phone, Navigation } from 'lucide-react-native';

interface Task {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  product: string;
  quantity: number;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  dueTime: string;
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  specialInstructions?: string;
}

const mockTasks: Task[] = [
  {
    id: '1',
    orderId: '#12345',
    customerName: 'John Smith',
    customerPhone: '+1 (555) 123-4567',
    address: '123 Main St, Downtown',
    product: 'Office Supplies',
    quantity: 5,
    status: 'pending',
    dueTime: '10:00 AM',
    estimatedTime: '30 min',
    priority: 'high',
    description: 'Delivery of office supplies including printer paper, pens, and folders.',
    specialInstructions: 'Please deliver to reception desk on 3rd floor.',
  },
  {
    id: '2',
    orderId: '#12346',
    customerName: 'Sarah Johnson',
    customerPhone: '+1 (555) 234-5678',
    address: '456 Oak Ave, Westside',
    product: 'Electronics',
    quantity: 2,
    status: 'in-progress',
    dueTime: '11:30 AM',
    estimatedTime: '45 min',
    priority: 'medium',
    description: 'Laptop and wireless mouse delivery for home office setup.',
    specialInstructions: 'Customer prefers delivery after 11 AM.',
  },
  {
    id: '3',
    orderId: '#12347',
    customerName: 'Mike Wilson',
    customerPhone: '+1 (555) 345-6789',
    address: '789 Pine Rd, Eastside',
    product: 'Furniture',
    quantity: 1,
    status: 'completed',
    dueTime: '9:00 AM',
    estimatedTime: '60 min',
    priority: 'low',
    description: 'Office chair delivery and assembly if required.',
  },
  {
    id: '4',
    orderId: '#12348',
    customerName: 'Lisa Brown',
    customerPhone: '+1 (555) 456-7890',
    address: '321 Elm St, Northside',
    product: 'Medical Supplies',
    quantity: 3,
    status: 'delayed',
    dueTime: '2:00 PM',
    estimatedTime: '25 min',
    priority: 'high',
    description: 'Medical equipment delivery to clinic.',
    specialInstructions: 'Handle with extreme care. Fragile items.',
  },
];

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'in-progress':
        return '#2563EB';
      case 'completed':
        return '#10B981';
      case 'delayed':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} color="#F59E0B" />;
      case 'in-progress':
        return <Package size={16} color="#2563EB" />;
      case 'completed':
        return <CheckCircle size={16} color="#10B981" />;
      case 'delayed':
        return <AlertCircle size={16} color="#EF4444" />;
      default:
        return <Clock size={16} color="#64748B" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#64748B';
    }
  };

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filter);

  const startTask = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'in-progress' as const }
          : task
      )
    );
    Alert.alert('Task Started', 'Task has been marked as in progress!');
  };

  const completeTask = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed' as const }
          : task
      )
    );
    Alert.alert('Task Completed', 'Task has been marked as completed!');
  };

  const viewTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const callCustomer = (phone: string) => {
    Alert.alert('Call Customer', `Would you like to call ${phone}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => Alert.alert('Calling...', `Dialing ${phone}`) }
    ]);
  };

  const getDirections = (address: string) => {
    Alert.alert('Get Directions', `Opening directions to: ${address}`);
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <TouchableOpacity style={styles.taskCard} onPress={() => viewTaskDetails(task)}>
      <View style={styles.taskHeader}>
        <View style={styles.taskHeaderLeft}>
          <Text style={styles.orderId}>{task.orderId}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '15' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
              {task.priority.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) + '15' }]}>
          {getStatusIcon(task.status)}
          <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
            {task.status.replace('-', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.customerName}>{task.customerName}</Text>
      <Text style={styles.product}>{task.product} (Qty: {task.quantity})</Text>
      
      <View style={styles.addressContainer}>
        <MapPin size={14} color="#64748B" />
        <Text style={styles.address}>{task.address}</Text>
      </View>

      <View style={styles.timeContainer}>
        <View style={styles.timeItem}>
          <Clock size={14} color="#64748B" />
          <Text style={styles.timeText}>Due: {task.dueTime}</Text>
        </View>
        <Text style={styles.estimatedTime}>Est: {task.estimatedTime}</Text>
      </View>

      <View style={styles.taskActions}>
        {task.status === 'pending' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.startButton]}
            onPress={() => startTask(task.id)}
          >
            <Text style={styles.startButtonText}>Start Task</Text>
          </TouchableOpacity>
        )}
        {task.status === 'in-progress' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => completeTask(task.id)}
          >
            <Text style={styles.completeButtonText}>Mark Complete</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => viewTaskDetails(task)}
        >
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const FilterButton = ({ title, value, isActive }: {
    title: string;
    value: typeof filter;
    isActive: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const TaskDetailModal = () => (
    <Modal
      visible={showTaskDetail}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowTaskDetail(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Task Details</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowTaskDetail(false)}
          >
            <X size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        {selectedTask && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Text style={styles.detailOrderId}>{selectedTask.orderId}</Text>
                <View style={[styles.detailStatusBadge, { backgroundColor: getStatusColor(selectedTask.status) + '15' }]}>
                  {getStatusIcon(selectedTask.status)}
                  <Text style={[styles.detailStatusText, { color: getStatusColor(selectedTask.status) }]}>
                    {selectedTask.status.replace('-', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Customer Information</Text>
                <Text style={styles.detailCustomerName}>{selectedTask.customerName}</Text>
                <TouchableOpacity 
                  style={styles.detailContactRow}
                  onPress={() => callCustomer(selectedTask.customerPhone)}
                >
                  <Phone size={16} color="#2563EB" />
                  <Text style={styles.detailContactText}>{selectedTask.customerPhone}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Delivery Address</Text>
                <TouchableOpacity 
                  style={styles.detailAddressRow}
                  onPress={() => getDirections(selectedTask.address)}
                >
                  <MapPin size={16} color="#2563EB" />
                  <Text style={styles.detailAddressText}>{selectedTask.address}</Text>
                  <Navigation size={16} color="#2563EB" />
                </TouchableOpacity>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Product Details</Text>
                <Text style={styles.detailProductName}>{selectedTask.product}</Text>
                <Text style={styles.detailQuantity}>Quantity: {selectedTask.quantity}</Text>
                <Text style={styles.detailDescription}>{selectedTask.description}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Schedule</Text>
                <View style={styles.detailTimeRow}>
                  <Clock size={16} color="#64748B" />
                  <Text style={styles.detailTimeText}>Due: {selectedTask.dueTime}</Text>
                </View>
                <Text style={styles.detailEstimatedTime}>Estimated time: {selectedTask.estimatedTime}</Text>
              </View>

              {selectedTask.specialInstructions && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Special Instructions</Text>
                  <Text style={styles.detailInstructions}>{selectedTask.specialInstructions}</Text>
                </View>
              )}

              <View style={styles.detailActions}>
                {selectedTask.status === 'pending' && (
                  <TouchableOpacity 
                    style={[styles.detailActionButton, styles.detailStartButton]}
                    onPress={() => {
                      startTask(selectedTask.id);
                      setShowTaskDetail(false);
                    }}
                  >
                    <Text style={styles.detailStartButtonText}>Start Task</Text>
                  </TouchableOpacity>
                )}
                {selectedTask.status === 'in-progress' && (
                  <TouchableOpacity 
                    style={[styles.detailActionButton, styles.detailCompleteButton]}
                    onPress={() => {
                      completeTask(selectedTask.id);
                      setShowTaskDetail(false);
                    }}
                  >
                    <Text style={styles.detailCompleteButtonText}>Mark Complete</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={[styles.detailActionButton, styles.detailCallButton]}
                  onPress={() => callCustomer(selectedTask.customerPhone)}
                >
                  <Phone size={20} color="#FFFFFF" />
                  <Text style={styles.detailCallButtonText}>Call Customer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <TouchableOpacity style={styles.filterIcon}>
          <Filter size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterButton title="All" value="all" isActive={filter === 'all'} />
          <FilterButton title="Pending" value="pending" isActive={filter === 'pending'} />
          <FilterButton title="In Progress" value="in-progress" isActive={filter === 'in-progress'} />
          <FilterButton title="Completed" value="completed" isActive={filter === 'completed'} />
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.tasksContainer}>
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </View>
      </ScrollView>

      <TaskDetailModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  filterIcon: {
    padding: 8,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2563EB',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  tasksContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  product: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  address: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginLeft: 6,
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginLeft: 6,
  },
  estimatedTime: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#2563EB',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  completeButton: {
    backgroundColor: '#10B981',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  viewButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  viewButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  detailOrderId: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  detailStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  detailStatusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 6,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  detailCustomerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  detailContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailContactText: {
    fontSize: 16,
    color: '#2563EB',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  detailAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailAddressText: {
    fontSize: 16,
    color: '#2563EB',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
    flex: 1,
  },
  detailProductName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  detailQuantity: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  detailTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailTimeText: {
    fontSize: 16,
    color: '#1E293B',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  detailEstimatedTime: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  detailInstructions: {
    fontSize: 14,
    color: '#EF4444',
    fontFamily: 'Inter-Medium',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  detailActions: {
    gap: 12,
    marginTop: 8,
  },
  detailActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  detailStartButton: {
    backgroundColor: '#2563EB',
  },
  detailStartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  detailCompleteButton: {
    backgroundColor: '#10B981',
  },
  detailCompleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  detailCallButton: {
    backgroundColor: '#F59E0B',
  },
  detailCallButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});
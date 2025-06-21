import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, CreditCard as Edit, Phone, Mail, MapPin, Star, Trophy, Calendar, Camera, Settings, Award, History, X, Check, LogOut } from 'lucide-react-native';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  employeeId: string;
  joinDate: string;
  department: string;
  avatar?: string;
}

interface ProfileStats {
  totalDeliveries: number;
  completionRate: number;
  averageRating: number;
  totalDistance: number;
  bestMonth: string;
}

const avatarOptions = [
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=400',
];

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showPerformanceStats, setShowPerformanceStats] = useState(false); // Hidden by default
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, Anytown, ST 12345',
    employeeId: 'EMP001',
    joinDate: '2023-01-15',
    department: 'Sales & Delivery',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
  });

  const [editableProfile, setEditableProfile] = useState<UserProfile>(profile);

  const stats: ProfileStats = {
    totalDeliveries: 1247,
    completionRate: 96.8,
    averageRating: 4.8,
    totalDistance: 12450,
    bestMonth: 'November 2024',
  };

  const handleSave = () => {
    setProfile(editableProfile);
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditableProfile(profile);
    setIsEditing(false);
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setEditableProfile(prev => ({ ...prev, avatar: avatarUrl }));
    setShowAvatarPicker(false);
  };

  const handleAccountSettings = () => {
    Alert.alert('Account Settings', 'Account settings feature coming soon!');
  };

  const handleViewAchievements = () => {
    Alert.alert(
      'Achievements',
      '🏆 Top Performer - November 2024\n⭐ 5-Star Rating - 50+ deliveries\n🎯 Perfect Week - 7 days streak\n📦 Century Club - 100+ deliveries',
      [{ text: 'OK' }]
    );
  };

  const handleWorkHistory = () => {
    Alert.alert(
      'Work History',
      'Recent Activity:\n• 1,247 total deliveries\n• 96.8% completion rate\n• 4.8/5 average rating\n• 12,450 km traveled\n• Member since Jan 2023',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Logged Out', 'You have been successfully logged out.');
            // Here you would typically handle the logout logic
          }
        }
      ]
    );
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
        <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
          {icon}
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );

  const EditableField = ({ label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default' }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
    keyboardType?: 'default' | 'email-address' | 'phone-pad';
  }) => (
    <View style={styles.inputGroup}>
      <View style={styles.inputLabelRow}>
        <Text style={styles.inputLabel}>{label}</Text>
        <Edit size={14} color="#2563EB" />
      </View>
      <TextInput
        style={[styles.textInput, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType}
      />
    </View>
  );

  const AvatarPickerModal = () => (
    <Modal
      visible={showAvatarPicker}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAvatarPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.avatarPickerContainer}>
          <View style={styles.avatarPickerHeader}>
            <Text style={styles.avatarPickerTitle}>Choose Profile Photo</Text>
            <TouchableOpacity onPress={() => setShowAvatarPicker(false)}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.avatarGrid}>
            <View style={styles.avatarRow}>
              {avatarOptions.map((avatar, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.avatarOption}
                  onPress={() => handleAvatarSelect(avatar)}
                >
                  <Image source={{ uri: avatar }} style={styles.avatarOptionImage} />
                  {editableProfile.avatar === avatar && (
                    <View style={styles.avatarSelectedOverlay}>
                      <Check size={24} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Edit size={20} color="#2563EB" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <LogOut size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={40} color="#64748B" />
              </View>
            )}
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={() => setShowAvatarPicker(true)}
            >
              <Camera size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            {isEditing ? (
              <View style={styles.editForm}>
                <EditableField
                  label="Full Name"
                  value={editableProfile.name}
                  onChangeText={(text) => setEditableProfile(prev => ({ ...prev, name: text }))}
                  placeholder="Enter full name"
                />

                <EditableField
                  label="Email Address"
                  value={editableProfile.email}
                  onChangeText={(text) => setEditableProfile(prev => ({ ...prev, email: text }))}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                />

                <EditableField
                  label="Phone Number"
                  value={editableProfile.phone}
                  onChangeText={(text) => setEditableProfile(prev => ({ ...prev, phone: text }))}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />

                <EditableField
                  label="Address"
                  value={editableProfile.address}
                  onChangeText={(text) => setEditableProfile(prev => ({ ...prev, address: text }))}
                  placeholder="Enter address"
                  multiline
                />

                <View style={styles.buttonGroup}>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.employeeId}>ID: {profile.employeeId}</Text>
                <Text style={styles.department}>{profile.department}</Text>

                <View style={styles.contactInfo}>
                  <TouchableOpacity style={styles.contactItem}>
                    <Mail size={16} color="#64748B" />
                    <Text style={styles.contactText}>{profile.email}</Text>
                    <Edit size={12} color="#2563EB" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.contactItem}>
                    <Phone size={16} color="#64748B" />
                    <Text style={styles.contactText}>{profile.phone}</Text>
                    <Edit size={12} color="#2563EB" />
                  </TouchableOpacity>
                  <View style={styles.contactItem}>
                    <MapPin size={16} color="#64748B" />
                    <Text style={styles.contactText}>{profile.address}</Text>
                    <Edit size={12} color="#2563EB" />
                  </View>
                  <View style={styles.contactItem}>
                    <Calendar size={16} color="#64748B" />
                    <Text style={styles.contactText}>
                      Joined {new Date(profile.joinDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Performance Statistics - Hidden by default */}
        {showPerformanceStats && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Performance Statistics</Text>
            
            <View style={styles.statsGrid}>
              <StatCard
                icon={<Trophy size={20} color="#F59E0B" />}
                title="Total Deliveries"
                value={stats.totalDeliveries.toLocaleString()}
                color="#F59E0B"
                onPress={handleWorkHistory}
              />
              <StatCard
                icon={<Star size={20} color="#10B981" />}
                title="Completion Rate"
                value={`${stats.completionRate}%`}
                color="#10B981"
                onPress={handleWorkHistory}
              />
              <StatCard
                icon={<Star size={20} color="#2563EB" />}
                title="Average Rating"
                value={stats.averageRating}
                subtitle="Customer Reviews"
                color="#2563EB"
                onPress={handleWorkHistory}
              />
              <StatCard
                icon={<MapPin size={20} color="#8B5CF6" />}
                title="Distance Traveled"
                value={`${stats.totalDistance.toLocaleString()} km`}
                color="#8B5CF6"
                onPress={handleWorkHistory}
              />
            </View>

            <TouchableOpacity style={styles.achievementCard} onPress={handleViewAchievements}>
              <View style={styles.achievementHeader}>
                <Trophy size={24} color="#F59E0B" />
                <Text style={styles.achievementTitle}>Best Performance</Text>
              </View>
              <Text style={styles.achievementDescription}>
                Highest completion rate achieved in {stats.bestMonth}
              </Text>
              <View style={styles.achievementBadge}>
                <Text style={styles.achievementBadgeText}>Top Performer</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleAccountSettings}>
            <Settings size={20} color="#2563EB" />
            <Text style={styles.actionButtonText}>Account Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleViewAchievements}>
            <Award size={20} color="#2563EB" />
            <Text style={styles.actionButtonText}>View Achievements</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleWorkHistory}>
            <History size={20} color="#2563EB" />
            <Text style={styles.actionButtonText}>Work History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AvatarPickerModal />
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '50%',
    marginRight: -30,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileDetails: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  employeeId: {
    fontSize: 14,
    color: '#2563EB',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  department: {
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginBottom: 20,
  },
  contactInfo: {
    width: '100%',
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginLeft: 12,
    flex: 1,
  },
  editForm: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
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
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
  },
  statTitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Inter-Medium',
  },
  statSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'Inter-Regular',
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  achievementBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  achievementBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    fontFamily: 'Inter-SemiBold',
  },
  actionsContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    fontFamily: 'Inter-Medium',
    marginLeft: 12,
  },
  // Avatar picker modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  avatarPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatarPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
  },
  avatarGrid: {
    padding: 20,
  },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  avatarOption: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  avatarOptionImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarSelectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(37, 99, 235, 0.8)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
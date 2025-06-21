import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Dimensions, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Navigation, Clock, CircleCheck as CheckCircle, Play, Square, Loader, TriangleAlert as AlertTriangle, Plus, X, Trash2 } from 'lucide-react-native';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
  address?: string;
}

interface LocationError {
  code: string;
  message: string;
}

interface TaskItem {
  id: string;
  name: string;
  quantity: string;
}

interface CompletedTask {
  id: string;
  shopName: string;
  shopLocation: string;
  items: TaskItem[];
  completedAt: Date;
  gpsLocation: LocationData;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function TasksScreen() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  
  // Form state
  const [shopName, setShopName] = useState('');
  const [shopLocation, setShopLocation] = useState('');
  const [items, setItems] = useState<TaskItem[]>([{ id: '1', name: '', quantity: '' }]);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const reverseGeocodeTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    requestLocationPermission();
    
    // Cleanup on unmount
    return () => {
      stopLocationTracking();
      if (reverseGeocodeTimeout.current) {
        clearTimeout(reverseGeocodeTimeout.current);
      }
    };
  }, []);

  const requestLocationPermission = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if location services are enabled
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationEnabled) {
        setError({
          code: 'LOCATION_DISABLED',
          message: 'Location services are disabled. Please enable them in your device settings.'
        });
        setIsLoading(false);
        return;
      }

      // Request foreground permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError({
          code: 'PERMISSION_DENIED',
          message: 'Location permission denied. Please grant location access to use this feature.'
        });
        setIsLoading(false);
        return;
      }

      // Get initial location
      await getCurrentLocation();
    } catch (err) {
      console.error('Permission request error:', err);
      setError({
        code: 'PERMISSION_ERROR',
        message: 'Failed to request location permissions. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 10000, // Use cached location if less than 10 seconds old
      });

      const locationData: LocationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        timestamp: Date.now(),
        accuracy: currentLocation.coords.accuracy || undefined,
      };

      setLocation(locationData);
      
      // Get address for the location
      await reverseGeocode(locationData.latitude, locationData.longitude);
    } catch (err) {
      console.error('Get location error:', err);
      setError({
        code: 'LOCATION_ERROR',
        message: 'Failed to get current location. Please check your GPS signal.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      // Clear any existing timeout
      if (reverseGeocodeTimeout.current) {
        clearTimeout(reverseGeocodeTimeout.current);
      }

      // Debounce reverse geocoding to avoid too many API calls
      reverseGeocodeTimeout.current = setTimeout(async () => {
        try {
          const addresses = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

          if (addresses && addresses.length > 0) {
            const address = addresses[0];
            const formattedAddress = formatAddress(address);
            
            setLocation(prev => prev ? {
              ...prev,
              address: formattedAddress
            } : null);
          }
        } catch (geocodeError) {
          console.warn('Reverse geocoding failed:', geocodeError);
          // Don't set error for geocoding failures, just log them
          setLocation(prev => prev ? {
            ...prev,
            address: 'Address unavailable'
          } : null);
        }
      }, 1000); // Wait 1 second before geocoding
    } catch (err) {
      console.warn('Reverse geocode setup error:', err);
    }
  };

  const formatAddress = (address: Location.LocationGeocodedAddress): string => {
    const parts = [];
    
    if (address.name) parts.push(address.name);
    if (address.street) parts.push(address.street);
    if (address.district) parts.push(address.district);
    if (address.city) parts.push(address.city);
    if (address.region) parts.push(address.region);
    
    return parts.length > 0 ? parts.join(', ') : 'Unknown location';
  };

  const startLocationTracking = async () => {
    try {
      setError(null);
      
      // Request background permissions for continuous tracking
      const { status } = await Location.requestBackgroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Background Location',
          'Background location permission is recommended for continuous tracking, but foreground tracking will still work.',
          [{ text: 'OK' }]
        );
      }

      setIsTracking(true);

      // Start watching position with high accuracy
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (newLocation) => {
          const locationData: LocationData = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            timestamp: Date.now(),
            accuracy: newLocation.coords.accuracy || undefined,
          };

          setLocation(prev => ({
            ...locationData,
            address: prev?.address // Keep previous address until new one is geocoded
          }));

          // Reverse geocode the new location
          reverseGeocode(locationData.latitude, locationData.longitude);
        }
      );

      Alert.alert('Tracking Started', 'Location tracking is now active. Your position will be updated automatically.');
    } catch (err) {
      console.error('Start tracking error:', err);
      setError({
        code: 'TRACKING_ERROR',
        message: 'Failed to start location tracking. Please try again.'
      });
      setIsTracking(false);
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    
    if (reverseGeocodeTimeout.current) {
      clearTimeout(reverseGeocodeTimeout.current);
      reverseGeocodeTimeout.current = null;
    }
    
    setIsTracking(false);
  };

  const handleStopTracking = () => {
    stopLocationTracking();
    Alert.alert(
      'Tracking Stopped',
      'Location tracking has been stopped.',
      [{ text: 'OK' }]
    );
  };

  const addItem = () => {
    const newItem: TaskItem = {
      id: Date.now().toString(),
      name: '',
      quantity: '',
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: 'name' | 'quantity', value: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const saveTask = async () => {
    if (!shopName.trim() || !shopLocation.trim()) {
      Alert.alert('Error', 'Please fill in shop name and location.');
      return;
    }

    const validItems = items.filter(item => item.name.trim() && item.quantity.trim());
    if (validItems.length === 0) {
      Alert.alert('Error', 'Please add at least one item.');
      return;
    }

    try {
      // Get current GPS location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const gpsLocation: LocationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        timestamp: Date.now(),
        accuracy: currentLocation.coords.accuracy || undefined,
      };

      const completedTask: CompletedTask = {
        id: Date.now().toString(),
        shopName: shopName.trim(),
        shopLocation: shopLocation.trim(),
        items: validItems,
        completedAt: new Date(),
        gpsLocation,
      };

      setCompletedTasks([...completedTasks, completedTask]);

      // Reset form
      setShopName('');
      setShopLocation('');
      setItems([{ id: '1', name: '', quantity: '' }]);

      Alert.alert('Success', 'Task saved successfully and added to completed section!');
      // Don't close modal - stay in popup as requested
    } catch (err) {
      console.error('Save task error:', err);
      Alert.alert('Error', 'Failed to get GPS location. Please try again.');
    }
  };

  const getLocationStatusText = () => {
    if (isLoading) return 'Finding location...';
    if (error) return 'Location unavailable';
    if (isTracking) return 'Tracking active';
    return 'Ready to track';
  };

  const getLocationStatusColor = () => {
    if (isLoading) return '#F59E0B';
    if (error) return '#EF4444';
    if (isTracking) return '#10B981';
    return '#64748B';
  };

  const AddTaskModal = () => (
    <Modal
      visible={showAddTaskModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAddTaskModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add New Task</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowAddTaskModal(false)}
          >
            <X size={24} color="#64748B" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Shop Name</Text>
            <TextInput
              style={styles.formInput}
              value={shopName}
              onChangeText={setShopName}
              placeholder="Enter shop name"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Shop Location</Text>
            <TextInput
              style={styles.formInput}
              value={shopLocation}
              onChangeText={setShopLocation}
              placeholder="Enter shop location"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Add Items</Text>
            {items.map((item, index) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemInputs}>
                  <TextInput
                    style={[styles.formInput, styles.itemNameInput]}
                    value={item.name}
                    onChangeText={(value) => updateItem(item.id, 'name', value)}
                    placeholder="Item name"
                  />
                  <TextInput
                    style={[styles.formInput, styles.itemQuantityInput]}
                    value={item.quantity}
                    onChangeText={(value) => updateItem(item.id, 'quantity', value)}
                    placeholder="Quantity (e.g., 13kg)"
                  />
                </View>
                {items.length > 1 && (
                  <TouchableOpacity 
                    style={styles.removeItemButton}
                    onPress={() => removeItem(item.id)}
                  >
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            
            <TouchableOpacity style={styles.addItemButton} onPress={addItem}>
              <Plus size={20} color="#2563EB" />
              <Text style={styles.addItemButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveTaskButton} onPress={saveTask}>
            <Text style={styles.saveTaskButtonText}>Save Task</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <View style={styles.headerRight}>
          <View style={[styles.statusIndicator, { backgroundColor: getLocationStatusColor() }]}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {getLocationStatusText().toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddTaskModal(true)}
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <AlertTriangle size={20} color="#DC2626" />
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>Location Error</Text>
              <Text style={styles.errorText}>{error.message}</Text>
            </View>
            <TouchableOpacity style={styles.retryButton} onPress={requestLocationPermission}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Current Location Card */}
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Text style={styles.cardTitle}>Current Location</Text>
            {isLoading && <Loader size={20} color="#2563EB" />}
          </View>
          
          {location ? (
            <View style={styles.locationInfo}>
              {location.address && (
                <View style={styles.addressSection}>
                  <Text style={styles.addressTitle}>Address</Text>
                  <Text style={styles.addressText}>{location.address}</Text>
                </View>
              )}
              
              <View style={styles.coordinatesSection}>
                <Text style={styles.coordinatesTitle}>Coordinates</Text>
                <View style={styles.coordinateRow}>
                  <Text style={styles.coordinateLabel}>Latitude:</Text>
                  <Text style={styles.coordinateValue}>{location.latitude.toFixed(6)}</Text>
                </View>
                <View style={styles.coordinateRow}>
                  <Text style={styles.coordinateLabel}>Longitude:</Text>
                  <Text style={styles.coordinateValue}>{location.longitude.toFixed(6)}</Text>
                </View>
                {location.accuracy && (
                  <View style={styles.coordinateRow}>
                    <Text style={styles.coordinateLabel}>Accuracy:</Text>
                    <Text style={styles.coordinateValue}>{Math.round(location.accuracy)}m</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.lastUpdate}>
                Last updated: {new Date(location.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          ) : (
            <View style={styles.noLocationContainer}>
              <MapPin size={48} color="#64748B" />
              <Text style={styles.noLocationText}>
                {isLoading ? 'Finding your location...' : 'Location not available'}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.controlsContainer}>
          {!isTracking ? (
            <TouchableOpacity 
              style={[styles.primaryButton, styles.startButton, (isLoading || error) && styles.disabledButton]} 
              onPress={startLocationTracking}
              disabled={isLoading || !!error}
            >
              <Play size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Start Continuous Tracking</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.primaryButton, styles.stopButton]} onPress={handleStopTracking}>
              <Square size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Stop Tracking</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.secondaryButton, isLoading && styles.disabledButton]} 
            onPress={getCurrentLocation}
            disabled={isLoading}
          >
            <Navigation size={20} color="#2563EB" />
            <Text style={styles.secondaryButtonText}>
              {isLoading ? 'Getting Location...' : 'Refresh Location'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Completed Tasks Section */}
        {completedTasks.length > 0 && (
          <View style={styles.completedSection}>
            <Text style={styles.sectionTitle}>Completed Tasks</Text>
            {completedTasks.map((task) => (
              <View key={task.id} style={styles.completedTaskCard}>
                <View style={styles.completedTaskHeader}>
                  <CheckCircle size={20} color="#10B981" />
                  <Text style={styles.completedTaskShop}>{task.shopName}</Text>
                </View>
                <Text style={styles.completedTaskLocation}>{task.shopLocation}</Text>
                <View style={styles.completedTaskItems}>
                  {task.items.map((item, index) => (
                    <Text key={index} style={styles.completedTaskItem}>
                      • {item.name} - {item.quantity}
                    </Text>
                  ))}
                </View>
                <Text style={styles.completedTaskTime}>
                  Completed: {task.completedAt.toLocaleString()}
                </Text>
                <Text style={styles.completedTaskGPS}>
                  GPS: {task.gpsLocation.latitude.toFixed(6)}, {task.gpsLocation.longitude.toFixed(6)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <AddTaskModal />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: screenWidth < 375 ? 20 : 24,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Inter-Bold',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  addButton: {
    backgroundColor: '#2563EB',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Extra padding for tab bar
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  errorContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationInfo: {
    gap: 16,
  },
  addressSection: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 15,
    color: '#2563EB',
    fontFamily: 'Inter-Medium',
    lineHeight: 22,
  },
  coordinatesSection: {
    gap: 8,
  },
  coordinatesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  coordinateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  coordinateLabel: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  coordinateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
  },
  lastUpdate: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  noLocationContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noLocationText: {
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  startButton: {
    backgroundColor: '#10B981',
  },
  stopButton: {
    backgroundColor: '#EF4444',
  },
  secondaryButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
    borderColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  completedSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  completedTaskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  completedTaskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  completedTaskShop: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  completedTaskLocation: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  completedTaskItems: {
    marginBottom: 8,
  },
  completedTaskItem: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  completedTaskTime: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  completedTaskGPS: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'Inter-Regular',
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
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#FFFFFF',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  itemNameInput: {
    flex: 2,
  },
  itemQuantityInput: {
    flex: 1,
  },
  removeItemButton: {
    padding: 8,
    marginLeft: 8,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#2563EB',
    borderStyle: 'dashed',
    borderRadius: 8,
    gap: 8,
  },
  addItemButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  saveTaskButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveTaskButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});
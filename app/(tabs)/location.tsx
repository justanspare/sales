import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Navigation, Clock, CircleCheck as CheckCircle, Play, Square } from 'lucide-react-native';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

export default function LocationScreen() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentTask, setCurrentTask] = useState({
    id: '1',
    orderId: '#12345',
    customerName: 'John Smith',
    address: '123 Main St, Downtown',
    startTime: null as Date | null,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'web') {
      // Web geolocation API
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: Date.now(),
              accuracy: position.coords.accuracy,
            });
          },
          (error) => {
            setErrorMsg('Location access denied or unavailable');
          }
        );
      } else {
        setErrorMsg('Geolocation not supported by this browser');
      }
    } else {
      // Native platform location
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Location permission denied');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          timestamp: Date.now(),
          accuracy: currentLocation.coords.accuracy,
        });
      } catch (error) {
        setErrorMsg('Error getting location');
      }
    }
  };

  const startTracking = () => {
    setIsTracking(true);
    setCurrentTask(prev => ({ ...prev, startTime: new Date() }));
    
    if (Platform.OS === 'web') {
      // Web location tracking
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now(),
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.error('Location tracking error:', error);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );
      
      // Store watchId for cleanup
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      // Native location tracking would go here
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            timestamp: Date.now(),
            accuracy: newLocation.coords.accuracy,
          });
        }
      );
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
    Alert.alert(
      'Tracking Stopped',
      'Location tracking has been stopped. Task completed!',
      [{ text: 'OK' }]
    );
  };

  const completeDelivery = () => {
    if (!location) {
      Alert.alert('Error', 'Location not available. Please enable location services.');
      return;
    }

    Alert.alert(
      'Complete Delivery',
      `Confirm delivery completion at:\nLat: ${location.latitude.toFixed(6)}\nLng: ${location.longitude.toFixed(6)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            setIsTracking(false);
            Alert.alert('Success', 'Delivery completed successfully!');
          }
        }
      ]
    );
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getElapsedTime = () => {
    if (!currentTask.startTime) return '--:--';
    const now = new Date();
    const elapsed = now.getTime() - currentTask.startTime.getTime();
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Location Tracking</Text>
        <View style={[styles.statusIndicator, { backgroundColor: isTracking ? '#10B981' : '#64748B' }]}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            {isTracking ? 'TRACKING' : 'OFFLINE'}
          </Text>
        </View>
      </View>

      {errorMsg && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={requestLocationPermission}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.currentTaskCard}>
        <Text style={styles.cardTitle}>Current Task</Text>
        <Text style={styles.orderId}>{currentTask.orderId}</Text>
        <Text style={styles.customerName}>{currentTask.customerName}</Text>
        <View style={styles.addressContainer}>
          <MapPin size={16} color="#64748B" />
          <Text style={styles.address}>{currentTask.address}</Text>
        </View>
        
        <View style={styles.taskTimeInfo}>
          <View style={styles.timeItem}>
            <Clock size={16} color="#64748B" />
            <Text style={styles.timeLabel}>Start Time:</Text>
            <Text style={styles.timeValue}>{formatTime(currentTask.startTime)}</Text>
          </View>
          <View style={styles.timeItem}>
            <Clock size={16} color="#2563EB" />
            <Text style={styles.timeLabel}>Elapsed:</Text>
            <Text style={styles.timeValue}>{getElapsedTime()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.locationCard}>
        <Text style={styles.cardTitle}>Current Location</Text>
        {location ? (
          <View style={styles.locationInfo}>
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
            <Text style={styles.lastUpdate}>
              Last updated: {new Date(location.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        ) : (
          <View style={styles.noLocationContainer}>
            <MapPin size={48} color="#64748B" />
            <Text style={styles.noLocationText}>Location not available</Text>
          </View>
        )}
      </View>

      <View style={styles.controlsContainer}>
        {!isTracking ? (
          <TouchableOpacity style={styles.startButton} onPress={startTracking}>
            <Play size={20} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start Tracking</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={stopTracking}>
            <Square size={20} color="#FFFFFF" />
            <Text style={styles.stopButtonText}>Stop Tracking</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.completeButton, !location && styles.disabledButton]} 
          onPress={completeDelivery}
          disabled={!location}
        >
          <CheckCircle size={20} color="#FFFFFF" />
          <Text style={styles.completeButtonText}>Complete Delivery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.refreshButton} onPress={requestLocationPermission}>
          <Navigation size={20} color="#2563EB" />
          <Text style={styles.refreshButtonText}>Refresh Location</Text>
        </TouchableOpacity>
      </View>
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
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 16,
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  currentTaskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  address: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginLeft: 6,
    flex: 1,
  },
  taskTimeInfo: {
    gap: 8,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: 'Inter-SemiBold',
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locationInfo: {
    gap: 8,
  },
  coordinateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  noLocationContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noLocationText: {
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },
  controlsContainer: {
    padding: 20,
    gap: 12,
  },
  startButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  stopButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  completeButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  refreshButton: {
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
  refreshButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
  },
});
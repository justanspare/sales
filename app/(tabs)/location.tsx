import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Navigation, Clock, CircleCheck as CheckCircle, Play, Square, Loader, TriangleAlert as AlertTriangle } from 'lucide-react-native';
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

export default function LocationScreen() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);
  const [currentTask, setCurrentTask] = useState({
    id: '1',
    orderId: '#12345',
    customerName: 'John Smith',
    address: '123 Main St, Downtown',
    startTime: null as Date | null,
  });

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
      setCurrentTask(prev => ({ ...prev, startTime: new Date() }));

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
      'Location tracking has been stopped. Task completed!',
      [{ text: 'OK' }]
    );
  };

  const completeDelivery = () => {
    if (!location) {
      Alert.alert('Error', 'Location not available. Please enable location services.');
      return;
    }

    const addressInfo = location.address ? `\nAddress: ${location.address}` : '';
    
    Alert.alert(
      'Complete Delivery',
      `Confirm delivery completion at:\nLat: ${location.latitude.toFixed(6)}\nLng: ${location.longitude.toFixed(6)}${addressInfo}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            stopLocationTracking();
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Location Tracking</Text>
        <View style={[styles.statusIndicator, { backgroundColor: getLocationStatusColor() }]}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>
            {getLocationStatusText().toUpperCase()}
          </Text>
        </View>
      </View>

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

      <View style={styles.controlsContainer}>
        {!isTracking ? (
          <TouchableOpacity 
            style={[styles.startButton, (isLoading || error) && styles.disabledButton]} 
            onPress={startLocationTracking}
            disabled={isLoading || !!error}
          >
            <Play size={20} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start Continuous Tracking</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={handleStopTracking}>
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

        <TouchableOpacity 
          style={[styles.refreshButton, isLoading && styles.disabledButton]} 
          onPress={getCurrentLocation}
          disabled={isLoading}
        >
          <Navigation size={20} color="#2563EB" />
          <Text style={styles.refreshButtonText}>
            {isLoading ? 'Getting Location...' : 'Refresh Location'}
          </Text>
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
    borderRadius: 12,
    padding: 16,
    margin: 20,
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
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
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
    fontSize: 16,
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
    textAlign: 'center',
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
    borderColor: '#94A3B8',
  },
});
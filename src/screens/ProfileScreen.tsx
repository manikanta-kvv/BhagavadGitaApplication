import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavorites } from '../context/FavoritesContext';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('User');
  const { favorites, readCount, refreshFavorites } = useFavorites();
  const [expandedSloka, setExpandedSloka] = useState<number | null>(null);

  useEffect(() => {
    const loadUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username') || 'Arjunaa!';
        setUsername(storedUsername);
      } catch (error) {
        console.error('Error loading username:', error);
      }
    };
    loadUsername();
  }, []);

  const toggleExpand = (index: number) => {
    setExpandedSloka(expandedSloka === index ? null : index);
  };

  const removeFavorite = async (slokaId: string, chapter: number, verse: number) => {
    // Platform-specific alert styling
    const alertConfig = {
      title: "Remove from Favorites",
      message: `Are you sure you want to remove Chapter ${chapter}, Verse ${verse} from favorites?`,
      buttons: [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => console.log("Cancel Pressed")
        },
        {
          text: "Remove",
          style: Platform.OS === 'ios' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              const storedFavorites = await AsyncStorage.getItem('favorites');
              if (storedFavorites) {
                const favoritesArray = JSON.parse(storedFavorites);
                const newFavorites = favoritesArray.filter((fav: {id: string}) => fav.id !== slokaId);
                await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
                refreshFavorites(); // Refresh to update the UI
              }
            } catch (error) {
              console.error('Error removing favorite:', error);
            }
          }
        }
      ]
    };

    // Show the alert
    Alert.alert(
      alertConfig.title,
      alertConfig.message,
      alertConfig.buttons as Array<{
        text: string,
        style?: 'default' | 'cancel' | 'destructive',
        onPress?: () => void
      }>,
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {/* User Info Section */}
      <View style={styles.userSection}>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.statsText}>
          <Text style={styles.italicText}>You listened to </Text>
          <Text style={[styles.italicText, styles.boldText]}>Krishna </Text>
          <Text style={styles.boldText}>{readCount}</Text>
          <Text style={styles.italicText}> times</Text>
        </Text>
      </View>

      {/* Chapter-wise Section */}
      <TouchableOpacity 
        style={styles.chapterSection}
        onPress={() => navigation.navigate('ChapterList' as never)}
      >
        <Text style={styles.sectionTitle}>Chapter-wise Slokas</Text>
        <Text style={styles.sectionSubtitle}>View all 18 chapters</Text>
      </TouchableOpacity>

      {/* Favorites Section */}
      <View style={styles.favoritesSection}>
        <Text style={styles.sectionTitle}>Favorited Slokas</Text>
        {Array.isArray(favorites) && favorites.length > 0 ? (
          <ScrollView style={styles.favoritesList}>
            {favorites.map((sloka, index) => (
              <View key={sloka.id || index} style={styles.favoriteItem}>
                <View style={styles.favoriteHeaderContainer}>
                  <TouchableOpacity 
                    style={styles.favoriteHeader}
                    onPress={() => toggleExpand(index)}
                  >
                    <Text style={styles.favoriteTitle}>
                      Chapter {sloka.chapter}, Verse {sloka.verse}
                    </Text>
                    <Text style={styles.dropdownIcon}>
                      {expandedSloka === index ? '▼' : '▶'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeFavorite(sloka.id, sloka.chapter, sloka.verse)}
                  >
                    <Text style={styles.removeButtonText}>−</Text>
                  </TouchableOpacity>
                </View>
                
                {expandedSloka === index && (
                  <View style={styles.expandedContent}>
                    <View style={styles.slokaContent}>
                      <Text style={styles.slokaLabel}>Sanskrit:</Text>
                      <Text style={styles.sanskritText}>{sloka.sanskrit}</Text>
                    </View>
                    
                    <View style={styles.slokaContent}>
                      <Text style={styles.slokaLabel}>Pronunciation:</Text>
                      <Text style={styles.pronunciationText}>{sloka.pronunciation}</Text>
                    </View>
                    
                    <View style={styles.slokaContent}>
                      <Text style={styles.slokaLabel}>Meaning:</Text>
                      <Text style={styles.meaningText}>{sloka.meaning}</Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noFavoritesContainer}>
            <Text style={styles.noFavoritesText}>No favorites yet</Text>
            <Text style={styles.noFavoritesSubText}>Add them from the Home screen</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  userSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  statsText: {
    fontSize: 16,
    color: colors.textLight,
  },
  favoritesSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  favoritesList: {
    flex: 1,
  },
  favoriteItem: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  favoriteHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  favoriteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  dropdownIcon: {
    fontSize: 16,
    color: '#4CAF50',
  },
  expandedContent: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  slokaContent: {
    marginBottom: 10,
  },
  slokaLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  sanskritText: {
    fontSize: 16,
    marginBottom: 5,
  },
  pronunciationText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 5,
  },
  meaningText: {
    fontSize: 14,
    color: '#333',
  },
  favoriteEmptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  chapterSection: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textLight,
    marginBottom: 8,
    textAlign: 'center'
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    opacity: 0.8,
  },
  noFavoritesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: colors.card,
    borderRadius: 10,
    marginTop: 10,
  },
  noFavoritesText: {
    fontSize: 18,
    color: colors.textLight,
    fontWeight: '500',
    marginBottom: 8,
  },
  noFavoritesSubText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    opacity: 0.8,
  },
  removeButton: {
    padding: 15,
    paddingLeft: 0,
  },
  removeButtonText: {
    fontSize: 24,
    color: colors.error,
    fontWeight: 'bold',
    marginRight: 15,
  },
  italicText: {
    fontStyle: 'italic',
  },
  boldText: {
    fontWeight: 'bold',
    color: colors.text,
  },
}); 
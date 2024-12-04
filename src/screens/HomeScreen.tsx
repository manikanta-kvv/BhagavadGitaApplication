import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, AppState, AppStateStatus } from 'react-native';
import FlipCard from 'react-native-flip-card';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllSlokas, getChapterSlokas } from '../utils/slokaUtils';
import { useFavorites } from '../context/FavoritesContext';
import { colors } from '../theme/colors';

export default function HomeScreen() {
  const [currentSlokaIndex, setCurrentSlokaIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(1);
  const { refreshFavorites, updateReadCount, favorites } = useFavorites();
  const [appStateVisible, setAppStateVisible] = useState(AppState.currentState);
  const [lastActiveTime, setLastActiveTime] = useState<number>(Date.now());
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const allSlokas = getAllSlokas();

  const currentSloka = allSlokas.slokas[currentSlokaIndex];

  // Add this new useEffect for AppState monitoring
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);
  // Add this new handler
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    setAppStateVisible(nextAppState);
    
    if (nextAppState === 'active') {
      const currentTime = Date.now();
      const inactiveTime = currentTime - lastActiveTime;
      const thirtyMinutes = 1 * 60 * 1000; // 30 minutes in milliseconds
      
      // Check if inactive for 30 minutes or date changed
      const currentDate = new Date().toISOString().split('T')[0];
      const lastVisitDate = await AsyncStorage.getItem('lastVisitDate');
      
      if (inactiveTime > thirtyMinutes || currentDate !== lastVisitDate) {
        console.log('App became active after inactivity or date change');
        await getDailySloka();
      }
    } else if (nextAppState === 'background') {
      setLastActiveTime(Date.now());
    }
  };
  

  // Check if current sloka is in favorites when index changes
  useEffect(() => {
    checkIfFavorite();
    if (currentSloka?.id && isInitialLoad) {
      console.log('Not Updating read count for initial load:', currentSloka.id);
      // updateReadCount(currentSloka.id);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, currentSloka?.id]);

  // Reset hasUpdatedReadCount when sloka index changes
  useEffect(() => {
    if (!isInitialLoad && currentSloka?.id) {
      console.log('Updating read count for sloka index change:', currentSloka.id);
      updateReadCount(currentSloka.id);
    }
  }, [currentSlokaIndex]);

  const checkIfFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites');
      if (favorites) {
        const favoritesArray = JSON.parse(favorites);
        setIsFavorite(favoritesArray.some((fav: {id: string}) => fav.id === currentSloka.id));
      }
    } catch (error) {
      console.error('Error checking favorites:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const favorites = await AsyncStorage.getItem('favorites') || '[]';
      const favoritesArray = JSON.parse(favorites);
      if (isFavorite) {
        const newFavorites = favoritesArray.filter((fav: {id: string}) => fav.id !== currentSloka.id);
        await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      } else {
        favoritesArray.push(currentSloka);
        await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray));
      }
      setIsFavorite(!isFavorite);
      await refreshFavorites();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const showRandomSloka = () => {
    const totalSlokas = allSlokas.slokas.length;
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * totalSlokas);
    } while (newIndex === currentSlokaIndex && totalSlokas > 1);
    setCurrentSlokaIndex(newIndex);
  };

  const showChapterSlokas = (chapterNum: number) => {
    const chapterSlokas = getChapterSlokas(chapterNum);
    setCurrentChapter(chapterNum);
    setCurrentSlokaIndex(0); // Reset to first sloka of the chapter
  };

  const getDailySloka = async () => {
    try {
      // Get current device date (will update when device date changes)
      const currentDate = new Date();
      const today = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      // Log for testing
      console.log('Current device date:', today);
      
      const lastVisitDate = await AsyncStorage.getItem('lastVisitDate');
      console.log('Last visit date:', lastVisitDate);
      
      const visitedSlokas = JSON.parse(await AsyncStorage.getItem('visitedSlokas') || '[]');

      // If it's a new day or first time
      if (lastVisitDate !== today) {
        console.log('New day detected, changing sloka...');
        
        let unvisitedSlokas = allSlokas.slokas.filter(
          sloka => !visitedSlokas.includes(sloka.id)
        );
        
        // If all slokas have been shown, reset visited slokas
        if (unvisitedSlokas.length === 0) {
          console.log('All slokas visited, resetting list...');
          await AsyncStorage.setItem('visitedSlokas', '[]');
          unvisitedSlokas = allSlokas.slokas;
        }
        
        // Get random sloka from unvisited ones
        const randomIndex = Math.floor(Math.random() * unvisitedSlokas.length);
        const dailySloka = unvisitedSlokas[randomIndex];
        
        // Update storage
        await AsyncStorage.setItem('lastVisitDate', today);
        await AsyncStorage.setItem('currentDailySloka', dailySloka.id);
        visitedSlokas.push(dailySloka.id);
        await AsyncStorage.setItem('visitedSlokas', JSON.stringify(visitedSlokas));
        
        // Update UI
        const slokaIndex = allSlokas.slokas.findIndex(s => s.id === dailySloka.id);
        setCurrentSlokaIndex(slokaIndex);
        console.log('New sloka set:', dailySloka.id);
      } else {
        console.log('Same day, loading saved sloka...');
        // Load saved daily sloka
        const dailySlokaId = await AsyncStorage.getItem('currentDailySloka');
        if (dailySlokaId) {
          const slokaIndex = allSlokas.slokas.findIndex(s => s.id === dailySlokaId);
          setCurrentSlokaIndex(slokaIndex);
        }
      }
    } catch (error) {
      console.error('Error getting daily sloka:', error);
    }
  };

  useEffect(() => {
    getDailySloka();
  }, []); // Empty dependency array means it runs once on mount

  return (
    <View style={styles.container}>
      {/* Image Section */}
      <View style={styles.imageSection}>
        <Image
          source={require('../../assets/gitaHomePage.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Flip Card Section */}
      <View style={styles.cardSection}>
        <FlipCard
          style={styles.card}
          friction={6}
          perspective={1000}
          flipHorizontal={true}
          flipVertical={false}
          clickable={true}
          flip={isFlipped}
        >
          {/* Face Side */}
          <View style={styles.cardFace}>
            <Text style={styles.sanskritText}>{currentSloka.sanskrit}</Text>
            <Text style={styles.pronunciationText}>{currentSloka.pronunciation}</Text>
            <View style={styles.verseIndicator}>
              <Text style={styles.verseText}>
                Ch.{currentSloka.chapter} • V.{currentSloka.verse}
              </Text>
            </View>
          </View>
          
          {/* Back Side */}
          <View style={styles.cardBack}>
            <Text style={styles.meaningText}>{currentSloka.meaning}</Text>
            <View style={styles.verseIndicator}>
              <Text style={styles.verseText}>
                Ch.{currentSloka.chapter} • V.{currentSloka.verse}
              </Text>
            </View>
          </View>
        </FlipCard>
      </View>

      {/* Controls Section */}
      <View style={styles.controlsSection}>
        <TouchableOpacity 
          style={[styles.button, styles.favoriteButton]}
          onPress={toggleFavorite}
        >
          {isFavorite ? (
            <Text style={styles.buttonText}>❤️</Text>
          ) : (
            <Image 
              source={require('../../assets/favorite_border.png')}
              style={styles.iconStyle}
            />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.nextButton]}
          onPress={showRandomSloka}
        >
          <Image 
            source={require('../../assets/nextIcon.png')}
            style={styles.iconStyle}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.flipButton]}
          onPress={() => setIsFlipped(!isFlipped)}
        >
          <Image 
            source={require('../../assets/flipIcon2.png')}
            style={styles.iconStyle}
          />
        </TouchableOpacity>
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
  imageSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '300%',
    height: '240%',
    maxHeight: 220,
  },
  cardSection: {
    flex: 2,
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
  card: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 20,
  },
  cardFace: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingBottom: 40,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  cardBack: {
    flex: 1,
    backgroundColor: colors.cardBack,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingBottom: 40,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  sanskritText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: colors.text,
    flexShrink: 1,
    width: '100%',
    lineHeight: 30,
  },
  pronunciationText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: colors.textLight,
    marginTop: 10,
    marginBottom: 10,
    flexShrink: 1,
    width: '100%',
    lineHeight: 24,
  },
  meaningText: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.text,
    flexShrink: 1,
    width: '100%',
    lineHeight: 24,
  },
  controlsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteButton: {
    backgroundColor: colors.primary,
  },
  nextButton: {
    backgroundColor: colors.accent,
  },
  flipButton: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  verseIndicator: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: colors.accent + '20',
    padding: 5,
    borderRadius: 5,
    zIndex: 1,
  },
  verseText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
  },
  iconStyle: {
    width: 24,
    height: 24,
    tintColor: colors.text,
  },
}); 
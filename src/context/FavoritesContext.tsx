import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesContextType {
  favorites: any[];
  refreshFavorites: () => Promise<void>;
  readCount: number;
  updateReadCount: (slokaId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  refreshFavorites: async () => {},
  readCount: 0,
  updateReadCount: async () => {}
});

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [readCount, setReadCount] = useState(0);

  const refreshFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      const readSlokas = await AsyncStorage.getItem('readSlokas');
      
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      if (readSlokas) {
        const readSlokasArray = JSON.parse(readSlokas);
        setReadCount(readSlokasArray.length);
      }
    } catch (error) {
      console.error('Error refreshing favorites:', error);
    }
  };

  const updateReadCount = async (slokaId: string) => {
    try {
      const readSlokas = await AsyncStorage.getItem('readSlokas') || '[]';
      const readSlokasArray = JSON.parse(readSlokas);
      
      if (!readSlokasArray.includes(slokaId)) {
        readSlokasArray.push(slokaId);
        await AsyncStorage.setItem('readSlokas', JSON.stringify(readSlokasArray));
        setReadCount(readSlokasArray.length);
      }
    } catch (error) {
      console.error('Error updating read count:', error);
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, []);

  return (
    <FavoritesContext.Provider value={{ 
      favorites, 
      refreshFavorites, 
      readCount,
      updateReadCount 
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext); 
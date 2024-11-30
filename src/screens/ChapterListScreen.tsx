import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { colors } from '../theme/colors';
import slokas from '../data/slokas.json';

export default function ChapterListScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  return (
    <View style={styles.container}>
      <ScrollView>
        {slokas.chapters.map((chapter) => (
          <TouchableOpacity
            key={chapter.number}
            style={styles.chapterCard}
            onPress={() => navigation.navigate('ChapterDetail', {
              chapterNumber: chapter.number,
              chapterName: chapter.name
            })}
          >
            <Text style={styles.chapterTitle}>
              Chapter {chapter.number} - {chapter.name}
            </Text>
            <Text style={styles.chapterDescription}>{chapter.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  chapterCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  chapterDescription: {
    fontSize: 14,
    color: colors.textLight,
  },
}); 
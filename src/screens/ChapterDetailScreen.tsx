import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { getChapterSlokas } from '../utils/slokaUtils';

export default function ChapterDetailScreen({ route }: { route: { params: { chapterNumber: number; chapterName: string } } }) {
  const { chapterNumber, chapterName } = route.params;
  const chapterSlokas = getChapterSlokas(chapterNumber);

  return (
    <View style={styles.container}>
      <Text style={styles.chapterHeader}>
        Chapter {chapterNumber} - {chapterName}
      </Text>
      <ScrollView style={styles.slokasContainer}>
        {chapterSlokas.map((sloka) => (
          <View key={sloka.id} style={styles.slokaCard}>
            <Text style={styles.verseNumber}>Verse {sloka.verse}</Text>
            <View style={styles.textContainer}>
              <Text style={styles.sanskritText}>{sloka.sanskrit}</Text>
              <View style={styles.divider} />
              <Text style={styles.pronunciationText}>{sloka.pronunciation}</Text>
              <View style={styles.divider} />
              <Text style={styles.meaningText}>{sloka.meaning}</Text>
            </View>
          </View>
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
  chapterHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  slokasContainer: {
    flex: 1,
  },
  slokaCard: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  verseNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  textContainer: {
    width: '100%',
  },
  sanskritText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: colors.text,
    lineHeight: 30,
  },
  pronunciationText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: colors.textLight,
    marginBottom: 12,
    lineHeight: 24,
  },
  meaningText: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.text,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 12,
    width: '100%',
  },
}); 
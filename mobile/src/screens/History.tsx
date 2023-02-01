import { useState } from 'react';
import { Heading, SectionList, Text, VStack } from 'native-base';
import { ScreenHeader } from '@components/ScreenHeader';
import { HistoryCard } from '@components/HistoryCard';

function EmptyList() {
  return (
    <Text color="gray.100" textAlign="center">
      Não há exercícios registrados ainda.{'\n'}
      Vamos fazer exercícios hoje?
    </Text>
  );
}

export function History() {
  const [exercises, setExercises] = useState([
    {
      title: '26.08.22',
      data: ['Puxada frontal', 'Remada unilateral'],
    },
    {
      title: '27.08.22',
      data: ['Puxada frontal'],
    },
  ]);

  return (
    <VStack flex={1}>
      <ScreenHeader title="Histórico de Exercícios" />

      <SectionList
        sections={exercises}
        keyExtractor={item => item}
        renderSectionHeader={({ section }) => (
          <Heading color="gray.200" fontSize="md" mt={10} mb={3} fontFamily="heading">{section.title}</Heading>
        )}
        renderItem={({ item }) => (
          <HistoryCard />
        )}
        ListEmptyComponent={EmptyList}
        px={8}
        contentContainerStyle={!exercises.length && { flex: 1, justifyContent: 'center' }}
      />
    </VStack>
  );
}

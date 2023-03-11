import { useCallback, useState } from 'react';
import { Heading, SectionList, Text, useToast, VStack } from 'native-base';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenHeader } from '@components/ScreenHeader';
import { HistoryCard } from '@components/HistoryCard';
import { api } from '@services/api';
import { HistoryByDayDTO } from '@dtos/HistoryByDayDTO';
import { AppError } from '@utils/AppError';

function EmptyList() {
  return (
    <Text color="gray.100" textAlign="center">
      Não há exercícios registrados ainda.{'\n'}
      Vamos fazer exercícios hoje?
    </Text>
  );
}

export function History() {
  const [exercises, setExercises] = useState<HistoryByDayDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToast();

  async function fetchHistory() {
    try {
      setIsLoading(true);

      const response = await api.get('/history');
      setExercises(response.data);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível carregar o histórico.'
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      });
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(useCallback(() => {
    fetchHistory();
  }, []));

  return (
    <VStack flex={1}>
      <ScreenHeader title="Histórico de Exercícios" />

      <SectionList
        sections={exercises}
        keyExtractor={item => item.id}
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

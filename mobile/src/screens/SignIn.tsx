import { Center, Heading, Image, Text, VStack, ScrollView } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { useAuth } from '@hooks/useAuth';
import BackgroundImg from '@assets/background.png';
import LogoSvg from '@assets/logo.svg';

import type { AuthNavigatorRoutesProps } from '@routes/auth.routes';

type FormData = {
  email: string;
  password: string;
}

export function SignIn() {
  const navigation = useNavigation<AuthNavigatorRoutesProps>();
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>()
  const { signIn } = useAuth();

  function handleNewAccount() {
    navigation.navigate('signUp');
  }

  async function handleSignIn({ email, password }: FormData) {
    await signIn(email, password);
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <VStack flex={1} px={10} pb={16}>
        <Image
          defaultSource={BackgroundImg}
          source={BackgroundImg}
          alt="Pessoas treinando."
          resizeMode="contain"
          position="absolute"
        />

        <Center my={24}>
          <LogoSvg />

          <Text color="gray.100" fontSize="sm">
            Treine sua mente e seu corpo.
          </Text>
        </Center>

        <Center>
          <Heading
            color="gray.100"
            fontSize="xl"
            mb={6}
            fontFamily="heading"
          >
            Acesse sua conta
          </Heading>

          <Controller
            control={control}
            name="email"
            rules={{ required: 'Informe o e-mail' }}
            render={({ field: { onChange } }) => (
              <Input
                placeholder="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                errorMessage={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{ required: 'Informe a senha' }}
            render={({ field: { onChange } }) => (
              <Input
                placeholder="Senha"
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Button title="Acessar" onPress={handleSubmit(handleSignIn)} />
        </Center>

        <Center mt={24}>
          <Text color="gray.100" fontSize="sm" mb={3} fontFamily="body">
            Ainda não tem acesso?
          </Text>

          <Button title="Criar conta" variant="outline" onPress={handleNewAccount} />
        </Center>
      </VStack>
    </ScrollView>
  );
}

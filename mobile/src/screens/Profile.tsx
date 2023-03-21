import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Center, Heading, ScrollView, Skeleton, Text, useToast, VStack } from 'native-base';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ScreenHeader } from '@components/ScreenHeader';
import { UserPhoto } from '@components/UserPhoto';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { api } from '@services/api';
import { AppError } from '@utils/AppError';
import { useAuth } from '@hooks/useAuth';

const PHOTO_SIZE = 33;

type FormDataProps = {
  email: string;
  name: string;
  password: string;
  old_password: string;
  confirmPassword: string;
};

const profileSchema = yup.object({
  name: yup
    .string()
    .required('Informe o nome.'),
  password: yup
    .string()
    .min(6, 'A senha deve ter pelo menos 6 dígitos.')
    .nullable()
    .transform(value => {
      return !!value ? value : null;
    }),
  confirmPassword: yup
    .string()
    .nullable()
    .transform(value => {
      return !!value ? value : null;
    })
    .oneOf([yup.ref('password'), null], 'A confirmação de senha não confere.')
    .when('password', {
      is: (field: string | null) => field,
      then: yup
        .string()
        .nullable()
        .required('Informe a confirmação da senha.')
        .transform(value => {
          return !!value ? value : null;
        }),
    }),
})

export function Profile() {
  const [isUpdating, setUpdating] = useState(false);
  const [photoIsLoading, setPhotoIsLoading] = useState(false);
  const [userPhoto, setUserPhoto] = useState('https://github.com/ceduardogodoi.png');

  const toast = useToast();
  const { user, updateUserProfile } = useAuth();
  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    defaultValues: {
      name: user.name,
      email: user.email,
    },
    resolver: yupResolver(profileSchema),
  });

  async function handleUserPhotoSelect() {
    setPhotoIsLoading(true);

    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,
      });

      if (!photoSelected.canceled) {
        const photoInfo = await FileSystem.getInfoAsync(photoSelected.assets[0].uri);
        if (photoInfo.size && photoInfo.size / 1024 / 1024 > 3) {
          toast.show({
            title: 'Essa imagem é muito grande. Escolha uma de até 3MB.',
            placement: 'top',
            bgColor: 'red.500',
          })
        } else {
          const fileExtension = photoSelected.assets[0].uri.split('.').pop();
          const photoFile = {
            name: `${user.name}.${fileExtension}`.toLowerCase(),
            uri: photoSelected.assets[0].uri,
            type: `${photoSelected.assets[0].type}/${fileExtension}`,
          } as any;

          const userPhotoUploadForm = new FormData();
          userPhotoUploadForm.append('avatar', photoFile);

          await api.patch('/users/avatar', userPhotoUploadForm, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          toast.show({
            title: 'Foto atualizada.',
            placement: 'top',
            bgColor: 'green.500',
          });
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setPhotoIsLoading(false);
    }
  }

  async function handleProfileUpdate(data: FormDataProps) {
    try {
      setUpdating(true);

      const userUpdated = user;
      userUpdated.name = data.name;

      await api.put('/users', data);

      await updateUserProfile(userUpdated);

      toast.show({
        title: 'Perfil atualizado com sucesso.',
        placement: 'top',
        bgColor: 'green.500',
      });
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível atualizar dados. Tente novamente mais tarde.';

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      });
    } finally {
      setUpdating(false);
    }
  }

  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />

      <ScrollView contentContainerStyle={{
        paddingBottom: 36
      }}>
        <Center mt={6} px={10}>
          {photoIsLoading ? (
            <Skeleton
              w={PHOTO_SIZE}
              h={PHOTO_SIZE}
              rounded="full"
              startColor="gray.500"
              endColor="gray.400"
            />
          ) : (
            <UserPhoto
              source={{ uri: userPhoto }}
              alt="Foto do usuário"
              size={PHOTO_SIZE}
            />
          )}
          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text color="green.500" fontWeight="bold" fontSize="md" mt={2} mb={8}>
              Alterar foto
            </Text>
          </TouchableOpacity>

          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange } }) => (
              <Input
                placeholder='Nome'
                bg="gray.600"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <Input
                placeholder='E-mail'
                bg="gray.600"
                isDisabled
                onChangeText={onChange}
                value={value}
              />
            )}
          />

          <Heading
            color="gray.200"
            fontSize="md"
            fontFamily="heading"
            mb={2}
            alignSelf="flex-start"
            mt={12}
          >
            Alterar senha
          </Heading>

          <Controller
            control={control}
            name="old_password"
            render={({ field: { onChange } }) => (
              <Input
                placeholder="Senha antiga"
                bg="gray.600"
                secureTextEntry
                onChangeText={onChange}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange } }) => (
              <Input
                placeholder="Nova senha"
                bg="gray.600"
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange } }) => (
              <Input
                placeholder="Confirme a nova senha"
                bg="gray.600"
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.confirmPassword?.message}
              />
            )}
          />

          <Button
            title="Atualizar"
            mt={4}
            onPress={handleSubmit(handleProfileUpdate)}
            isLoading={isUpdating}
          />
        </Center>
      </ScrollView>
    </VStack>
  );
}

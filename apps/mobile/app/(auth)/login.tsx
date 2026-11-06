import { Button, TextInput, View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm } from 'react-hook-form';
import { generateCaptcha } from '../services/api';

export default function LoginScreen({
  navigation,
  route,
}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [captcha, setCaptcha] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const onLogin = async (data: { email: string; password: string; captcha: string }) => {
    setIsLoading(true);
    try {
      const response = await generateCaptcha(data.email, data.password, data.captcha);
      // Handle login response - will be handled by API service
      if (response.success) {
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('Login Failed', response.message);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      
      <TextInput
        placeholder="Email or Username"
        style={styles.input}
        {...register('email', { required: true })}>
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
      </TextInput>
      
      <TextInput
        placeholder="Password"
        style={styles.input}
        type="password"
        {...register('password', { required: true })}>
        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
      </TextInput>
      
      <TextInput
        placeholder="CAPTCHA"
        style={styles.input}
        value={captcha}
        onChangeText={setCaptcha}
        {...register('captcha', { required: true })}>
        {errors.captcha && <Text style={styles.error}>{errors.captcha.message}</Text>}
      </TextInput>
      
      <Button title="Login" loading={isLoading} onPress={onLogin} disabled={isLoading} />
      
      <Button
        title="Register"
        onPress={() => navigation.navigate('Register')}
        style={styles.linkButton}
      />
      
      <Button
        title="Forgot Password?"
        onPress={() => {}}
        style={styles.linkButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#1a1a2e',
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  linkButton: {
    marginVertical: 5,
    backgroundColor: 'transparent',
    padding: 0,
  },
});
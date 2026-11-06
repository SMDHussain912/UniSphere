import { Button, TextInput, View, StyleSheet, Alert, useNavigation } from 'react-native';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';

export default function RegisterScreen({
  navigation,
}) {
  const { register, handleSubmit, reset } = useForm();
  
  const onRegister = async (data: {
    fullname: { firstname: string; lastname?: string };
    email: string;
    password: string;
    phone?: string;
    dob?: string;
    gender?: string;
    qualification?: string;
    captcha: string;
  }) => {
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          fullname: data.fullname.firstname,
          lastname: data.fullname.lastname || '',
          email: data.email,
          password: data.password,
          phone: data.phone || '',
          dob: data.dob || '',
          gender: data.gender || '',
          qualification: data.qualification || '',
          captcha: data.captcha,
        }),
      });
      const result = await response.json();
      if (result.success) {
        Alert.alert('Success', 'Registration successful! Please login.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Registration Failed', result.message || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Registration failed');
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      <TextInput
        placeholder="First Name"
        style={styles.input}
        {...register('fullname', { valueAsDate: undefined, required: true })} />
      
      <TextInput
        placeholder="Last Name (optional)"
        style={styles.input}
        {...register('lastname')}>
      </TextInput>
      
      <TextInput
        placeholder="Email"
        style={styles.input}
        keyboardType="email"
        {...register('email', { required: true })}>
        {register('email') && errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
      </TextInput>
      
      <TextInput
        placeholder="Password"
        style={styles.input}
        type="password"
        {...register('password', { required: true })}>
        {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
      </TextInput>
      
      <TextInput
        placeholder="Phone (optional)"
        style={styles.input}
        {...register('phone')}>
      </TextInput>
      
      <TextInput
        placeholder="Date of Birth (optional)"
        style={styles.input}
        {...register('dob')}>
      </TextInput>
      
      <TextInput
        placeholder="Gender (optional)"
        style={styles.input}
        {...register('gender')}>
      </TextInput>
      
      <TextInput
        placeholder="Qualification (optional)"
        style={styles.input}
        {...register('qualification')}>
      </TextInput>
      
      <TextInput
        placeholder="CAPTCHA"
        style={styles.input}
        {...register('captcha', { required: true })}>
        {errors.captcha && <Text style={styles.error}>{errors.captcha.message}</Text>}
      </TextInput>
      
      <Button title="Register" onPress={onRegister} disabled={isSubmitting} />
      
      <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
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
});
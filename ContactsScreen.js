import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const ContactsScreen = ({ navigation }) => {
  const handleChatPress = () => {
    navigation.navigate('ChatScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contacts</Text>
      {/* Display list of contacts here. Link with firebase. */}
      <Button title="Chat with User" onPress={handleChatPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default ContactsScreen;

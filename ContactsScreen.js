import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const ContactScreen = ({ navigation }) => {
  const contacts = [
    { id: '1', name: 'Driver 1' },
    { id: '2', name: 'Customer 7' },
    { id: '3', name: 'Manager' },
  ];

  const handleContactPress = (contact) => {
    navigation.navigate('ChatScreen', { contactName: contact.name });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contacts</Text>
      <FlatList
        data={contacts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleContactPress(item)}>
            <Text style={styles.contactName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 50,
    paddingLeft: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  contactItem: {
    backgroundColor: 'red',
    padding: 20,
    marginBottom: 10,
    borderRadius: 10,
  },
  contactName: {
    fontSize: 18,
    color: 'white',
  },
});

export default ContactScreen;

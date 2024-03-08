import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const ContactScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [contacts, setContacts] = useState([
    { id: '1', name: 'Alex', email: 'alex@example.com' },
    { id: '2', name: 'Bridgette', email: 'bridgette@example.com' },
    { id: '3', name: 'Connor', email: 'connor@example.com' },
    // Add more contacts as needed
  ]);

  const handleGroupChatPress = () => {
    navigation.navigate('ChatScreen');
  };

  const handleContactPress = (contact) => {
    navigation.navigate('ChatScreen', { contactName: contact.name });
  };

  const handleSearch = () => {
    // Perform search logic here, filter contacts based on searchText
    // For simplicity, we'll just filter contacts by name containing searchText
    const filteredContacts = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchText.toLowerCase())
    );
    return filteredContacts;
  };

  const renderContactItem = ({ item }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => handleContactPress(item)}>
      <Text style={styles.contactName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <TouchableOpacity
        style={[styles.groupChatButton, { backgroundColor: 'red' }]}
        onPress={handleGroupChatPress}>
        <Text style={styles.buttonText}>Group Chat</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Contacts</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search Contacts"
        value={searchText}
        onChangeText={setSearchText}
      />
      <FlatList
        data={handleSearch()}
        renderItem={renderContactItem}
        keyExtractor={item => item.id}
        style={styles.contactList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  groupChatButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  contactList: {
    flex: 1,
  },
  contactItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  contactName: {
    fontSize: 16,
  },
});

export default ContactScreen;

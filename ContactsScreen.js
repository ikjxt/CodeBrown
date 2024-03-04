import React from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet } from 'react-native';

const ContactScreen = ({ navigation }) => {
  const contacts = [
    { id: '1', name: 'Alex' },
    { id: '2', name: 'Bridgette' },
    { id: '3', name: 'Connor' },
    { id: '4', name: 'Dole' },
    { id: '5', name: 'Eva' },
    { id: '6', name: 'Evelynn' },
    { id: '7', name: 'Anthony' },
    { id: '8', name: 'Henry' },
    { id: '9', name: 'Ivy' },
    { id: '10', name: 'Olaf' },
    { id: '11', name: 'North' },
    { id: '12', name: 'Olivia' },
    { id: '13', name: 'Peter' },
    { id: '14', name: 'Vivian' },
    { id: '15', name: 'William' },
    { id: '16', name: 'Zoe' },
  ];

  const handleContactPress = (contact) => {
    navigation.navigate('ChatScreen', { contactName: contact.name });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => handleContactPress(item)}>
      <View style={styles.contactNameContainer}>
        <Text style={styles.contactName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const contactsData = contacts.reduce((acc, contact) => {
    const sectionKey = contact.name.charAt(0).toUpperCase();
    if (!acc[sectionKey]) {
      acc[sectionKey] = [];
    }
    acc[sectionKey].push(contact);
    return acc;
  }, {});

  const sections = Object.keys(contactsData)
    .sort()
    .map(sectionKey => ({
      title: sectionKey,
      data: contactsData[sectionKey],
    }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contacts</Text>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingLeft: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contactItem: {
    marginBottom: 10,
  },
  contactNameContainer: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 10,
  },
  contactName: {
    fontSize: 16,
    color: 'white',
  },
});

export default ContactScreen;
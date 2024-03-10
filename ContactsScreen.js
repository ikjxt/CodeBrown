import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Modal } from 'react-native';

const ContactScreen = ({ navigation }) => {
    const [searchText, setSearchText] = useState('');
    const [contacts, setContacts] = useState([
        { id: '1', name: 'Alex', email: 'alex@example.com' },
        { id: '2', name: 'Bridgette', email: 'bridgette@example.com' },
        { id: '3', name: 'Connor', email: 'connor@example.com' },
        // Add more contacts as needed
    ]);
    const [newContactName, setNewContactName] = useState('');
    const [newContactEmail, setNewContactEmail] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    const handleGroupChatPress = () => {
        navigation.navigate('ChatScreen');
    };

    const handleContactPress = (contact) => {
        setSelectedContact(contact);
        setModalVisible(true);
    };

    const handleSearch = () => {
        const filteredContacts = contacts.filter(contact =>
            contact.name.toLowerCase().includes(searchText.toLowerCase())
        );
        return filteredContacts;
    };

    const handleAddContact = () => {
        if (newContactName && newContactEmail) {
            const newId = String(contacts.length + 1); // Simple ID generation
            const newContact = { id: newId, name: newContactName, email: newContactEmail };
            setContacts([...contacts, newContact]);
            setNewContactName('');
            setNewContactEmail('');
        } else {
            Alert.alert('Missing Information', 'Please enter both a name and an email for the new contact.');
        }
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
                style={styles.groupChatButton}
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
            <TextInput
                style={styles.input}
                placeholder="New Contact's Name"
                value={newContactName}
                onChangeText={setNewContactName}
            />
            <TextInput
                style={styles.input}
                placeholder="New Contact's Email"
                value={newContactEmail}
                onChangeText={setNewContactEmail}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
                <Text style={styles.buttonText}>Add Contact</Text>
            </TouchableOpacity>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        {selectedContact && (
                            <>
                                <Text style={styles.modalText}>Name: {selectedContact.name}</Text>
                                <Text style={styles.modalText}>Email: {selectedContact.email}</Text>
                            </>
                        )}
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(!modalVisible)}
                        >
                            <Text style={styles.textStyle}>Hide</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        backgroundColor: '#e74c3c',
    },
    buttonText: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    searchInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    addButton: {
        backgroundColor: '#e74c3c',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 20,
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
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    // Add any other styles you may have
});

export default ContactScreen;

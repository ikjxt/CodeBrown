import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal } from 'react-native';
import { getFirestore, collection, query, onSnapshot } from 'firebase/firestore';

const ContactScreen = ({ navigation }) => {
    const [searchText, setSearchText] = useState('');
    const [contacts, setContacts] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    useEffect(() => {
        const db = getFirestore();
        const unsubscribe = onSnapshot(query(collection(db, 'USERS')), (snapshot) => {
            const fetchedContacts = snapshot.docs.map(doc => ({
                id: doc.id,
                name: `${doc.data().firstName} ${doc.data().lastName}`,
                email: doc.data().email,
                firstName: doc.data().firstName,
                lastName: doc.data().lastName
            }));
            setContacts(fetchedContacts);
        });

        return () => unsubscribe();
    }, []);

    const handleGroupChatPress = () => {
        navigation.navigate('ChatScreen');
    };

    const handleContactPress = (contact) => {
        setSelectedContact(contact);
        setModalVisible(true);
    };

    const handleSearch = () => {
        return contacts.filter(contact =>
            contact.name.toLowerCase().includes(searchText.toLowerCase())
        );
    };

    const renderContactItem = ({ item }) => (
        <TouchableOpacity style={styles.contactItem} onPress={() => handleContactPress(item)}>
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
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        {selectedContact && (
                            <>
                                <Text style={styles.modalText}>Name: {selectedContact.firstName} {selectedContact.lastName}</Text>
                                <Text style={styles.modalText}>Email: {selectedContact.email}</Text>
                            </>
                        )}
                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(!modalVisible)}
                        >
                            <Text style={styles.textStyle}>Close</Text>
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
        marginTop: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
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
        backgroundColor: '#e74c3c',
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    }
});

export default ContactScreen;

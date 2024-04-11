import { TouchableWithoutFeedback } from '@gorhom/bottom-sheet';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Modal, SafeAreaView, Keyboard } from 'react-native';

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
            style={styles.suggestion}
            onPress={() => handleContactPress(item)}>
            <Text style={styles.contactName}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.content}>

                    <Text style={styles.headerText}>Messages</Text>
                    <TouchableOpacity style={styles.startButton} onPress={handleGroupChatPress}>
                        <Text style={styles.buttonText}>Group Chat</Text>
                    </TouchableOpacity>

                    <Text style={styles.headerText}>Contacts</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Search Contacts"
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholderTextColor="#888"
                    />
                    <FlatList
                        data={handleSearch()}
                        renderItem={renderContactItem}
                        keyExtractor={item => item.id}
                        style={styles.suggestionsList}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="New Contact's Name"
                        value={newContactName}
                        onChangeText={setNewContactName}
                        placeholderTextColor="#888"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="New Contact's Email"
                        value={newContactEmail}
                        onChangeText={setNewContactEmail}
                        placeholderTextColor="#888"
                    />
                    <TouchableOpacity style={styles.startButton} onPress={handleAddContact}>
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
            </TouchableWithoutFeedback>
        </SafeAreaView>


        // <View style={styles.container}>
        //     <Text style={styles.title}>Messages</Text>
        //     <TouchableOpacity
        //         style={styles.groupChatButton}
        //         onPress={handleGroupChatPress}>
        //         <Text style={styles.buttonText}>Group Chat</Text>
        //     </TouchableOpacity>
        //     <Text style={styles.title}>Contacts</Text>
        //     <TextInput
        //         style={styles.searchInput}
        //         placeholder="Search Contacts"
        //         value={searchText}
        //         onChangeText={setSearchText}
        //     />
        //     <FlatList
        //         data={handleSearch()}
        //         renderItem={renderContactItem}
        //         keyExtractor={item => item.id}
        //         style={styles.contactList}
        //     />
        //     <TextInput
        //         style={styles.input}
        //         placeholder="New Contact's Name"
        //         value={newContactName}
        //         onChangeText={setNewContactName}
        //     />
        //     <TextInput
        //         style={styles.input}
        //         placeholder="New Contact's Email"
        //         value={newContactEmail}
        //         onChangeText={setNewContactEmail}
        //     />
        //     <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
        //         <Text style={styles.buttonText}>Add Contact</Text>
        //     </TouchableOpacity>
        //     <Modal
        //         animationType="slide"
        //         transparent={true}
        //         visible={modalVisible}
        //         onRequestClose={() => {
        //             Alert.alert("Modal has been closed.");
        //             setModalVisible(!modalVisible);
        //         }}
        //     >
        //         <View style={styles.centeredView}>
        //             <View style={styles.modalView}>
        //                 {selectedContact && (
        //                     <>
        //                         <Text style={styles.modalText}>Name: {selectedContact.name}</Text>
        //                         <Text style={styles.modalText}>Email: {selectedContact.email}</Text>
        //                     </>
        //                 )}
        //                 <TouchableOpacity
        //                     style={[styles.button, styles.buttonClose]}
        //                     onPress={() => setModalVisible(!modalVisible)}
        //                 >
        //                     <Text style={styles.textStyle}>Hide</Text>
        //                 </TouchableOpacity>
        //             </View>
        //         </View>
        //     </Modal>
        // </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    contentContainer: {
        flexGrow: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    },
    content: {
        flex: 1,
        padding: 16,
        alignItems: "center",
    },
    logo: {
        width: 150,
        height: 30,
        marginBottom: 5,
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#333",
        alignSelf: "flex-start",
    },
    input: {
        width: "100%",
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 16,
        paddingHorizontal: 8,
        backgroundColor: "#fff",
    },
    routeContainer: {
        width: "100%",
        marginBottom: 24,
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    routeText: {
        fontSize: 16,
        marginBottom: 8,
        color: "#333",
    },
    routeLabel: {
        fontWeight: "bold",
    },
    startButton: {
        backgroundColor: "#e74c3c", // Deep orange color
        borderRadius: 24,
        paddingVertical: 12,
        paddingHorizontal: 32,
        alignItems: "center",
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        width: 205,
    },
    completeButton: {
        backgroundColor: "#e74c3c", // Green color: "#4caf50". [4/10]: changed to orange
        borderRadius: 24,
        paddingVertical: 12,
        paddingHorizontal: 32,
        alignItems: "center",
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        width: 205,
    },
    navigateButton: {
        backgroundColor: "#e74c3c", // Blue color: "#2196f3". [4/10]: changed to orange
        borderRadius: 24,
        paddingVertical: 12,
        paddingHorizontal: 32,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        width: 205,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    suggestionsList: {
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 4,
        marginTop: -8,
        marginBottom: 16,
        elevation: 2,
    },
    suggestion: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
});

export default ContactScreen;

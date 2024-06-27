import { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text , TextInput} from 'react-native';
import tw, { useDeviceContext } from 'twrnc';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAddNoteMutation, useDeleteNoteMutation, useSearchNotesQuery, useUpdateNoteMutation } from './db';
import { PaperProvider } from 'react-native-paper';
import MasonryList from '@react-native-seoul/masonry-list';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Home Screen
function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: notes } = useSearchNotesQuery(searchQuery);

  const handleNotePress = (note) => {
    navigation.navigate('EditNote', { note });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity key={item.id} onPress={() => handleNotePress(item)}>
      <View style={[tw`bg-gray-800 p-2 m-1`]}>
        <Text style={[tw`text-5l text-white`]}>
          {item.title}
        </Text>
        <Text style={[tw`text-4l text-white`]}>
          {item.content}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <PaperProvider>
      <View style={tw`flex-1 bg-black text-white pt-15`}>
        <Text style={tw`text-white mx-auto text-3xl mb-2 font-bold`}>Notes</Text>
        <TextInput
          style={tw`p-3 ml-4 mr-4 mb-2 rounded text-white bg-gray-800`}
          placeholder="Search..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <MasonryList
          style={tw`ml-3 mr-3`}
          data={notes || []}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          onEndReachedThreshold={0.1}
        />
        <TouchableOpacity 
          onPress={() => navigation.navigate('AddNote')}
          style={tw`bg-blue-500 rounded-full absolute bottom-[5%] right-8 mx-auto items-center flex-1 justify-center w-12 h-12`}>
          <Text style={tw`text-white text-center text-3xl mt--1`}>+</Text>
        </TouchableOpacity>
      </View>
    </PaperProvider>
  );
}

// Add new note screen
function AddNoteScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [addNote] = useAddNoteMutation();
  
  const handleSaveNote = async () => {
    if (title != '' || content != '') {
      const newNote = { 
        title: title, 
        content: content,  
      };
      await addNote(newNote);
    } 
  };

  // Save the note when navigating back
  useEffect(() => {
    // Listen for beforeRemove event to trigger saveNote
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        handleSaveNote();
    });

    // Clean up the listener when component unmounts
    return unsubscribe;
  }, [navigation, title, content]);

  return (
    <View style={tw`flex-1 bg-black text-white pt-15`}>
      <Text style={tw`text-white mx-auto text-3xl mb-5 font-bold`}>Add Note</Text>
      <TextInput
        style={tw`p-3 ml-4 mr-4 mb-2 rounded text-white bg-gray-800`}
        placeholder="Title..."
        placeholderTextColor="#aaa"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={tw`p-3 ml-4 mr-4 mb-2 rounded text-white bg-gray-800`}
        placeholder="Content..."
        placeholderTextColor="#aaa"
        value={content}
        onChangeText={setContent}
        multiline
      />
    </View>
  );
}

//Edit Note Screen: include modifying and deleting
function EditNoteScreen({ navigation, route }) {
  const { note } = route.params;
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [showError, setShowError] = useState(false);

  const [updateNote] = useUpdateNoteMutation();
  const [deleteNote] = useDeleteNoteMutation();

  const handleDeleteNote = async () => {
      await deleteNote(note);
      navigation.goBack();
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleDeleteNote}>
          <Ionicons name="trash" size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  });

  // Auto save the note
  useEffect(() => {
    if (title != '' || content != '') {
      setShowError(false);
      const updatedNote = { id: note.id, title: title, content: content };
      updateNote(updatedNote);
    } else {
      setShowError(true);
    }
  }, [title, content]);

  return (
    <View style={tw`flex-1 bg-black text-white pt-15`}>
      <Text style={tw`text-white mx-auto text-3xl mb-5 font-bold`}>Edit Note</Text>
      <TextInput
        style={tw`p-3 ml-4 mr-4 mb-2 rounded text-white bg-gray-800`}
        placeholder="Title..."
        placeholderTextColor="#aaa"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={tw`p-3 ml-4 mr-4 mb-2 rounded text-white bg-gray-800`}
        placeholder="Content..."
        placeholderTextColor="#aaa"
        value={content}
        onChangeText={setContent}
        multiline
      />
      {showError && <Text style={tw`p-3 ml-4 mr-4 mb-2 text-white`}>The Title and Content cannot be empty !</Text>}
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  useDeviceContext(tw);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Notes">
          <Stack.Screen 
            options={{ headerShown: false }}
            name="Notes" 
            component={HomeScreen} 
          />
          <Stack.Screen 
            options={{
              headerTitle: "",
              headerStyle: tw`bg-black border-0`,
              headerTintColor: '#fff',
              headerShadowVisible: false
            }}
            name="AddNote" 
            component={AddNoteScreen} 
          />
          <Stack.Screen 
            options={{
              headerTitle: "",
              headerStyle: tw`bg-black border-0`,
              headerTintColor: '#fff',
              headerShadowVisible: false
            }}
            name="EditNote" 
            component={EditNoteScreen} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
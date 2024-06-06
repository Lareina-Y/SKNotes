import { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text , TextInput, } from 'react-native';
import tw, { useDeviceContext } from 'twrnc';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAddNoteMutation, useSearchNotesQuery } from './db';
import { PaperProvider } from 'react-native-paper';
import MasonryList from '@react-native-seoul/masonry-list';

function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const [ addNote ] = useAddNoteMutation();
  const { data: notes, refetch } = useSearchNotesQuery(searchQuery);

  const handleAddNote = async () => {
    const newNote = {
      title: 'New Note',
      content: 'This is a new note'
    };
    await addNote(newNote);
    refetch();
  };

  const renderItem = ({ item }) => (
    <View style={[tw`bg-gray-800 p-2 m-1`]}>
      <Text style={[tw`text-5l text-white`]}>
        {item.title}
      </Text>
      <Text style={[tw`text-1xl text-white`]}>
        {item.content}
      </Text>
    </View>
  );

  return (
    <PaperProvider>
      <View style={tw`flex-1 bg-black text-white pt-15`}>
        <Text style={tw`text-white mx-auto text-3xl mb-2 font-bold`}>Notes</Text>
        <TextInput
          style={tw`p-3 ml-4 mr-4 mb-2 rounded text-white bg-gray-800`}
          placeholder="Search..."
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
        <TouchableOpacity onPress={handleAddNote} style={tw`bg-blue-500 rounded-full absolute bottom-[5%] right-8 mx-auto items-center flex-1 justify-center w-12 h-12`}>
          <Text style={tw`text-white text-center text-3xl mt--1`}>+</Text>
        </TouchableOpacity>
      </View>
    </PaperProvider>
  );
}

export default function App() {
  useDeviceContext(tw);

  return (
    <Provider store={store}>
      <HomeScreen />
    </Provider>
  );
}
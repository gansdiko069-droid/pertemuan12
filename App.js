import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  SafeAreaView 
} from 'react-native';
// [LEVEL 1] Import AsyncStorage untuk menyimpan data secara permanen di HP
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  // [LEVEL 1] State utama untuk menampung list catatan dan teks input
  const [notes, setNotes] = useState([]);
  const [inputText, setInputText] = useState('');

  // [LEVEL 1 - READ] Mengambil data yang tersimpan saat pertama kali aplikasi dibuka
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('@note_keys');
        if (savedData !== null) {
          setNotes(JSON.parse(savedData)); 
        }
      } catch (e) {
        console.error("Gagal memuat data:", e);
      }
    };
    loadData();
  }, []);

  // [LEVEL 1 - SINKRONISASI] Fungsi untuk menyimpan data ke AsyncStorage
  const saveData = async (newNotes) => {
    try {
      await AsyncStorage.setItem('@note_keys', JSON.stringify(newNotes));
    } catch (e) {
      console.error("Gagal menyimpan data:", e);
    }
  };

  // [LEVEL 1 - CREATE & LEVEL 3 - TIMESTAMP] Fungsi menambahkan catatan baru
  const addNote = () => {
    if (inputText.trim() === '') {
      Alert.alert('Peringatan', 'Catatan tidak boleh kosong!');
      return;
    }

    // [LEVEL 3] Membuat format tanggal dan waktu lokal saat item dibuat
    const now = new Date();
    const formattedTimestamp = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ' ' + now.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const newNoteItem = {
      id: Date.now().toString(), 
      text: inputText,
      time: formattedTimestamp // [LEVEL 3] Menyimpan string tanggal/waktu ke dalam objek item
    };

    const updatedNotes = [...notes, newNoteItem];
    setNotes(updatedNotes);
    saveData(updatedNotes); 
    setInputText(''); 
  };

  // [LEVEL 1 - DELETE & LEVEL 2 - KONFIRMASI HAPUS] Fungsi menghapus satu item
  const deleteNote = (id) => {
    Alert.alert(
      "Konfirmasi Hapus", 
      "Apakah Anda yakin ingin menghapus catatan ini?", 
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus", 
          style: "destructive",
          onPress: () => {
            const updatedNotes = notes.filter(item => item.id !== id);
            setNotes(updatedNotes);
            saveData(updatedNotes); 
          } 
        }
      ]
    );
  };

  // [LEVEL 2 - HAPUS SEMUA] Fungsi untuk membersihkan semua data catatan
  const deleteAllNotes = () => {
    Alert.alert(
      "Hapus Semua", 
      "Apakah Anda yakin ingin menghapus SEMUA catatan?", 
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus Semua", 
          style: "destructive",
          onPress: () => {
            setNotes([]);
            saveData([]); 
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>📝 Note Keeper App</Text>
      
      {/* Input dan Tombol Tambah */}
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input}
          placeholder="Tulis catatan baru di sini..."
          placeholderTextColor="#888"
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.addButton} onPress={addNote}>
          <Text style={styles.addButtonText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* Tombol Hapus Semua (Level 2) */}
      {notes.length > 0 && (
        <TouchableOpacity style={styles.deleteAllButton} onPress={deleteAllNotes}>
          <Text style={styles.deleteAllButtonText}>🗑️ Hapus Semua Catatan</Text>
        </TouchableOpacity>
      )}

      {/* [LEVEL 1] FlatList untuk menampilkan daftar item */}
      <FlatList 
        data={notes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        // [LEVEL 1] Empty State jika data kosong
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada catatan.</Text>
            <Text style={styles.emptySubText}>Silakan tambah catatan baru di atas!</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.noteItem}>
            <View style={styles.noteContent}>
              <Text style={styles.noteText}>{item.text}</Text>
              {/* [LEVEL 3] Menampilkan teks Waktu Pembuatan di bawah catatan */}
              {item.time && <Text style={styles.timestampText}>🕒 {item.time}</Text>}
            </View>
            
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => deleteNote(item.id)}
            >
              <Text style={styles.deleteButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// Desain Tampilan Aplikasi (Styling)
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingTop: 40
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#333',
    marginBottom: 20, 
    textAlign: 'center' 
  },
  inputContainer: { 
    flexDirection: 'row', 
    marginBottom: 15 
  },
  input: { 
    flex: 1, 
    backgroundColor: '#fff',
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 12, 
    marginRight: 10, 
    borderRadius: 8,
    fontSize: 16,
    elevation: 2
  },
  addButton: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  deleteAllButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center'
  },
  deleteAllButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  noteItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 15, 
    backgroundColor: '#fff', 
    marginBottom: 10, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#eee',
    elevation: 1
  },
  noteContent: {
    flex: 1,
    marginRight: 10
  },
  noteText: {
    fontSize: 16,
    color: '#333',
  },
  timestampText: {
    fontSize: 11,
    color: '#8e8e93',
    marginTop: 5,
    fontStyle: 'italic'
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontWeight: 'bold',
    fontSize: 14
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40
  },
  emptyText: { 
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
  },
  emptySubText: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 5,
  }
});
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

function DaySelector({ day, setDay }) {
  const [open, setOpen] = useState(false);
  const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

  return (
    <View style={{ marginBottom: 15, width: "90%", maxWidth: 400, alignSelf: "center" }}>
      <TouchableOpacity
        style={[styles.selectorButton, { backgroundColor: "#FF9800" }]}
        onPress={() => setOpen(true)}
      >
        <Text style={[styles.selectorText, { color: "#fff" }]}>
          Selecione o dia ▼
        </Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <View style={styles.modalContent}>
            <FlatList
              data={days}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dayItem}
                  onPress={() => {
                    setDay(item);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.dayText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default function App() {
  const [task, setTask] = useState("");
  const [day, setDay] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks();
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const data = await AsyncStorage.getItem("tasks");
      if (data) setTasks(JSON.parse(data));
    } catch (error) {
      console.log(error);
    }
  };

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (error) {
      console.log(error);
    }
  };

  const addTask = () => {
    if (task.trim() === "" || !day) return;

    if (editingIndex !== null) {
      const updated = [...tasks];
      updated[editingIndex] = { title: task, done: false, day };
      setTasks(updated);
      setEditingIndex(null);
    } else {
      setTasks([...tasks, { title: task, done: false, day }]);
    }

    setTask("");
    setDay(null);
  };

  const toggleTask = (index) => {
    const updated = [...tasks];
    updated[index].done = !updated[index].done;
    setTasks(updated);
  };

  const editTask = (index) => {
    setTask(tasks[index].title);
    setDay(tasks[index].day);
    setEditingIndex(index);
  };

  const deleteTask = (index) => {
    const updated = [...tasks];
    updated.splice(index, 1);
    setTasks(updated);
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Tarefas da Semana</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite uma tarefa"
          placeholderTextColor="#555"
          value={task}
          onChangeText={setTask}
        />

        <DaySelector day={day} setDay={setDay} />

        <TouchableOpacity
          style={[styles.button, (!day || task.trim() === "") && { opacity: 0.6 }]}
          onPress={addTask}
          disabled={!day || task.trim() === ""}
        >
          <Text style={styles.buttonText}>
            {editingIndex !== null ? "Salvar" : "Adicionar"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.taskContainer}>
            <TouchableOpacity onPress={() => toggleTask(index)}>
              <Text style={[styles.task, item.done && styles.done]}>
                {item.title} ({item.day})
              </Text>
            </TouchableOpacity>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => editTask(index)}>
                <Text style={styles.edit}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTask(index)}>
                <Text style={styles.delete}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#4CAF50", padding: 20, paddingTop: 60 },
  formContainer: { alignItems: "center", justifyContent: "center", marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#fff" },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    fontSize: 16,
    marginBottom: 10,
    width: "90%",
    maxWidth: 400,
    alignSelf: "center",
  },
  selectorButton: { backgroundColor: "#FF9800", padding: 14, borderRadius: 15 },
  selectorText: { color: "#fff", fontSize: 16, textAlign: "center" },
  button: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  taskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 10,
    width: "90%",
    maxWidth: 400,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  task: { fontSize: 18, color: "#333" },
  done: { textDecorationLine: "line-through", color: "#555" },
  actions: { flexDirection: "row", gap: 10 },
  edit: { fontSize: 20 },
  delete: { fontSize: 20, color: "#E53935" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", borderRadius: 15, width: "80%", maxHeight: 300 },
  dayItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  dayText: { fontSize: 16 },
});

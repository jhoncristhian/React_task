import React, { useState, useEffect } from "react";
import "./TaskList.css"; // Importa el archivo CSS

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editedTask, setEditedTask] = useState("");
  const [editingIndex, setEditingIndex] = useState(-1);

  useEffect(() => {
    loadTasksFromIndexedDB(); // Cargar tareas almacenadas al iniciar
  }, []);

  useEffect(() => {
    saveTasksToIndexedDB(); // Guardar tareas actualizadas cuando cambian
  }, [tasks]);

  const openIndexedDB = () => {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open("taskDB", 1);

      request.onerror = (event) => {
        console.error("Error opening IndexedDB:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const objectStore = db.createObjectStore("tasks", {
          keyPath: "id",
          autoIncrement: true,
        });
        objectStore.createIndex("text", "text", { unique: false });
      };
    });
  };

  const loadTasksFromIndexedDB = async () => {
    try {
      const db = await openIndexedDB();
      const transaction = db.transaction("tasks", "readonly");
      const objectStore = transaction.objectStore("tasks");
      const request = objectStore.getAll();

      request.onsuccess = () => {
        setTasks(request.result);
      };
    } catch (error) {
      console.error("Error loading tasks from IndexedDB:", error);
    }
  };

  const saveTasksToIndexedDB = async () => {
    try {
      const db = await openIndexedDB();
      const transaction = db.transaction("tasks", "readwrite");
      const objectStore = transaction.objectStore("tasks");

      tasks.forEach((task) => {
        const request = objectStore.put(task);
        request.onerror = (event) => {
          console.error("Error saving task to IndexedDB:", event.target.error);
        };
      });
    } catch (error) {
      console.error("Error saving tasks to IndexedDB:", error);
    }
  };
  const handleAddTask = () => {
    if (newTask.trim() !== "") {
      const updatedTasks = [...tasks, { text: newTask, completed: false }];
      setTasks(updatedTasks);
      setNewTask("");

      // Guardar tareas en localStorage
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    }
  };

  const handleEditTask = (index) => {
    setEditedTask(tasks[index].text);
    setEditingIndex(index);
  };

  const handleUpdateTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].text = editedTask;
    setTasks(updatedTasks);
    setEditingIndex(-1);
    setEditedTask("");
  };

  const handleToggleCompletion = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
  };

  const handleDeleteTask = (index) => {
    const shouldDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar esta tarea?"
    );
    if (shouldDelete) {
      const updatedTasks = tasks.filter((_, i) => i !== index);
      setTasks(updatedTasks);
    }
  };

  const handleOpenEditModal = (index) => {
    setEditedTask(tasks[index].text);
    setEditingIndex(index);
  };

  const handleCloseEditModal = () => {
    setEditingIndex(-1);
    setEditedTask("");
  };

  const handleSaveEditedTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].text = editedTask;
    setTasks(updatedTasks);
    handleCloseEditModal();
  };

  return (
    <div>
      <h1>Lista de Tareas</h1>
      <ul>
        {tasks.map((task, index) => (
          <li key={index} className="task">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggleCompletion(index)}
            />
            <div className="task-text">
              {index + 1}. {task.text}
            </div>

            <div className="task-buttons">
              <button onClick={() => handleOpenEditModal(index)}>E</button>
              <button onClick={() => handleDeleteTask(index)}>X</button>
            </div>
          </li>
        ))}
      </ul>
      <div>
        <input
          type="text"
          value={newTask}
          className="input-add"
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button className="button-add" onClick={handleAddTask}>
          Agregar
        </button>
      </div>

      {/* Ventana modal para la edición */}
      {editingIndex !== -1 && (
        <div className="modal">
          <div className="modal-content">
            <textarea
              value={editedTask}
              onChange={(e) => setEditedTask(e.target.value)}
            />
            <button onClick={() => handleSaveEditedTask(editingIndex)}>
              Guardar
            </button>
            <button onClick={handleCloseEditModal}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;

package com.example.myapplication

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch

class TaskViewModel(application: Application) : AndroidViewModel(application) {
    private val database = AppDatabase.getDatabase(application)
    private val taskDao = database.taskDao()
    private val auditDao = database.auditDao()

    val allTasks: Flow<List<Task>> = taskDao.getAllTasks()
    val auditLog: Flow<List<AuditEntry>> = auditDao.getAllAuditEntries()

    fun addTask(title: String) {
        viewModelScope.launch {
            taskDao.insertTask(Task(title = title))
            auditDao.insertAuditEntry(AuditEntry(action = "Added task: $title"))
        }
    }

    fun deleteTask(task: Task) {
        viewModelScope.launch {
            taskDao.deleteTask(task)
            auditDao.insertAuditEntry(AuditEntry(action = "Deleted task: ${task.title}"))
        }
    }

    fun toggleTaskCompletion(task: Task) {
        viewModelScope.launch {
            val newState = !task.isCompleted
            taskDao.updateTask(task.copy(isCompleted = newState))
            val action = if (newState) "Completed" else "Uncompleted"
            auditDao.insertAuditEntry(AuditEntry(action = "$action task: ${task.title}"))
        }
    }

    fun clearAuditLog() {
        viewModelScope.launch {
            auditDao.clearLog()
        }
    }
}

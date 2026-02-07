package com.example.myapplication

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.myapplication.ui.theme.MyApplicationTheme
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlinx.coroutines.delay

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MyApplicationTheme {
                TodoApp()
            }
        }
    }
}

data class TodoItem(val id: Int, val task: String, val isCompleted: Boolean = false)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TodoApp() {
    var todos by remember { mutableStateOf(listOf<TodoItem>()) }
    var text by remember { mutableStateOf("") }
    var nextId by remember { mutableStateOf(0) }
    var currentTime by remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        while (true) {
            currentTime = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())
            delay(1000)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("To-Do List") }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .padding(paddingValues)
                .padding(16.dp)
                .fillMaxSize()
        ) {
            Text(
                text = currentTime,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.align(Alignment.End)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = text,
                    onValueChange = { text = it },
                    label = { Text("New Task") },
                    modifier = Modifier.weight(1f)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Button(onClick = {
                    if (text.isNotBlank()) {
                        todos = todos + TodoItem(id = nextId++, task = text)
                        text = ""
                    }
                }) {
                    Text("Add")
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(todos, key = { it.id }) { todo ->
                    TodoItemRow(
                        todo = todo,
                        onCheckedChange = { isChecked ->
                            todos = todos.map {
                                if (it.id == todo.id) it.copy(isCompleted = isChecked) else it
                            }
                        },
                        onDelete = {
                            todos = todos.filter { it.id != todo.id }
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun TodoItemRow(
    todo: TodoItem,
    onCheckedChange: (Boolean) -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Checkbox(
                checked = todo.isCompleted,
                onCheckedChange = onCheckedChange
            )
            Text(
                text = todo.task,
                modifier = Modifier
                    .weight(1f)
                    .padding(start = 16.dp, end = 8.dp),
                style = if (todo.isCompleted) {
                    MaterialTheme.typography.bodyLarge.copy(
                        textDecoration = TextDecoration.LineThrough,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                } else {
                    MaterialTheme.typography.bodyLarge
                }
            )
            IconButton(onClick = onDelete) {
                 Text("X", color = MaterialTheme.colorScheme.error)
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun DefaultPreview() {
    MyApplicationTheme {
        TodoApp()
    }
}

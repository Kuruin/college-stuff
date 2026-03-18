package com.example.myapplication

import android.Manifest
import android.annotation.SuppressLint
import android.bluetooth.BluetoothDevice
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.example.myapplication.ui.theme.MyApplicationTheme
import java.io.File

class MainActivity : ComponentActivity() {
    private lateinit var bluetoothHelper: BluetoothHelper

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        bluetoothHelper = BluetoothHelper(this)
        setContent {
            MyApplicationTheme {
                BluetoothFileTransferScreen(bluetoothHelper)
            }
        }
    }
}

@SuppressLint("MissingPermission")
@Composable
fun BluetoothFileTransferScreen(bluetoothHelper: BluetoothHelper) {
    val context = LocalContext.current
    val connectionStatus by bluetoothHelper.connectionStatus.collectAsState()
    val transferProgress by bluetoothHelper.transferProgress.collectAsState()
    val pairedDevices = remember { mutableStateListOf<BluetoothDevice>() }

    val permissions = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        arrayOf(
            Manifest.permission.BLUETOOTH_SCAN,
            Manifest.permission.BLUETOOTH_ADVERTISE,
            Manifest.permission.BLUETOOTH_CONNECT,
            Manifest.permission.ACCESS_FINE_LOCATION
        )
    } else {
        arrayOf(
            Manifest.permission.BLUETOOTH,
            Manifest.permission.BLUETOOTH_ADMIN,
            Manifest.permission.ACCESS_FINE_LOCATION
        )
    }

    val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { results ->
        if (results.all { it.value }) {
            pairedDevices.clear()
            pairedDevices.addAll(bluetoothHelper.getPairedDevices())
        } else {
            Toast.makeText(context, "Permissions denied", Toast.LENGTH_SHORT).show()
        }
    }

    LaunchedEffect(Unit) {
        launcher.launch(permissions)
    }

    Column(modifier = Modifier.padding(16.dp)) {
        Text("Bluetooth File Transfer", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Status: $connectionStatus", style = MaterialTheme.typography.bodyMedium)
        Text("Progress: $transferProgress", style = MaterialTheme.typography.bodySmall)
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = { bluetoothHelper.startServer() }) {
                Text("Wait for Connection")
            }
            Button(onClick = { 
                pairedDevices.clear()
                pairedDevices.addAll(bluetoothHelper.getPairedDevices())
            }) {
                Text("Refresh Paired")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text("Paired Devices (Tap to connect):", style = MaterialTheme.typography.titleMedium)
        
        LazyColumn(modifier = Modifier.weight(1f)) {
            items(pairedDevices) { device ->
                ListItem(
                    headlineContent = { Text(device.name ?: "Unknown Device") },
                    supportingContent = { Text(device.address) },
                    modifier = Modifier.clickable { bluetoothHelper.connectToDevice(device) }
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        
        Button(
            onClick = {
                // For demo: create a dummy file to send
                val dummyFile = File(context.cacheDir, "test.txt")
                dummyFile.writeText("Hello from Bluetooth Transfer!")
                bluetoothHelper.sendFile(dummyFile)
            },
            enabled = connectionStatus == "Connected",
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Send Test File")
        }
    }
}

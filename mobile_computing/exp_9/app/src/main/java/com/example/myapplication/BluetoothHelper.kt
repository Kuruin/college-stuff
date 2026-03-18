package com.example.myapplication

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothServerSocket
import android.bluetooth.BluetoothSocket
import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException
import java.util.UUID

@SuppressLint("MissingPermission")
class BluetoothHelper(private val context: Context) {
    private val bluetoothAdapter: BluetoothAdapter? = BluetoothAdapter.getDefaultAdapter()
    private val APP_NAME = "BTFileTransfer"
    private val MY_UUID: UUID = UUID.fromString("8ce255c0-200a-11e0-ac64-0800200c9a66")

    val connectionStatus = MutableStateFlow("Disconnected")
    val transferProgress = MutableStateFlow("")

    private var connectThread: ConnectThread? = null
    private var connectedThread: ConnectedThread? = null
    private var acceptThread: AcceptThread? = null

    fun getPairedDevices(): List<BluetoothDevice> {
        return bluetoothAdapter?.bondedDevices?.toList() ?: emptyList()
    }

    fun startServer() {
        acceptThread?.cancel()
        acceptThread = AcceptThread()
        acceptThread?.start()
        connectionStatus.value = "Listening for connections..."
    }

    fun connectToDevice(device: BluetoothDevice) {
        connectThread?.cancel()
        connectThread = ConnectThread(device)
        connectThread?.start()
        connectionStatus.value = "Connecting to ${device.name}..."
    }

    fun sendFile(file: File) {
        connectedThread?.writeFile(file)
    }

    private inner class AcceptThread : Thread() {
        private val mmServerSocket: BluetoothServerSocket? by lazy(LazyThreadSafetyMode.NONE) {
            bluetoothAdapter?.listenUsingInsecureRfcommWithServiceRecord(APP_NAME, MY_UUID)
        }

        override fun run() {
            var shouldLoop = true
            while (shouldLoop) {
                val socket: BluetoothSocket? = try {
                    mmServerSocket?.accept()
                } catch (e: IOException) {
                    Log.e("BT", "Socket's accept() method failed", e)
                    shouldLoop = false
                    null
                }
                socket?.also {
                    manageMyConnectedSocket(it)
                    mmServerSocket?.close()
                    shouldLoop = false
                }
            }
        }

        fun cancel() {
            try {
                mmServerSocket?.close()
            } catch (e: IOException) {
                Log.e("BT", "Could not close the connect socket", e)
            }
        }
    }

    private inner class ConnectThread(device: BluetoothDevice) : Thread() {
        private val mmSocket: BluetoothSocket? by lazy(LazyThreadSafetyMode.NONE) {
            device.createRfcommSocketToServiceRecord(MY_UUID)
        }

        override fun run() {
            bluetoothAdapter?.cancelDiscovery()

            try {
                mmSocket?.connect()
            } catch (e: IOException) {
                connectionStatus.value = "Connection failed"
                try {
                    mmSocket?.close()
                } catch (e2: IOException) {
                }
                return
            }

            mmSocket?.also { manageMyConnectedSocket(it) }
        }

        fun cancel() {
            try {
                mmSocket?.close()
            } catch (e: IOException) {
            }
        }
    }

    private fun manageMyConnectedSocket(socket: BluetoothSocket) {
        connectionStatus.value = "Connected"
        connectedThread = ConnectedThread(socket)
        connectedThread?.start()
    }

    private inner class ConnectedThread(private val mmSocket: BluetoothSocket) : Thread() {
        private val mmInStream = mmSocket.inputStream
        private val mmOutStream = mmSocket.outputStream
        private val mmBuffer: ByteArray = ByteArray(1024)

        override fun run() {
            while (true) {
                try {
                    // This implementation is a simplified file receiver
                    // In a real app, you'd send file metadata (name, size) first
                    val file = File(context.cacheDir, "received_file_${System.currentTimeMillis()}")
                    val fos = FileOutputStream(file)
                    var bytes: Int
                    while (mmInStream.read(mmBuffer).also { bytes = it } != -1) {
                        fos.write(mmBuffer, 0, bytes)
                        transferProgress.value = "Receiving data..."
                    }
                    fos.close()
                    transferProgress.value = "File received: ${file.name}"
                } catch (e: IOException) {
                    connectionStatus.value = "Disconnected"
                    break
                }
            }
        }

        fun writeFile(file: File) {
            try {
                val fis = FileInputStream(file)
                val buffer = ByteArray(1024)
                var bytes: Int
                while (fis.read(buffer).also { bytes = it } != -1) {
                    mmOutStream.write(buffer, 0, bytes)
                }
                fis.close()
                transferProgress.value = "File sent: ${file.name}"
            } catch (e: IOException) {
                transferProgress.value = "Send failed"
            }
        }

        fun cancel() {
            try {
                mmSocket.close()
            } catch (e: IOException) {
            }
        }
    }
}

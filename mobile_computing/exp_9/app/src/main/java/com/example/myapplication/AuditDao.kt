package com.example.myapplication

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface AuditDao {
    @Query("SELECT * FROM audit_log ORDER BY timestamp DESC")
    fun getAllAuditEntries(): Flow<List<AuditEntry>>

    @Insert
    suspend fun insertAuditEntry(entry: AuditEntry)

    @Query("DELETE FROM audit_log")
    suspend fun clearLog()
}

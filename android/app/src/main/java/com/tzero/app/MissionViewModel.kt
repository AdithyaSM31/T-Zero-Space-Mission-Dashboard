package com.tzero.app

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.tzero.app.data.*
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class MissionState(
    val upcoming: Snapshot<Mission> = Snapshot(),
    val recent: Snapshot<Mission> = Snapshot(),
    val fleet: Snapshot<Vehicle> = Snapshot(),
    val loading: Boolean = true,
    val saved: Set<String> = emptySet(),
    val localTime: Boolean = false,
)

class MissionViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = MissionRepository(application)
    private val preferences = application.getSharedPreferences("tzero-native", 0)
    private val mutable =
        MutableStateFlow(
            MissionState(
                saved = preferences.getStringSet("saved", emptySet()).orEmpty().toSet(),
                localTime = preferences.getBoolean("local-time", false),
            )
        )
    val state = mutable.asStateFlow()
    private var started = false

    init {
        refresh()
    }

    fun refresh(force: Boolean = false) {
        if (mutable.value.loading && started) return
        started = true
        viewModelScope.launch {
            mutable.value = mutable.value.copy(loading = true)
            val catalog = repository.fleet()
            val cachedUpcoming = repository.cachedMissions(false)
            val cachedRecent = repository.cachedMissions(true)
            mutable.value =
                mutable.value.copy(
                    fleet = catalog,
                    upcoming =
                        mutable.value.upcoming.takeIf { it.items.isNotEmpty() } ?: cachedUpcoming,
                    recent = mutable.value.recent.takeIf { it.items.isNotEmpty() } ?: cachedRecent,
                )
            val upcoming = async { repository.missions(false, force) }
            val recent = async { repository.missions(true, force) }
            mutable.value =
                mutable.value.copy(
                    upcoming = upcoming.await(),
                    recent = recent.await(),
                    loading = false,
                )
        }
    }

    fun toggleSaved(id: String) {
        val saved = mutable.value.saved.let { if (id in it) it - id else it + id }
        preferences.edit().putStringSet("saved", saved).apply()
        mutable.value = mutable.value.copy(saved = saved)
    }

    fun toggleTime() {
        val local = !mutable.value.localTime
        preferences.edit().putBoolean("local-time", local).apply()
        mutable.value = mutable.value.copy(localTime = local)
    }
}

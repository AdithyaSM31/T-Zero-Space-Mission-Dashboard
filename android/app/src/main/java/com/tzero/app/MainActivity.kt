package com.tzero.app

import android.hardware.display.DisplayManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.tzero.app.ui.TZeroApp

class MainActivity : ComponentActivity(), DisplayManager.DisplayListener {
    private val displays by lazy { getSystemService(DisplayManager::class.java) }

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { TZeroApp() }
    }

    override fun onResume() {
        super.onResume()
        displays.registerDisplayListener(this, Handler(Looper.getMainLooper()))
        updateRefreshPreference()
    }

    override fun onPause() {
        displays.unregisterDisplayListener(this)
        window.attributes = window.attributes.apply { preferredRefreshRate = 0f }
        super.onPause()
    }

    private fun updateRefreshPreference() {
        // Android 15+ uses view-level adaptive refresh voting (see TZeroApp).
        if (Build.VERSION.SDK_INT >= 35) return
        @Suppress("DEPRECATION") val screen = windowManager.defaultDisplay
        val current = screen.mode
        val peak =
            screen.supportedModes
                .filter {
                    it.physicalWidth == current.physicalWidth &&
                        it.physicalHeight == current.physicalHeight
                }
                .maxOfOrNull { it.refreshRate } ?: screen.refreshRate
        if (window.attributes.preferredRefreshRate != peak) {
            window.attributes = window.attributes.apply { preferredRefreshRate = peak }
        }
    }

    override fun onDisplayChanged(displayId: Int) = updateRefreshPreference()

    override fun onDisplayAdded(displayId: Int) = updateRefreshPreference()

    override fun onDisplayRemoved(displayId: Int) = updateRefreshPreference()
}

package com.tzero.app.ui

import android.content.Context
import android.graphics.Rect
import android.os.SystemClock
import android.view.Choreographer
import android.view.TextureView
import android.view.ViewTreeObserver
import android.widget.FrameLayout
import androidx.compose.runtime.Composable
import androidx.compose.runtime.key
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.google.android.filament.IndirectLight
import com.google.android.filament.View.BlendMode
import com.google.android.filament.android.UiHelper
import com.google.android.filament.utils.Float3
import com.google.android.filament.utils.Manipulator
import com.google.android.filament.utils.ModelViewer
import com.google.android.filament.utils.Utils
import com.tzero.app.data.globePoint
import java.nio.ByteBuffer

@Composable
fun NativeModel(
    asset: String,
    modifier: Modifier = Modifier,
    modelScale: Float = 1f,
    latitude: Double? = null,
    longitude: Double? = null,
    onReady: () -> Unit = {},
    onError: () -> Unit = {},
) {
    val lifecycle = LocalLifecycleOwner.current
    key(asset) {
        AndroidView(
            factory = { context ->
                ModelSurface(context, asset, lifecycle, onError, onReady, modelScale)
            },
            modifier = modifier,
            update = { it.updateLocation(latitude, longitude) },
        )
    }
}

private class ModelSurface(
    context: Context,
    private val assetPath: String,
    private val owner: LifecycleOwner,
    private val onError: () -> Unit,
    private val onReady: () -> Unit,
    private val modelScale: Float,
) : FrameLayout(context), DefaultLifecycleObserver, Choreographer.FrameCallback {
    private val surface = TextureView(context).apply { isOpaque = false }
    private var viewer: ModelViewer? = null
    private var running = false
    private var announced = false
    private var activeUntil = 0L
    private var latitude: Double? = null
    private var longitude: Double? = null
    private var rootTransform: FloatArray? = null
    private val visibleRect = Rect()
    private val scrollListener =
        ViewTreeObserver.OnScrollChangedListener {
            if (!announced && surface.getGlobalVisibleRect(visibleRect)) start()
        }

    init {
        addView(surface, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
        contentDescription = "Interactive 3D model. Drag to orbit and pinch to zoom."
        if (android.os.Build.VERSION.SDK_INT >= 35) {
            surface.requestedFrameRate = android.view.View.REQUESTED_FRAME_RATE_CATEGORY_HIGH
        }
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        try {
            Utils.init()
            val earth = assetPath == "earth"
            val helper = UiHelper(UiHelper.ContextErrorPolicy.DONT_CHECK).apply { isOpaque = false }
            val manipulator =
                Manipulator.Builder()
                    .targetPosition(0f, 0f, 0f)
                    .orbitHomePosition(0f, 0f, if (earth) 2.65f else 4f)
                    .upVector(0f, 1f, 0f)
                    .panning(false)
                    .build(Manipulator.Mode.ORBIT)
            val model = ModelViewer(surface, uiHelper = helper, manipulator = manipulator)
            viewer = model
            surface.setOnTouchListener { _, event ->
                parent?.requestDisallowInterceptTouchEvent(true)
                model.onTouchEvent(event)
                start()
                true
            }
            val bytes = context.assets.open("models/$assetPath.glb").use { it.readBytes() }
            model.loadModelGlb(ByteBuffer.wrap(bytes))
            check(model.asset != null) { "Model could not be loaded" }
            // Keep the mesh center and the orbit target in the same coordinate system.
            // The viewer's default fit translates to z=-4; scaling that also moves the pivot.
            model.transformToUnitCube(Float3(0f, 0f, 0f))
            if (modelScale != 1f) {
                val transforms = model.engine.transformManager
                val root = transforms.getInstance(checkNotNull(model.asset).root)
                val matrix = FloatArray(16)
                transforms.getTransform(root, matrix)
                for (index in 0..14) matrix[index] *= modelScale
                transforms.setTransform(root, matrix)
            }
            if (earth) {
                val transforms = model.engine.transformManager
                val root = transforms.getInstance(checkNotNull(model.asset).root)
                val matrix = FloatArray(16)
                transforms.getTransform(root, matrix)
                rootTransform = matrix
                applyLocation()
            }
            model.scene.skybox = null
            // A convex globe needs diffuse lighting, not a shadow map of its own triangles.
            // Self-shadow depth precision can produce concentric acne when orbiting on mobile GPUs.
            if (earth) model.view.setShadowingEnabled(false)
            model.view.blendMode = BlendMode.TRANSLUCENT
            model.renderer.clearOptions =
                model.renderer.clearOptions.apply {
                    clear = true
                    clearColor = floatArrayOf(0f, 0f, 0f, 0f)
                }
            val harmonics =
                FloatArray(27).apply {
                    this[0] = 0.8f
                    this[1] = 0.9f
                    this[2] = 1f
                }
            model.scene.indirectLight =
                IndirectLight.Builder()
                    .irradiance(3, harmonics)
                    .intensity(if (earth) 18_000f else 35_000f)
                    .build(model.engine)
            val light = model.engine.lightManager.getInstance(model.light)
            model.engine.lightManager.setDirection(light, -0.7f, -1f, -1f)
            if (earth) model.engine.lightManager.setIntensity(light, 55_000f)
            owner.lifecycle.addObserver(this)
            viewTreeObserver.addOnScrollChangedListener(scrollListener)
            if (owner.lifecycle.currentState.isAtLeast(Lifecycle.State.RESUMED)) start()
        } catch (_: Exception) {
            onError()
        } catch (_: UnsatisfiedLinkError) {
            onError()
        }
    }

    fun updateLocation(latitude: Double?, longitude: Double?) {
        if (this.latitude == latitude && this.longitude == longitude) return
        this.latitude = latitude
        this.longitude = longitude
        if (assetPath == "earth" && rootTransform != null) {
            applyLocation()
            start()
        }
    }

    private fun applyLocation() {
        val model = viewer ?: return
        val asset = model.asset ?: return
        val base = rootTransform?.copyOf() ?: return
        val point = globePoint(latitude, longitude)
        // Rotate the chosen surface coordinate towards the camera, as in the web globe.
        android.opengl.Matrix.rotateM(
            base,
            0,
            if (point != null) latitude!!.toFloat() else 32f,
            1f,
            0f,
            0f,
        )
        if (point != null)
            android.opengl.Matrix.rotateM(base, 0, -longitude!!.toFloat() - 90f, 0f, 1f, 0f)
        val transforms = model.engine.transformManager
        transforms.setTransform(transforms.getInstance(asset.root), base)
        val marker = asset.getFirstEntityByName("LaunchSiteMarker")
        if (marker != 0) {
            val matrix = FloatArray(16)
            android.opengl.Matrix.setIdentityM(matrix, 0)
            if (point != null)
                android.opengl.Matrix.translateM(
                    matrix,
                    0,
                    point[0] * 1.01f,
                    point[1] * 1.01f,
                    point[2] * 1.01f,
                )
            android.opengl.Matrix.scaleM(matrix, 0, .014f, .014f, .014f)
            transforms.setTransform(transforms.getInstance(marker), matrix)
        }
    }

    private fun start() {
        if (!owner.lifecycle.currentState.isAtLeast(Lifecycle.State.RESUMED)) return
        activeUntil = SystemClock.uptimeMillis() + 500
        if (!running && viewer != null) {
            running = true
            Choreographer.getInstance().postFrameCallback(this)
        }
    }

    private fun stop() {
        running = false
        Choreographer.getInstance().removeFrameCallback(this)
    }

    override fun onResume(owner: LifecycleOwner) = start()

    override fun onPause(owner: LifecycleOwner) = stop()

    override fun doFrame(frameTimeNanos: Long) {
        if (running) {
            if (!surface.getGlobalVisibleRect(visibleRect)) {
                stop()
                return
            }
            viewer?.render(frameTimeNanos)
            if (!announced && (viewer?.progress ?: 0f) >= 1f) {
                announced = true
                post { onReady() }
            }
            // Static GLBs need no GPU work once loaded and gesture settling has finished.
            // Active interaction still renders on every display vsync, without a fixed FPS cap.
            if (!announced || SystemClock.uptimeMillis() < activeUntil) {
                Choreographer.getInstance().postFrameCallback(this)
            } else {
                running = false
            }
        }
    }

    override fun onDetachedFromWindow() {
        stop()
        owner.lifecycle.removeObserver(this)
        if (viewTreeObserver.isAlive) viewTreeObserver.removeOnScrollChangedListener(scrollListener)
        viewer = null
        super.onDetachedFromWindow()
    }
}

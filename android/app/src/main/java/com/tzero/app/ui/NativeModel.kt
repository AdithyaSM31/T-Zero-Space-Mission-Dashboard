package com.tzero.app.ui

import android.content.Context
import android.view.Choreographer
import android.view.TextureView
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
import java.nio.ByteBuffer

@Composable
fun NativeModel(
    asset: String,
    modifier: Modifier = Modifier,
    modelScale: Float = 1f,
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

    init {
        addView(surface, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
        contentDescription = "Interactive 3D model. Drag to orbit and pinch to zoom."
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
                android.opengl.Matrix.rotateM(matrix, 0, 32f, 1f, 0f, 0f)
                transforms.setTransform(root, matrix)
            }
            model.scene.skybox = null
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
                    .intensity(35_000f)
                    .build(model.engine)
            val light = model.engine.lightManager.getInstance(model.light)
            model.engine.lightManager.setDirection(light, -0.7f, -1f, -1f)
            owner.lifecycle.addObserver(this)
            if (owner.lifecycle.currentState.isAtLeast(Lifecycle.State.RESUMED)) start()
        } catch (_: Exception) {
            onError()
        } catch (_: UnsatisfiedLinkError) {
            onError()
        }
    }

    private fun start() {
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
            viewer?.render(frameTimeNanos)
            if (!announced && (viewer?.progress ?: 0f) >= 1f) {
                announced = true
                post { onReady() }
            }
            Choreographer.getInstance().postFrameCallback(this)
        }
    }

    override fun onDetachedFromWindow() {
        stop()
        owner.lifecycle.removeObserver(this)
        viewer = null
        super.onDetachedFromWindow()
    }
}

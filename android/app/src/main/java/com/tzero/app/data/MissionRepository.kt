package com.tzero.app.data

import android.content.Context
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject

class MissionRepository(private val context: Context) {
    private val endpoint = "https://ll.thespacedevs.com/2.2.0"

    suspend fun cachedMissions(recent: Boolean): Snapshot<Mission> =
        withContext(Dispatchers.IO) {
            runCatching {
                    val file =
                        File(context.filesDir, if (recent) "recent-v1.json" else "upcoming-v1.json")
                    val root = JSONObject(file.readText())
                    Snapshot(
                        DataParser.missions(root.getJSONArray("results")),
                        root.optLong("retrieved"),
                        cached = true,
                    )
                }
                .getOrElse { Snapshot() }
        }

    private fun request(url: String): String {
        val connection = URL(url).openConnection() as HttpURLConnection
        return try {
            connection.connectTimeout = 10000
            connection.readTimeout = 15000
            connection.setRequestProperty("User-Agent", "T-Zero-Android/1.1")
            when (connection.responseCode) {
                429 -> error("The launch provider is rate-limited. Try again later.")
                in 200..299 -> Unit
                else -> error("The source is temporarily unavailable (${connection.responseCode}).")
            }
            connection.inputStream.bufferedReader().use { it.readText() }
        } finally {
            connection.disconnect()
        }
    }

    suspend fun missions(recent: Boolean, force: Boolean = false): Snapshot<Mission> =
        withContext(Dispatchers.IO) {
            val cache = File(context.filesDir, if (recent) "recent-v1.json" else "upcoming-v1.json")
            val stored = runCatching { JSONObject(cache.readText()) }.getOrNull()
            val age = stored?.optLong("retrieved") ?: 0L
            fun cached(error: String? = null): Snapshot<Mission> =
                Snapshot(
                    stored?.optJSONArray("results")?.let(DataParser::missions).orEmpty(),
                    age.takeIf { it > 0 },
                    true,
                    error,
                )
            val ttl = if (recent) 3_600_000 else 60_000
            if (!force && stored != null && System.currentTimeMillis() - age < ttl)
                return@withContext cached()
            try {
                val response =
                    JSONObject(
                        request(
                            "$endpoint/launch/${if (recent) "previous" else "upcoming"}/?limit=100&mode=detailed"
                        )
                    )
                val array = response.getJSONArray("results")
                val now = System.currentTimeMillis()
                val parsed = DataParser.missions(array)
                runCatching {
                    cache.writeText(
                        JSONObject().put("retrieved", now).put("results", array).toString()
                    )
                }
                Snapshot(parsed, now)
            } catch (cancelled: CancellationException) {
                throw cancelled
            } catch (error: Exception) {
                cached(
                    error.message?.takeIf { it.startsWith("The ") }
                        ?: "Couldn't reach the source. Check your connection and retry."
                )
            }
        }

    suspend fun fleet(): Snapshot<Vehicle> =
        withContext(Dispatchers.IO) {
            runCatching {
                    val root =
                        JSONObject(
                            context.assets.open("fleet-snapshot.json").bufferedReader().use {
                                it.readText()
                            }
                        )
                    Snapshot(
                        DataParser.vehicles(root.getJSONArray("results")),
                        root.optLong("retrieved").takeIf { it > 0 },
                        cached = true,
                    )
                }
                .getOrElse { Snapshot(error = "The bundled vehicle catalog could not be read.") }
        }
}

package com.tzero.app.data

import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale
import org.json.JSONArray
import org.json.JSONObject

data class Mission(
    val id: String,
    val name: String,
    val description: String,
    val provider: String,
    val vehicle: String,
    val location: String,
    val pad: String,
    val scheduled: String,
    val precision: String,
    val precisionName: String,
    val status: String,
    val statusCode: String,
    val image: String,
    val windowStart: String,
    val windowEnd: String,
) {
    val instant: Instant?
        get() = runCatching { Instant.parse(scheduled) }.getOrNull()

    val hasDay: Boolean
        get() = precision in setOf("SEC", "MIN", "HR", "DAY")

    val hasCountdown: Boolean
        get() = precision in setOf("SEC", "MIN") && statusCode == "Go"

    val outcome: String
        get() =
            when (statusCode) {
                "Success" -> "Successful"
                "Failure" -> "Failed"
                "Partial Failure" -> "Partial failure"
                else -> "Other / pending"
            }

    fun date(local: Boolean = false): String {
        val time = instant ?: return "Date not provided"
        val pattern =
            when {
                precision in setOf("SEC", "MIN", "HR") -> "dd MMM yyyy · HH:mm"
                precision == "DAY" -> "dd MMM yyyy"
                precision == "M" -> "MMM yyyy"
                else -> "yyyy"
            }
        return DateTimeFormatter.ofPattern(pattern, Locale.ENGLISH)
            .withZone(if (local) ZoneId.systemDefault() else ZoneId.of("UTC"))
            .format(time) +
            when {
                precision == "HR" -> " (approx.)"
                precision in setOf("SEC", "MIN") -> if (local) " local" else " UTC"
                !hasDay -> " · ${precisionName.ifBlank { "estimated" }}"
                else -> ""
            }
    }
}

data class Vehicle(
    val id: Int,
    val name: String,
    val maker: String,
    val description: String,
    val image: String,
    val height: Double?,
    val diameter: Double?,
    val mass: Double?,
    val payload: Double?,
    val launches: Int?,
    val success: Int?,
)

data class Snapshot<T>(
    val items: List<T> = emptyList(),
    val updatedAt: Long? = null,
    val cached: Boolean = false,
    val error: String? = null,
)

data class Outcomes(val successes: Int, val failures: Int, val partial: Int, val pending: Int) {
    val classified
        get() = successes + failures + partial

    val rate: Double?
        get() = if (classified == 0) null else successes * 100.0 / classified
}

fun outcomes(missions: List<Mission>) =
    Outcomes(
        missions.count { it.outcome == "Successful" },
        missions.count { it.outcome == "Failed" },
        missions.count { it.outcome == "Partial failure" },
        missions.count { it.outcome == "Other / pending" },
    )

fun countdown(mission: Mission, now: Instant): String? {
    if (!mission.hasCountdown) return null
    val seconds =
        (mission.instant?.epochSecond?.minus(now.epochSecond) ?: return null).coerceAtLeast(0)
    return "%02d : %02d : %02d : %02d"
        .format(Locale.US, seconds / 86400, seconds / 3600 % 24, seconds / 60 % 60, seconds % 60)
}

object DataParser {
    fun missions(array: JSONArray): List<Mission> =
        (0 until array.length()).mapNotNull { index ->
            val item = array.optJSONObject(index) ?: return@mapNotNull null
            val id = item.optString("id").takeIf { it.isNotBlank() } ?: return@mapNotNull null
            val mission = item.optJSONObject("mission") ?: JSONObject()
            val status = item.optJSONObject("status") ?: JSONObject()
            val pad = item.optJSONObject("pad") ?: JSONObject()
            val precision = item.optJSONObject("net_precision") ?: JSONObject()
            Mission(
                id,
                mission.optString("name").ifBlank { item.optString("name", "Unknown mission") },
                mission.optString("description"),
                item.optJSONObject("launch_service_provider")?.optString("name")
                    ?: "Unknown provider",
                item.optJSONObject("rocket")?.optJSONObject("configuration")?.optString("name")
                    ?: "Unknown vehicle",
                pad.optJSONObject("location")?.optString("name") ?: "Unknown location",
                pad.optString("name"),
                item.optString("net"),
                precision.optString("abbrev"),
                precision.optString("name"),
                status.optString("name", "Unknown"),
                status.optString("abbrev"),
                item.optString("image").takeUnless { it == "null" } ?: "",
                item.optString("window_start"),
                item.optString("window_end"),
            )
        }

    fun vehicles(array: JSONArray): List<Vehicle> =
        (0 until array.length()).mapNotNull { index ->
            val item = array.optJSONObject(index) ?: return@mapNotNull null
            fun number(key: String) =
                if (item.isNull(key) || !item.has(key)) null
                else item.optDouble(key).takeIf { it.isFinite() }
            Vehicle(
                item.optInt("id"),
                item.optString("name"),
                item.optJSONObject("manufacturer")?.optString("name") ?: "Unknown",
                item.optString("description"),
                item.optString("image_url").takeUnless { it == "null" } ?: "",
                number("length"),
                number("diameter"),
                number("launch_mass"),
                number("leo_capacity"),
                number("total_launch_count")?.toInt(),
                number("successful_launches")?.toInt(),
            )
        }
}

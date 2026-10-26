package com.tzero.app.data

import kotlin.math.cos
import kotlin.math.sin

/** Matches the longitude convention of the Earth texture and sphere used by the web app. */
fun globePoint(latitude: Double?, longitude: Double?): FloatArray? {
    if (
        latitude == null ||
            longitude == null ||
            !latitude.isFinite() ||
            !longitude.isFinite() ||
            latitude !in -90.0..90.0 ||
            longitude !in -180.0..180.0
    )
        return null
    val lat = Math.toRadians(latitude)
    val lon = Math.toRadians(longitude)
    return floatArrayOf(
        (cos(lat) * cos(lon)).toFloat(),
        sin(lat).toFloat(),
        (-cos(lat) * sin(lon)).toFloat(),
    )
}

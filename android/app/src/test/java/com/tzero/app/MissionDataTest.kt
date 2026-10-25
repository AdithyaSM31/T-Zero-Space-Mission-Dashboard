package com.tzero.app

import com.tzero.app.data.*
import java.time.Instant
import org.json.JSONArray
import org.junit.Assert.*
import org.junit.Test

class MissionDataTest {
    private fun launch(
        status: String = "Go",
        precision: String = "MIN",
        net: String = "2026-10-27T04:45:00Z",
    ) =
        Mission(
            "test",
            "Test mission",
            "",
            "Provider",
            "Vehicle",
            "Location",
            "Pad",
            net,
            precision,
            precision,
            status,
            status,
            "",
            "",
            "",
        )

    @Test
    fun classifiedDenominatorExcludesPendingAndIncludesPartialFailure() {
        val result =
            outcomes(
                listOf("Success", "Success", "Failure", "Partial Failure", "TBD", "In Flight").map {
                    launch(it)
                }
            )
        assertEquals(4, result.classified)
        assertEquals(2, result.pending)
        assertEquals(50.0, result.rate!!, 0.01)
    }

    @Test
    fun emptyAndPendingSamplesHaveNoSuccessPercentage() {
        assertNull(outcomes(emptyList()).rate)
        assertNull(outcomes(listOf(launch("TBD"))).rate)
    }

    @Test
    fun approximateDatesNeverCreatePreciseCountdownsOrCalendarDays() {
        for (precision in listOf("M", "Q1", "Y", "")) {
            val item = launch(precision = precision)
            assertFalse(item.hasDay)
            assertNull(countdown(item, Instant.EPOCH))
        }
        assertTrue(launch(precision = "DAY").hasDay)
        assertFalse(launch(precision = "DAY").hasCountdown)
    }

    @Test
    fun countdownUsesAnInjectedClockAndDoesNotGoNegative() {
        assertEquals(
            "02 : 01 : 00 : 00",
            countdown(launch(), Instant.parse("2026-10-25T03:45:00Z")),
        )
        assertEquals(
            "00 : 00 : 00 : 00",
            countdown(launch(), Instant.parse("2026-10-28T03:45:00Z")),
        )
        assertNull(countdown(launch(status = "TBC"), Instant.EPOCH))
    }

    @Test
    fun parserHandlesMissingOptionalDescriptionsAndStatistics() {
        val items =
            DataParser.missions(
                JSONArray(
                    """[{"id":"a","name":"Fallback name","net":"2026-10-27T04:45:00Z","mission":null,"status":{"abbrev":"TBD"}}]"""
                )
            )
        assertEquals("Fallback name", items.single().name)
        assertEquals("Unknown vehicle", items.single().vehicle)
        val vehicle =
            DataParser.vehicles(JSONArray("""[{"id":1,"name":"Vehicle","leo_capacity":null}]"""))
        assertNull(vehicle.single().payload)
        assertNull(vehicle.single().height)
    }
}

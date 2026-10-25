package com.tzero.app.ui

import android.content.Intent
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.FileProvider
import com.tzero.app.MissionState
import com.tzero.app.data.Mission
import com.tzero.app.data.outcomes
import java.io.File
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.Locale

private data class Milestone(
    val year: String,
    val title: String,
    val detail: String,
    val url: String,
)

private val milestones =
    listOf(
        Milestone(
            "1957",
            "The space age begins.",
            "Sputnik 1 becomes the first artificial satellite to orbit Earth.",
            "https://www.nasa.gov/history/sputnik/",
        ),
        Milestone(
            "1969",
            "One giant leap.",
            "Apollo 11 brings humanity to the surface of the Moon.",
            "https://www.nasa.gov/mission/apollo-11/",
        ),
        Milestone(
            "1998",
            "A home above Earth.",
            "The first element of the International Space Station launches.",
            "https://www.nasa.gov/international-space-station/",
        ),
        Milestone(
            "2021",
            "A new window on the universe.",
            "The James Webb Space Telescope launches to study distant galaxies and worlds.",
            "https://science.nasa.gov/mission/webb/",
        ),
    )

@Composable
fun HistoryScreen(state: MissionState, save: (String) -> Unit) {
    var curated by rememberSaveable { mutableStateOf(false) }
    var query by rememberSaveable { mutableStateOf("") }
    var status by rememberSaveable { mutableStateOf("") }
    var selected by remember { mutableStateOf<Mission?>(null) }
    val uri = LocalUriHandler.current
    val filtered =
        state.recent.items.filter {
            (query.isBlank() || "${it.name} ${it.provider}".contains(query, true)) &&
                (status.isBlank() || it.outcome == status)
        }
    LazyColumn(
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        item {
            PageHeading(
                "Look back. Look further.",
                "Mission History",
                "Every giant leap starts with a question.",
            )
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                FilterChip(!curated, { curated = false }, label = { Text("Recent missions") })
                FilterChip(curated, { curated = true }, label = { Text("Milestones") })
            }
        }
        if (curated) {
            items(milestones, key = { it.year }) { story ->
                SpaceCard {
                    Eyebrow("EXPLORATION / ${story.year}")
                    Text(story.year, color = Mint, fontSize = 43.sp)
                    Text(story.title, fontSize = 25.sp, lineHeight = 31.sp)
                    Text(story.detail, color = Muted, fontSize = 13.sp, lineHeight = 22.sp)
                    TextButton(onClick = { uri.openUri(story.url) }) {
                        Text("Read the NASA story")
                        Spacer(Modifier.width(8.dp))
                        Icon(Icons.Outlined.NorthEast, null, Modifier.size(15.dp))
                    }
                }
            }
            item { SourceFooter("CURATED NASA MILESTONES · NOT AN EXHAUSTIVE ARCHIVE") }
        } else {
            item {
                OutlinedTextField(
                    query,
                    { query = it },
                    Modifier.fillMaxWidth(),
                    label = { Text("Search recent missions or providers") },
                    singleLine = true,
                    leadingIcon = { Icon(Icons.Outlined.Search, null) },
                )
            }
            item {
                Row(
                    Modifier.horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    listOf("", "Successful", "Failed", "Partial failure", "Other / pending")
                        .forEach { label ->
                            FilterChip(
                                status == label,
                                { status = label },
                                label = { Text(label.ifBlank { "All outcomes" }) },
                            )
                        }
                }
            }
            item { DataNotice(state.recent, state.loading) }
            item {
                Text(
                    "${filtered.size} missions from the retrieved recent sample. Dates shown in ${if (state.localTime) "local time" else "UTC"}.",
                    color = Muted,
                    fontSize = 11.sp,
                    lineHeight = 18.sp,
                )
            }
            items(filtered, key = { it.id }) { mission ->
                MissionCard(
                    mission,
                    mission.id in state.saved,
                    state.localTime,
                    { save(mission.id) },
                    { selected = mission },
                )
            }
            item { SourceFooter("UP TO 100 RECENT LAUNCHES · THE SPACE DEVS") }
        }
    }
    MissionSheet(
        selected,
        selected?.id in state.saved,
        state.localTime,
        { selected?.let { save(it.id) } },
        { selected = null },
    )
}

@Composable
fun AnalyticsScreen(state: MissionState) {
    var provider by rememberSaveable { mutableStateOf("") }
    var days by rememberSaveable { mutableIntStateOf(0) }
    var table by rememberSaveable { mutableStateOf(false) }
    val context = LocalContext.current
    val threshold =
        if (days == 0) Instant.EPOCH else Instant.now().minus(days.toLong(), ChronoUnit.DAYS)
    val sample =
        state.recent.items.filter {
            (provider.isBlank() || it.provider == provider) &&
                it.instant?.isAfter(threshold) == true
        }
    val results = outcomes(sample)
    val providers =
        sample.groupingBy { it.provider }.eachCount().entries.sortedByDescending { it.value }
    val vehicles =
        sample.groupingBy { it.vehicle }.eachCount().entries.sortedByDescending { it.value }
    val activity = sample.groupingBy { it.scheduled.take(10) }.eachCount().toSortedMap()
    LazyColumn(
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        item {
            PageHeading(
                "Patterns behind the progress",
                "Analytics",
                "A clear view of recent launch activity, with the context that matters.",
            )
        }
        item {
            ProviderPicker(state.recent.items.map { it.provider }.distinct().sorted(), provider) {
                provider = it
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                listOf(0, 30, 7).forEach { period ->
                    FilterChip(
                        days == period,
                        { days = period },
                        label = { Text(if (period == 0) "Full sample" else "$period days") },
                    )
                }
            }
        }
        item {
            Text(
                "Metrics describe up to 100 recently retrieved launches, not all-time or year-to-date totals. Filters operate within this sample.",
                fontSize = 12.sp,
                color = Muted,
                lineHeight = 20.sp,
            )
        }
        item { DataNotice(state.recent, state.loading) }
        if (sample.isNotEmpty()) {
            item {
                SpaceCard {
                    Eyebrow("Missions in sample")
                    Text(sample.size.toString(), fontSize = 42.sp, color = Mint)
                    Text(
                        "${sample.minOf { it.scheduled }.take(10)} — ${sample.maxOf { it.scheduled }.take(10)} · UTC",
                        color = Muted,
                        fontSize = 11.sp,
                    )
                }
            }
            item {
                SpaceCard {
                    Eyebrow("Confirmed success rate")
                    Text(
                        results.rate?.let { "%.1f%%".format(Locale.US, it) } ?: "—",
                        fontSize = 42.sp,
                        color = Mint,
                    )
                    Text(
                        "${results.successes} successful / ${results.classified} classified outcomes",
                        color = Muted,
                        fontSize = 12.sp,
                    )
                    Text(
                        "Pending and unclassified statuses are excluded from the denominator. Partial failures count as classified outcomes.",
                        color = Muted,
                        fontSize = 11.sp,
                        lineHeight = 18.sp,
                    )
                }
            }
            item {
                SpaceCard {
                    Eyebrow("The rhythm of exploration")
                    Text("Launch activity", fontSize = 25.sp)
                    Text("Launches per represented UTC day", color = Muted, fontSize = 11.sp)
                    Canvas(
                        Modifier.fillMaxWidth().height(150.dp).semantics {
                            contentDescription =
                                "Launch activity chart. Exact values are available in the data table."
                        }
                    ) {
                        val counts = activity.values.toList()
                        val max = (counts.maxOrNull() ?: 1).toFloat()
                        val width = size.width / counts.size.coerceAtLeast(1)
                        repeat(4) { line ->
                            val y = size.height / 4 * line
                            drawLine(Outline, Offset(0f, y), Offset(size.width, y), 1f)
                        }
                        counts.forEachIndexed { index, count ->
                            val height = (count / max) * (size.height - 8.dp.toPx())
                            drawRect(
                                Mint,
                                Offset(index * width + 1f, size.height - height),
                                Size((width - 2).coerceAtLeast(1f), height),
                            )
                        }
                    }
                    TextButton(onClick = { table = !table }) {
                        Text(if (table) "Hide exact values" else "View exact values")
                    }
                    if (table)
                        activity.forEach { (date, count) -> DetailRow(date, "$count launches") }
                }
            }
            item {
                SpaceCard {
                    Eyebrow("Mission outcomes")
                    DetailRow("Successful", results.successes.toString())
                    DetailRow("Failed", results.failures.toString())
                    DetailRow("Partial failure", results.partial.toString())
                    DetailRow("Other / pending", results.pending.toString())
                }
            }
            item { Ranking("Who is launching?", providers.map { it.key to it.value }, sample.size) }
            item { Ranking("The workhorses.", vehicles.map { it.key to it.value }, sample.size) }
            item {
                Button(
                    onClick = { shareCsv(context, sample) },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Icon(Icons.Outlined.Share, null)
                    Spacer(Modifier.width(9.dp))
                    Text("Export sample as CSV")
                }
            }
        } else if (!state.loading && state.recent.error == null)
            item {
                Text(
                    "No missions match this selection.",
                    color = Muted,
                    modifier = Modifier.padding(20.dp),
                )
            }
        item { SourceFooter("THE SPACE DEVS · BOUNDED RECENT SAMPLE · NOT GLOBAL LIFETIME TOTALS") }
    }
}

@Composable
private fun Ranking(title: String, entries: List<Pair<String, Int>>, count: Int) {
    SpaceCard {
        Text(title, fontSize = 25.sp)
        entries.forEach { (name, value) ->
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(15.dp)) {
                Text(name, Modifier.weight(1f), fontSize = 12.sp, color = Muted, lineHeight = 19.sp)
                Text(value.toString(), color = Mint, fontSize = 13.sp)
            }
            LinearProgressIndicator(
                progress = { value.toFloat() / count.coerceAtLeast(1) },
                modifier = Modifier.fillMaxWidth(),
                color = Mint,
                trackColor = Outline,
            )
        }
    }
}

private fun shareCsv(context: android.content.Context, sample: List<Mission>) {
    fun cell(value: String): String {
        val safe =
            if (
                value.startsWith("=") ||
                    value.startsWith("+") ||
                    value.startsWith("-") ||
                    value.startsWith("@")
            )
                "'$value"
            else value
        return "\"${safe.replace("\"", "\"\"")}\""
    }
    val rows =
        listOf(listOf("Mission", "Provider", "Vehicle", "UTC date", "Outcome")) +
            sample.map { listOf(it.name, it.provider, it.vehicle, it.scheduled, it.status) }
    val directory = File(context.cacheDir, "exports").apply { mkdirs() }
    val file = File(directory, "tzero-launch-sample.csv")
    file.writeText(rows.joinToString("\r\n") { row -> row.joinToString(",") { cell(it) } })
    val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
    context.startActivity(
        Intent.createChooser(
            Intent(Intent.ACTION_SEND).apply {
                type = "text/csv"
                putExtra(Intent.EXTRA_STREAM, uri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            },
            "Export T-Zero sample",
        )
    )
}

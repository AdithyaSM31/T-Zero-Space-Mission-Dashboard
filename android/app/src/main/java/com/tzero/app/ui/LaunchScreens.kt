package com.tzero.app.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.tzero.app.MissionState
import com.tzero.app.data.Mission
import com.tzero.app.data.countdown
import java.time.Instant
import java.time.YearMonth
import java.time.ZoneOffset
import kotlinx.coroutines.delay

@Composable
fun OverviewScreen(
    state: MissionState,
    save: (String) -> Unit,
    changeTime: () -> Unit,
    launches: () -> Unit,
    fleet: () -> Unit,
) {
    val now by
        produceState(Instant.now()) {
            while (true) {
                value = Instant.now()
                delay(1000)
            }
        }
    val upcoming =
        state.upcoming.items.filter { it.instant?.isAfter(now) == true }.sortedBy { it.instant }
    val featured = upcoming.firstOrNull()
    var selected by remember { mutableStateOf<Mission?>(null) }
    var failed by remember { mutableStateOf(false) }
    var earthKey by remember { mutableIntStateOf(0) }
    var earthReady by remember { mutableStateOf(false) }
    LazyColumn(
        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        item {
            Column(
                Modifier.padding(top = 8.dp, bottom = 6.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    HorizontalDivider(Modifier.width(20.dp), color = Mint)
                    Spacer(Modifier.width(9.dp))
                    Text(
                        "YOUR WINDOW TO THE COSMOS",
                        color = Muted,
                        fontSize = 7.sp,
                        letterSpacing = 1.sp,
                        fontFamily = FontFamily.Monospace,
                    )
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        "A bigger perspective.",
                        fontSize = 27.sp,
                        lineHeight = 32.sp,
                        letterSpacing = (-1.2).sp,
                        modifier = Modifier.weight(1f),
                    )
                    IconButton(onClick = launches) {
                        Icon(Icons.Outlined.NorthEast, "Browse launches", Modifier.size(19.dp))
                    }
                }
                Text(
                    "Every launch. Every discovery. One extraordinary\njourney.",
                    color = Muted,
                    fontSize = 11.sp,
                    lineHeight = 18.sp,
                )
            }
        }
        item {
            Surface(
                shape = RoundedCornerShape(10.dp),
                color = Space,
                border = BorderStroke(1.dp, Outline.copy(alpha = .5f)),
            ) {
                Column(Modifier.fillMaxWidth().padding(11.dp)) {
                    BoxWithConstraints(Modifier.fillMaxWidth().height(310.dp).clipToBounds()) {
                        Canvas(Modifier.fillMaxSize()) {
                            val pivot = Offset(size.width * .595f, size.height * .5f)
                            rotate(-24f, pivot) {
                                drawOval(
                                    Mint.copy(alpha = .17f),
                                    topLeft =
                                        Offset(
                                            pivot.x - size.width * .55f,
                                            pivot.y - size.height * .19f,
                                        ),
                                    size = Size(size.width * 1.1f, size.height * .38f),
                                    style = Stroke(1.dp.toPx()),
                                )
                            }
                        }
                        if (!failed) {
                            key(earthKey) {
                                NativeModel(
                                    "earth",
                                    Modifier.offset(x = maxWidth * .08f)
                                        .requiredWidth(maxWidth * 1.03f)
                                        .fillMaxHeight()
                                        .testTag("overview-earth")
                                        .semantics {
                                            stateDescription =
                                                if (earthReady) "Earth ready" else "Earth loading"
                                        },
                                    onReady = { earthReady = true },
                                ) {
                                    failed = true
                                }
                            }
                        } else {
                            EarthArtwork(Modifier.fillMaxSize())
                            TextButton(
                                onClick = {
                                    failed = false
                                    earthKey++
                                },
                                modifier = Modifier.align(Alignment.Center),
                            ) {
                                Text("Retry 3D Earth", fontSize = 10.sp)
                            }
                        }
                        Column(
                            Modifier.padding(10.dp, 12.dp),
                            verticalArrangement = Arrangement.spacedBy(17.dp),
                        ) {
                            Text(
                                "●  THE ORBITAL VIEW",
                                color = Muted,
                                fontSize = 7.sp,
                                letterSpacing = 1.sp,
                                fontFamily = FontFamily.Monospace,
                            )
                            Text(
                                "Our home.\nOur launchpad.",
                                fontSize = 23.sp,
                                lineHeight = 29.sp,
                                letterSpacing = (-.8).sp,
                            )
                        }
                        Row(
                            Modifier.align(Alignment.BottomStart)
                                .padding(10.dp, 16.dp)
                                .fillMaxWidth(.72f),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Icon(Icons.Outlined.MyLocation, null, Modifier.size(15.dp), tint = Mint)
                            Spacer(Modifier.width(7.dp))
                            Text(
                                featured?.location ?: "Earth / Sol system",
                                color = Muted,
                                fontSize = 7.sp,
                                fontFamily = FontFamily.Monospace,
                                maxLines = 1,
                            )
                        }
                        IconButton(
                            onClick = {
                                earthKey++
                                earthReady = false
                                failed = false
                            },
                            modifier = Modifier.align(Alignment.BottomEnd),
                        ) {
                            Icon(
                                Icons.Outlined.RestartAlt,
                                "Reset Earth view",
                                tint = Muted,
                                modifier = Modifier.size(18.dp),
                            )
                        }
                    }
                    if (featured != null) {
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = Panel,
                            border = BorderStroke(1.dp, Outline),
                        ) {
                            Column(
                                Modifier.padding(20.dp),
                                verticalArrangement = Arrangement.spacedBy(16.dp),
                            ) {
                                Row(
                                    Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                ) {
                                    Text(
                                        "◉  NEXT ON THE HORIZON",
                                        color = Muted,
                                        fontSize = 8.sp,
                                        letterSpacing = 1.sp,
                                        fontFamily = FontFamily.Monospace,
                                    )
                                    Text("01", color = Muted, fontSize = 8.sp)
                                }
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        featured.provider,
                                        color = Muted,
                                        fontFamily = FontFamily.Monospace,
                                        fontSize = 9.sp,
                                        modifier = Modifier.weight(1f),
                                    )
                                    Text(featured.statusCode, color = Mint, fontSize = 8.sp)
                                }
                                Text(
                                    featured.name,
                                    fontSize = 26.sp,
                                    lineHeight = 31.sp,
                                    letterSpacing = (-.8).sp,
                                )
                                Text(featured.vehicle, color = Muted, fontSize = 10.sp)
                                Spacer(Modifier.height(2.dp))
                                Text(
                                    "TIME TO SCHEDULED LAUNCH",
                                    color = Muted,
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 7.sp,
                                    letterSpacing = 1.sp,
                                )
                                HorizontalDivider(color = Outline.copy(alpha = .4f))
                                val clock = countdown(featured, now)
                                if (clock != null) {
                                    Row(
                                        Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                    ) {
                                        clock.split(" : ").forEachIndexed { index, value ->
                                            Column(
                                                horizontalAlignment = Alignment.CenterHorizontally
                                            ) {
                                                Text(
                                                    value,
                                                    fontSize = 28.sp,
                                                    fontFamily = FontFamily.Monospace,
                                                )
                                                Text(
                                                    listOf("DAYS", "HOURS", "MINS", "SECS")[index],
                                                    color = Muted,
                                                    fontSize = 7.sp,
                                                    letterSpacing = 1.sp,
                                                )
                                            }
                                            if (index < 3)
                                                Text(":", color = Outline, fontSize = 25.sp)
                                        }
                                    }
                                } else
                                    Text("Awaiting a precise time", color = Muted, fontSize = 12.sp)
                                HorizontalDivider(color = Outline.copy(alpha = .4f))
                                Text(featured.location, color = Muted, fontSize = 9.sp)
                                Text(featured.date(state.localTime), color = Muted, fontSize = 9.sp)
                                Button(
                                    onClick = { selected = featured },
                                    shape = RoundedCornerShape(4.dp),
                                    modifier = Modifier.fillMaxWidth(),
                                ) {
                                    Text(
                                        "Explore mission",
                                        modifier = Modifier.weight(1f),
                                        fontSize = 11.sp,
                                    )
                                    Icon(Icons.Outlined.NorthEast, null, Modifier.size(16.dp))
                                }
                            }
                        }
                    }
                }
            }
        }
        item { DataNotice(state.upcoming, state.loading) }
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                SmallMetric(
                    "ON THE RADAR",
                    if (state.loading && upcoming.isEmpty()) "—" else upcoming.size.toString(),
                    Modifier.weight(1f),
                )
                SmallMetric("SAVED MISSIONS", state.saved.size.toString(), Modifier.weight(1f))
            }
        }
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Coming up next", fontSize = 23.sp, modifier = Modifier.weight(1f))
                TextButton(onClick = launches) { Text("View all") }
            }
        }
        items(upcoming.take(3), key = { it.id }) { mission ->
            MissionCard(
                mission,
                mission.id in state.saved,
                state.localTime,
                { save(mission.id) },
                { selected = mission },
            )
        }
        item {
            SpaceCard {
                Eyebrow("Engineered for the extraordinary")
                Text(
                    "Meet the machines that take us further.",
                    fontSize = 24.sp,
                    lineHeight = 29.sp,
                )
                OutlinedButton(onClick = fleet, modifier = Modifier.fillMaxWidth()) {
                    Text("Explore the fleet")
                }
            }
        }
        item {
            SourceFooter(
                if (state.upcoming.cached) "CACHED SCHEDULE"
                else "THE SPACE DEVS · UP TO 100 UPCOMING MISSIONS"
            )
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
private fun SmallMetric(label: String, value: String, modifier: Modifier) {
    SpaceCard(modifier) {
        Eyebrow(label)
        Text(value, fontSize = 30.sp, fontFamily = FontFamily.Monospace)
    }
}

@Composable
private fun EarthArtwork(modifier: Modifier) {
    Canvas(modifier) {
        val radius = size.minDimension * .47f
        val center = Offset(size.width * .6f, size.height * .5f)
        drawCircle(
            Brush.radialGradient(
                listOf(Color(0xFF428EAC), Color(0xFF183D63), Color(0xFF071422)),
                center - Offset(radius * .4f, radius * .4f),
                radius * 1.8f,
            ),
            radius,
            center,
        )
        drawCircle(Mint.copy(alpha = .2f), radius, center, style = Stroke(1.5.dp.toPx()))
    }
}

@Composable
fun ProviderPicker(providers: List<String>, selected: String, choose: (String) -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    Box {
        OutlinedButton(onClick = { expanded = true }) {
            Text(
                selected.ifBlank { "All providers" },
                maxLines = 1,
                modifier = Modifier.widthIn(max = 220.dp),
            )
            Icon(Icons.Outlined.ExpandMore, "Choose launch provider")
        }
        DropdownMenu(expanded, { expanded = false }) {
            DropdownMenuItem(
                text = { Text("All providers") },
                onClick = {
                    choose("")
                    expanded = false
                },
            )
            providers.forEach { provider ->
                DropdownMenuItem(
                    text = { Text(provider) },
                    onClick = {
                        choose(provider)
                        expanded = false
                    },
                )
            }
        }
    }
}

@Composable
fun LaunchScreen(state: MissionState, save: (String) -> Unit) {
    var query by rememberSaveable { mutableStateOf("") }
    var provider by rememberSaveable { mutableStateOf("") }
    var onlySaved by rememberSaveable { mutableStateOf(false) }
    var calendar by rememberSaveable { mutableStateOf(false) }
    var status by rememberSaveable { mutableStateOf("") }
    var monthText by rememberSaveable { mutableStateOf(YearMonth.now(ZoneOffset.UTC).toString()) }
    var day by rememberSaveable { mutableStateOf<String?>(null) }
    var selected by remember { mutableStateOf<Mission?>(null) }
    val month = YearMonth.parse(monthText)
    val upcoming = state.upcoming.items.filter { it.instant?.isAfter(Instant.now()) == true }
    val filtered =
        upcoming.filter {
            (query.isBlank() || "$it".contains(query, true)) &&
                (provider.isBlank() || it.provider == provider) &&
                (!onlySaved || it.id in state.saved) &&
                (status.isBlank() || it.statusCode == status)
        }
    val displayed =
        if (!calendar) filtered
        else filtered.filter { it.hasDay && it.scheduled.startsWith(day ?: monthText) }
    LazyColumn(
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item {
            PageHeading(
                "The next chapter starts here",
                "Launch Center",
                "Follow the missions taking humanity a little further.",
            )
        }
        item {
            OutlinedTextField(
                query,
                { query = it },
                Modifier.fillMaxWidth(),
                label = { Text("Search missions, vehicles, or sites") },
                leadingIcon = { Icon(Icons.Outlined.Search, null) },
            )
        }
        item {
            ProviderPicker(upcoming.map { it.provider }.distinct().sorted(), provider) {
                provider = it
            }
        }
        item {
            Row(
                Modifier.horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                FilterChip(
                    selected = onlySaved,
                    onClick = { onlySaved = !onlySaved },
                    label = { Text("Saved") },
                )
                FilterChip(
                    selected = calendar,
                    onClick = {
                        calendar = !calendar
                        day = null
                    },
                    label = { Text("Calendar") },
                )
                FilterChip(
                    selected = status.isEmpty(),
                    onClick = { status = "" },
                    label = { Text("All statuses") },
                )
                upcoming
                    .map { it.statusCode }
                    .distinct()
                    .forEach { code ->
                        FilterChip(
                            selected = status == code,
                            onClick = { status = code },
                            label = { Text(code) },
                        )
                    }
            }
        }
        item { DataNotice(state.upcoming, state.loading) }
        if (calendar)
            item {
                SpaceCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(
                            onClick = {
                                monthText = month.minusMonths(1).toString()
                                day = null
                            }
                        ) {
                            Icon(Icons.Outlined.ChevronLeft, "Previous month")
                        }
                        Text(month.toString() + " · UTC", Modifier.weight(1f))
                        IconButton(
                            onClick = {
                                monthText = month.plusMonths(1).toString()
                                day = null
                            }
                        ) {
                            Icon(Icons.Outlined.ChevronRight, "Next month")
                        }
                    }
                    Row {
                        listOf("M", "T", "W", "T", "F", "S", "S").forEach {
                            Text(it, Modifier.weight(1f), color = Muted, fontSize = 11.sp)
                        }
                    }
                    val offset = month.atDay(1).dayOfWeek.value - 1
                    val cells =
                        (0 until offset + month.lengthOfMonth()).map {
                            if (it < offset) null else it - offset + 1
                        }
                    cells.chunked(7).forEach { week ->
                        Row(Modifier.fillMaxWidth()) {
                            (0..6).forEach { col ->
                                val number = week.getOrNull(col)
                                val date = number?.let { month.atDay(it).toString() }
                                val count =
                                    filtered.count {
                                        it.hasDay && it.scheduled.startsWith(date ?: "invalid")
                                    }
                                Column(
                                    Modifier.weight(1f)
                                        .heightIn(min = 44.dp)
                                        .background(
                                            if (date != null && day == date) Outline
                                            else Color.Transparent
                                        )
                                        .clickable(enabled = number != null) {
                                            day = if (day == date) null else date
                                        },
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                ) {
                                    Text(number?.toString() ?: "", fontSize = 12.sp)
                                    if (number != null && count > 0)
                                        Text("$count", color = Mint, fontSize = 9.sp)
                                }
                            }
                        }
                    }
                    Text(
                        "Approximate month/year dates are excluded from calendar days.",
                        color = Muted,
                        fontSize = 10.sp,
                    )
                    if (day != null)
                        TextButton(onClick = { day = null }) { Text("Show whole month") }
                }
            }
        item { Text("${displayed.size} missions", color = Muted, fontSize = 12.sp) }
        items(displayed, key = { it.id }) { mission ->
            MissionCard(
                mission,
                mission.id in state.saved,
                state.localTime,
                { save(mission.id) },
                { selected = mission },
            )
        }
        if (displayed.isEmpty() && !state.loading)
            item { Text("No missions match these filters.", color = Muted) }
        item { SourceFooter("THE SPACE DEVS · SCHEDULES MAY CHANGE") }
    }
    MissionSheet(
        selected,
        selected?.id in state.saved,
        state.localTime,
        { selected?.let { save(it.id) } },
        { selected = null },
    )
}

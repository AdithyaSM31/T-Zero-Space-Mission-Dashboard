package com.tzero.app.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.tzero.app.MissionViewModel
import com.tzero.app.data.Mission
import com.tzero.app.data.Snapshot

val Space = Color(0xFF080C12)
val Panel = Color(0xFF101B26)
val Mint = Color(0xFF8CE6DA)
val Muted = Color(0xFF91A6B8)
val Outline = Color(0xFF233543)
private val palette =
    darkColorScheme(
        primary = Mint,
        onPrimary = Space,
        background = Space,
        surface = Panel,
        onBackground = Color(0xFFEAF0F5),
        onSurface = Color(0xFFEAF0F5),
        onSurfaceVariant = Muted,
        outline = Outline,
        secondaryContainer = Color(0xFF203D40),
        onSecondaryContainer = Mint,
    )

private data class Destination(val title: String, val icon: ImageVector)

private val destinations =
    listOf(
        Destination("Overview", Icons.Outlined.Dashboard),
        Destination("Launches", Icons.Outlined.RocketLaunch),
        Destination("Fleet", Icons.Outlined.Explore),
        Destination("History", Icons.Outlined.History),
        Destination("Analytics", Icons.Outlined.BarChart),
    )

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TZeroApp(vm: MissionViewModel = viewModel()) {
    val composeView = LocalView.current
    DisposableEffect(composeView) {
        if (android.os.Build.VERSION.SDK_INT >= 35) {
            composeView.requestedFrameRate = android.view.View.REQUESTED_FRAME_RATE_CATEGORY_HIGH
        }
        onDispose {
            if (android.os.Build.VERSION.SDK_INT >= 35) {
                composeView.requestedFrameRate =
                    android.view.View.REQUESTED_FRAME_RATE_CATEGORY_DEFAULT
            }
        }
    }
    val state by vm.state.collectAsStateWithLifecycle()
    var selected by rememberSaveable { mutableIntStateOf(0) }
    BackHandler(selected != 0) { selected = 0 }
    MaterialTheme(colorScheme = palette) {
        Scaffold(
            containerColor = Space,
            topBar = {
                Column(Modifier.statusBarsPadding()) {
                    Row(
                        Modifier.fillMaxWidth().height(48.dp).padding(horizontal = 15.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text("Workspace", color = Muted, fontSize = 9.sp)
                        Icon(
                            Icons.Outlined.ChevronRight,
                            null,
                            Modifier.padding(horizontal = 6.dp).size(12.dp),
                            tint = Muted,
                        )
                        Text(
                            destinations[selected].title,
                            fontSize = 9.sp,
                            modifier = Modifier.weight(1f),
                        )
                        Text(
                            if (state.loading) "SYNCING"
                            else if (state.upcoming.cached) "CACHED"
                            else if (state.upcoming.items.isNotEmpty()) "CONNECTED" else "OFFLINE",
                            color = Mint,
                            fontSize = 6.sp,
                            fontFamily = FontFamily.Monospace,
                        )
                        Spacer(Modifier.width(6.dp))
                        TextButton(onClick = vm::toggleTime, contentPadding = PaddingValues(5.dp)) {
                            Text(
                                if (state.localTime) "UTC / Local*" else "UTC* / Local",
                                fontSize = 8.sp,
                            )
                        }
                        IconButton(
                            onClick = { vm.refresh(true) },
                            enabled = !state.loading,
                            modifier = Modifier.size(28.dp),
                        ) {
                            Icon(
                                Icons.Outlined.Refresh,
                                "Refresh launch data",
                                Modifier.size(16.dp),
                            )
                        }
                    }
                    HorizontalDivider(color = Outline.copy(alpha = .4f))
                }
            },
            bottomBar = {
                NavigationBar(containerColor = Space, tonalElevation = 0.dp) {
                    destinations.forEachIndexed { index, item ->
                        NavigationBarItem(
                            selected = selected == index,
                            onClick = { selected = index },
                            icon = { Icon(item.icon, null) },
                            label = { Text(item.title, fontSize = 10.sp) },
                            colors =
                                NavigationBarItemDefaults.colors(
                                    indicatorColor = Color.Transparent,
                                    selectedIconColor = Mint,
                                    selectedTextColor = Mint,
                                    unselectedIconColor = Muted,
                                    unselectedTextColor = Muted,
                                ),
                        )
                    }
                }
            },
        ) { padding ->
            Box(Modifier.fillMaxSize().padding(padding)) {
                when (selected) {
                    0 ->
                        OverviewScreen(
                            state,
                            vm::toggleSaved,
                            vm::toggleTime,
                            { selected = 1 },
                            { selected = 2 },
                        )
                    1 -> LaunchScreen(state, vm::toggleSaved)
                    2 -> FleetScreen(state)
                    3 -> HistoryScreen(state, vm::toggleSaved)
                    else -> AnalyticsScreen(state)
                }
            }
        }
    }
}

@Composable
fun Eyebrow(text: String, modifier: Modifier = Modifier) {
    Text(
        text.uppercase(),
        modifier,
        color = Mint.copy(alpha = .8f),
        fontSize = 9.sp,
        letterSpacing = 1.6.sp,
        fontFamily = FontFamily.Monospace,
    )
}

@Composable
fun PageHeading(eyebrow: String, title: String, description: String) {
    Column(
        verticalArrangement = Arrangement.spacedBy(11.dp),
        modifier = Modifier.padding(vertical = 10.dp),
    ) {
        Eyebrow(eyebrow)
        Text(title, fontSize = 32.sp, lineHeight = 37.sp, fontWeight = FontWeight.Medium)
        Text(description, color = Muted, fontSize = 13.sp, lineHeight = 20.sp)
    }
}

@Composable
fun SpaceCard(modifier: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
    Surface(
        modifier,
        shape = RoundedCornerShape(20.dp),
        color = Panel,
        border = BorderStroke(1.dp, Outline),
    ) {
        Column(
            Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(13.dp),
            content = content,
        )
    }
}

@Composable
fun DataNotice(snapshot: Snapshot<*>, loading: Boolean = false) {
    if (loading && snapshot.items.isEmpty()) {
        Row(
            Modifier.fillMaxWidth().padding(18.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            CircularProgressIndicator(Modifier.size(17.dp), color = Mint, strokeWidth = 2.dp)
            Text("Connecting to the launch source…", color = Muted, fontSize = 12.sp)
        }
    }
    snapshot.error?.let {
        Text(
            if (snapshot.items.isEmpty()) it
            else "$it Showing cached records; schedules may have changed.",
            color = Color(0xFFE9C58A),
            fontSize = 12.sp,
            lineHeight = 19.sp,
            modifier =
                Modifier.background(Color(0xFF29231B), RoundedCornerShape(12.dp))
                    .padding(15.dp)
                    .fillMaxWidth(),
        )
    }
    if (!loading && snapshot.items.isEmpty() && snapshot.error == null)
        Text(
            "No missions in this source sample.",
            color = Muted,
            modifier = Modifier.padding(18.dp),
        )
}

@Composable
fun MissionCard(
    mission: Mission,
    saved: Boolean,
    local: Boolean,
    onSave: () -> Unit,
    onClick: () -> Unit,
) {
    OutlinedCard(
        onClick = onClick,
        colors = CardDefaults.outlinedCardColors(containerColor = Panel),
        border = BorderStroke(1.dp, Outline),
        shape = RoundedCornerShape(16.dp),
    ) {
        Column(
            Modifier.fillMaxWidth().padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Eyebrow(mission.provider, Modifier.weight(1f))
                IconButton(onClick = onSave, modifier = Modifier.size(42.dp)) {
                    Icon(
                        if (saved) Icons.Outlined.BookmarkAdded else Icons.Outlined.BookmarkBorder,
                        if (saved) "Remove saved mission" else "Save mission",
                        tint = if (saved) Mint else Muted,
                    )
                }
            }
            Text(mission.name, fontSize = 21.sp, lineHeight = 27.sp)
            Text(mission.vehicle, fontSize = 12.sp, color = Muted)
            HorizontalDivider(color = Outline)
            Text(
                mission.date(local),
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace,
                color = Mint,
            )
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(7.dp),
            ) {
                Icon(Icons.Outlined.LocationOn, null, Modifier.size(13.dp), tint = Muted)
                Text(
                    mission.location,
                    fontSize = 11.sp,
                    color = Muted,
                    modifier = Modifier.weight(1f),
                )
                StatusBadge(mission.statusCode)
            }
        }
    }
}

@Composable
fun StatusBadge(text: String) {
    Text(
        text.ifBlank { "Unknown" },
        fontSize = 10.sp,
        color = if (text == "Failure") Color(0xFFF0A1A3) else Mint,
        modifier =
            Modifier.background(Mint.copy(alpha = .08f), RoundedCornerShape(5.dp))
                .padding(horizontal = 8.dp, vertical = 5.dp),
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MissionSheet(
    mission: Mission?,
    saved: Boolean,
    local: Boolean,
    onSave: () -> Unit,
    onDismiss: () -> Unit,
) {
    if (mission == null) return
    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = Panel) {
        androidx.compose.foundation.lazy.LazyColumn(
            Modifier.fillMaxWidth().padding(horizontal = 24.dp),
            contentPadding = PaddingValues(bottom = 36.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp),
        ) {
            item {
                Eyebrow("Mission brief")
                Spacer(Modifier.height(15.dp))
                Text(mission.name, fontSize = 29.sp, lineHeight = 35.sp)
            }
            item { StatusBadge(mission.status) }
            if (mission.image.startsWith("https://"))
                item {
                    AsyncImage(
                        mission.image,
                        mission.name,
                        modifier = Modifier.fillMaxWidth().height(190.dp),
                        contentScale = androidx.compose.ui.layout.ContentScale.Crop,
                    )
                }
            item {
                Text(
                    mission.description.ifBlank {
                        "The source has not provided a mission description."
                    },
                    color = Muted,
                    lineHeight = 23.sp,
                )
            }
            item {
                DetailRow("Vehicle", mission.vehicle)
                DetailRow("Provider", mission.provider)
                DetailRow("Scheduled", mission.date(local))
                DetailRow("Launch site", "${mission.pad}\n${mission.location}")
            }
            item {
                Button(onClick = onSave, modifier = Modifier.fillMaxWidth()) {
                    Icon(
                        if (saved) Icons.Outlined.BookmarkAdded else Icons.Outlined.BookmarkBorder,
                        null,
                    )
                    Spacer(Modifier.width(9.dp))
                    Text(if (saved) "Saved · remove from collection" else "Save this mission")
                }
            }
            item {
                Text(
                    "Source: The Space Devs. Schedules can change; the listed time is not launch clearance.",
                    fontSize = 11.sp,
                    color = Muted,
                    lineHeight = 18.sp,
                )
            }
        }
    }
}

@Composable
fun DetailRow(label: String, value: String) {
    Row(
        Modifier.fillMaxWidth().padding(vertical = 11.dp),
        horizontalArrangement = Arrangement.spacedBy(20.dp),
    ) {
        Text(label, Modifier.width(95.dp), color = Muted, fontSize = 12.sp)
        Text(value, Modifier.weight(1f), fontSize = 13.sp, lineHeight = 20.sp)
    }
    HorizontalDivider(color = Outline)
}

@Composable
fun SourceFooter(text: String = "THE SPACE DEVS · SCHEDULES SUBJECT TO CHANGE") {
    Text(
        text,
        fontSize = 8.sp,
        fontFamily = FontFamily.Monospace,
        letterSpacing = .8.sp,
        color = Muted,
        lineHeight = 15.sp,
        modifier = Modifier.padding(vertical = 18.dp),
    )
}

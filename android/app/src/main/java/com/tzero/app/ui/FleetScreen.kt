package com.tzero.app.ui

import androidx.compose.foundation.Image
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.tzero.app.MissionState
import com.tzero.app.R
import com.tzero.app.data.Vehicle
import java.time.Instant
import java.util.Locale

private data class Heritage(
    val slug: String,
    val name: String,
    val preview: Int,
    val era: String,
    val description: String,
)

private val models =
    listOf(
        Heritage(
            "saturn-v",
            "Saturn V",
            R.drawable.saturn_v_preview,
            "APOLLO / RETIRED",
            "The three-stage launch vehicle that carried Apollo crews toward the Moon. NASA / Michael D. Carbajal.",
        ),
        Heritage(
            "atlas-mercury",
            "Friendship 7",
            R.drawable.atlas_mercury_preview,
            "MERCURY / RETIRED",
            "John Glenn's Mercury capsule, not the complete Atlas launch vehicle. Original NASA geometry with reference-based restored finishes.",
        ),
        Heritage(
            "ares-i",
            "Ares I",
            R.drawable.ares_i_preview,
            "CONSTELLATION / HISTORICAL CONCEPT",
            "A NASA historical concept, not an operational vehicle. The colored source model has been cleaned of duplicate export fragments. NASA / Michael D. Carbajal.",
        ),
    )

private fun number(value: Double?, unit: String = "") =
    value?.let {
        String.format(Locale.US, "%,.1f", it).removeSuffix(".0") +
            if (unit.isBlank()) "" else " $unit"
    } ?: "Not provided"

@Composable
fun FleetScreen(state: MissionState) {
    var heritage by rememberSaveable { mutableStateOf(false) }
    var modelIndex by rememberSaveable { mutableIntStateOf(0) }
    var query by rememberSaveable { mutableStateOf("") }
    var compare by rememberSaveable { mutableStateOf(listOf<Int>()) }
    var selected by remember { mutableStateOf<Vehicle?>(null) }
    val asset = models[modelIndex]
    var active3D by remember(asset.slug) { mutableStateOf(false) }
    var failed by remember(asset.slug) { mutableStateOf(false) }
    var modelReady by remember(asset.slug) { mutableStateOf(false) }
    val vehicles = state.fleet.items.filter { "${it.name} ${it.maker}".contains(query, true) }
    val comparison = state.fleet.items.filter { it.id in compare }
    LazyColumn(
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        item {
            PageHeading(
                "Engineered for the extraordinary",
                "Fleet Explorer",
                "Meet the machines that take us further.",
            )
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                FilterChip(!heritage, { heritage = false }, label = { Text("Vehicle catalog") })
                FilterChip(heritage, { heritage = true }, label = { Text("NASA 3D") })
            }
        }
        if (heritage) {
            item {
                Row(
                    Modifier.horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(9.dp),
                ) {
                    models.forEachIndexed { index, item ->
                        FilterChip(
                            index == modelIndex,
                            { modelIndex = index },
                            label = { Text(item.name) },
                        )
                    }
                }
            }
            item {
                SpaceCard {
                    Eyebrow(asset.era)
                    Text(asset.name, fontSize = 30.sp)
                    if (active3D && !failed)
                        NativeModel(
                            asset.slug,
                            Modifier.fillMaxWidth().height(380.dp).clip(MaterialTheme.shapes.large),
                            onReady = { modelReady = true },
                        ) {
                            failed = true
                        }
                    else
                        Image(
                            painterResource(asset.preview),
                            "${asset.name} preview",
                            Modifier.fillMaxWidth().height(300.dp),
                            contentScale = androidx.compose.ui.layout.ContentScale.Fit,
                        )
                    if (!active3D || failed)
                        Button(
                            onClick = {
                                failed = false
                                modelReady = false
                                active3D = true
                            },
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text(if (failed) "Retry native 3D viewer" else "Explore in 3D")
                            Spacer(Modifier.width(9.dp))
                            Icon(Icons.Outlined.ViewInAr, null)
                        }
                    if (active3D && !failed) {
                        Text(
                            if (modelReady)
                                "Drag to orbit · Pinch to zoom · Native Filament rendering"
                            else "Preparing native model…",
                            fontSize = 10.sp,
                            color = Muted,
                        )
                        TextButton(onClick = { active3D = false }) {
                            Text("Return to static preview")
                        }
                    }
                    Text(asset.description, color = Muted, lineHeight = 22.sp, fontSize = 13.sp)
                }
            }
            item { StagingStudy() }
            item { SourceFooter("NASA 3D RESOURCES · VISUAL REFERENCES, NOT ENGINEERING DRAWINGS") }
        } else {
            item {
                OutlinedTextField(
                    query,
                    { query = it },
                    Modifier.fillMaxWidth(),
                    label = { Text("Search vehicles or manufacturers") },
                    leadingIcon = { Icon(Icons.Outlined.Search, null) },
                    singleLine = true,
                )
            }
            item {
                Text(
                    "Bundled source snapshot · ${state.fleet.updatedAt?.let { Instant.ofEpochMilli(it).toString().take(10) } ?: "Date unavailable"}. Specifications may be incomplete or have changed.",
                    color = Muted,
                    lineHeight = 18.sp,
                    fontSize = 11.sp,
                )
            }
            if (state.fleet.error != null) item { DataNotice(state.fleet) }
            if (comparison.isNotEmpty())
                item {
                    SpaceCard {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Eyebrow("Side by side", Modifier.weight(1f))
                            TextButton(onClick = { compare = emptyList() }) { Text("Clear") }
                        }
                        if (comparison.size == 1)
                            Text("Select one more vehicle to compare.", color = Muted)
                        else {
                            val a = comparison[0]
                            val b = comparison[1]
                            Text("${a.name} / ${b.name}", fontSize = 22.sp, lineHeight = 29.sp)
                            ComparisonRow("Height", number(a.height, "m"), number(b.height, "m"))
                            ComparisonRow(
                                "Diameter",
                                number(a.diameter, "m"),
                                number(b.diameter, "m"),
                            )
                            ComparisonRow("Launch mass", number(a.mass, "t"), number(b.mass, "t"))
                            ComparisonRow(
                                "Payload to LEO",
                                number(a.payload, "kg"),
                                number(b.payload, "kg"),
                            )
                            ComparisonRow(
                                "Flights",
                                a.launches?.toString() ?: "Not provided",
                                b.launches?.toString() ?: "Not provided",
                            )
                        }
                    }
                }
            items(vehicles, key = { it.id }) { vehicle ->
                SpaceCard {
                    if (vehicle.image.startsWith("https://"))
                        AsyncImage(
                            vehicle.image,
                            vehicle.name,
                            modifier =
                                Modifier.fillMaxWidth()
                                    .height(190.dp)
                                    .clip(MaterialTheme.shapes.medium),
                            contentScale = androidx.compose.ui.layout.ContentScale.Crop,
                        )
                    Eyebrow(vehicle.maker)
                    Text(vehicle.name, fontSize = 26.sp, lineHeight = 32.sp)
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(
                            "HEIGHT\n${number(vehicle.height, "m")}",
                            fontSize = 11.sp,
                            lineHeight = 20.sp,
                            color = Muted,
                        )
                        Text(
                            "LEO PAYLOAD\n${number(vehicle.payload, "kg")}",
                            fontSize = 11.sp,
                            lineHeight = 20.sp,
                            color = Muted,
                        )
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedButton(
                            onClick = { selected = vehicle },
                            modifier = Modifier.weight(1f),
                        ) {
                            Text("Details")
                        }
                        OutlinedButton(
                            onClick = {
                                compare =
                                    if (vehicle.id in compare) compare - vehicle.id
                                    else (compare + vehicle.id).takeLast(2)
                            },
                            modifier = Modifier.weight(1f),
                        ) {
                            Icon(
                                if (vehicle.id in compare) Icons.Outlined.Check
                                else Icons.Outlined.CompareArrows,
                                null,
                                Modifier.size(16.dp),
                            )
                            Spacer(Modifier.width(7.dp))
                            Text("Compare")
                        }
                    }
                }
            }
            item { SourceFooter("THE SPACE DEVS · BUNDLED VEHICLE SNAPSHOT · NOT LIVE TELEMETRY") }
        }
    }
    VehicleSheet(selected) { selected = null }
}

@Composable
private fun ComparisonRow(label: String, a: String, b: String) {
    Column(verticalArrangement = Arrangement.spacedBy(9.dp)) {
        Text(label, color = Muted, fontSize = 11.sp)
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(14.dp)) {
            Text(a, Modifier.weight(1f), fontSize = 13.sp, color = Mint)
            Text(b, Modifier.weight(1f), fontSize = 13.sp, color = Mint)
        }
        HorizontalDivider(color = Outline)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun VehicleSheet(vehicle: Vehicle?, close: () -> Unit) {
    if (vehicle == null) return
    ModalBottomSheet(onDismissRequest = close, containerColor = Panel) {
        LazyColumn(
            Modifier.padding(horizontal = 24.dp),
            contentPadding = PaddingValues(bottom = 35.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp),
        ) {
            item {
                Eyebrow(vehicle.maker)
                Spacer(Modifier.height(12.dp))
                Text(vehicle.name, fontSize = 30.sp)
            }
            item {
                Text(
                    vehicle.description.ifBlank { "No description provided." },
                    color = Muted,
                    lineHeight = 23.sp,
                )
            }
            item {
                DetailRow("Height", number(vehicle.height, "m"))
                DetailRow("Diameter", number(vehicle.diameter, "m"))
                DetailRow("Launch mass", number(vehicle.mass, "t"))
                DetailRow("LEO payload", number(vehicle.payload, "kg"))
                DetailRow("Flights", vehicle.launches?.toString() ?: "Not provided")
            }
        }
    }
}

@Composable
private fun StagingStudy() {
    var stage by rememberSaveable { mutableIntStateOf(0) }
    SpaceCard {
        Eyebrow("Saturn V / how staging works")
        Text("Go further by letting go.", fontSize = 25.sp, lineHeight = 30.sp)
        Text(
            "A launch vehicle sheds spent stages so the remaining engines accelerate less mass.",
            color = Muted,
            lineHeight = 21.sp,
            fontSize = 13.sp,
        )
        listOf("Assembled", "First stage separates", "Second stage separates").forEachIndexed {
            index,
            label ->
            FilterChip(stage == index, { stage = index }, label = { Text("0${index + 1}  $label") })
        }
        Text(
            when (stage) {
                0 -> "APOLLO\nS-IVB · Third stage\nS-II · Second stage\nS-IC · First stage"
                1 -> "APOLLO + S-IVB + S-II continue upward\n\n↘ S-IC separates"
                else -> "APOLLO + S-IVB continue upward\n\n↘ S-II separates\n↘ S-IC has separated"
            },
            fontFamily = FontFamily.Monospace,
            fontSize = 13.sp,
            lineHeight = 25.sp,
            color = Mint,
        )
        Text(
            "Educational sequence. Timing, distance, and proportions are illustrative.",
            color = Muted,
            fontSize = 10.sp,
            lineHeight = 17.sp,
        )
    }
}

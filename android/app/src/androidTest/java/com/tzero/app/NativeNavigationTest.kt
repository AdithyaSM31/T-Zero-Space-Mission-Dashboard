package com.tzero.app

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import org.junit.Rule
import org.junit.Test

class NativeNavigationTest {
    @get:Rule val compose = createAndroidComposeRule<MainActivity>()

    @Test
    fun overviewEarthLoadsOrbitsAndResets() {
        fun awaitEarth() {
            compose.waitUntil(timeoutMillis = 30000) {
                compose
                    .onAllNodes(hasTestTag("overview-earth") and hasStateDescription("Earth ready"))
                    .fetchSemanticsNodes()
                    .isNotEmpty()
            }
        }
        awaitEarth()
        compose.onNodeWithTag("overview-earth").performTouchInput {
            swipe(start = centerRight, end = centerLeft, durationMillis = 600)
        }
        compose.onNodeWithTag("overview-earth").assertIsDisplayed()
        compose.onNodeWithContentDescription("Reset Earth view").performClick()
        awaitEarth()
        compose.onNodeWithTag("overview-earth").assertIsDisplayed()
    }

    @Test
    fun bundledModelsCompleteNativeLoading() {
        compose.onNodeWithText("Fleet", useUnmergedTree = true).performClick()
        compose.onNodeWithText("NASA 3D").performClick()
        for (name in listOf("Saturn V", "Friendship 7", "Ares I")) {
            compose.onAllNodesWithText(name).onFirst().performScrollTo().performClick()
            compose.onNodeWithText("Explore in 3D").performScrollTo().performClick()
            compose.waitUntil(timeoutMillis = 30000) {
                compose
                    .onAllNodesWithText("Drag to orbit · Pinch to zoom · Native Filament rendering")
                    .fetchSemanticsNodes()
                    .isNotEmpty()
            }
            compose.onNodeWithText("Return to static preview").performScrollTo().performClick()
        }
    }

    @Test
    fun nativeDestinationsAndOfflineHeritageCatalogAreAccessible() {
        compose.onNodeWithText("A bigger perspective.").assertIsDisplayed()
        compose.onNodeWithText("Launches").performClick()
        compose.onNodeWithText("Launch Center").assertIsDisplayed()
        compose.onNodeWithText("Fleet", useUnmergedTree = true).performClick()
        compose.onNodeWithText("NASA 3D").performClick()
        compose.onNodeWithContentDescription("Saturn V preview").assertExists()
        compose.onNodeWithText("Friendship 7").performClick()
        compose.onNodeWithContentDescription("Friendship 7 preview").assertExists()
        compose.onNodeWithText("History", useUnmergedTree = true).performClick()
        compose.onNodeWithText("Milestones").performClick()
        compose.onNodeWithText("The space age begins.").assertExists()
        compose.onNodeWithText("Analytics", useUnmergedTree = true).performClick()
        compose.onNodeWithText("Full sample").assertIsDisplayed()
    }
}

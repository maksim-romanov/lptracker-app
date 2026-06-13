package expo.modules.widgetbridge

import androidx.test.core.app.ApplicationProvider
import expo.modules.widgetbridge.widget.data.InvertedStore
import kotlinx.coroutines.runBlocking
import org.junit.Test
import org.junit.Assert.*
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class InvertedStoreTest {
  private val ctx = ApplicationProvider.getApplicationContext<android.content.Context>()

  @Test fun emptyByDefault() = runBlocking {
    val store = InvertedStore(ctx)
    assertFalse(store.isInverted("ref-1"))
  }

  @Test fun toggleOnThenOff() = runBlocking {
    val store = InvertedStore(ctx)
    store.toggle("ref-1")
    assertTrue(store.isInverted("ref-1"))
    store.toggle("ref-1")
    assertFalse(store.isInverted("ref-1"))
  }

  @Test fun isolatedPerRef() = runBlocking {
    val store = InvertedStore(ctx)
    store.toggle("ref-1")
    assertTrue(store.isInverted("ref-1"))
    assertFalse(store.isInverted("ref-2"))
  }
}

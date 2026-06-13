package expo.modules.widgetbridge.widget.data

import android.content.Context
import androidx.core.util.AtomicFile
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.Serializable
import java.io.File

class InvertedStore(private val context: Context) {
  @Serializable private data class Payload(val refs: List<String>)
  private val mutex = Mutex()

  private fun file() = AtomicFile(File(context.filesDir, FILENAME))

  suspend fun isInverted(ref: String): Boolean = mutex.withLock { load().contains(ref) }

  suspend fun toggle(ref: String): Unit = mutex.withLock {
    val refs = load().toMutableSet()
    if (!refs.add(ref)) refs.remove(ref)
    write(refs)
  }

  private fun load(): Set<String> {
    val af = file()
    return try {
      val bytes = af.readFully()
      SnapshotJson.json.decodeFromString(Payload.serializer(), bytes.decodeToString()).refs.toSet()
    } catch (_: java.io.FileNotFoundException) {
      emptySet()
    } catch (_: Exception) {
      emptySet()
    }
  }

  private fun write(refs: Set<String>) {
    val af = file()
    val out = af.startWrite()
    try {
      out.write(SnapshotJson.json.encodeToString(Payload.serializer(), Payload(refs.toList())).encodeToByteArray())
      af.finishWrite(out)
    } catch (e: Exception) {
      af.failWrite(out)
      throw e
    }
  }

  companion object { const val FILENAME = "widget-inverted.json" }
}

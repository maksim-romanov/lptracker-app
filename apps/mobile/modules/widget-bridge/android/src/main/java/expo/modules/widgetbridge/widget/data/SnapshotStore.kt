package expo.modules.widgetbridge.widget.data

import android.content.Context
import android.util.Log
import androidx.core.util.AtomicFile
import java.io.File

class SnapshotStore(private val context: Context) {
  fun load(): WidgetSnapshot? {
    val file = AtomicFile(File(context.filesDir, FILENAME))
    return try {
      val bytes = file.readFully()
      SnapshotJson.json.decodeFromString(WidgetSnapshot.serializer(), bytes.decodeToString())
    } catch (_: java.io.FileNotFoundException) {
      null
    } catch (e: Exception) {
      Log.w("SnapshotStore", "Decode failed: ${e.message}")
      null
    }
  }

  fun writeRaw(json: String) {
    val file = AtomicFile(File(context.filesDir, FILENAME))
    val out = file.startWrite()
    try {
      out.write(json.encodeToByteArray())
      file.finishWrite(out)
    } catch (e: Exception) {
      file.failWrite(out)
      throw e
    }
  }

  companion object { const val FILENAME = "widget-snapshot.json" }
}

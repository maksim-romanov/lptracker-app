package expo.modules.widgetbridge.widget.images

import android.content.Context
import android.graphics.Bitmap
import android.graphics.drawable.BitmapDrawable
import coil.ImageLoader
import coil.request.ImageRequest
import coil.size.Size

object CoilLoader {
  @Volatile private var loader: ImageLoader? = null

  private fun loader(ctx: Context): ImageLoader =
    loader ?: synchronized(this) {
      loader ?: ImageLoader.Builder(ctx)
        .allowHardware(false)
        .build()
        .also { loader = it }
    }

  /**
   * Load a remote bitmap, downscaled to (sizePx, sizePx). Returns null on
   * network failure. RemoteViews IPC budget is 1 MB; this caps each icon
   * at ~96×96 px = ~36 KB ARGB_8888.
   */
  suspend fun loadBitmap(ctx: Context, url: String?, sizePx: Int = 96): Bitmap? {
    if (url.isNullOrBlank()) return null
    val req = ImageRequest.Builder(ctx)
      .data(url)
      .size(Size(sizePx, sizePx))
      .allowHardware(false)
      .build()
    val drawable = loader(ctx).execute(req).drawable ?: return null
    return (drawable as? BitmapDrawable)?.bitmap
  }
}

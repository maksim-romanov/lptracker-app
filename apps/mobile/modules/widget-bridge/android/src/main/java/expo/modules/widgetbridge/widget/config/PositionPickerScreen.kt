package expo.modules.widgetbridge.widget.config

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import expo.modules.widgetbridge.widget.data.WidgetExtension
import expo.modules.widgetbridge.widget.data.WidgetPosition
import expo.modules.widgetbridge.widget.util.ChainCatalog

data class PickerItem(val ref: String, val displayPair: String, val subtitle: String) {
  companion object {
    fun from(p: WidgetPosition): PickerItem {
      val extLabel = (p.extension as? WidgetExtension.UniswapV3)?.feeTierLabel ?: "—"
      return PickerItem(
        ref = p.ref,
        displayPair = "${p.pair.sym0}/${p.pair.sym1} · $extLabel",
        subtitle = "${p.protocolLabel} · ${ChainCatalog.name(p.chainId)}",
      )
    }
  }
}

@Composable
fun PositionPickerScreen(
  items: List<PickerItem>,
  onPick: (String) -> Unit,
  onOpenApp: () -> Unit,
) {
  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(Color.Black)
      .padding(16.dp),
  ) {
    Text("Pick a position", color = Color.White)
    Spacer(Modifier.height(16.dp))
    if (items.isEmpty()) {
      Text(
        "Open Depthly to follow positions, then return here.",
        color = Color.LightGray,
      )
      Spacer(Modifier.height(12.dp))
      Text(
        "Open Depthly",
        color = Color.Cyan,
        modifier = Modifier.clickable(onClick = onOpenApp),
      )
    } else {
      LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        items(items, key = { it.ref }) { item ->
          Column(
            modifier = Modifier
              .fillMaxWidth()
              .clickable { onPick(item.ref) }
              .padding(vertical = 8.dp),
          ) {
            Text(item.displayPair, color = Color.White)
            Text(item.subtitle, color = Color.LightGray)
          }
        }
      }
    }
  }
}

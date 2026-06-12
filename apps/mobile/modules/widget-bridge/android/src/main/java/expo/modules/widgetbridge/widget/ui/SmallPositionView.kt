package expo.modules.widgetbridge.widget.ui

import androidx.compose.runtime.Composable
import androidx.glance.GlanceModifier
import androidx.glance.action.Action
import androidx.glance.action.clickable
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.width
import expo.modules.widgetbridge.widget.data.WidgetExtension
import expo.modules.widgetbridge.widget.data.WidgetPosition
import expo.modules.widgetbridge.widget.theme.Colors
import expo.modules.widgetbridge.widget.theme.Sizing
import expo.modules.widgetbridge.widget.theme.Spacing
import expo.modules.widgetbridge.widget.theme.Typography
import expo.modules.widgetbridge.widget.ui.components.ChainTag
import expo.modules.widgetbridge.widget.ui.components.InlineStatRow
import expo.modules.widgetbridge.widget.ui.components.MetaTag
import expo.modules.widgetbridge.widget.ui.components.PairRow
import expo.modules.widgetbridge.widget.ui.components.RangeBarView
import expo.modules.widgetbridge.widget.ui.components.ReverseButtonKind
import expo.modules.widgetbridge.widget.util.TokenStatHelper

@Composable
fun SmallPositionView(
  position: WidgetPosition?,
  reason: EmptyReason?,
  deepLinkAction: Action?,
) {
  if (position == null) {
    EmptyStateView(reason ?: EmptyReason.NotConfigured)
    return
  }
  Column(
    modifier = GlanceModifier.fillMaxSize().padding(Sizing.WidgetMetrics.contentMargin),
  ) {
    // PairRow (with ReverseButton) is intentionally NOT inside the deep-link
    // clickable Box — they're siblings so the button click can't be eaten by
    // a wrapping click handler.
    PairRow(
      sym0 = position.pair.sym0,
      sym1 = position.pair.sym1,
      positionRef = position.ref,
      pairStyle = Typography.pairSm,
      kind = ReverseButtonKind.Small,
    )
    Spacer(GlanceModifier.height(Spacing.lg))
    Box(
      modifier = GlanceModifier
        .defaultWeight()
        .fillMaxWidth()
        .let { m -> if (deepLinkAction != null) m.clickable(deepLinkAction) else m },
    ) {
      // Inner Column needs fillMaxSize so its Spacer.defaultWeight() actually
      // has vertical space to weight against — otherwise Value/Fees float up
      // to sit right under the range bar.
      Column(modifier = GlanceModifier.fillMaxSize()) {
        RangeSection(position)
        Spacer(GlanceModifier.defaultWeight())
        InlineStatRow(
          label = "Value",
          left = position.primaryPrincipal?.formatted,
          right = position.secondaryPrincipal?.formatted,
          valueStyle = Typography.valueMd,
          accent = Colors.textPrimary,
        )
        Spacer(GlanceModifier.height(Spacing.sm))
        InlineStatRow(
          label = "Fees",
          left = TokenStatHelper.feeString(position.primaryPrincipal?.symbol, position.fees),
          right = TokenStatHelper.feeString(position.secondaryPrincipal?.symbol, position.fees),
          valueStyle = Typography.valueXxs,
          accent = Colors.brandPrimary,
        )
      }
    }
  }
}

@Composable
private fun RangeSection(position: WidgetPosition) {
  val ext = position.extension as? WidgetExtension.UniswapV3 ?: return
  Column {
    Row(verticalAlignment = Alignment.Vertical.CenterVertically) {
      ChainTag(chainId = position.chainId)
      Spacer(GlanceModifier.width(Spacing.xs))
      MetaTag(text = ext.feeTierLabel)
      Spacer(GlanceModifier.defaultWeight())
    }
    if (ext.range != null) {
      Spacer(GlanceModifier.height(Spacing.md))
      RangeBarView(range = ext.range)
    }
  }
}

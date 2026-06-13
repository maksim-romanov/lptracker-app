package expo.modules.widgetbridge.widget.ui

import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.glance.GlanceModifier
import androidx.glance.action.Action
import androidx.glance.action.clickable
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.ColumnScope
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxHeight
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.width
import androidx.glance.unit.ColorProvider
import expo.modules.widgetbridge.widget.data.WidgetExtension
import expo.modules.widgetbridge.widget.data.WidgetPosition
import expo.modules.widgetbridge.widget.theme.Colors
import expo.modules.widgetbridge.widget.theme.Opacity
import expo.modules.widgetbridge.widget.theme.Sizing
import expo.modules.widgetbridge.widget.theme.Spacing
import expo.modules.widgetbridge.widget.theme.Typography
import expo.modules.widgetbridge.widget.ui.components.ChainTag
import expo.modules.widgetbridge.widget.ui.components.Density
import expo.modules.widgetbridge.widget.ui.components.MetaTag
import expo.modules.widgetbridge.widget.ui.components.PairRow
import expo.modules.widgetbridge.widget.ui.components.PriceRangeView
import expo.modules.widgetbridge.widget.ui.components.ReverseButtonKind
import expo.modules.widgetbridge.widget.ui.components.StatBlock
import expo.modules.widgetbridge.widget.ui.components.StatusTag
import expo.modules.widgetbridge.widget.ui.components.TokenAmount
import expo.modules.widgetbridge.widget.util.TokenStatHelper

private val RIGHT_COLUMN_WIDTH = 100.dp

@Composable
fun MediumPositionView(
  position: WidgetPosition?,
  reason: EmptyReason?,
  deepLinkAction: Action?,
) {
  if (position == null) {
    EmptyStateView(reason ?: EmptyReason.NotConfigured)
    return
  }
  Row(
    modifier = GlanceModifier.fillMaxSize().padding(Sizing.WidgetMetrics.contentMargin),
    verticalAlignment = Alignment.Vertical.CenterVertically,
  ) {
    Column(modifier = GlanceModifier.defaultWeight()) {
      LeftColumn(position, deepLinkAction)
    }
    Spacer(GlanceModifier.width(Spacing.lg))
    Box(
      modifier = GlanceModifier
        .width(Sizing.Divider.thin)
        .fillMaxHeight()
        .background(ColorProvider(Colors.textPrimary.copy(alpha = Opacity.strokeMuted))),
    ) {}
    Spacer(GlanceModifier.width(Spacing.lg))
    Column(modifier = GlanceModifier.width(RIGHT_COLUMN_WIDTH)) {
      RightColumn(position, deepLinkAction)
    }
  }
}

@Composable
private fun ColumnScope.LeftColumn(position: WidgetPosition, deepLinkAction: Action?) {
  // PairRow stays outside the deep-link clickable so its ReverseButton click
  // is not eaten by a wrapping handler.
  PairRow(
    sym0 = position.pair.sym0,
    sym1 = position.pair.sym1,
    positionRef = position.ref,
    pairStyle = Typography.pairMd,
    kind = ReverseButtonKind.Medium,
  )
  Spacer(GlanceModifier.height(Spacing.md))
  Box(
    modifier = GlanceModifier
      .defaultWeight()
      .fillMaxWidth()
      .let { m -> if (deepLinkAction != null) m.clickable(deepLinkAction) else m },
  ) {
    Column {
      TagsRow(position)
      val ext = position.extension as? WidgetExtension.UniswapV3
      if (ext?.range != null) {
        Spacer(GlanceModifier.height(Spacing.lg))
        PriceRangeView(range = ext.range)
      }
    }
  }
}

@Composable
private fun TagsRow(position: WidgetPosition) {
  val ext = position.extension as? WidgetExtension.UniswapV3
  Row(verticalAlignment = Alignment.Vertical.CenterVertically) {
    ChainTag(chainId = position.chainId)
    Spacer(GlanceModifier.width(Spacing.xs))
    if (ext != null) {
      MetaTag(text = ext.feeTierLabel)
      Spacer(GlanceModifier.width(Spacing.xs))
    }
    StatusTag(status = position.status)
    Spacer(GlanceModifier.defaultWeight())
  }
}

@Composable
private fun ColumnScope.RightColumn(position: WidgetPosition, deepLinkAction: Action?) {
  val primary = position.primaryPrincipal
  val secondary = position.secondaryPrincipal
  Box(
    modifier = GlanceModifier
      .fillMaxSize()
      .let { m -> if (deepLinkAction != null) m.clickable(deepLinkAction) else m },
  ) {
    Column {
      StatBlock(
        label = "Value",
        accent = Colors.textPrimary,
        primary = TokenAmount(value = primary?.formatted, symbol = primary?.symbol),
        secondary = TokenAmount(value = secondary?.formatted, symbol = secondary?.symbol),
        density = Density.Compact,
      )
      Spacer(GlanceModifier.height(Spacing.md))
      StatBlock(
        label = "Fees",
        accent = Colors.brandPrimary,
        primary = TokenAmount(
          value = TokenStatHelper.feeString(primary?.symbol, position.fees),
          symbol = primary?.symbol,
        ),
        secondary = TokenAmount(
          value = TokenStatHelper.feeString(secondary?.symbol, position.fees),
          symbol = secondary?.symbol,
        ),
        density = Density.Compact,
      )
    }
  }
}

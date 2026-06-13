package expo.modules.widgetbridge.widget.data

import androidx.datastore.preferences.core.intPreferencesKey
import androidx.glance.action.ActionParameters

/** Action parameter key — propagates the position ref to ToggleInversionAction. */
val POSITION_REF_KEY = ActionParameters.Key<String>("positionRef")

/**
 * Per-widget DataStore tick. Bumped by ToggleInversionAction across every
 * widget instance after a toggle, so Glance's state-diff registers a change
 * and recomposes (the file-based InvertedStore mutation is otherwise
 * invisible to Glance state tracking).
 */
val INVERSION_TICK = intPreferencesKey("inversionTick")

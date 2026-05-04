import { type ComponentType, useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import { Canvas, Picture, Skia } from "@shopify/react-native-skia";
import Animated, {
  Easing,
  makeMutable,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";
import tinycolor from "tinycolor2";

import { GOLD } from "./FollowingTag";

const EXIT_DURATION = 220;
const GLOBAL_PERIOD = 6000;
const GRID_COLS = 3;
const GRID_ROWS = 3;
const PARTICLE_COUNT = GRID_COLS * GRID_ROWS;
const SPILL = 14;

const PARTICLE_RGB = tinycolor(GOLD).toRgb();

// One global clock shared by every animated chip on screen. Reanimated drives
// `globalClock` from 0 → 1e9 ms linearly, so any consumer worklet just reads
// the current ms value. One engine-level interpolation, regardless of how many
// chips are mounted.
const globalClock = makeMutable(0);
let clockStarted = false;
const startGlobalClock = () => {
  if (clockStarted) return;
  clockStarted = true;
  globalClock.value = withTiming(1e9, { duration: 1e9, easing: Easing.linear });
};

// Skia paint + recorder are reused across all instances. Worklets run
// sequentially on the UI thread (Reanimated guarantees this), so it's safe
// to share these mutable Skia objects.
const recorder = Skia.PictureRecorder();
const paint = Skia.Paint();
paint.setColor(Skia.Color(`rgba(${PARTICLE_RGB.r}, ${PARTICLE_RGB.g}, ${PARTICLE_RGB.b}, 1)`));

type ParticleConfig = {
  x: number;
  y: number;
  size: number;
  /** Per-cycle drift direction is re-derived from these seeds, so each bloom
   *  goes in a different direction — that's where most of the chaos comes
   *  from. Otherwise particles would always trace the same line outward. */
  seedA: number;
  seedB: number;
  driftRadius: number;
  freq: number;
  phase: number;
  peakOpacity: number;
  wobbleFreqX: number;
  wobblePhaseX: number;
  wobbleAmpX: number;
  wobbleFreqY: number;
  wobblePhaseY: number;
  wobbleAmpY: number;
};

const generateParticles = (): ParticleConfig[] => {
  // Jittered-grid sampling — one particle per cell with bounded jitter.
  // Eliminates the random clustering that occasionally produced visible blobs.
  const cellW = 100 / GRID_COLS;
  const cellH = 100 / GRID_ROWS;
  const JITTER = 0.75;

  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);
    const x = (col + 0.5) * cellW + (Math.random() - 0.5) * cellW * JITTER;
    const y = (row + 0.5) * cellH + (Math.random() - 0.5) * cellH * JITTER;

    return {
      x,
      y,
      size: 0.7 + Math.random() * 2.4,
      seedA: 0.5 + Math.random() * 4,
      seedB: Math.random() * 1000,
      driftRadius: 5 + Math.random() * 11,
      freq: 0.7 + Math.random() * 1.9,
      phase: Math.random(),
      peakOpacity: 0.45 + Math.random() * 0.55,
      wobbleFreqX: 4 + Math.random() * 6,
      wobblePhaseX: Math.random() * Math.PI * 2,
      wobbleAmpX: 0.6 + Math.random() * 1.6,
      wobbleFreqY: 4 + Math.random() * 6,
      wobblePhaseY: Math.random() * Math.PI * 2,
      wobbleAmpY: 0.6 + Math.random() * 1.6,
    };
  });
};

type DustCloudProps = { width: number; height: number };

const DustCloud = ({ width, height }: DustCloudProps) => {
  const particles = useMemo(generateParticles, []);

  // Pre-compute static Skia geometry so the worklet doesn't allocate per frame.
  const recordingRect = useMemo(() => Skia.XYWHRect(0, 0, width, height), [width, height]);
  const innerW = Math.max(0, width - 2 * SPILL);
  const innerH = Math.max(0, height - 2 * SPILL);

  useEffect(() => {
    startGlobalClock();
  }, []);

  // ONE worklet per chip per frame draws ALL particles into a single Picture
  // — the entire dust cloud collapses to a single Skia drawing op.
  const picture = useDerivedValue(() => {
    const canvas = recorder.beginRecording(recordingRect);
    const tick = globalClock.value / GLOBAL_PERIOD;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const raw = tick * p.freq + p.phase;
      const cycleIndex = Math.floor(raw);
      const localT = raw - cycleIndex;
      const fade = Math.sin(localT * Math.PI);

      // Per-cycle drift direction: re-rolled every cycle from cycleIndex +
      // particle seeds, so each bloom shoots in a different direction. Cheap
      // pseudo-random hash via fractional multiplications. Continuous because
      // fade is 0 at cycle boundaries — direction snap is invisible.
      const cycleAngle = (cycleIndex * p.seedA + p.seedB) * 0.137;
      const driftX = Math.cos(cycleAngle) * p.driftRadius;
      const driftY = Math.sin(cycleAngle) * p.driftRadius;

      // High-frequency wobble — adds constant "trembling" on top of the slow
      // bloom. Multiplied by fade so wobble fades in/out with the particle.
      const wobbleX = Math.sin(tick * p.wobbleFreqX + p.wobblePhaseX) * p.wobbleAmpX;
      const wobbleY = Math.cos(tick * p.wobbleFreqY + p.wobblePhaseY) * p.wobbleAmpY;

      const cx = SPILL + (p.x / 100) * innerW + fade * (driftX + wobbleX);
      const cy = SPILL + (p.y / 100) * innerH + fade * (driftY + wobbleY);
      const r = (p.size / 2) * (0.55 + fade * 0.5);

      paint.setAlphaf(fade * p.peakOpacity);
      canvas.drawCircle(cx, cy, r, paint);
    }

    return recorder.finishRecordingAsPicture();
  });

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Picture picture={picture} />
    </Canvas>
  );
};

type AnimationProps = {
  /** Whether the chip is shown — drives both enter and exit transitions. */
  active: boolean;
};

/**
 * HOC that adds the entrance/exit animation and the radiating gold dust cloud
 * around any presentational chip (typically `FollowingTag`).
 *
 * Mount lifecycle is internal: the wrapper always renders for its parent but
 * only commits DOM while the exit transition is in flight, so unmount reliably
 * plays the shrink-out without depending on Reanimated layout-anim.
 */
export const withFollowingAnimation = <P extends object>(Wrapped: ComponentType<P>) => {
  const Animated_FollowingTag = (props: P & AnimationProps) => {
    const { active, ...rest } = props;
    const [mounted, setMounted] = useState(active);
    const [cloudSize, setCloudSize] = useState({ width: 0, height: 0 });

    const progress = useSharedValue(0);

    useEffect(() => {
      if (active) {
        setMounted(true);
        progress.value = withSpring(1, { damping: 12, stiffness: 220, mass: 0.6 });
      } else {
        progress.value = withTiming(0, { duration: EXIT_DURATION, easing: Easing.in(Easing.quad) }, (finished) => {
          if (finished) runOnJS(setMounted)(false);
        });
      }
    }, [active, progress]);

    const containerStyle = useAnimatedStyle(() => ({
      opacity: progress.value,
      transform: [{ scale: 0.6 + progress.value * 0.4 }],
    }));

    if (!mounted) return null;

    return (
      <Animated.View style={[styles.glow, containerStyle]}>
        {/* Cloud sits in a sibling layer with negative insets so the Skia
            Canvas has room to draw particles that drift past the chip's
            rounded border. Rendered before the chip → behind it. */}
        <View
          style={styles.cloudLayer}
          pointerEvents="none"
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            if (width !== cloudSize.width || height !== cloudSize.height) {
              setCloudSize({ width, height });
            }
          }}
        >
          {cloudSize.width > 0 ? <DustCloud width={cloudSize.width} height={cloudSize.height} /> : null}
        </View>
        <Wrapped {...(rest as unknown as P)} />
      </Animated.View>
    );
  };

  Animated_FollowingTag.displayName = `withFollowingAnimation(${Wrapped.displayName ?? Wrapped.name ?? "Component"})`;
  return Animated_FollowingTag;
};

const styles = StyleSheet.create((theme) => ({
  glow: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.full,
  },

  cloudLayer: {
    position: "absolute",
    top: -SPILL,
    bottom: -SPILL,
    left: -SPILL,
    right: -SPILL,
    overflow: "visible",
  },
}));

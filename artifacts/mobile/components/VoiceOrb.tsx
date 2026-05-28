import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  isListening: boolean;
  onPress: () => void;
  size?: number;
}

export default function VoiceOrb({ isListening, onPress, size = 80 }: Props) {
  const colors = useColors();
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isListening) {
      loopRef.current = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(ripple1, {
              toValue: 1,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(ripple1, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(400),
            Animated.timing(ripple2, {
              toValue: 1,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(ripple2, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.loop(
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 1.08,
                duration: 700,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
              }),
            ])
          ),
        ])
      );
      loopRef.current.start();
    } else {
      loopRef.current?.stop();
      ripple1.setValue(0);
      ripple2.setValue(0);
      scaleAnim.setValue(1);
    }
  }, [isListening, ripple1, ripple2, scaleAnim]);

  const rippleScale1 = ripple1.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.4],
  });
  const rippleOpacity1 = ripple1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 0.2, 0],
  });
  const rippleScale2 = ripple2.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.0],
  });
  const rippleOpacity2 = ripple2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.15, 0],
  });

  return (
    <View style={{ width: size * 2.6, height: size * 2.6, alignItems: "center", justifyContent: "center" }}>
      {isListening && (
        <>
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                borderRadius: size,
                backgroundColor: colors.accent + "40",
                transform: [{ scale: rippleScale1 }],
                opacity: rippleOpacity1,
              },
            ]}
          />
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                borderRadius: size,
                backgroundColor: colors.primary + "30",
                transform: [{ scale: rippleScale2 }],
                opacity: rippleOpacity2,
              },
            ]}
          />
        </>
      )}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
          <LinearGradient
            colors={
              isListening
                ? [colors.accent, colors.gradientEnd]
                : [colors.gradientStart, colors.gradientEnd]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: isListening ? colors.accent : colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.5,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <Feather
              name={isListening ? "mic" : "mic"}
              size={size * 0.38}
              color="#fff"
            />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface WaveDecorationProps {
  topPosition: number;
}

const WaveDecoration: React.FC<WaveDecorationProps> = ({ topPosition }) => {
  return (
    <View style={[styles.waveContainer, { top: topPosition }]}>
      <Svg
        height="120"
        width={width}
        viewBox={`0 0 ${width} 120`}
        style={styles.svg}
      >
        <Path
          d={`M 0 50 Q ${width * 0.5} 10 ${width} 50 L ${width} 120 L 0 120 Z`}
          fill="#166534"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  waveContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 120,
    zIndex: 5,
  },
  svg: {
    width: '100%',
  },
});

export default WaveDecoration;

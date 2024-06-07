import { Box, Button } from '@chakra-ui/react';
import './ColorPicker.css';
import { TwitterPicker } from 'react-color';
import { forwardRef } from 'react';

export type RGBAColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

type Color = {
  rgb: RGBAColor;
};

interface IColorPickerProps {
  color: RGBAColor;
  showColorPicker: boolean;

  setColor: React.Dispatch<
    React.SetStateAction<{
      r: number;
      g: number;
      b: number;
      a: number;
    }>
  >;
  setShowColorPicker: { on: () => void; off: () => void; toggle: () => void };
}

export const ColorPicker = forwardRef<HTMLDivElement, IColorPickerProps>(
  function ColorPicker(props: IColorPickerProps, ref) {
    const handleChangeComplete = (color: Color) => {
      props.setColor(color.rgb);
    };

    return (
      <div ref={ref}>
        <Button
          onClick={() => props.setShowColorPicker.toggle()}
          style={{
            backgroundColor: `rgba(${props.color.r}, ${props.color.g}, ${props.color.b}, ${props.color.a})`,
            border: '2px solid white',
          }}
        />
        {props.showColorPicker && (
          <Box style={{ position: 'absolute', marginTop: '13px' }}>
            <TwitterPicker
              color={props.color}
              onChangeComplete={handleChangeComplete}
            />
          </Box>
        )}
      </div>
    );
  }
);

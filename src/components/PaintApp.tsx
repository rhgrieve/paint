import { createRef, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import './PaintApp.css';
import {
  Box,
  Button,
  ButtonGroup,
  Circle,
  Flex,
  HStack,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  useBoolean,
} from '@chakra-ui/react';
import { AddIcon, ArrowBackIcon, ArrowForwardIcon, RepeatIcon } from '@chakra-ui/icons';
import { ColorPicker, RGBAColor } from './ColorPicker';
import { Canvas } from './Canvas';

type LayerData = {
  id: string
  position: number
}

type Target = {
  x: number;
  y: number;
};

enum Actions {
  Undo,
  Redo,
  Null,
}

enum BrushSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
}

type BrushConfig = {
  canvasSize: number;
  circleSize: string;
};

type BrushSizeConfig = {
  [key in BrushSize]: BrushConfig;
};

const brushSizes: BrushSizeConfig = {
  sm: {
    canvasSize: 4,
    circleSize: '8px',
  },
  md: {
    canvasSize: 8,
    circleSize: '16px',
  },
  lg: {
    canvasSize: 16,
    circleSize: '32px',
  },
};

const getHotkey = (e: KeyboardEvent): Actions => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 'z':
        return Actions.Undo;
      case 'y':
        return Actions.Redo;
      default:
        break;
    }
  }

  return Actions.Null;
};

export default function PaintApp() {
  // const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  // const [historyPos, setHistoryPos] = useState(0);
  // const [history, setHistory] = useState<ImageData[]>([]);
  const [prevTarget, setPrevTarget] = useState<Target>({ x: 0, y: 0 });
  const [target, setTarget] = useState<Target>({ x: 0, y: 0 });
  const [isMouseDown, setIsMouseDown] = useBoolean();
  const [boundingRect, setBoundingRect] = useState<DOMRect>();
  // Drawing tools
  const [brushSize, setBrushSize] = useState<BrushConfig>(brushSizes.sm);
  // Color picker
  const [showColorPicker, setShowColorPicker] = useBoolean();
  const [color, setColor] = useState<RGBAColor>({
    r: 0,
    g: 0,
    b: 0,
    a: 1,
  });
  const [layers, setLayers] = useState<LayerData[]>([{ id: uuidv4(), position: 0 }])
  const [currentLayer, setCurrentLayer] = useState(0);

  // References
  // const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const layerRefs = layers.map(layer => ({ id: layer.id, ref: createRef<HTMLCanvasElement>() }))
  const navbarRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasContainerRef.current) {
      const ctx = layerRefs[currentLayer].ref.current?.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        // storeHistory();
      }
      setBoundingRect(canvasContainerRef.current.getBoundingClientRect());

      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvasContainerRef.current, currentLayer]);

  useEffect(() => {
    const ctx = layerRefs[currentLayer].ref.current?.getContext('2d');
    if (ctx) {
      ctx.lineWidth = brushSize.canvasSize;
    }
  }, [brushSize]);

  useEffect(() => {
    const ctx = layerRefs[currentLayer].ref.current?.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
    }
  });

  useEffect(() => {
    const handleClickOutsideColorPicker = (e: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(e.target as Node)
      ) {
        setShowColorPicker.off();
      }
    };

    window.addEventListener('mousedown', handleClickOutsideColorPicker);

    return () => {
      window.removeEventListener('mousedown', handleClickOutsideColorPicker);
    };
  }, [colorPickerRef]);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (getHotkey(e)) {
      case Actions.Undo:
        e.preventDefault();
        // undo();
        break;
      case Actions.Redo:
        e.preventDefault();
        // redo();
        break;
      case Actions.Null:
        break;
    }
  };

  const clearScreen = () => {
    const ctx = layerRefs[currentLayer].ref.current?.getContext('2d');
    if (ctx) {
      ctx.clearRect(
        0,
        0,
        layerRefs[currentLayer].ref.current?.width || 0,
        layerRefs[currentLayer].ref.current?.height || 0
      );
      // storeHistory();
    }
  };

  const drawPixel = () => {
    const ctx = layerRefs[currentLayer].ref.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(prevTarget.x, prevTarget.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
    }
  };

  const trackPosition: React.MouseEventHandler = (e) => {
    if (boundingRect) {
      setPrevTarget(target);

      setTarget({
        x: e.clientX - boundingRect.left,
        y: e.clientY - boundingRect.top,
      });
    }

    if (isMouseDown) {
      drawPixel();
    }
  };

  const handleMouseDown: React.MouseEventHandler = (_e) => {
    setIsMouseDown.toggle();
  };

  const handleMouseUp: React.MouseEventHandler = (_e) => {
    setIsMouseDown.toggle();
    // storeHistory();
  };

  const createLayer = () => {
    setLayers([...layers, { id: uuidv4(), position: layers.length }])
  }

  return (
    <div>
      <Flex direction="column" height={"100vh"}>
        <Box
          ref={navbarRef}
          bg="blue.300"
          w="100%"
          p={4}
          fontSize="2xl"
          fontWeight="bold"
          color="white"
        >
          <Flex justify="space-between">
            <Box>h.paint</Box>
            <HStack>
            <Popover>
                <PopoverTrigger>
                  <Button
                    style={{
                      border: '2px solid white',
                    }}
                  >{currentLayer + 1}</Button>
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverBody>
                    <HStack>
                      {layers && layers.map(layer => {
                        return <Button onClick={() => setCurrentLayer(layer.position)} key={layer.id} isActive={currentLayer === layer.position}>{layer.position + 1}</Button>;
                      })}
                      <IconButton onClick={() => createLayer()} icon={<AddIcon />} aria-label='add layer' />
                    </HStack>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger>
                  <IconButton
                    aria-label={`brush picker`}
                    icon={
                      <Circle
                        size={brushSize.circleSize}
                        bg="black"
                        color="white"
                      />
                    }
                    style={{
                      border: '2px solid white',
                    }}
                  />
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverBody>
                    <HStack>
                      {Object.entries(brushSizes).map(([key, value]) => {
                        const localBrushSize = value;
                        return (
                          <IconButton
                            key={`${key}-brush`}
                            aria-label={`${key} brush`}
                            onClick={() =>
                              setBrushSize(brushSizes[key as BrushSize])
                            }
                            isActive={
                              brushSize.canvasSize === localBrushSize.canvasSize
                            }
                            icon={
                              <Circle
                                size={localBrushSize.circleSize}
                                bg="black"
                                color="white"
                              />
                            }
                          />
                        );
                      })}
                    </HStack>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
              <ColorPicker
                ref={colorPickerRef}
                color={color}
                setColor={setColor}
                showColorPicker={showColorPicker}
                setShowColorPicker={setShowColorPicker}
              />
            </HStack>
            <HStack justify="space-between">
              <ButtonGroup isAttached variant="solid">
                <IconButton
                  // isDisabled={historyPos <= 0}
                  // onClick={() => undo()}
                  aria-label="back"
                  colorScheme="blue"
                  icon={<ArrowBackIcon />}
                />
                <IconButton
                  // isDisabled={historyPos >= history.length - 1}
                  // onClick={() => redo()}
                  aria-label="forward"
                  colorScheme="blue"
                  icon={<ArrowForwardIcon />}
                />
              </ButtonGroup>
              <IconButton
                // isDisabled={historyPos <= 0}
                onClick={() => clearScreen()}
                colorScheme="red"
                icon={<RepeatIcon />}
                aria-label="refresh"
              >
                Reset
              </IconButton>
            </HStack>
          </Flex>
        </Box>
        <Box ref={canvasContainerRef} flex={1} onMouseMove={trackPosition} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
          {layers && layers.map((layer, idx) => <Canvas ref={layerRefs[idx].ref} key={layer.id} navbarRef={navbarRef} zIndex={layer.position} />)}
        </Box>
      </Flex>
    </div>
  );
}

import './App.css';
import { ChakraProvider } from '@chakra-ui/react';
import PaintApp from './components/PaintApp';

function App() {
  return (
    <ChakraProvider>
      <PaintApp />
    </ChakraProvider>
  );
}

export default App;

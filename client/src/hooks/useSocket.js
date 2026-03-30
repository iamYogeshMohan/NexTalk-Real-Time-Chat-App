import { useSocket } from '../context/SocketContext';

const useSocketHook = () => {
  const { socket, connected } = useSocket();
  return { socket, connected };
};

export default useSocketHook;

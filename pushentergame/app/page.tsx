import {useState,useEffect} from 'react';

export default function Home() {
  //状態管理のためのuseState
  const[count,setCount] = useState(0);//エンターキーのカウント
  const[timeLeft,setTimeLeft]=useState(10);//ゲーム時間
  const[gameStarted,setGameStarted] = useState(false);//ゲームの状態
  const[isGameOver,setIsGameOver] = useState(false);//ゲームの終了状態

  // ゲームのスタート
  const startGame = () => {
    setGameStarted(true);
    setCount(0);
    setTimeLeft(10);
    setIsGameOver(false);

    // タイマーの設定
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer); // タイマーの停止
          setIsGameOver(true); // ゲームオーバー
          setGameStarted(false);
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // エンターキーの連打カウント
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && gameStarted) {
        setCount((prevCount) => prevCount + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {!gameStarted && (
        <button onClick={startGame} disabled={gameStarted}>
          Start Game
        </button>
      )}
      <h2>Time Left: {timeLeft} seconds</h2>
      <h2>Enter Count: {count}</h2>
      {isGameOver && <h3>Game Over!</h3>}
    </div>
  );

}

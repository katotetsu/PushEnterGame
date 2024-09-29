"use client";
import { useCallback, useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

type ScoreData = {
  score: number;
  userName: string;
  timestamp: Date;
};

export default function Home() {
  // 状態管理のためのuseState
  const [count, setCount] = useState(0); // エンターキーのカウント
  const [timeLeft, setTimeLeft] = useState(10); // ゲーム時間
  const [gameStarted, setGameStarted] = useState(false); // ゲームの状態
  const [isGameOver, setIsGameOver] = useState(false); // ゲームの終了状態
  const [scoreSaved, setScoreSaved] = useState(false); // スコア保存済みフラグ
  const [ranking, setRanking] = useState<ScoreData[]>([]); // ランキングデータ
  const [targetCount, setTargetCount] = useState(20); // 目標スコア
  const [gameDuration, setGameDuration] = useState(10); // ゲームの持続時間
  const [userName, setUserName] = useState(""); // ユーザー名の状態

  // countの最新値を保持するためのuseRef
  const countRef = useRef(0);
  // タイマーのIDを保持するためのuseRef
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // FireStoreのコレクションリファレンス
  const scoresCollectionRef = collection(db, 'scores3');

  // ゲームのスタート
  const startGame = () => {
    if (timerRef.current) return;

    setGameStarted(true);
    setCount(0);
    setTimeLeft(gameDuration);
    setIsGameOver(false);
    setScoreSaved(false);

    // タイマーの設定
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);
  };

  const resetGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current); // タイマーの停止
      timerRef.current = null; // タイマー参照のクリア
    }
    setCount(0);
    setTimeLeft(gameDuration);
    setIsGameOver(false);
    setGameStarted(false);
    setScoreSaved(false);
  };

  // FireStoreからランキングを取得
  const fetchRanking = useCallback(async () => {
    try {
      const q = query(scoresCollectionRef, orderBy('score', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      const rankingData = querySnapshot.docs.map((doc) => ({
        score: doc.data().score as number,
        userName: doc.data().userName as string,
        timestamp: doc.data().timestamp.toDate() as Date,
      }));
      setRanking(rankingData);
    } catch (error) {
      console.error('Error fetching ranking', error);
    }
  }, [scoresCollectionRef]);

  // スコアの保存
  const saveScore = useCallback(async (finalCount: number) => {
    try {
      await addDoc(scoresCollectionRef, { 
        score: finalCount, 
        userName: userName, // ユーザー名も保存
        timestamp: new Date() 
      });
      fetchRanking();
    } catch (error) {
      console.error('Error saving score:', error);
    }
  }, [fetchRanking, scoresCollectionRef, userName]);

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

  // タイマーのカウントダウンを監視してゲームオーバーを判断
  useEffect(() => {
    if (timeLeft <= 0 && gameStarted && !isGameOver) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsGameOver(true);
      setGameStarted(false);
      if (!scoreSaved) {
        setScoreSaved(true);
        saveScore(countRef.current);
      }
    }
  }, [timeLeft, gameStarted, isGameOver, scoreSaved, saveScore]);


  // `count`の変更時に`countRef`を更新
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <div style={{ margin: '20px' }}>
        <h3>Game Settings</h3>
        {/* ユーザー名の入力フォーム */}
        <div>
          <label>User Name: </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        {/* 目標スコアの入力フォーム */}
        <div>
          <label>Clear Count: </label>
          <input
            type="number"
            value={targetCount}
            onChange={(e) => setTargetCount(Number(e.target.value))}
            min="1"
          />
        </div>
        {/* ゲームの持続時間の入力フォーム */}
        <div>
          <label>Game Duration (seconds): </label>
          <input
            type="number"
            value={gameDuration}
            onChange={(e) => setGameDuration(Number(e.target.value))}
            min="1"
          />
        </div>
      </div>

      {/* ゲーム開始とリセット */}
      {!gameStarted && !isGameOver && (
        <button onClick={startGame} disabled={gameStarted || userName.trim() === ""}>
          Start Game
        </button>
      )}
      {isGameOver && (
        <button onClick={resetGame}>
          Play Again
        </button>
      )}

      <h2>Time Left: {timeLeft} seconds</h2>
      <h2>Enter Count: {count}</h2>
        {isGameOver && (
      <h3>{count >= targetCount ? "Game Clear!" : "Game Over!"}</h3>
      )}

      {/* ランキングの表示 */}
      <h3>Top Scores:</h3>
      <ul>
        {ranking.map((item, index) => (
          <li key={index}>
            {item.userName} - Score: {item.score}
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";
import {useState,useEffect} from 'react';
import{db}from '../firebase';
import{collection,addDoc,getDocs,query,orderBy,limit} from 'firebase/firestore';

type ScoreData ={
  score:number;
  timestamp:Date;
};

export default function Home() {
  //状態管理のためのuseState
  const[count,setCount] = useState(0);//エンターキーのカウント
  const[timeLeft,setTimeLeft]=useState(10);//ゲーム時間
  const[gameStarted,setGameStarted] = useState(false);//ゲームの状態
  const[isGameOver,setIsGameOver] = useState(false);//ゲームの終了状態
  const[ranking,setRanking]=useState<ScoreData[]>([]);//ランキングデータ

  //FireStoreのコレクションリファレンス
  const scoresCollectionRef = collection(db,'scores');

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
          saveScore();//ゲーム終了時にスコアを保存
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  //スコアの保存
  const saveScore = async () => {
    try{
      //FireStoreにスコアを保存
      await addDoc(scoresCollectionRef,{score:count,timestam:new Date()});
      console.log('Score saved successfully!');
      fetchRanking();
    }
    catch(error){
      console.error('Error saving score:',error);
    }
  };

  //FireStoreからランキングを取得
  const fetchRanking = async() =>{
    try{
      //スコアの高い順に上位10件を取得
      const q=query(scoresCollectionRef,orderBy('score','desc'),limit(10));
      const querySnapshot = await getDocs(q);
      //ドキュメントデータを'scoreData'型にキャスト
      const rankingData = querySnapshot.docs.map((doc)=>{
        return{
          score:doc.data().score as number,
          //Firestoreのtimestamp型をJSのDate型に変換
          timestamp:doc.data().timestamp.toDate() as Date,
        };
      });
      setRanking(rankingData);
    }catch(error){
      console.error('Error fetching ranking',error);
    }
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

      {/* ランキングの表示 */}
      <h3>Top Scores:</h3>
      <ul>
        {ranking.map((item, index) => (
          <li key={index}>Score: {item.score}</li>
        ))}
      </ul>
    </div>
  );

}

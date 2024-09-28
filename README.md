# PushEnterGame
# 学祭の余興で制作

# エンター連打ゲーム - 開発要件

## プロジェクト概要
10秒間で何回エンターキーを押せるかを試すゲーム。設定で連打の回数目標と時間を変更でき、クリア条件を満たせれば成功、満たせなければ失敗となる。

## 機能一覧
### ゲーム機能
- **スタート/リセットボタン**  
  ゲーム開始時にスタートボタンを押してスタート。開始時には3秒のカウントダウンを行う。
  クリアまたは失敗時にはリセットボタンで再度ゲームが開始できる。

- **リアルタイムカウントと音量可視化**  
  エンターキーを押すたびにリアルタイムで回数を表示。また、カウントが増えるたびに赤色のグラデーションの波が下から上に伸びる演出を行う。

- **残り時間表示**  
  10秒のカウントダウンを右上に表示し、時間が切れると自動的にゲーム終了。

### クリア・失敗時のフィードバック
- **クリア時のフィードバック**  
  設定した回数を達成した場合、「クリア！」というメッセージが表示される。

- **失敗時のフィードバック**  
  設定した回数に達しなかった場合、「残念！失敗です！」というメッセージが表示される。

### 設定機能
- **難易度設定**  
  設定画面で、クリア条件のエンター回数とゲーム時間を変更できる。数値はキーボードから直接入力する方式。

## 使用技術
- **フロントエンド**: Next.js, React
- **バックエンド**: Next.jsのAPIルート
- **データベース**: Firebase Firestore
- **リアルタイム更新**: Firebaseのリアルタイムリスナー機能

## システムフロー
1. **ゲーム開始**: ユーザーがスタートボタンを押すと3秒のカウントダウンが始まり、その後ゲームスタート。
2. **エンターキーの連打**: 10秒以内に設定された回数のエンターキーを押す。
3. **スコアの判定と表示**: 10秒経過後にスコアを判定し、クリアまたは失敗のフィードバックを表示。
4. **スコアの保存**: スコアがデータベースに保存され、ランキングが更新される。

## API設計
- **/api/score**  
  - **GET**: 現在のランキング上位10人のスコアを取得。
  - **POST**: ゲーム終了時にスコアを送信し、データベースに保存。

- **/api/settings**  
  - **GET**: 現在のクリア条件やゲーム時間の設定を取得。
  - **POST**: ユーザーによって変更された設定を保存。

## リアルタイムランキング機能
- **スコアのリアルタイム更新**  
  スコアが新たに記録されるたびに、Firebaseのリアルタイムリスナーでランキング情報が自動的に更新される。

## システムのセッション管理
- **リロード時のセッション**  
  ページがリロードされた場合、セッション情報はリセットされ、新しいゲームとしてスタートする。
